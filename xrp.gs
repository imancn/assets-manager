/**
 * xrp.gs - XRP Network Integration
 * Handles fetching XRP balances using Ripple JSON-RPC
 */

/**
 * Get XRP balances for an address
 * @param {string} address - XRP address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getXrpBalances(address, coins) {
  try {
    if (!address || !isValidXrpAddress(address)) {
      throw new Error('Invalid XRP address');
    }
    
    console.log(`Fetching XRP balances for address: ${address}`);
    
    const balances = [];
    
    // Get native XRP balance
    const xrpBalance = getXrpNativeBalance(address);
    if (xrpBalance > 0) {
      balances.push({
        symbol: 'XRP',
        balance: xrpBalance,
        network: 'XRP',
        contract_address: '',
        decimals: 6
      });
    }
    
    // Get issued token balances (IOUs)
    const tokenBalances = getXrpTokenBalances(address, coins);
    balances.push(...tokenBalances);
    
    console.log(`Found ${balances.length} balances for XRP address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching XRP balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native XRP balance
 * @param {string} address - XRP address
 * @returns {number} XRP balance
 */
function getXrpNativeBalance(address) {
  try {
    const rpcUrl = 'https://xrplcluster.com';
    
    const payload = {
      method: 'account_info',
      params: [{
        account: address,
        ledger_index: 'validated'
      }]
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.result && data.result.account_data) {
        const balanceDrops = parseInt(data.result.account_data.Balance);
        const balanceXrp = balanceDrops / Math.pow(10, 6); // Convert drops to XRP
        return balanceXrp;
      } else if (data.result && data.result.error === 'actNotFound') {
        // Account not found, return 0 balance
        return 0;
      }
    }
    
    throw new Error(`Failed to get XRP balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting XRP native balance:', error);
    return 0;
  }
}

/**
 * Get XRP token balances (IOUs)
 * @param {string} address - XRP address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of token balance objects
 */
function getXrpTokenBalances(address, coins) {
  const balances = [];
  
  try {
    const rpcUrl = 'https://xrplcluster.com';
    
    const payload = {
      method: 'account_lines',
      params: [{
        account: address,
        ledger_index: 'validated'
      }]
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.result && data.result.lines) {
        const lines = data.result.lines;
        
        for (const line of lines) {
          if (parseFloat(line.balance) > 0) {
            // Find coin info for this token
            const coin = coins.find(c => c.symbol === line.currency);
            const symbol = coin ? coin.symbol : line.currency;
            const decimals = coin ? coin.decimals : 6;
            
            balances.push({
              symbol: symbol,
              balance: parseFloat(line.balance),
              network: 'XRP',
              contract_address: line.account, // Issuer address
              decimals: decimals
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error getting XRP token balances:', error);
  }
  
  return balances;
}

/**
 * Get XRP account transactions
 * @param {string} address - XRP address
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Array} Array of transaction objects
 */
function getXrpTransactions(address, limit = 20) {
  try {
    const rpcUrl = 'https://xrplcluster.com';
    
    const payload = {
      method: 'account_tx',
      params: [{
        account: address,
        limit: limit,
        ledger_index_min: -1,
        ledger_index_max: -1
      }]
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.result && data.result.transactions) {
        return data.result.transactions;
      }
    }
    
    throw new Error(`Failed to get transactions: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting XRP transactions:', error);
    return [];
  }
}

/**
 * Get XRP ledger info
 * @returns {Object} Ledger information
 */
function getXrpLedgerInfo() {
  try {
    const rpcUrl = 'https://xrplcluster.com';
    
    const payload = {
      method: 'ledger',
      params: [{
        ledger_index: 'validated'
      }]
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.result && data.result.ledger) {
        return {
          ledger_index: data.result.ledger_index,
          ledger_hash: data.result.ledger.ledger_hash,
          parent_hash: data.result.ledger.parent_hash,
          close_time: data.result.ledger.close_time,
          parent_close_time: data.result.ledger.parent_close_time,
          total_coins: data.result.ledger.total_coins
        };
      }
    }
    
    throw new Error(`Failed to get ledger info: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting XRP ledger info:', error);
    return {};
  }
}

/**
 * Get XRP server info
 * @returns {Object} Server information
 */
function getXrpServerInfo() {
  try {
    const rpcUrl = 'https://xrplcluster.com';
    
    const payload = {
      method: 'server_info'
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.result && data.result.info) {
        return {
          build_version: data.result.info.build_version,
          complete_ledgers: data.result.info.complete_ledgers,
          hostid: data.result.info.hostid,
          io_latency_ms: data.result.info.io_latency_ms,
          last_close: data.result.info.last_close,
          load_factor: data.result.info.load_factor,
          peers: data.result.info.peers,
          pubkey_node: data.result.info.pubkey_node,
          pubkey_validator: data.result.info.pubkey_validator,
          server_state: data.result.info.server_state,
          validated_ledger: data.result.info.validated_ledger,
          validation_quorum: data.result.info.validation_quorum
        };
      }
    }
    
    throw new Error(`Failed to get server info: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting XRP server info:', error);
    return {};
  }
}

/**
 * Validate XRP address format
 * @param {string} address - XRP address to validate
 * @returns {boolean} True if valid
 */
function isValidXrpAddress(address) {
  // Basic validation - XRP addresses are base58 encoded and typically 25-35 characters
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // XRP addresses start with 'r' and are typically 25-35 characters
  if (address.startsWith('r') && address.length >= 25 && address.length <= 35) {
    return true;
  }
  
  // Testnet addresses start with 's' and are typically 25-35 characters
  if (address.startsWith('s') && address.length >= 25 && address.length <= 35) {
    return true;
  }
  
  return false;
}

/**
 * Test XRP functions
 * @returns {Object} Test results
 */
function testXrpFunctions() {
  try {
    console.log('Testing XRP functions...');
    
    const testAddress = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Address validation
    try {
      const isValid = isValidXrpAddress(testAddress);
      result.tests.push(`✓ Address validation: ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      result.tests.push(`✗ Address validation failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Native XRP balance
    try {
      const xrpBalance = getXrpNativeBalance(testAddress);
      result.tests.push(`✓ XRP balance: ${xrpBalance} XRP`);
    } catch (error) {
      result.tests.push(`✗ XRP balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Ledger info
    try {
      const ledgerInfo = getXrpLedgerInfo();
      if (ledgerInfo.ledger_index) {
        result.tests.push(`✓ Ledger index: ${ledgerInfo.ledger_index}`);
      } else {
        result.tests.push(`✗ Ledger info failed: No data`);
        result.success = false;
      }
    } catch (error) {
      result.tests.push(`✗ Ledger info failed: ${error.toString()}`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ XRP test failed: ${error.toString()}`]
    };
  }
}