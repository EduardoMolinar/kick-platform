# CloudFormation — frontend.yml

Single-stack CloudFormation template that provisions all AWS infrastructure
needed to back the GitHub Actions release workflows.

## What it creates

| Resource | Purpose |
|---|---|
| S3 bucket | Private origin bucket for all frontend artifacts |
| CloudFront OAC | Origin Access Control — SigV4-signed requests to S3 |
| CloudFront distribution | Global CDN; enforces caching contract (see below) |
| IAM OIDC provider | Lets GitHub Actions authenticate without long-lived keys |
| IAM role | Short-lived credentials for S3 writes and CF invalidations |

## Why a single stack

Shell and remotes are one cohesive frontend product. The CloudFront behaviors,
the S3 bucket, and the IAM role are tightly coupled: splitting them into nested
stacks would add cross-stack export dependencies without any operational benefit
at this scale. Revisit if the backend team needs to import these resources, or
if you need per-remote S3 buckets.

## Caching contract (mirrors the workflow design)

| Path pattern | Cache policy | Notes |
|---|---|---|
| `/index.html` | No-cache | Must always be fresh |
| `/federation.manifest.json` | No-cache | Remote URL map |
| `/importmap.json` | No-cache | Native Federation import map |
| `/remoteEntry.json` | No-cache | Shell federation metadata |
| `/remotes/*/remoteEntry.json` | No-cache | Per-remote, five behaviors |
| `/remotes/*/*` | Immutable 1 year | Hashed JS/CSS assets |
| `*` (default) | Immutable 1 year | Shell hashed JS/CSS assets |

SPA fallback: CloudFront maps both 403 and 404 responses from S3 to
`/index.html` with HTTP 200. S3 returns 403 (not 404) for missing keys when
the bucket has OAC-only access, so both codes must be handled.

## Parameters you must provide when deploying

| Parameter | Default | Action required |
|---|---|---|
| `Environment` | `prod` | Change to `staging` for a second stack |
| `BucketNamePrefix` | `kick-platform-frontend` | Change if the default name is taken |
| `GitHubOrg` | `EduardoMolinar` | Correct if the repo is transferred |
| `GitHubRepo` | `kick-platform` | Correct if the repo is renamed |
| `CreateOidcProvider` | `true` | Set to `false` if the GitHub OIDC provider already exists in the account |

## Deploying

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name kick-platform-frontend-prod \
  --template-file infra/cloudformation/frontend.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
      Environment=prod \
      BucketNamePrefix=kick-platform-frontend \
      GitHubOrg=EduardoMolinar \
      GitHubRepo=kick-platform \
      CreateOidcProvider=true
```

## Reading the outputs (GitHub secrets)

After the stack reaches CREATE_COMPLETE or UPDATE_COMPLETE, read the outputs:

```bash
aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name kick-platform-frontend-prod \
  --query "Stacks[0].Outputs" \
  --output table
```

Set these three GitHub secrets:

| Output key | GitHub secret name |
|---|---|
| `AwsRoleArn` | `AWS_ROLE_ARN` |
| `S3Bucket` | `S3_BUCKET` |
| `CloudFrontDistributionId` | `CLOUDFRONT_DISTRIBUTION_ID` |

### Repository secrets

Add the three secrets at the repository level (not an environment):

GitHub repo → **Settings** → **Secrets and variables** → **Actions** →
**Repository secrets** → **New repository secret**.

Add each of:
- `AWS_ROLE_ARN`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

The release workflows use `secrets: inherit` to forward repository secrets into
reusable workflows. No `environment: prod` declaration is used — the workflows
access secrets directly from the repository scope.

If you later add a staging environment or want required-reviewer protection on
deploys, migrate to environment secrets. You would need to add
`environment: prod` to each deploy job in `release-affected.yml`,
`release-all.yml`, and `release-shell.yml`, and move the three secrets to a
`prod` environment in GitHub Settings.

## Rollback

There are no per-project release tags. Rollback is commit-based.

**Primary path — revert on main:**
Revert the offending commit(s) on main and push. The next push triggers
`release-affected.yml`, which redeploys only the affected projects with the
reverted code. Only the CloudFront paths for the changed apps are invalidated.

**Fast path — redeploy everything from a known-good SHA:**
Run `release-all.yml` manually from the GitHub Actions UI. In the "Use workflow
from" selector, enter the branch name or commit SHA you want to restore. This
redeploys all six apps without crafting a revert PR. Use this when you need an
immediate known-good state and can tolerate a full redeploy.

**Last-resort path — individual S3 object restore:**
S3 versioning is enabled on the bucket. If a specific object is corrupted and
you need to restore it outside the normal workflow path, use the AWS S3 console
or CLI to restore the previous object version. This is a break-glass operation
and bypasses the normal deploy pipeline.

Infrastructure rollback: use CloudFormation stack rollback or re-deploy the
previous template.

## OIDC trust scope

The IAM role's trust policy uses a wildcard sub claim:

```
repo:EduardoMolinar/kick-platform:*
```

This allows any branch or tag in the repository to assume the role. The release
workflows (`release-affected.yml`, `release-all.yml`) trigger on pushes to
`main` and `workflow_dispatch`. Both trigger types are covered by the wildcard.

If you want tighter control, restrict the sub claim to the branch and ref
patterns used by the release workflows:

```
repo:EduardoMolinar/kick-platform:ref:refs/heads/main
```

`workflow_dispatch` does not populate a ref-based sub claim, so adding
`workflow_dispatch` access requires either keeping the wildcard or accepting
that `release-all.yml` manual runs can only be initiated from the GitHub UI
(which uses the repository's default branch ref, covered by the `main` pattern
above if the token is scoped to the branch, not the triggering user).
