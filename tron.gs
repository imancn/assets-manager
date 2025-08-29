/**
 * tron.gs - Tron Network Integration
 * Handles fetching TRX and TRC20 token balances
 */

/**
 * Get Tron balances for an address
 * @param {string} address - Tron address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getTronBalances(address, coins) {
  try {
    if (!address || !isValidTronAddress(address)) {
      throw new Error('Invalid Tron address');
    }
    
    console.log(`Fetching Tron balances for address: ${address}`);
    
    const balances = [];
    
    // Get native TRX balance
    const trxBalance = getTronNativeBalance(address);
    if (trxBalance > 0) {
      balances.push({
        symbol: 'TRX',
        balance: trxBalance,
        network: 'TRX',
        contract_address: '',
        decimals: 6
      });
    }
    
    // Get TRC20 token balances
    const trc20Balances = getTronTrc20Balances(address, coins);
    balances.push(...trc20Balances);
    
    console.log(`Found ${balances.length} balances for Tron address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching Tron balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native TRX balance
 * @param {string} address - Tron address
 * @returns {number} TRX balance
 */
function getTronNativeBalance(address) {
  try {
    const apiKey = readEnv('TRONGRID_API_KEY', '');
    let url;
    
    if (apiKey && apiKey !== 'YOUR_TRONGRID_API_KEY_HERE') {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/accounts/${address}?api_key=${apiKey}`;
    } else {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/accounts/${address}`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.data && data.data.length > 0) {
        const account = data.data[0];
        const balanceSun = parseInt(account.balance || 0);
        const balanceTrx = balanceSun / Math.pow(10, 6); // Convert sun to TRX
        return balanceTrx;
      }
    }
    
    throw new Error(`Failed to get TRX balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Tron native balance:', error);
    return 0;
  }
}

/**
 * Get TRC20 token balances
 * @param {string} address - Tron address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of TRC20 balance objects
 */
function getTronTrc20Balances(address, coins) {
  const balances = [];
  const tronCoins = coins.filter(coin => coin.network === 'TRX' && coin.contract_address);
  
  console.log(`Checking ${tronCoins.length} TRC20 tokens for address ${address}`);
  
  for (const coin of tronCoins) {
    try {
      const balance = getTronTrc20Balance(address, coin.contract_address, coin.decimals);
      if (balance > 0) {
        balances.push({
          symbol: coin.symbol,
          balance: balance,
          network: 'TRX',
          contract_address: coin.contract_address,
          decimals: coin.decimals
        });
      }
    } catch (error) {
      console.warn(`Error getting balance for ${coin.symbol}:`, error);
      // Continue with other tokens
    }
  }
  
  return balances;
}

/**
 * Get single TRC20 token balance
 * @param {string} address - Tron address
 * @param {string} contractAddress - TRC20 contract address
 * @param {number} decimals - Token decimals
 * @returns {number} Token balance
 */
function getTronTrc20Balance(address, contractAddress, decimals = 18) {
  try {
    const apiKey = readEnv('TRONGRID_API_KEY', '');
    let url;
    
    if (apiKey && apiKey !== 'YOUR_TRONGRID_API_KEY_HERE') {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/contracts/${contractAddress}/accounts/${address}?api_key=${apiKey}`;
    } else {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/contracts/${contractAddress}/accounts/${address}`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.data && data.data.length > 0) {
        const tokenData = data.data[0];
        const balance = parseFloat(tokenData.balance || 0);
        return balance / Math.pow(10, decimals);
      }
    }
    
    return 0;
    
  } catch (error) {
    console.error(`Error getting TRC20 balance for ${contractAddress}:`, error);
    return 0;
  }
}

/**
 * Get Tron account info
 * @param {string} address - Tron address
 * @returns {Object} Account information
 */
function getTronAccountInfo(address) {
  try {
    const apiKey = readEnv('TRONGRID_API_KEY', '');
    let url;
    
    if (apiKey && apiKey !== 'YOUR_TRONGRID_API_KEY_HERE') {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/accounts/${address}?api_key=${apiKey}`;
    } else {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/accounts/${address}`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.data && data.data.length > 0) {
        const account = data.data[0];
        return {
          address: account.address,
          balance: account.balance,
          power_used: account.power_used,
          power_limit: account.power_limit,
          energy_used: account.energy_used,
          energy_limit: account.energy_limit,
          frozen: account.frozen,
          account_type: account.account_type
        };
      }
    }
    
    throw new Error(`Failed to get account info: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Tron account info:', error);
    return {};
  }
}

/**
 * Get Tron transactions
 * @param {string} address - Tron address
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Array} Array of transaction objects
 */
function getTronTransactions(address, limit = 20) {
  try {
    const apiKey = readEnv('TRONGRID_API_KEY', '');
    let url;
    
    if (apiKey && apiKey !== 'YOUR_TRONGRID_API_KEY_HERE') {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/accounts/${address}/transactions?limit=${limit}&api_key=${apiKey}`;
    } else {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/accounts/${address}/transactions?limit=${limit}`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.data) {
        return data.data;
      }
    }
    
    throw new Error(`Failed to get transactions: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Tron transactions:', error);
    return [];
  }
}

/**
 * Get Tron block info
 * @returns {Object} Block information
 */
function getTronBlockInfo() {
  try {
    const apiKey = readEnv('TRONGRID_API_KEY', '');
    let url;
    
    if (apiKey && apiKey !== 'YOUR_TRONGRID_API_KEY_HERE') {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/blocks/latest?api_key=${apiKey}`;
    } else {
      url = `${GLOBAL_CONFIG.TRONGRID_BASE_URL}/v1/blocks/latest`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.data && data.data.length > 0) {
        const block = data.data[0];
        return {
          block_header: block.block_header,
          block_size: block.block_size,
          parent_hash: block.parent_hash,
          witness_address: block.witness_address,
          witness_signature: block.witness_signature,
          timestamp: block.timestamp,
          number: block.number
        };
      }
    }
    
    throw new Error(`Failed to get block info: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Tron block info:', error);
    return {};
  }
}

/**
 * Validate Tron address format
 * @param {string} address - Tron address to validate
 * @returns {boolean} True if valid
 */
function isValidTronAddress(address) {
  // Basic validation - Tron addresses are base58 encoded and typically 34 characters
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Tron addresses start with 'T' and are typically 34 characters
  if (address.startsWith('T') && address.length === 34) {
    return true;
  }
  
  return false;
}

/**
 * Test Tron functions
 * @returns {Object} Test results
 */
function testTronFunctions() {
  try {
    console.log('Testing Tron functions...');
    
    const testAddress = 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Address validation
    try {
      const isValid = isValidTronAddress(testAddress);
      result.tests.push(`✓ Address validation: ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      result.tests.push(`✗ Address validation failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Native TRX balance
    try {
      const trxBalance = getTronNativeBalance(testAddress);
      result.tests.push(`✓ TRX balance: ${trxBalance} TRX`);
    } catch (error) {
      result.tests.push(`✗ TRX balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Block info
    try {
      const blockInfo = getTronBlockInfo();
      if (blockInfo.number) {
        result.tests.push(`✓ Block number: ${blockInfo.number}`);
      } else {
        result.tests.push(`✗ Block info failed: No data`);
        result.success = false;
      }
    } catch (error) {
      result.tests.push(`✗ Block info failed: ${error.toString()}`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ Tron test failed: ${error.toString()}`]
    };
  }
}