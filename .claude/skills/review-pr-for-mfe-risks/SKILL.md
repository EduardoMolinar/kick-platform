---
name: review-pr-for-mfe-risks
description: Review a pull request for micro-frontend architecture risks. Use when code changes affect shell/remote boundaries, shared libraries, runtime dependency sharing, route ownership, or deployment blast radius.
compatibility: Designed for Claude Code on Angular + Nx micro-frontend repos.
---

# Goal

Catch architecture drift before merge.

# Review checklist

1. Ownership
   - Is the code in the right layer?
   - Did a domain-specific change leak into shared code or shell?

2. Coupling
   - Any cross-remote imports?
   - Any shared-lib changes that create hidden dependencies?

3. Runtime behavior
   - Any risk to remote loading, route ownership, or shared session behavior?
   - Any platform dependency changes that could affect runtime compatibility?

4. Deployability
   - Can the intended app still deploy independently?
   - Does this change silently require shell rebuild or manifest update?

5. Test coverage
   - Are validations proportional to the risk?

# Output expectations

Return:
- findings ordered by severity
- affected areas
- whether the PR is safe to merge, needs changes, or needs architecture review
