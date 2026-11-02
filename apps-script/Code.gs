/**
 * Flexy Offers API
 * Reads a client sheet from the "Offers" Drive folder and returns it as JSON.
 *
 *   https://script.google.com/macros/s/<DEPLOY_ID>/exec?c=acme
 *
 * - Looks only inside the folder below. Files whose name starts with "_" (e.g. _template) are never served.
 * - Reads the first sheet and finds data by its labels ("Invoice for", "Description", "Subtotal"…),
 *   so rows can be added and columns renamed/added freely. Keep the label texts themselves.
 */

const FOLDER_ID = '1SKUYYd6hHAREBk_f9Yvj5To7bW5jRkOO'; // Google Drive → Offers
const CACHE_SECONDS = 60;                               // edits show up on the site within a minute

function doGet(e) {
  const slug = String((e && e.parameter && e.parameter.c) || '').trim();
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/i.test(slug)) return json_({ error: 'not_found' });

  const cache = CacheService.getScriptCache();
  const hit = cache.get('offer:' + slug);
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  const files = DriveApp.getFolderById(FOLDER_ID).getFilesByName(slug);
  if (!files.hasNext()) return json_({ error: 'not_found' });
  const file = files.next();
  if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) return json_({ error: 'not_found' });

  const sheet = SpreadsheetApp.openById(file.getId()).getSheets()[0];
  const data = parseOffer(sheet.getDataRange().getDisplayValues());
  data.slug = slug;
  data.updated = file.getLastUpdated().toISOString();

  const out = JSON.stringify(data);
  cache.put('offer:' + slug, out, CACHE_SECONDS);
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- parsing (pure function, no Google APIs) ---------- */

function parseOffer(grid) {
  const norm = v => String(v == null ? '' : v).trim();
  const low = v => norm(v).toLowerCase().replace(/\s+/g, ' ').replace(/:+$/, '').trim();
  const rows = grid.map(r => r.map(norm));

  const find = (label, startsWith) => {
    const want = low(label);
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < rows[r].length; c++) {
        const v = rows[r][c].toLowerCase();
        if (startsWith ? v.indexOf(want) === 0 : low(rows[r][c]) === want) return { r, c };
      }
    return null;
  };
  const cell = (r, c) => (rows[r] && rows[r][c]) || '';
  const below = (label, n) => { const p = find(label); return p ? cell(p.r + (n || 1), p.c) : ''; };
  const belowList = (label, max) => {
    const p = find(label); if (!p) return [];
    const out = [];
    for (let i = 1; i <= max; i++) { const v = cell(p.r + i, p.c); if (!v) break; out.push(v); }
    return out;
  };

  // header block
  const head = find('description');
  const titleCell = (() => {           // the line right above "Submitted on…" — any text, e.g. "Offer Acme"
    const p = find('submitted on', true);
    if (p) for (let r = p.r - 1; r >= 0; r--) { const v = cell(r, p.c); if (v) return v; }
    const words = ['invoice', 'proposal', 'offer', 'quote', 'estimate'];
    for (let r = 0; r < (head ? head.r : rows.length); r++)
      for (let c = 0; c < rows[r].length; c++) if (words.indexOf(low(rows[r][c]).split(' ')[0]) >= 0) return rows[r][c];
    return 'Offer';
  })();
  const submitted = (() => { const p = find('submitted on', true); return p ? cell(p.r, p.c).replace(/^submitted on\s*/i, '') : ''; })();

  const client = belowList('invoice for', 4);
  const from = (() => {               // company block at the very top (above the title)
    const out = [];
    for (let r = 0; r < rows.length && out.length < 4; r++) {
      const v = rows[r].filter(Boolean)[0];
      if (!v) { if (out.length) break; continue; }
      if (low(v) === low(titleCell)) break;
      out.push(v);
    }
    return out;
  })();

  // items table: header row = row with "Description", read until "Notes" / "Subtotal"
  let columns = [], items = [], stop = rows.length;
  if (head) {
    const hr = rows[head.r];
    for (let c = head.c; c < hr.length; c++) if (hr[c]) columns.push({ label: hr[c], col: c });
    const notesAt = find('notes'), subAt = find('subtotal');
    stop = Math.min(notesAt ? notesAt.r : rows.length, subAt ? subAt.r : rows.length);
    for (let r = head.r + 1; r < stop; r++) {
      const vals = columns.map(k => cell(r, k.col));
      if (!vals[0]) continue;                     // skip rows without a description (empty formula rows)
      items.push(vals);
    }
  }

  // totals: label/value pairs from the "Subtotal" row down; a lone money value is the grand total
  const totals = []; let total = '';
  const sub = find('subtotal');
  if (sub) {
    for (let r = sub.r; r < rows.length; r++) {
      const label = cell(r, sub.c), value = cell(r, sub.c + 1);
      if (!label && !value) continue;
      if (/^[-–]?\s*[$€£₽]|[\d.,]+\s*[$€£₽]?$/.test(label) && !value) { total = label; continue; }
      if (label) totals.push({ label, value });
    }
  }

  // notes: text next to or under "Notes:"
  const notes = (() => {
    const p = find('notes'); if (!p) return '';
    const inline = rows[p.r].slice(p.c + 1, sub ? sub.c : undefined).filter(Boolean);
    const under = [];
    for (let r = p.r + 1; r < rows.length; r++) {
      const v = rows[r].slice(p.c, sub ? sub.c : undefined).filter(Boolean);
      if (!v.length) continue; under.push(v.join(' '));
    }
    return inline.concat(under).join('\n');
  })();

  return {
    title: titleCell,
    submitted,
    number: below('invoice #', 1),
    due: below('due date', 1),
    project: below('project', 1),
    client: { name: client[0] || '', company: client[1] || '', address: client.slice(2) },
    payableTo: below('payable to', 1),
    from,
    columns: columns.map(k => k.label),
    items,
    totals,
    total,
    notes
  };
}
