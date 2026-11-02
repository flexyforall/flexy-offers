# Flexy Offers

Client offer pages for Flexy Global. One template, one Google Sheet per client.

`https://flexyforall.github.io/flexy-offers/?id=<Google Sheet ID>`

## New offer
1. In Google Drive → **Offers** (flexyforall), make a copy of `_template` and fill it in like a normal invoice.
   Keep the label texts (`Invoice for`, `Payable to`, `Project`, `Invoice #`, `Due date`, `Submitted on`, `Description`, `Subtotal`, `Notes:`). Only the first tab is read.
2. **Share → General access → Anyone with the link → Viewer.**
3. Open https://flexyforall.github.io/flexy-offers/make.html, paste the sheet link, copy the client link.

Edits in the sheet show up after a page refresh (Google may take a minute).
Switching the sheet back to Restricted closes the offer.

## Files
- `index.html` — the page (Three.js book + sand). Reads the first tab of the sheet as CSV and parses it by labels.
- `make.html` — turns a sheet link into a client link.
- `apps-script/Code.gs` — an Apps Script variant (`?c=<file name>`). Not used: public web-app deployments fail on our accounts. Kept for reference and for `testAcme` checks.
