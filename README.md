# Flexy Offers

Client offer pages for Flexy Global. One template, one Google Sheet per client.

`https://flexyforall.github.io/flexy-offers/?id=<Google Sheet ID>`

## New offer
1. In Google Drive → **Offers**, make a copy of `_template` and fill it in like a normal invoice.
   Keep the label texts (`Invoice for`, `Description`, `Subtotal`, …).
2. **Share → General access → Anyone with the link → Viewer.**
3. Open `make.html` (https://flexyforall.github.io/flexy-offers/make.html), paste the sheet link, copy the client link.

Edits in the sheet show up on the page after a refresh (Google may take a minute or two).
Unsharing the sheet closes the offer.

## Files
- `index.html` — the page (Three.js book + sand). Reads the first tab of the sheet as CSV and parses it by labels.
- `make.html` — turns a sheet link into a client link.
- `apps-script/Code.gs` — earlier Apps Script version of the same parser; not used by the page (web app access is blocked on this account), kept for `testAcme` checks in the editor.
