# Globalistihdam Recruitment & Investment Agency

**[Open the public website](https://globalistihdam.mtoman.chatgpt.site)** · [GitHub project](https://github.com/mayhewforever/globalistihdam.com)

Professional bilingual static marketing website for recruitment, education and business advisory. The public pages run on GitHub Pages under `/globalistihdam.com/` or on a domain's root path.

Applications, administration and robotics services link to the existing separate site at `https://global-istihdam.mtoman.chatgpt.site`. This repository does not contain application records, credentials or server code. Submitting and tracking an application requires the separate portal to be available and the visitor to complete its sign-in process.

## Publish

The current public website is deployed with Sites at `https://globalistihdam.mtoman.chatgpt.site`. Its public marketing files mirror this repository. GitHub pushes do not automatically deploy that Site; publish the updated static files through Sites after source changes. The separate application portal remains at `https://global-istihdam.mtoman.chatgpt.site`.

GitHub Pages is an optional additional hosting target. To enable it:

GitHub repository → **Settings → Pages → Deploy from a branch → main → / (root) → Save**.

After GitHub reports a successful deployment, the expected address is `https://mayhewforever.github.io/globalistihdam.com/`. Pages was not enabled when this repair began. The repository name does not establish domain ownership and no custom domain is configured. Mailbox setup is independent of website hosting.

## Verify

Use Node.js 20 or later:

```sh
npm ci
npm test
```

`npm run test:static` requires no installed dependencies. It checks public routes in Turkish and English, shell loading paths, metadata generation, local assets, language resolution and URL rewriting. The DOM tests check menus, skip navigation, form-value preservation and bilingual controls without making external submissions. They are simulated DOM tests, not visual browser tests.

The static website has no build step. After changing public page content, run `node scripts/build-search-index.mjs` to regenerate local search. After changing either inline HTML bootstrap script, run `node scripts/update-security-policy.mjs` to refresh the exact script hashes in the Content Security Policy. Retain `assets/hosting-runtime.js` alongside the existing compiled component bundle. The HTML shells load the runtime and professional homepage before the component bundle, followed by site search; the homepage then loads `site.js`. Existing generated components are preserved. Future source exports must retain the static-host fixes or be reviewed before replacing these assets.

## Prepared email setup

See [email setup, four account specifications, signatures and bilingual acknowledgements](docs/email/README.md). These materials do not create mailboxes. Activate website email links only after the provider confirms the accounts and delivery has been tested.

## Verification limits

See [repair record](docs/verification.md) for completed checks and remaining deployment and authenticated-service checks.

## Security scope

See [security review](docs/security-review.md) for the controls and verification limits. The static site is separate from the authenticated application service. No security review can establish that a site is impossible to compromise.
