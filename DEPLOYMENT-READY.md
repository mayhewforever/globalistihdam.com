# Pending application-domain cutover

Do not deploy until `basvuru.globalistihdam.com` DNS and TLS are active and the guest application backend is publicly ready.

This release serves the public website at `globalistihdam.com` and sends guest applications and WhatsApp destination requests to `https://basvuru.globalistihdam.com`. Application submission must work without creating an account; administration and private application records must remain protected.

The public export comes from source revision `b149106680394d94e84a3b0eb0c4e5b02ea28b9d`. Its manifest and checksum whitelist cover only public files. The cPanel deployment script verifies these files before writing, backs up existing files privately, preserves unrelated files, and publishes the homepage last.

Prepared and checked locally only. DNS, TLS, backend readiness and live deployment remain separate prerequisites.
