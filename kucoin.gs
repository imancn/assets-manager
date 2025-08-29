/**
 * kucoin.gs - KuCoin API Integration
 * Handles fetching account balances from KuCoin exchange
 */

/**
 * Fetch KuCoin account balances
 * @param {Object} wallet - Wallet configuration object
 * @returns {Array} Array of balance objects
 */
function getKucoinBalances(wallet) {
  try {
    if (!wallet.api_key || !wallet.api_secret || !wallet.passphrase) {
      throw new Error('KuCoin API credentials not configured');
    }
    
    console.log(`Fetching KuCoin balances for account: ${wallet.name}`);
    
    // Get account list first
    const accounts = getKucoinAccounts(wallet);
    if (!accounts || accounts.length === 0) {
      console.warn('No KuCoin accounts found');
      return [];
    }
    
    const balances = [];
    
    // Process each account
    for (const account of accounts) {
      if (account.type === 'trade' && account.balance > 0) {
        // Get token details
        const tokenInfo = getKucoinTokenInfo(account.currency, wallet);
        
        balances.push({
          symbol: account.currency,
          available: parseFloat(account.available) || 0,
          hold: parseFloat(account.hold) || 0,
          total: parseFloat(account.balance) || 0,
          balance: parseFloat(account.balance) || 0, // For aggregator compatibility
          network: 'KUCOIN',
          token_info: tokenInfo
        });
      }
    }
    
    console.log(`Found ${balances.length} non-zero balances on KuCoin`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching KuCoin balances: ${error.toString()}`);
    throw error;
  }
}

/**
 * Get KuCoin accounts list
 * @param {Object} wallet - Wallet configuration object
 * @returns {Array} Array of account objects
 */
function getKucoinAccounts(wallet) {
  const endpoint = '/api/v1/accounts';
  const timestamp = Date.now().toString();
  
  const signature = createKucoinSignature('GET', endpoint, '', timestamp, wallet.api_secret);
  const passphrase = Utilities.base64Encode(Utilities.computeHmacSha256Signature(wallet.passphrase, wallet.api_secret));
  
  const options = {
    method: 'GET',
    headers: {
      'KC-API-KEY': wallet.api_key,
      'KC-API-SIGNATURE': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': passphrase,
      'KC-API-KEY-VERSION': '2'
    },
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(`${GLOBAL_CONFIG.KUCOIN_BASE_URL}${endpoint}`, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      const data = JSON.parse(responseText);
      if (data.code === '200000' && data.data) {
        return data.data;
      } else {
        throw new Error(`KuCoin API error: ${data.msg || 'Unknown error'}`);
      }
    } else {
      throw new Error(`KuCoin API HTTP error: ${responseCode} - ${responseText}`);
    }
    
  } catch (error) {
    console.error('Error fetching KuCoin accounts:', error);
    throw error;
  }
}

/**
 * Get KuCoin token information
 * @param {string} currency - Currency symbol
 * @param {Object} wallet - Wallet configuration object
 * @returns {Object} Token information
 */
function getKucoinTokenInfo(currency, wallet) {
  try {
    const endpoint = '/api/v2/currencies';
    const timestamp = Date.now().toString();
    
    const signature = createKucoinSignature('GET', endpoint, '', timestamp, wallet.api_secret);
    const passphrase = Utilities.base64Encode(Utilities.computeHmacSha256Signature(wallet.passphrase, wallet.api_secret));
    
    const options = {
      method: 'GET',
      headers: {
        'KC-API-KEY': wallet.api_key,
        'KC-API-SIGNATURE': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': passphrase,
        'KC-API-KEY-VERSION': '2'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(`${GLOBAL_CONFIG.KUCOIN_BASE_URL}${endpoint}`, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.code === '200000' && data.data) {
        const token = data.data.find(t => t.currency === currency);
        if (token) {
          return {
            name: token.name,
            fullName: token.fullName,
            precision: token.precision,
            withdrawalMinSize: token.withdrawalMinSize,
            withdrawalMinFee: token.withdrawalMinFee,
            isWithdrawEnabled: token.isWithdrawEnabled,
            isDepositEnabled: token.isDepositEnabled
          };
        }
      }
    }
    
    // Return default info if API call fails
    return {
      name: currency,
      fullName: currency,
      precision: 8,
      withdrawalMinSize: '0',
      withdrawalMinFee: '0',
      isWithdrawEnabled: true,
      isDepositEnabled: true
    };
    
  } catch (error) {
    console.warn(`Could not fetch token info for ${currency}:`, error);
    // Return default info
    return {
      name: currency,
      fullName: currency,
      precision: 8,
      withdrawalMinSize: '0',
      withdrawalMinFee: '0',
      isWithdrawEnabled: true,
      isDepositEnabled: true
    };
  }
}

/**
 * Create KuCoin API signature
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {string} body - Request body
 * @param {string} timestamp - Timestamp
 * @param {string} secret - API secret
 * @returns {string} Base64 encoded signature
 */
function createKucoinSignature(method, endpoint, body, timestamp, secret) {
  const message = timestamp + method + endpoint + body;
  const signature = Utilities.computeHmacSha256Signature(message, secret);
  return Utilities.base64Encode(signature);
}

/**
 * Test KuCoin API connection
 * @param {Object} wallet - Wallet configuration object
 * @returns {Object} Test results
 */
function testKucoinConnection(wallet) {
  try {
    console.log('Testing KuCoin API connection...');
    
    if (!wallet.api_key || !wallet.api_secret || !wallet.passphrase) {
      return {
        success: false,
        error: 'API credentials not configured'
      };
    }
    
    // Test with a simple API call
    const accounts = getKucoinAccounts(wallet);
    
    return {
      success: true,
      accountsFound: accounts.length,
      message: `Successfully connected to KuCoin API. Found ${accounts.length} accounts.`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get KuCoin ticker information for a symbol
 * @param {string} symbol - Trading pair symbol (e.g., 'BTC-USDT')
 * @param {Object} wallet - Wallet configuration object
 * @returns {Object} Ticker information
 */
function getKucoinTicker(symbol, wallet) {
  try {
    const endpoint = `/api/v1/market/orderbook/level1?symbol=${symbol}`;
    const timestamp = Date.now().toString();
    
    const signature = createKucoinSignature('GET', endpoint, '', timestamp, wallet.api_secret);
    const passphrase = Utilities.base64Encode(Utilities.computeHmacSha256Signature(wallet.passphrase, wallet.api_secret));
    
    const options = {
      method: 'GET',
      headers: {
        'KC-API-KEY': wallet.api_key,
        'KC-API-SIGNATURE': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': passphrase,
        'KC-API-KEY-VERSION': '2'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(`${GLOBAL_CONFIG.KUCOIN_BASE_URL}${endpoint}`, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.code === '200000' && data.data) {
        return {
          symbol: symbol,
          price: parseFloat(data.data.price) || 0,
          bestBid: parseFloat(data.data.bestBid) || 0,
          bestAsk: parseFloat(data.data.bestAsk) || 0,
          timestamp: data.data.time
        };
      }
    }
    
    throw new Error(`Failed to get ticker for ${symbol}`);
    
  } catch (error) {
    console.error(`Error getting KuCoin ticker for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get KuCoin trading pairs
 * @param {Object} wallet - Wallet configuration object
 * @returns {Array} Array of trading pairs
 */
function getKucoinTradingPairs(wallet) {
  try {
    const endpoint = '/api/v2/symbols';
    const timestamp = Date.now().toString();
    
    const signature = createKucoinSignature('GET', endpoint, '', timestamp, wallet.api_secret);
    const passphrase = Utilities.base64Encode(Utilities.computeHmacSha256Signature(wallet.passphrase, wallet.api_secret));
    
    const options = {
      method: 'GET',
      headers: {
        'KC-API-KEY': wallet.api_key,
        'KC-API-SIGNATURE': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': passphrase,
        'KC-API-KEY-VERSION': '2'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(`${GLOBAL_CONFIG.KUCOIN_BASE_URL}${endpoint}`, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.code === '200000' && data.data) {
        return data.data.filter(pair => pair.enableTrading);
      }
    }
    
    throw new Error('Failed to get trading pairs');
    
  } catch (error) {
    console.error('Error getting KuCoin trading pairs:', error);
    throw error;
  }
}