---
name: review-pr-for-security
description: Review frontend changes for security and privacy issues. Use when code changes affect auth/session, browser storage, untrusted content, permissions, tokens, PII, logging, or sensitive workflows.
compatibility: Designed for Claude Code on banking-style or security-sensitive frontend applications.
---

# Goal

Detect security regressions early and explain them clearly.

# Review checklist

1. Sensitive data handling
   - Are tokens, identifiers, or PII stored or logged unsafely?
   - Is browser persistence used unnecessarily?

2. Trust boundaries
   - Does the UI render untrusted content?
   - Are unsafe DOM APIs or bypasses introduced?

3. Auth and authorization
   - Any stale permission risk?
   - Any route guard or interceptor inconsistency?
   - Any logout or clear-session gaps?

4. Request behavior
   - Any accidental credential leakage?
   - Any missing anti-CSRF assumptions where relevant?

5. Dependency and third-party usage
   - Any new package or API that increases attack surface?

# Output expectations

Return:
- severity
- why it matters
- concrete file/pattern references
- minimal mitigation steps
