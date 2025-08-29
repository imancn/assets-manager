/**
 * eth.gs - Ethereum Network Integration
 * Handles fetching ETH and ERC20 token balances
 */

/**
 * Get Ethereum balances for an address
 * @param {string} address - Ethereum address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getEthBalances(address, coins) {
  try {
    if (!address || !address.startsWith('0x')) {
      throw new Error('Invalid Ethereum address');
    }
    
    console.log(`Fetching ETH balances for address: ${address}`);
    
    const balances = [];
    
    // Get native ETH balance
    const ethBalance = getEthNativeBalance(address);
    if (ethBalance > 0) {
      balances.push({
        symbol: 'ETH',
        balance: ethBalance,
        network: 'ETH',
        contract_address: '0x0000000000000000000000000000000000000000',
        decimals: 18
      });
    }
    
    // Get ERC20 token balances
    const erc20Balances = getEthErc20Balances(address, coins);
    balances.push(...erc20Balances);
    
    console.log(`Found ${balances.length} balances for ETH address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching ETH balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native ETH balance
 * @param {string} address - Ethereum address
 * @returns {number} ETH balance in wei
 */
function getEthNativeBalance(address) {
  try {
    const infuraProjectId = readEnv('INFURA_PROJECT_ID', '');
    let rpcUrl;
    
    if (infuraProjectId && infuraProjectId !== 'YOUR_INFURA_PROJECT_ID_HERE') {
      rpcUrl = `${GLOBAL_CONFIG.INFURA_BASE_URL}/${infuraProjectId}`;
    } else {
      // Use public RPC as fallback first; Moralis as the last resort if configured
      rpcUrl = 'https://eth.llamarpc.com';
    }
    
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
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result) {
        const balanceWei = parseInt(data.result, 16);
        const balanceEth = balanceWei / Math.pow(10, 18);
        return balanceEth;
      }
    }
    
    // If standard RPC fails and Moralis is configured, try Moralis
    if (isMoralisConfigured()) {
      try {
        return moralisGetNativeBalance(address, 'eth');
      } catch (moralisError) {
        console.warn('Moralis native balance fallback failed:', moralisError);
      }
    }
    
    throw new Error(`Failed to get ETH balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting ETH native balance:', error);
    return 0;
  }
}

/**
 * Get ERC20 token balances
 * @param {string} address - Ethereum address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of ERC20 balance objects
 */
function getEthErc20Balances(address, coins) {
  const balances = [];
  const ethCoins = coins.filter(coin => coin.network === 'ETH' && coin.contract_address);
  
  console.log(`Checking ${ethCoins.length} ERC20 tokens for address ${address}`);
  
  for (const coin of ethCoins) {
    try {
      let balance = getEthErc20Balance(address, coin.contract_address, coin.decimals);
      
      // Moralis symbol-based fallback if direct RPC returned zero
      if ((!balance || balance === 0) && isMoralisConfigured()) {
        try {
          if (coin.contract_address) {
            balance = moralisGetTokenBalance(address, coin.contract_address, coin.decimals, 'eth');
          }
          if (!balance || balance === 0) {
            balance = moralisGetTokenBalanceBySymbol(address, coin.symbol, 'eth');
          }
        } catch (e) {
          console.warn(`Moralis fallback failed for ${coin.symbol} on ETH:`, e);
        }
      }
      
      if (balance > 0) {
        balances.push({
          symbol: coin.symbol,
          balance: balance,
          network: 'ETH',
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
 * Get single ERC20 token balance
 * @param {string} address - Ethereum address
 * @param {string} contractAddress - ERC20 contract address
 * @param {number} decimals - Token decimals
 * @returns {number} Token balance
 */
function getEthErc20Balance(address, contractAddress, decimals = 18) {
  try {
    const infuraProjectId = readEnv('INFURA_PROJECT_ID', '');
    let rpcUrl;
    
    if (infuraProjectId && infuraProjectId !== 'YOUR_INFURA_PROJECT_ID_HERE') {
      rpcUrl = `${GLOBAL_CONFIG.INFURA_BASE_URL}/${infuraProjectId}`;
    } else {
      // Use public RPC as fallback
      rpcUrl = 'https://eth.llamarpc.com';
    }
    
    // ERC20 balanceOf function signature: 0x70a08231
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
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result && data.result !== '0x') {
        const balanceWei = parseInt(data.result, 16);
        const balance = balanceWei / Math.pow(10, decimals);
        return balance;
      }
    }
    
    // Try Moralis fallback for token balances if configured
    if (isMoralisConfigured()) {
      try {
        let amt = 0;
        if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
          amt = moralisGetTokenBalance(address, contractAddress, decimals, 'eth');
        }
        if (!amt || amt === 0) {
          // As a last resort, try by symbol (requires calling function with symbol)
          // We don't have symbol here; the higher-level caller will handle symbol-based path.
        }
        return amt;
      } catch (moralisError) {
        console.warn('Moralis ERC20 balance fallback failed:', moralisError);
      }
    }
    
    return 0;
    
  } catch (error) {
    console.error(`Error getting ERC20 balance for ${contractAddress}:`, error);
    return 0;
  }
}

/**
 * Get ETH gas price
 * @returns {number} Gas price in Gwei
 */
function getEthGasPrice() {
  try {
    const infuraProjectId = readEnv('INFURA_PROJECT_ID', '');
    let rpcUrl;
    
    if (infuraProjectId && infuraProjectId !== 'YOUR_INFURA_PROJECT_ID_HERE') {
      rpcUrl = `${GLOBAL_CONFIG.INFURA_BASE_URL}/${infuraProjectId}`;
    } else {
      rpcUrl = 'https://eth.llamarpc.com';
    }
    
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
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
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
    console.error('Error getting ETH gas price:', error);
    return 0;
  }
}

/**
 * Get ETH transaction count (nonce)
 * @param {string} address - Ethereum address
 * @returns {number} Transaction count
 */
function getEthTransactionCount(address) {
  try {
    const infuraProjectId = readEnv('INFURA_PROJECT_ID', '');
    let rpcUrl;
    
    if (infuraProjectId && infuraProjectId !== 'YOUR_INFURA_PROJECT_ID_HERE') {
      rpcUrl = `${GLOBAL_CONFIG.INFURA_BASE_URL}/${infuraProjectId}`;
    } else {
      rpcUrl = 'https://eth.llamarpc.com';
    }
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
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
    
    const response = UrlFetchApp.fetch(rpcUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const data = JSON.parse(response.getContentText());
      if (data.result) {
        return parseInt(data.result, 16);
      }
    }
    
    throw new Error(`Failed to get transaction count: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting ETH transaction count:', error);
    return 0;
  }
}

/**
 * Test ETH functions
 * @returns {Object} Test results
 */
function testEthFunctions() {
  try {
    console.log('Testing ETH functions...');
    
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Native ETH balance
    try {
      const ethBalance = getEthNativeBalance(testAddress);
      result.tests.push(`✓ ETH balance: ${ethBalance} ETH`);
    } catch (error) {
      result.tests.push(`✗ ETH balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Gas price
    try {
      const gasPrice = getEthGasPrice();
      result.tests.push(`✓ Gas price: ${gasPrice} Gwei`);
    } catch (error) {
      result.tests.push(`✗ Gas price failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Transaction count
    try {
      const txCount = getEthTransactionCount(testAddress);
      result.tests.push(`✓ Transaction count: ${txCount}`);
    } catch (error) {
      result.tests.push(`✗ Transaction count failed: ${error.toString()}`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ ETH test failed: ${error.toString()}`]
    };
  }
}