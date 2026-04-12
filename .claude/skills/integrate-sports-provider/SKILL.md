---
name: integrate-sports-provider
description: Evaluate or integrate a sports data provider. Use when adding provider adapters, normalizing responses, comparing free secure APIs, mapping competitions, or defining provider-to-backend contracts.
compatibility: Designed for Claude Code on a sports app with backend provider mediation.
---

# Goal

Bring in provider data without coupling the product to a provider's raw schema.

# Process

1. Confirm the target coverage.
   - Champions League
   - La Liga
   - Premier League
   - international football
2. Compare the provider against product needs:
   - coverage
   - live freshness
   - free-tier limits
   - stability
   - legal or ToS concerns
3. Keep provider-specific mapping in backend adapter code.
4. Normalize backend DTOs for frontend use.
5. Define cacheability:
   - Redis TTL
   - stale tolerance
   - fallback behavior on miss or quota issues
6. Document known provider gaps or assumptions.

# Output expectations

Always include:
- provider being evaluated or integrated
- normalized contracts introduced or changed
- cache/freshness policy
- risks or provider limitations
