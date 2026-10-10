# Security review — 10 October 2026

## Public marketing site

- Query and stored language values are restricted to supported languages.
- Search input and result text use text nodes, not HTML interpolation.
- Search targets must stay on the same origin and within the active hosting path. Executable schemes, network-path URLs, path traversal, control characters and backslashes are rejected.
- Social configuration accepts only HTTPS URLs on the approved Instagram, YouTube and TikTok hosts, without embedded credentials or custom ports.
- Each HTML shell contains an early Content Security Policy. Only same-origin JavaScript and the exact two hashed bootstrap scripts may execute; script `unsafe-inline` and `unsafe-eval` are not allowed. Object embedding, frames and base URL changes are disabled. Forms are limited to the current origin and the existing application service.
- Inline styles remain permitted because the existing UI requires them. A strict referrer policy limits information sent to other origins.
- Existing logo artwork, images and campaign components are preserved.

The policy hash generator is `scripts/update-security-policy.mjs`. The static checker validates hashes against actual script bytes; DOM checks cover malformed links and malicious text. The final local checks passed 9,476 static assertions and 451 simulated DOM assertions.

## Application service

The authenticated portal and administrator tools run on the separate existing service at https://global-istihdam.mtoman.chatgpt.site. The marketing repository does not contain its applicant records, credentials, database or administrator permissions. Its server-side controls are reviewed and deployed separately.

## Limits

These are source and synthetic-test results, not a penetration-test certificate or a guarantee against compromise. No live application or outbound email was submitted. A pattern scan found no common private-key/API-token signatures in the reviewed source, but this is not an exhaustive historical secret audit.

Direct network requests from this environment received HTTP 403 from the hosting gateway. Accordingly, this review does not attest to production HTTP response headers, successful authenticated browser journeys or hosting-injected script compatibility. The HTML CSP is a browser resource policy; it does not claim HTTP header enforcement or clickjacking protection. Graphical browser testing was unavailable.

Dependency advisories, hosting infrastructure, account recovery and malware scanning for submitted documents require separate ongoing review. Keep administrator access restricted and review hosting and identity-provider security updates.
