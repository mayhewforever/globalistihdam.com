# Website repair record

Date: 10 October 2026

## Completed

- Portable loading from the GitHub Pages project path and a domain root.
- Normalised trailing-slash and explicit `index.html` routes.
- Social links load from the supplied `social.json`, not a missing API endpoint.
- Shared Turkish/English resolution, validated saved language, and translated social content after language changes.
- Preserved education form values during language changes.
- Skip-to-content preserves the selected page and moves focus to content.
- Escape dismisses mobile navigation and restores focus. Inner-page menus also dismiss on outside interaction.
- Local homepage images and slider backgrounds; the missing robotics thumbnail now uses the existing manufacturing photograph with an accurate caption.
- Consistent service navigation and routing to the existing separate portal, administrator and robotics pages.
- Explicit loading-error fallbacks, including a failed homepage script request.
- Repeatable static and simulated DOM checks included in `scripts/`.

- Professional bilingual homepage and shared visual system across public pages, retaining the original logo artwork, four-slide hero, six-sector carousel, audience links, Final–Hull feature and investment, insights and contact banners.
- Local search covering 83 public pages in each language, with keyboard controls and a clear empty state.
- Removed the temporary-preview banner and unfinished email placeholder from the public experience.

## Check results

- Static checks: 8,547 passed across 83 HTML shells, 75 detail routes, 162 Turkish/English page constructors and 36 local assets. 340 external URL formats were checked; their contents and availability were not all inspected.
- Simulated DOM checks: 435 passed, including language changes, form-value preservation, skip navigation, mobile menu dismissal, retained campaign sections, carousel keyboard and expansion controls, and representative deep routes at both hosting paths.
- JavaScript syntax checks passed for the active bundle, hosting runtime and homepage script.

## Remaining verification

- GitHub Pages was not enabled at the start; its expected URL returned HTTP 404. The current connection cannot change Pages settings. Enable Pages in repository settings, then verify the deployment and public URL.
- A graphical browser preview was unavailable in this environment. Layout, mobile viewport appearance and actual carousel movement have not been visually certified.
- Direct requests to the separate portal and robotics site returned HTTP 403 in this environment. The hosting service reports the existing site active and public, but these responses do not establish that its authenticated user journeys succeed or fail. Test sign-in, submission, file upload, staff review and status tracking with authorised accounts on that service.
- No live application or outbound email was submitted during verification.
- The four email addresses are setup specifications. Mailbox existence, DNS configuration and inbound/outbound delivery remain unverified; new contact links are not published.
