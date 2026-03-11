# Alado/Helena E-Commerce Automation — Master Context for Claude Code

> **Purpose:** Full reference for building/editing n8n workflows for Algerian e-commerce operations.  
> **n8n instance:** `https://n8n.srv1231456.hstgr.cloud`  
> **Server IP to whitelist with delivery APIs:** `31.97.177.156`

---

## 1. SHOPS & IDENTITIES

| Shop | Bot Name | Telegram Credential ID | Google Sheets ID |
|---|---|---|---|
| **Alado** | Alado Bot | `zvNgz6Hs0U4luSCA` | `1Qjr-btus-j-BWtuHHWOdcwBKSQsEKTa6-oI2RFaTpB0` |
| **Helena** | Helena BOT | `4xbJIn00RkZMFuLR` | `1y_23sWk5pgVZMfq2lAwEb-Jlt4Db6bBbSL0AaOgyk8c` |

**Shared credentials:**
- Google Sheets OAuth: `FZxCqZWvDGmj14fY` ("Google Sheets account")
- Gemini 2.5 Flash: `KAhqPkSKmWcvoJaQ`
- Operator Telegram chat ID (Yousri): `7448243821`

---

## 2. GOOGLE SHEETS STRUCTURE

### Alado — "alado khaled" spreadsheet
- **Sheet:** `Processing Orders` (gid `402469875`)
- **Header row:** 2, **First data row:** 3
- **Key columns:**
  - `CONFERMATION` — must equal `CONFERMEE` to be eligible
  - `LIVRASION` — tracking number (empty = not sent yet)
  - `société de livraison` — delivery company (NOEST / DHD / ZR / Yalidine)
  - `API STATUS` — set to `Success ✅` after successful submission
  - `TRACKING` — tracking code returned by API
  - `PHONE` — customer phone
  - `WILAYA` — wilaya (stored as `DZ-16` or `16-Alger` format; must be parsed to integer)
  - `TYPE LIVRASION` — Arabic: `للمكتب` (stop desk) or `للمنزل` (home delivery)
  - `NOTE` — must exist (non-empty) to be eligible for NOEST

### Helena — "cliente final (Yousri API)" sheet (gid `321695792`)
- **Key columns:**
  - `Type de livraison ` *(note trailing space)* — `À domicile` or `Stop Desk`
  - `API STATUS` — empty = not sent yet
  - `ZR account` — `Aziz` or `Khaoula` (determines which ZR credential to use)
  - `numero telephone` — customer phone
  - `Commune (à domicile) ` — commune for home delivery
  - `Commune Stop Desk` — commune for stop desk
  - `Wilaya` — wilaya name/number

---

## 3. DELIVERY APIs

### 3A. DHD / ECOTRACK
**Base URL:** `https://platform.dhd-dz.com`  
**Auth:** `?api_token=YOUR_TOKEN` (query param)  
**Rate limits:** 50 req/min · 1,500/hr · 15,000/day

#### Create Single Order
```
POST /api/v1/create/order?api_token={{token}}
```
Required fields:
```json
{
  "nom_client": "string (max 255)",
  "telephone": "0XXXXXXXXX",
  "adresse": "string",
  "commune": "exact name from /api/v1/get/communes",
  "code_wilaya": 16,
  "montant": 5000,
  "type": 1
}
```
Optional: `stop_desk` (0=home, 1=stop desk), `telephone_2`, `reference`, `remarque`, `produit`, `weight`, `fragile`, `boutique`

#### Create Bulk Orders
```
POST /api/v1/create/orders?api_token={{token}}
Body: { "orders": { "0": {...}, "1": {...} } }
```

#### Tracking
```
GET /api/v1/get/order/status?api_token={{token}}&tracking={{code}}
GET /api/v1/get/order/history?api_token={{token}}&tracking={{code}}
```

#### Reference endpoints
```
GET /api/v1/get/wilayas?api_token={{token}}
GET /api/v1/get/communes?api_token={{token}}&code_wilaya=16
GET /api/v1/get/fees?api_token={{token}}
```

**DHD-specific rules:**
- `commune` must be **exact match** from `/api/v1/get/communes`
- `code_wilaya` must be **integer** (not string, not `DZ-16`)
- `tarif_stopdesk: "0"` means stop desk unavailable for that wilaya
- Success check: verify `tracking` field exists and is not null in response
- Final statuses to exclude from polling: `LIVREE`, `Annulé`, `RETOUR`, `Retour archivé`

### 3B. ZR Express
- Two accounts: **Aziz** and **Khaoula** (separate API credentials)
- Routes: `À domicile` (home) and `Stop Desk`
- Requires `commune_id` and `wilaya_id` looked up from "Station ID (organized)" sheet
- Station lookup sheet is in the Helena spreadsheet, tab name: `Station ID (organized)`
  - Filter by `Level = WILAYA` and `Wilaya = {{wilayaValue}}` for wilaya-level ID
  - Filter by `Level = COMMUNE` for commune-level station ID

### 3C. NOEST
- Requires stop desk station code from `/api/public/desks` endpoint
- Unlike DHD, NOEST needs station codes (not just commune names)
- Orders filtered by: `CONFERMEE` + `NOEST` + `NOTE` non-empty + `TRACKING` empty

### 3D. Yalidine
- Triggered by `/send_confirmed_orders_to_yalidin` command in Alado bot

---

## 4. DATA NORMALIZATION RULES

### Phone normalization
```javascript
// Alado format: 0XXXXXXXXX
let phone = value.toString().trim().replace(/\D/g, '');
if (phone.startsWith('213')) phone = phone.slice(3);
if (!phone.startsWith('0')) phone = '0' + phone;

// Helena/ZR format: +213XXXXXXXXX
let phone = value.toString().trim().replace(/\D/g, '');
if (phone.startsWith('213')) phone = phone.slice(3);
if (phone.startsWith('0')) phone = phone.slice(1);
phone = '+213' + phone;
```

### Wilaya normalization (always parse to integer)
```javascript
let wilaya = value.toString();
// Handles: "DZ-16", "16-Alger", "16", " 16 "
if (wilaya.includes('-')) {
  const parts = wilaya.split('-');
  // "DZ-16" → take index 1; "16-Alger" → take index 0
  wilaya = parts.find(p => /^\d+$/.test(p.trim())) || parts[1];
}
wilaya = parseInt(wilaya.trim(), 10);
```

### Stop desk detection (Arabic)
```javascript
const type = (value || '').toString().trim().toLowerCase();
if (type.includes('للمكتب') || type.includes('llmaktab') || type.includes('مكتب')) {
  stop_desk = 1; // Stop Desk
} else if (type.includes('للمنزل') || type.includes('llmanzil') || type.includes('منزل')) {
  stop_desk = 0; // Home Delivery
} else {
  stop_desk = null; // Unknown — flag for manual review
}
```

---

## 5. N8N PATTERNS & BEST PRACTICES

### General workflow structure
```
Telegram Trigger → Command Router (Switch) → Start Notification → 
Get All Orders (Sheets) → Filter Eligible Orders (IF) → 
Format Data (Code) → Loop Over Orders (SplitInBatches) → 
[Lookup / API Call] → Update Sheet Row → Wait 1s → Loop back →
[Loop done] → Build Summary → Send Summary (Telegram)
```

### Key patterns
- **`$vars` is unreliable** — use `$input.all()` iteration with flags on items instead
- **Stamp-before-loop:** Copy key fields (`_rowId`, `_currentStatus`, etc.) onto items before entering SplitInBatches loop so they survive HTTP node transformations
- **Google Sheets formula prefix bug:** Strings starting with `=` cause `#ERROR!` — always strip/escape before writing
- **Wait 1s** between API calls to avoid rate limiting — use n8n-nodes-base.wait with 1 second
- **Error fallback:** All Telegram send nodes should have an error path that also notifies Telegram
- **Emoji-prefixed node names** for visual clarity (e.g., `🔍 Filter Orders`, `📡 Send to DHD`)

### SplitInBatches loop pattern
```
SplitInBatches (batchSize:1)
  → [output 0: done] → Build Summary
  → [output 1: loop] → Process Item → Wait 1s → back to SplitInBatches
```

### Commune deduplication (DHD)
Same commune name can exist across multiple wilayas. Always match on:
1. Wilaya integer (from parsed wilaya code)
2. Then commune name exact match within that wilaya

### Google Sheets update node
Always use `row_number` from the original sheet read to update the correct row:
```javascript
// In update node, set "Row Number" to:
={{ $('Get All Orders').item.json['row_number'] }}
```

---

## 6. TELEGRAM BOT COMMANDS

### Alado Bot commands
| Command | Action |
|---|---|
| `/send_confirmed_orders_to_noestt` | Submit eligible orders to NOEST |
| `/send_confirmed_orders_to_yalidin` | Submit eligible orders to Yalidine |
| `/send_confirmed_orders_to_zr` | Submit eligible orders to ZR Express |

### Helena Bot commands
| Command | Action |
|---|---|
| `/sendorders` | Submit eligible orders to ZR Express |
| `/deliveryprice` | Query ZR delivery prices by wilaya |

### Telegram message format
- Use `parse_mode: Markdown`
- Set `appendAttribution: false`
- Bold values: `*value*`
- Always send start notification before processing and summary after

---

## 7. WHATSAPP (GREEN API)

- **Instance:** `waInstance7103537389`
- **Phone format for Green API:** `213XXXXXXXXX@c.us`
- **Conversion:**
  ```javascript
  // From 0XXXXXXXXX to Green API format:
  const greenPhone = '213' + phone.replace(/^0/, '') + '@c.us';
  ```
- WF1: Triggered on new Google Sheets row → order confirmation message
- WF2: Triggered when TRACKING column is filled → dispatch notification
- System prompt for AI agent: Modern Standard Arabic only, strict reply format

---

## 8. SUPABASE (FINANCE)

- **Project ID:** `acksfqmouveyyzwqsdph`
- **Table:** `finance`
- Use `get_project_url` and `get_publishable_keys` as separate MCP calls
- Finance dashboard: `finance_dashboard.html` (dark theme, Chart.js)

---

## 9. ERROR CODES & DEBUGGING

| Code | Meaning | Fix |
|---|---|---|
| `401` | Invalid/expired token | Regenerate API token |
| `403` | IP not whitelisted | Whitelist `31.97.177.156` |
| `404` | Route not found | Check endpoint URL spelling |
| `422` | Validation error | Check commune name exact match, wilaya as integer |
| `429` | Rate limit exceeded | Add Wait node between requests |

---

## 10. WORKFLOW IDs & INSTANCE INFO

- **n8n instance ID:** `4b68637a617e42a16b74548b40488ac0c0b8b268a188be00a36b2f7f37e9abf5`
- **Alado bot webhook ID:** `alado-webhook-001`
- **Helena bot webhook ID:** `78f01efc-de5a-4c71-9694-7fed3e61ff8d`

---

## 11. QUICK REFERENCE — NODE TYPES

| Purpose | n8n Node Type |
|---|---|
| Telegram trigger | `n8n-nodes-base.telegramTrigger` (typeVersion 1.2) |
| Telegram send | `n8n-nodes-base.telegram` (typeVersion 1.2) |
| Google Sheets read | `n8n-nodes-base.googleSheets` (typeVersion 4.7) |
| Google Sheets update | `n8n-nodes-base.googleSheets` operation: `update` |
| IF condition | `n8n-nodes-base.if` (typeVersion 2.3) |
| Switch/Router | `n8n-nodes-base.switch` (typeVersion 3.4) |
| JavaScript code | `n8n-nodes-base.code` (typeVersion 2) |
| Loop | `n8n-nodes-base.splitInBatches` (typeVersion 3) |
| HTTP Request | `n8n-nodes-base.httpRequest` (typeVersion 4.2) |
| Wait | `n8n-nodes-base.wait` |
| Set fields | `n8n-nodes-base.set` |

---

## 12. SAMPLE CODE NODES

### Format Data (Alado style — DHD/NOEST)
```javascript
const items = $input.all();
for (const item of items) {
  // Phone
  let phone = item.json.PHONE?.toString().trim().replace(/\D/g, '') || '';
  if (phone.startsWith('213')) phone = phone.slice(3);
  if (!phone.startsWith('0')) phone = '0' + phone;
  item.json.PHONE = phone;

  // Wilaya → integer
  let wilaya = item.json.WILAYA?.toString() || '';
  if (wilaya.includes('-')) wilaya = wilaya.split('-').find(p => /^\d+$/.test(p.trim()));
  item.json.WILAYA = parseInt(wilaya.trim(), 10);

  // Stop desk
  const type = (item.json['TYPE LIVRASION'] || '').toLowerCase();
  item.json.stop_desk = type.includes('للمكتب') ? 1 : type.includes('للمنزل') ? 0 : null;
}
return items;
```

### Build Telegram Summary
```javascript
const items = $input.all();
let success = 0, failed = 0, errors = [];
for (const item of items) {
  if ((item.json['API STATUS'] || '').includes('Success')) success++;
  else { failed++; errors.push(item.json.PHONE || 'unknown'); }
}
return [{
  json: {
    summary: `✅ *${success}* envoyées\n❌ *${failed}* échouées${errors.length ? '\n\nErreurs:\n' + errors.join('\n') : ''}`
  }
}];
```