# Assests Manager — Cursor AI Development Guide

> Single-page Google Apps Script web app to fetch crypto wallet balances across multiple networks, fetch CoinMarketCap prices, and create financial records in Google Sheets. This file contains a Cursor‑friendly development plan, step-by-step prompts, code snippets, testing and deployment checklist.

---

## Overview

**Goal:** Build a single-page Google Apps Script (GAS) web app named **Assests Manager** that:

* Reads configured wallets and API keys from a Google Sheet (ENV and Wallets tabs).
* Fetches balances for wallets across supported networks (ETH, BSC, TRX, SOL, ADA, BTC, XRP, TON and KuCoin account balances for many tokens).
* Fetches live prices from CoinMarketCap (CMC) and calculates USD value per record.
* Writes financial records (balance snapshot or event-triggered records) to `Financial Records` sheet.
* Provides a small UI to trigger balance refresh and view last sync.

**Supported symbols:** (must support at least the provided list). The app should support token lookups by symbol and consult per-network token metadata (contract address, decimals) from the `Coins Management` sheet or KuCoin.

---

## Project structure (single `Code.gs` + `HTML` files)

* `setup.gs` — (already provided) setup, sheet creation and seed data.
* `api.gs` — backend functions exposed via `google.script.run` or ContentService endpoints.
* `balances/*.gs` — modular connectors per network (eth.js-like GAS modules): `eth.gs`, `bsc.gs`, `tron.gs`, `solana.gs`, `bitcoin.gs`, `xrp.gs`, `ton.gs`, `kucoin.gs`, `moralis_helpers.gs`.
* `ui.html` — single page UI (Bootstrap or vanilla) served by `doGet()`.
* `manifest (appsscript.json)` — scopes and webapp settings.

---

## Required Google Scopes (appsscript.json)

```json
{
  "timeZone": "Etc/UTC",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

> `script.external_request` is required for external API calls (CMC, Moralis, KuCoin, RPC endpoints).

---

## Cursor AI workflow (prompts + iterations)

Below are **Cursor-friendly prompts** to paste and iterate with Cursor AI. Use them in sequence to build the project incrementally.

### 1) Scaffolding (Cursor prompt)

```
You are an expert Google Apps Script engineer. Create a new GAS project scaffold for a single-page web app named "Assests Manager". Include files: setup.gs (seed sheets), api.gs (doGet, endpoints), eth.gs, kucoin.gs, ui.html, and appsscript.json. The API must expose endpoints to: runSetup(), fetchBalances(triggerType), getLastSync(). Use the provided setup.gs content as the starting file. Output the other files fully implemented with placeholder API keys and comments where real keys go. Keep code modular.
```

**Expected Cursor action:** generate `api.gs`, `eth.gs`, `kucoin.gs`, `ui.html`, `appsscript.json` files.

### 2) Implement CoinMarketCap (Cursor prompt)

```
Implement a GAS helper function `fetchCmcPrices(symbols: string[])` that calls CoinMarketCap `/v1/cryptocurrency/quotes/latest` using the CMC API key from ENV sheet. The function should retry up to MAX_RETRIES on failure, handle rate limit errors (HTTP 429) with exponential backoff, and return a map {SYMBOL: {price, market_cap, last_updated}}. Return zero price for unknown symbols. Add unit-like tests using a `test_fetchCmcPrices()` function that logs results for a small symbol set.
```

### 3) Implement KuCoin account balances (Cursor prompt)

```
Create a `kucoin.gs` GAS module with a function `fetchKucoinBalances(accountRow)` that reads API_KEY, API_SECRET, PASSPHRASE from the Wallets sheet and fetches spot account balances. Implement HMAC signing compatible with KuCoin REST API and pagination to collect all non-zero balances. Normalize tokens by symbol and decimals and return an array of {symbol, available, hold, total}. Add error handling for invalid creds.
```

### 4) Implement chain-native balance fetchers (Cursor prompt)

```
For each network module (eth.gs, bsc.gs, tron.gs, solana.gs, bitcoin.gs, xrp.gs, ton.gs), implement a function `getBalancesForAddress(address, symbolsList)` that: 1) for EVM chains uses public RPC + etherscan-like APIs or Moralis to fetch ERC20 balances for listed symbols; 2) for Tron uses TronGrid API; 3) for Solana uses Solscan or RPC getTokenAccountsByOwner; 4) for Bitcoin reads UTXO totals using blockstream API; 5) for XRP uses ripple-json RPC. The function must return normalized balances using decimals from TOKENS or Coins Management sheet. Provide placeholders and clear TODO comments where network-specific credentials are required.
```

### 5) Financial record writer (Cursor prompt)

```
Write a GAS function `appendFinancialRecord(record)` that writes a record to the `Financial Records` sheet. A record shape: {timestamp, type, network, symbol, address, balance, price_usd, value_usd, status}. Ensure concurrency-safe append (use getLastRow then setValues). Add optional deduplication by (timestamp, address, symbol) if duplicate protection flag is set in ENV.
```

### 6) Orchestrator `fetchAndStoreBalances(triggerType)` (Cursor prompt)

```
Implement `fetchAndStoreBalances(triggerType)` orchestrator that: 1) reads Wallets sheet rows, 2) for each active wallet, calls the appropriate network module to fetch balances for the configured tokens (use Coins Management as the token list), 3) fetches CMC prices for unique symbols in that run, 4) creates and appends Financial Records for each token found with price and USD value. Support a `DRY_RUN` flag from ENV to only log instead of append. Add progress logging and per-wallet error capture. Return a summary {fetchedRecords, errors, durationMs}.
```

### 7) UI & triggers (Cursor prompt)

```
Create `ui.html` with a simple SPA: header, last sync time, Run Now button, progress log area, and a small table preview of last 10 Financial Records. Wire `google.script.run.withSuccessHandler(...).fetchAndStoreBalances('MANUAL')` to the Run Now button. Add `auto-refresh` toggle. Ensure the UI is mobile-friendly.
```

### 8) Testing plan (Cursor prompt)

```
Provide a test plan for the GAS project: 1) Unit tests for CMC fetch (mocking responses); 2) Integration test calling `fetchAndStoreBalances` with a small Wallets sheet seeded with a known test ETH address and KuCoin sandbox account; 3) Load test: iterate 100 wallets but with DRY_RUN enabled; 4) Edge cases: missing API keys, invalid addresses, rate-limited APIs. Create helper test functions in `tests.gs` to run each test and log results.
```

---

## Implementation notes & snippets

### Reading environment values (helper):

```javascript
function readEnv(key, defaultValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const env = ss.getSheetByName('ENV');
  if (!env) return defaultValue;
  const data = env.getDataRange().getValues();
  for (let i=1;i<data.length;i++){
    if (String(data[i][0]) === key) return data[i][1];
  }
  return defaultValue;
}
```

### CoinMarketCap example (skeleton)

```javascript
function fetchCmcPrices(symbols) {
  const key = readEnv('CMC_API_KEY', '');
  if (!key) throw new Error('CMC API key missing in ENV');
  const url = GLOBAL_CONFIG.CMC_QUOTES_ENDPOINT + '?symbol=' + encodeURIComponent(symbols.join(','));
  const opts = { method: 'get', headers: { 'X-CMC_PRO_API_KEY': key }, muteHttpExceptions: true };
  const resp = UrlFetchApp.fetch(url, opts);
  // parse, map, handle errors. See Cursor prompts for full impl.
}
```

### Safe append to `Financial Records`:

```javascript
function appendFinancialRecord(record) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Financial Records');
  if (!sheet) throw new Error('Financial Records sheet missing');
  const row = [record.timestamp, record.type, record.network, record.symbol, record.address, record.balance, record.price_usd, record.value_usd, record.status];
  sheet.appendRow(row);
}
```

---

## Deployment checklist

1. Review `appsscript.json` scopes and add any additional scopes required by chosen RPC provider.
2. Put real API keys into `ENV` sheet (do **not** commit secrets to git).
3. Test with DRY\_RUN = true, then run small manual run.
4. Deploy as web app: `Publish > Deploy as web app` (set access to yourself or domain). Save deployment ID.
5. Consider creating a time-driven trigger (clock) to run `fetchAndStoreBalances('SCHEDULE')` every N minutes/hours based on API rate limits.

---

## Rate limits, costs & safety

* CoinMarketCap free tier: limited requests/minute. Batch up symbols and avoid calling for every wallet fetch. Use a single CMC call per run with unique symbols list.
* RPC providers (Infura, BSC RPC, Solana RPC) may rate-limit IPs. Consider using paid provider keys and caching.
* KuCoin API has signing and rate limits — implement exponential backoff.
* Keep `DRY_RUN` during development and large-scale tests.

---

## Security & Secrets

* Do **not** hardcode production API keys into scripts committed to repos.
* Use the ENV sheet for keys and mark the sheet as view-restricted.
* Consider using Google Secret Manager + Cloud Functions for higher security for production.

---

## Known limitations & Roadmap

* Token detection on EVM will only work for tokens that have ERC20 contract addresses available in `Coins Management` or discovered via on-chain token lists. Automatic discovery is non-trivial.
* Future: add an on-chain token discovery job, better caching, native support for staking/LP positions, and richer UI charts.

---

## Cursor AI prompt cheat-sheet (copyable short prompts)

* "Scaffold the GAS project `Assests Manager` with files setup.gs, api.gs, balances modules, ui.html, and appsscript.json. Use modular code and ENV config."
* "Implement `fetchCmcPrices(symbols)` with retries and exponential backoff following GAS UrlFetchApp."
* "Implement KuCoin HMAC signing and `fetchKucoinBalances` for spot wallet balances."
* "Implement `fetchAndStoreBalances(triggerType)` orchestrator reading Wallets and Coins Management sheets."
* "Create `ui.html` single-page UI that triggers `fetchAndStoreBalances('MANUAL')` and displays last 10 Financial Records."

---

## Final notes

* Use the provided `setup.gs` as the canonical scaffolding — it already seeds ENV, Wallets and Coins Management.
* Iterate with Cursor: request one file at a time, review, run in GAS editor, and fix issues. Cursor works best when you give small, focused prompts.

Good luck — if you want, I can now:

* generate the full `api.gs` and network modules for you; or
* produce a ready-to-paste `ui.html` + `appsscript.json` tailored to your ENV sheet.
