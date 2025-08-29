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

  // Build query string, skipping undefined/empty token_addresses for Moralis (404 otherwise)
  var querySafe = {};
  if (query) {
    for (var k in query) {
      if (!Object.prototype.hasOwnProperty.call(query, k)) continue;
      var val = query[k];
      if (k === 'token_addresses' && (!val || String(val).length < 10)) continue;
      querySafe[k] = val;
    }
  }
  const qs = Object.keys(querySafe).length
    ? '?' + Object.keys(querySafe).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(querySafe[k]))}`).join('&')
    : '';
  const url = `${GLOBAL_CONFIG.MORALIS_BASE_URL}${path}${qs}`;

  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = fetchWithLogging(url, {
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
 * Try Moralis with both chain formats: human name (eth/bsc) then hex (0x1/0x38)
 * @param {string} path
 * @param {string} chain - 'eth' | 'bsc'
 * @param {Object} queryExtras
 */
function moralisGetWithChainFallback(path, chain, queryExtras) {
  var primary = chain;
  var alt = (function(c){
    var m = { 'eth': '0x1', 'bsc': '0x38' };
    return m[String(c).toLowerCase()] || c;
  })(chain);
  try {
    var q1 = Object.assign({}, queryExtras || {}, { chain: primary });
    return moralisGet(path, q1);
  } catch (e1) {
    try {
      var q2 = Object.assign({}, queryExtras || {}, { chain: alt });
      return moralisGet(path, q2);
    } catch (e2) {
      throw e2;
    }
  }
}

/**
 * Get native balance using Moralis
 * @param {string} address
 * @param {string} chain - e.g. 'eth', 'bsc'
 * @returns {number} balance in native units
 */
function moralisGetNativeBalance(address, chain) {
  const data = moralisGetWithChainFallback(`/address/${address}/balance`, chain, {});
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
  const data = moralisGetWithChainFallback(`/address/${address}/erc20`, chain, { token_addresses: tokenAddress });
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
  const data = moralisGetWithChainFallback(`/address/${address}/erc20`, chain, {});
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
  const data = moralisGetWithChainFallback(`/address/${address}/erc20`, chain, {});
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

