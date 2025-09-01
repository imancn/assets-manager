/**
 * bitcoin.gs - Bitcoin Network Integration
 * Handles fetching BTC balances using Blockstream API
 */

/**
 * Get Bitcoin balances for an address
 * @param {string} address - Bitcoin address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getBitcoinBalances(address, coins) {
  try {
    if (!address || !isValidBitcoinAddress(address)) {
      throw new Error('Invalid Bitcoin address');
    }
    
    console.log(`Fetching Bitcoin balances for address: ${address}`);
    
    const balances = [];
    
    // Get native BTC balance
    const btcBalance = getBitcoinNativeBalance(address);
    if (btcBalance > 0) {
      balances.push({
        symbol: 'BTC',
        balance: btcBalance,
        network: 'BTC',
        contract_address: '',
        decimals: 8
      });
    }
    
    console.log(`Found ${balances.length} balances for Bitcoin address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching Bitcoin balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native BTC balance
 * @param {string} address - Bitcoin address
 * @returns {number} BTC balance
 */
function getBitcoinNativeBalance(address) {
  try {
    // Use Blockstream API to get address info
    const url = `https://blockstream.info/api/address/${address}`;
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (data.chain_stats && data.mempool_stats) {
        const confirmedBalance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        const unconfirmedBalance = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
        const totalBalance = (confirmedBalance + unconfirmedBalance) / Math.pow(10, 8); // Convert satoshis to BTC
        
        return totalBalance;
      }
    }
    
    throw new Error(`Failed to get BTC balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Bitcoin native balance:', error);
    return 0;
  }
}

/**
 * Get Bitcoin address transactions
 * @param {string} address - Bitcoin address
 * @returns {Array} Array of transaction objects
 */
function getBitcoinTransactions(address) {
  try {
    const url = `https://blockstream.info/api/address/${address}/txs`;
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      return data || [];
    }
    
    throw new Error(`Failed to get transactions: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Bitcoin transactions:', error);
    return [];
  }
}

/**
 * Get Bitcoin UTXOs for an address
 * @param {string} address - Bitcoin address
 * @returns {Array} Array of UTXO objects
 */
function getBitcoinUtxos(address) {
  try {
    const url = `https://blockstream.info/api/address/${address}/utxo`;
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      return data || [];
    }
    
    throw new Error(`Failed to get UTXOs: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Bitcoin UTXOs:', error);
    return [];
  }
}

/**
 * Get Bitcoin block height
 * @returns {number} Current block height
 */
function getBitcoinBlockHeight() {
  try {
    const url = 'https://blockstream.info/api/blocks/tip/height';
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = response.getContentText();
      return parseInt(data);
    }
    
    throw new Error(`Failed to get block height: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Bitcoin block height:', error);
    return 0;
  }
}

/**
 * Get Bitcoin block hash by height
 * @param {number} height - Block height
 * @returns {string} Block hash
 */
function getBitcoinBlockHash(height) {
  try {
    const url = `https://blockstream.info/api/block-height/${height}`;
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = response.getContentText();
      return data;
    }
    
    throw new Error(`Failed to get block hash: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Bitcoin block hash:', error);
    return '';
  }
}

/**
 * Validate Bitcoin address format
 * @param {string} address - Bitcoin address to validate
 * @returns {boolean} True if valid
 */
function isValidBitcoinAddress(address) {
  // Basic validation - check length and prefix
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Legacy addresses (P2PKH) start with 1 and are 26-35 characters
  if (address.startsWith('1') && address.length >= 26 && address.length <= 35) {
    return true;
  }
  
  // P2SH addresses start with 3 and are 26-35 characters
  if (address.startsWith('3') && address.length >= 26 && address.length <= 35) {
    return true;
  }
  
  // Bech32 addresses (P2WPKH/P2WSH) start with bc1 and are 42-62 characters
  if (address.startsWith('bc1') && address.length >= 42 && address.length <= 62) {
    return true;
  }
  
  // Taproot addresses start with bc1p and are 62 characters
  if (address.startsWith('bc1p') && address.length === 62) {
    return true;
  }
  
  return false;
}

/**
 * Test Bitcoin functions
 * @returns {Object} Test results
 */
function testBitcoinFunctions() {
  try {
    console.log('Testing Bitcoin functions...');
    
    const testAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Address validation
    try {
      const isValid = isValidBitcoinAddress(testAddress);
      result.tests.push(`✓ Address validation: ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      result.tests.push(`✗ Address validation failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Native BTC balance
    try {
      const btcBalance = getBitcoinNativeBalance(testAddress);
      result.tests.push(`✓ BTC balance: ${btcBalance} BTC`);
    } catch (error) {
      result.tests.push(`✗ BTC balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Block height
    try {
      const blockHeight = getBitcoinBlockHeight();
      result.tests.push(`✓ Block height: ${blockHeight}`);
    } catch (error) {
      result.tests.push(`✗ Block height failed: ${error.toString()}`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ Bitcoin test failed: ${error.toString()}`]
    };
  }
}