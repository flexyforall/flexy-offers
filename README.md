# Flexy Offers

Client offer pages for Flexy Global. One template, one Google Sheet per client.

`https://flexyforall.github.io/flexy-offers/?c=<sheet-name>`

## New offer
1. In Google Drive → **Offers**, make a copy of `_template` and name it with the client slug (e.g. `acme-7k2f`).
2. Fill it in like a normal invoice. Keep the label texts (`Invoice for`, `Description`, `Subtotal`, …).
3. Send the link with `?c=<sheet-name>`. Edits in the sheet appear on the page within a minute.

Files whose name starts with `_` are never served.

## How it works
- `index.html` — the page (Three.js book + sand background). The data URL is set in `const API`.
- `apps-script/Code.gs` — the Google Apps Script web app that reads the sheet from the Offers folder and returns JSON. After changing it: Deploy → Manage deployments → Edit → New version.
