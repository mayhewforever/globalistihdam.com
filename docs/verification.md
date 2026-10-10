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

- Professional bilingual homepage and shared visual system across public pages, retaining the logo’s human/orbit identity with a full-colour Türkiye-centred mark, four-slide hero, six-sector carousel, audience links, Final–Hull feature and investment, insights and contact banners.
- Local search covering 83 public pages in each language, with keyboard controls and a clear empty state.
- Consistent bilingual section names and one responsive section-heading type scale.
- Strict local search paths, approved social-link hosts, exact-hash script CSP and referrer policy in all public HTML shells.
- Bilingual news panels with twelve initially verified stories, publication/source/check timestamps, safe links, bounded fetches, stale warnings and a local fallback; shared live JSON supports unattended updates without redeployment.
- Public KVKK links and a current-notice landing page use the separate portal as the canonical privacy source.
- Removed the temporary-preview banner and unfinished email placeholder from the public experience.

## Public deployment

The marketing website is published at https://globalistihdam.mtoman.chatgpt.site with public access. The most recent completed deployments before this visual update were marketing version 3 and application backend version 19. This source is the next visual revision. Routine news-data refreshes require only a feed commit.

## Check results

- Static checks: 9,729 passed across 83 HTML shells, 75 detail routes, 162 Turkish/English page constructors and 37 local assets. 342 external URL formats were checked; their contents and availability were not all inspected.
- Simulated DOM checks: 443 passed, including language changes, form-value preservation, skip navigation, mobile menu dismissal, retained campaign sections, carousel keyboard and expansion controls, and representative deep routes at both hosting paths.
- News checks: all twelve feed items passed schema/date/source/bilingual-length validation; 222 offline rendering, routing, fallback and unsafe-input checks passed.
- JavaScript syntax checks passed for the active bundle, hosting runtime and homepage script.

## Remaining verification

- GitHub Pages remains disabled. Google passkey verification prevented the browser sign-in needed for its administration settings. The public website is hosted through Sites instead; Pages is optional and its expected URL should not be shared as live.
- A graphical browser preview was unavailable in this environment. Layout, mobile viewport appearance and actual carousel movement have not been visually certified.
- Direct requests to the separate portal and robotics site returned HTTP 403 in this environment. The hosting service reports the existing site active and public, but these responses do not establish that its authenticated user journeys succeed or fail. Test sign-in, submission, file upload, staff review and status tracking with authorised accounts on that service.
- No live application or outbound email was submitted during verification.
- The four email addresses are setup specifications. Mailbox existence, DNS configuration and inbound/outbound delivery remain unverified; new contact links are not published.
