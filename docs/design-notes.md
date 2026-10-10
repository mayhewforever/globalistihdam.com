# Design direction and benchmarks

Reviewed 10 October 2026.

The redesign draws on the clarity of audience routing and service descriptions found on the official [Randstad](https://www.randstad.com/), [Adecco](https://www.adecco.com/?language=en) and [IDP](https://www.idp.com/) websites. These are design and information-architecture references, not affiliates or partners. Their designs, testimonials, client logos and performance figures have not been copied.

## Implementation

- A restrained navy, ivory and gold visual identity, with one typography and spacing system.
- Immediate routes for candidates, employers and students, followed by specific recruitment, education, business and robotics services.
- Country and sector exploration using the site's existing content and photography.
- A searchable catalogue of the site's public pages in Turkish and English.
- Consistent navigation, footer, deep-page presentation, keyboard focus and responsive breakpoints.
- Clear next actions using the existing application portal or contact channel.
- No invented placement totals, client logos, testimonials, guaranteed outcomes or accreditation claims.
- The established Globalistihdam logo artwork, composition and original responsive logo styling are preserved. The professional stylesheet deliberately leaves the `.agency-brand`, `.agency-symbol` and `.agency-wordmark` rules to the original style bundle.
- The original four-slide hero, service strip, six-route audience links, sector carousel, Final–Hull education feature, investment banner, insight banner and contact banner remain part of the homepage. Original photography and the branded banner artwork are retained. Typography, spacing, responsive arrangements and accessible controls are refined around them.
- Slider behaviour remains in the existing implementation, including keyboard navigation, previous/next controls, visible-slide counts, the expanded sector view and reduced-motion support. New editorial content and directory search complement these established sections.

The visual system is implemented in `assets/professional.css`; the bilingual homepage is in `assets/professional-home.js`. The static export, URL rules, public page content and separate application backend are retained.

Visual browser inspection and real-device testing remain a launch check; the available automated checks verify routes and simulated interactions.
