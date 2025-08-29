/**
 * moralis_helpers.gs - Moralis API helper utilities
 * Provides optional fallbacks for EVM balance fetching (ETH/BSC) when direct RPC fails.
 */

/**
 * Determine whether Moralis is configured
 * @returns {boolean}
 */
function isMoralisConfigured() {
  try {
    const key = readEnv('MORALIS_API_KEY', '');
    return !!(key && key !== 'YOUR_MORALIS_API_KEY_HERE');
  } catch (e) {
    return false;
  }
}

/**
 * Perform a Moralis API GET request
 * @param {string} path - API path starting with '/'
 * @param {Object} query - Query parameters map
 * @returns {Object} parsed JSON response
 */
function moralisGet(path, query) {
  const apiKey = readEnv('MORALIS_API_KEY', '');
  if (!apiKey || apiKey === 'YOUR_MORALIS_API_KEY_HERE') {
    throw new Error('Moralis API key missing');
  }
  const maxRetries = parseInt(readEnv('MAX_RETRIES', '3')) || 3;

  const qs = query && Object.keys(query).length
    ? '?' + Object.keys(query).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`).join('&')
    : '';
  const url = `${GLOBAL_CONFIG.MORALIS_BASE_URL}${path}${qs}`;

  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        },
        muteHttpExceptions: true
      });
      const code = response.getResponseCode();
      const body = response.getContentText();
      if (code === 200) {
        return JSON.parse(body);
      }
      // 429 or 5xx: backoff and retry
      lastError = new Error(`Moralis HTTP ${code}: ${body}`);
      if (code === 429 || code >= 500) {
        const backoffMs = Math.pow(2, attempt) * 500;
        Utilities.sleep(backoffMs);
        continue;
      }
      // Other 4xx: don't retry
      throw lastError;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 500;
        Utilities.sleep(backoffMs);
      }
    }
  }
  throw lastError || new Error('Moralis request failed');
}

/**
 * Get native balance using Moralis
 * @param {string} address
 * @param {string} chain - e.g. 'eth', 'bsc'
 * @returns {number} balance in native units
 */
function moralisGetNativeBalance(address, chain) {
  const data = moralisGet(`/address/${address}/balance`, { chain: chain });
  if (!data || typeof data.balance === 'undefined') return 0;
  // Moralis returns balance in wei-like units (for EVM). Derive decimals by chain.
  const decimals = chain === 'bsc' ? 18 : 18; // EVM chains default 18
  const balance = parseFloat(data.balance) / Math.pow(10, decimals);
  return isNaN(balance) ? 0 : balance;
}

/**
 * Get ERC20/BEP20 token balance using Moralis for a single token
 * @param {string} address
 * @param {string} tokenAddress
 * @param {number} decimals
 * @param {string} chain - 'eth' | 'bsc'
 * @returns {number}
 */
function moralisGetTokenBalance(address, tokenAddress, decimals, chain) {
  const data = moralisGet(`/address/${address}/erc20`, { chain: chain, token_addresses: tokenAddress });
  if (!data || !data.length || !data[0] || typeof data[0].balance === 'undefined') return 0;
  const raw = data[0].balance;
  const amount = parseFloat(raw) / Math.pow(10, decimals || 18);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Attempt to find token balance by symbol (when contract address is missing/invalid)
 * @param {string} address
 * @param {string} symbol
 * @param {string} chain
 * @returns {number}
 */
function moralisGetTokenBalanceBySymbol(address, symbol, chain) {
  const data = moralisGet(`/address/${address}/erc20`, { chain: chain });
  if (!data || !data.length) return 0;
  const token = data.find(t => String(t.symbol).toUpperCase() === String(symbol).toUpperCase());
  if (!token || typeof token.balance === 'undefined') return 0;
  const decimals = parseInt(token.decimals) || 18;
  const amount = parseFloat(token.balance) / Math.pow(10, decimals);
  return isNaN(amount) ? 0 : amount;
}

/**
 * List all ERC20/BEP20 balances for an address using Moralis
 * @param {string} address
 * @param {string} chain - 'eth' | 'bsc' | other EVM chain ids supported by Moralis
 * @returns {Array<{symbol:string, contract_address:string, decimals:number, balance:number}>}
 */
function moralisListErc20Balances(address, chain) {
  const data = moralisGet(`/address/${address}/erc20`, { chain: chain });
  const results = [];
  if (Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      var t = data[i];
      var decimals = parseInt(t.decimals) || 18;
      var amt = parseFloat(t.balance) / Math.pow(10, decimals);
      if (!isNaN(amt) && amt > 0) {
        results.push({
          symbol: t.symbol || 'UNKNOWN',
          contract_address: t.token_address || t.address || '',
          decimals: decimals,
          balance: amt
        });
      }
    }
  }
  return results;
}

