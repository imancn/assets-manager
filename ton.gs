/**
 * ton.gs - TON Network Integration
 * Handles fetching TON balances using TON API
 */

/**
 * Get TON balances for an address
 * @param {string} address - TON address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getTonBalances(address, coins) {
  try {
    if (!address || !isValidTonAddress(address)) {
      throw new Error('Invalid TON address');
    }
    
    console.log(`Fetching TON balances for address: ${address}`);
    
    const balances = [];
    
    // Get native TON balance
    const tonBalance = getTonNativeBalance(address);
    if (tonBalance > 0) {
      balances.push({
        symbol: 'TON',
        balance: tonBalance,
        network: 'TON',
        contract_address: '',
        decimals: 9
      });
    }
    
    // Get Jetton balances (TON equivalent of ERC20)
    const jettonBalances = getTonJettonBalances(address, coins);
    balances.push(...jettonBalances);
    
    console.log(`Found ${balances.length} balances for TON address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching TON balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native TON balance
 * @param {string} address - TON address
 * @returns {number} TON balance
 */
function getTonNativeBalance(address) {
  try {
    // Use TON Center API to get account info
    const url = `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`;
    
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
      
      if (data.ok && data.result !== undefined) {
        const balanceNano = parseInt(data.result);
        const balanceTon = balanceNano / Math.pow(10, 9); // Convert nano to TON
        return balanceTon;
      }
    }
    
    throw new Error(`Failed to get TON balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting TON native balance:', error);
    return 0;
  }
}

/**
 * Get TON Jetton balances
 * @param {string} address - TON address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of Jetton balance objects
 */
function getTonJettonBalances(address, coins) {
  const balances = [];
  
  try {
    // Use TON Center API to get Jetton balances
    const url = `https://toncenter.com/api/v2/getWalletInfo?address=${encodeURIComponent(address)}`;
    
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
      
      if (data.ok && data.result && data.result.jettons) {
        const jettons = data.result.jettons;
        
        for (const jetton of jettons) {
          try {
            if (jetton.balance && parseFloat(jetton.balance) > 0) {
              // Find coin info for this jetton
              const coin = coins.find(c => c.contract_address === jetton.metadata.address);
              const symbol = coin ? coin.symbol : (jetton.metadata.symbol || 'UNKNOWN');
              const decimals = coin ? coin.decimals : (jetton.metadata.decimals || 9);
              
              balances.push({
                symbol: symbol,
                balance: parseFloat(jetton.balance),
                network: 'TON',
                contract_address: jetton.metadata.address,
                decimals: decimals
              });
            }
          } catch (jettonError) {
            console.warn('Error parsing jetton:', jettonError);
            // Continue with other jettons
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error getting TON Jetton balances:', error);
  }
  
  return balances;
}

/**
 * Get TON account info
 * @param {string} address - TON address
 * @returns {Object} Account information
 */
function getTonAccountInfo(address) {
  try {
    const url = `https://toncenter.com/api/v2/getWalletInfo?address=${encodeURIComponent(address)}`;
    
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
      
      if (data.ok && data.result) {
        return {
          address: data.result.address,
          balance: data.result.balance,
          last_transaction: data.result.last_transaction,
          code_hash: data.result.code_hash,
          data_hash: data.result.data_hash,
          state: data.result.state,
          wallet_type: data.result.wallet_type
        };
      }
    }
    
    throw new Error(`Failed to get account info: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting TON account info:', error);
    return {};
  }
}

/**
 * Get TON transactions
 * @param {string} address - TON address
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Array} Array of transaction objects
 */
function getTonTransactions(address, limit = 20) {
  try {
    const url = `https://toncenter.com/api/v2/getTransactions?address=${encodeURIComponent(address)}&limit=${limit}`;
    
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
      
      if (data.ok && data.result) {
        return data.result;
      }
    }
    
    throw new Error(`Failed to get transactions: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting TON transactions:', error);
    return [];
  }
}

/**
 * Get TON block info
 * @returns {Object} Block information
 */
function getTonBlockInfo() {
  try {
    const url = 'https://toncenter.com/api/v2/getMasterchainInfo';
    
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
      
      if (data.ok && data.result) {
        return {
          last_block: data.result.last,
          last_block_time: data.result.last_time,
          last_block_seqno: data.result.last_seqno,
          last_block_root_hash: data.result.last_root_hash,
          last_block_file_hash: data.result.last_file_hash,
          state_root_hash: data.result.state_root_hash
        };
      }
    }
    
    throw new Error(`Failed to get block info: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting TON block info:', error);
    return {};
  }
}

/**
 * Validate TON address format
 * @param {string} address - TON address to validate
 * @returns {boolean} True if valid
 */
function isValidTonAddress(address) {
  // Basic validation - TON addresses are base64url encoded and typically 48 characters
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // TON addresses are typically 48 characters long and contain base64url characters
  if (address.length === 48 && /^[A-Za-z0-9_-]+$/.test(address)) {
    return true;
  }
  
  // Some TON addresses might be shorter or longer, but this is a reasonable check
  if (address.length >= 40 && address.length <= 60 && /^[A-Za-z0-9_-]+$/.test(address)) {
    return true;
  }
  
  return false;
}

/**
 * Test TON functions
 * @returns {Object} Test results
 */
function testTonFunctions() {
  try {
    console.log('Testing TON functions...');
    
    const testAddress = 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Address validation
    try {
      const isValid = isValidTonAddress(testAddress);
      result.tests.push(`✓ Address validation: ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      result.tests.push(`✗ Address validation failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Native TON balance
    try {
      const tonBalance = getTonNativeBalance(testAddress);
      result.tests.push(`✓ TON balance: ${tonBalance} TON`);
    } catch (error) {
      result.tests.push(`✗ TON balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Block info
    try {
      const blockInfo = getTonBlockInfo();
      if (blockInfo.last_block) {
        result.tests.push(`✓ Last block: ${blockInfo.last_block}`);
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
      tests: [`✗ TON test failed: ${error.toString()}`]
    };
  }
}