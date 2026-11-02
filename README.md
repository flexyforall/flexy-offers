# Flexy Offers

Client offer pages for Flexy Global. One template, one Google Sheet per client.

`https://flexyforall.github.io/flexy-offers/?c=<file name>` — via Apps Script (main)
`https://flexyforall.github.io/flexy-offers/?id=<Google Sheet ID>` — direct, sheet shared by link (fallback)

## New offer
1. In Google Drive → **Offers** (flexyforall), make a copy of `_template`, name it with the client slug (e.g. `acme-7k2f`).
2. Fill it in like a normal invoice. Keep the label texts (`Invoice for`, `Description`, `Subtotal`, …).
3. Send `…/flexy-offers/?c=acme-7k2f`. The sheet stays private.

Fallback without the script: share the sheet as "Anyone with the link → Viewer" and make a link in `make.html`.

Edits in the sheet show up on the page after a refresh (Google may take a minute or two).
Unsharing the sheet closes the offer.

## Files
- `index.html` — the page (Three.js book + sand). Reads the first tab of the sheet as CSV and parses it by labels.
- `make.html` — turns a sheet link into a client link.
- `apps-script/Code.gs` — the Apps Script web app behind `?c=`. Deployed from a second Google account that has Viewer access to the Offers folder (web apps from flexyforall are blocked). After editing: Deploy → Manage deployments → Edit → New version.
