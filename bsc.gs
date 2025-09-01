/**
 * bsc.gs - Binance Smart Chain Integration
 * Handles fetching BSC and BEP20 token balances
 */

/**
 * Get BSC balances for an address
 * @param {string} address - BSC address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getBscBalances(address, coins) {
  try {
    if (!address || !address.startsWith('0x')) {
      throw new Error('Invalid BSC address');
    }
    
    console.log(`Fetching BSC balances for address: ${address}`);
    
    const balances = [];
    
    // Get native BNB balance
    const bnbBalance = getBscNativeBalance(address);
    if (bnbBalance > 0) {
      balances.push({
        symbol: 'BNB',
        balance: bnbBalance,
        network: 'BSC',
        contract_address: '0x0000000000000000000000000000000000000000',
        decimals: 18
      });
    }
    
    // Get BEP20 token balances
    const bep20Balances = getBscBep20Balances(address, coins);
    balances.push(...bep20Balances);
    
    console.log(`Found ${balances.length} balances for BSC address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching BSC balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native BNB balance
 * @param {string} address - BSC address
 * @returns {number} BNB balance
 */
function getBscNativeBalance(address) {
  try {
    const rpcUrl = readEnv('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result) {
        const balanceWei = parseInt(data.result, 16);
        const balanceBnb = balanceWei / Math.pow(10, 18);
        return balanceBnb;
      }
    }
    
    // Moralis fallback if configured
    if (isMoralisConfigured()) {
      try {
        return moralisGetNativeBalance(address, 'bsc');
      } catch (moralisError) {
        console.warn('Moralis BSC native balance fallback failed:', moralisError);
      }
    }
    
    throw new Error(`Failed to get BNB balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting BSC native balance:', error);
    return 0;
  }
}

/**
 * Get BEP20 token balances
 * @param {string} address - BSC address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of BEP20 balance objects
 */
function getBscBep20Balances(address, coins) {
  const balances = [];
  const bscCoins = coins.filter(coin => coin.network === 'BSC');
  
  console.log(`Checking ${bscCoins.length} BEP20 tokens for address ${address}`);
  
  for (const coin of bscCoins) {
    try {
      let balance = 0;
      const resolvedContract = resolveBscContractAddress(coin.symbol, coin.contract_address);
      if (resolvedContract) {
        addRunLog(`[BSC] Using contract for ${coin.symbol}: ${resolvedContract}`, 'debug');
        balance = getBscBep20Balance(address, resolvedContract, coin.decimals);
      }
      if ((!balance || balance === 0) && isMoralisConfigured()) {
        try {
          if (resolvedContract) {
            balance = moralisGetTokenBalance(address, resolvedContract, coin.decimals, 'bsc');
          }
          if ((!balance || balance === 0) && coin.symbol) {
            balance = moralisGetTokenBalanceBySymbol(address, coin.symbol, 'bsc');
          }
        } catch (e) {
          console.warn(`Moralis fallback failed for ${coin.symbol} on BSC:`, e);
        }
      }
      balances.push({
        symbol: coin.symbol,
        balance: balance || 0,
        network: 'BSC',
        contract_address: resolvedContract || coin.contract_address,
        decimals: coin.decimals
      });
    } catch (error) {
      console.warn(`Error getting balance for ${coin.symbol}:`, error);
      const resolvedContract = resolveBscContractAddress(coin.symbol, coin.contract_address);
      balances.push({ symbol: coin.symbol, balance: 0, network: 'BSC', contract_address: resolvedContract || coin.contract_address, decimals: coin.decimals });
    }
  }
  
  // Always enumerate via Moralis (if configured) and merge any additional tokens found
  if (isMoralisConfigured()) {
    try {
      const listed = moralisListErc20Balances(address, 'bsc');
      for (var i = 0; i < listed.length; i++) {
        var t = listed[i];
        var already = balances.find(b => b.symbol === t.symbol && (b.contract_address === t.contract_address || !b.contract_address));
        if (!already) {
          balances.push({
            symbol: t.symbol,
            balance: t.balance,
            network: 'BSC',
            contract_address: t.contract_address || '',
            decimals: t.decimals || 18
          });
        }
      }
    } catch (e) {
      console.warn('Moralis enumeration for BSC failed:', e);
    }
  }
  
  return balances;
}

/**
 * Resolve canonical BSC contract addresses for known tokens when missing/invalid
 */
function resolveBscContractAddress(symbol, provided) {
  try {
    const isValid = function(addr) {
      return !!(addr && typeof addr === 'string' && addr.startsWith('0x') && addr.length === 42);
    };
    if (isValid(provided)) return provided;
    const sym = String(symbol || '').toUpperCase();
    var map = {
      'BUSD': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      'CAKE': '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
    };
    return map[sym] || provided;
  } catch (e) {
    return provided;
  }
}

/**
 * Get single BEP20 token balance
 * @param {string} address - BSC address
 * @param {string} contractAddress - BEP20 contract address
 * @param {number} decimals - Token decimals
 * @returns {number} Token balance
 */
function getBscBep20Balance(address, contractAddress, decimals = 18) {
  try {
    const rpcUrl = readEnv('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/');
    
    // BEP20 balanceOf function signature: 0x70a08231
    const data = '0x70a08231' + '000000000000000000000000' + address.slice(2);
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: data
      }, 'latest'],
      id: 1
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result && data.result !== '0x') {
        const balanceWei = parseInt(data.result, 16);
        const balance = balanceWei / Math.pow(10, decimals);
        return balance;
      }
    }
    
    // Moralis fallback if configured
    if (isMoralisConfigured()) {
      try {
        return moralisGetTokenBalance(address, contractAddress, decimals, 'bsc');
      } catch (moralisError) {
        console.warn('Moralis BEP20 balance fallback failed:', moralisError);
      }
    }
    
    return 0;
    
  } catch (error) {
    console.error(`Error getting BEP20 balance for ${contractAddress}:`, error);
    return 0;
  }
}

/**
 * Get BSC gas price
 * @returns {number} Gas price in Gwei
 */
function getBscGasPrice() {
  try {
    const rpcUrl = readEnv('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result) {
        const gasPriceWei = parseInt(data.result, 16);
        const gasPriceGwei = gasPriceWei / Math.pow(10, 9);
        return gasPriceGwei;
      }
    }
    
    throw new Error(`Failed to get gas price: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting BSC gas price:', error);
    return 0;
  }
}

/**
 * Get BSC block number
 * @returns {number} Current block number
 */
function getBscBlockNumber() {
  try {
    const rpcUrl = readEnv('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = fetchWithLogging(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result) {
        return parseInt(data.result, 16);
      }
    }
    
    throw new Error(`Failed to get block number: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting BSC block number:', error);
    return 0;
  }
}

/**
 * Test BSC functions
 * @returns {Object} Test results
 */
function testBscFunctions() {
  try {
    console.log('Testing BSC functions...');
    
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Native BNB balance
    try {
      const bnbBalance = getBscNativeBalance(testAddress);
      result.tests.push(`✓ BNB balance: ${bnbBalance} BNB`);
    } catch (error) {
      result.tests.push(`✗ BNB balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Gas price
    try {
      const gasPrice = getBscGasPrice();
      result.tests.push(`✓ Gas price: ${gasPrice} Gwei`);
    } catch (error) {
      result.tests.push(`✗ Gas price failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Block number
    try {
      const blockNumber = getBscBlockNumber();
      result.tests.push(`✓ Block number: ${blockNumber}`);
    } catch (error) {
      result.tests.push(`✗ Block number failed: ${error.toString()}`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ BSC test failed: ${error.toString()}`]
    };
  }
}