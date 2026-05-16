# Infrastructure (AWS CDK · TypeScript)

CDK stacks for Pitch. Currently the sports-proxy Lambda + supporting resources.

This folder is **not** part of the Nx workspace; it has its own `package.json`
and toolchain.

## Stack: SportsProxyStack

Provisions:
- **DynamoDB** table for response caching (TTL attribute `expiresAt`, on-demand billing).
- **Lambda** (Python 3.12, ARM64) built from [`../backend/sports-proxy/`](../backend/sports-proxy/).
  The `PythonFunction` construct Docker-bundles `requirements.txt` into the deployment
  package — **Docker must be running locally** for `cdk synth` / `cdk deploy`.
- **API Gateway HTTP API** with `/v1/{proxy+}` → Lambda.
- **IAM role** with least-privilege to DynamoDB + the SSM parameter.

## Prerequisites

1. Node 20.x (`node --version`).
2. AWS CLI configured with credentials for the target account.
3. Docker running (for Lambda bundling).
4. The CDK bootstrap stack deployed in the target account/region:
   ```bash
   npx cdk bootstrap aws://<account>/<region>
   ```
5. The API-Football key seeded in SSM **before** first deploy:
   ```bash
   aws ssm put-parameter \
     --name /pitch/sports/api-football-key \
     --type SecureString \
     --value '<RAPIDAPI_KEY>' \
     --region eu-west-1
   ```

## Usage

```bash
npm ci                                    # install CDK + alpha constructs
npm run synth                              # emit CloudFormation; verifies Docker bundle
npm run diff                               # compare against deployed stack
npm run deploy                             # deploy (requires AWS creds)
npm run destroy                            # tear down (dev only)
```

### Context overrides

```bash
npx cdk deploy -c stage=prod \
  -c currentSeason=2026 \
  -c allowedOrigins=https://dxxxxxx.cloudfront.net,http://localhost:4200 \
  -c ssmKeyName=/pitch/sports/api-football-key
```

## After deploy

The `apiUrl` stack output (e.g. `https://abc123.execute-api.eu-west-1.amazonaws.com`)
must be copied into `frontend/apps/shell/src/environments/environment.prod.ts`
under `sportsApiBaseUrl`, then commit + push to trigger a frontend deploy.

## IAM for CI (GitHub Actions OIDC)

The role assumed by the `deploy-backend.yml` workflow needs:
- `cloudformation:*` on the CDKToolkit and `SportsProxyStack-*` stacks
- `iam:PassRole` on the Lambda's execution role
- `lambda:*`, `apigateway:*`, `dynamodb:*` scoped to this stack's resources
- `ssm:GetParameter` on the API key parameter
- `s3:*` on the CDK bootstrap bucket
- `ecr:*` on the CDK bootstrap ECR repo (for Lambda asset uploads)
