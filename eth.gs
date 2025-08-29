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
    
    const response = fetchWithLogging(rpcUrl, options);
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
  const ethCoins = coins.filter(coin => coin.network === 'ETH');
  
  console.log(`Checking ${ethCoins.length} ERC20 tokens for address ${address}`);
  
  for (const coin of ethCoins) {
    try {
      let balance = 0;
      // Resolve known bad/missing contract addresses
      const resolvedContract = resolveEthContractAddress(coin.symbol, coin.contract_address);
      if (resolvedContract) {
        addRunLog(`[ETH] Using contract for ${coin.symbol}: ${resolvedContract}`, 'debug');
        balance = getEthErc20Balance(address, resolvedContract, coin.decimals);
      }
      // Moralis fallbacks
      if ((!balance || balance === 0) && isMoralisConfigured()) {
        try {
          if (resolvedContract) {
            balance = moralisGetTokenBalance(address, resolvedContract, coin.decimals, 'eth');
          }
          if ((!balance || balance === 0) && coin.symbol) {
            balance = moralisGetTokenBalanceBySymbol(address, coin.symbol, 'eth');
          }
        } catch (e) {
          console.warn(`Moralis fallback failed for ${coin.symbol} on ETH:`, e);
        }
      }
      // Always push entry; default to zero when not found
      balances.push({
        symbol: coin.symbol,
        balance: balance || 0,
        network: 'ETH',
        contract_address: resolvedContract || coin.contract_address,
        decimals: coin.decimals
      });
    } catch (error) {
      console.warn(`Error getting balance for ${coin.symbol}:`, error);
      const resolvedContract = resolveEthContractAddress(coin.symbol, coin.contract_address);
      balances.push({ symbol: coin.symbol, balance: 0, network: 'ETH', contract_address: resolvedContract || coin.contract_address, decimals: coin.decimals });
    }
  }
  
  // Always enumerate via Moralis (if configured) and merge any additional tokens found
  if (isMoralisConfigured()) {
    try {
      const listed = moralisListErc20Balances(address, 'eth');
      for (var i = 0; i < listed.length; i++) {
        var t = listed[i];
        var already = balances.find(b => b.symbol === t.symbol && (b.contract_address === t.contract_address || !b.contract_address));
        if (!already) {
          balances.push({
            symbol: t.symbol,
            balance: t.balance,
            network: 'ETH',
            contract_address: t.contract_address || '',
            decimals: t.decimals || 18
          });
        }
      }
    } catch (e) {
      console.warn('Moralis enumeration for ETH failed:', e);
    }
  }
  
  return balances;
}

/**
 * Resolve canonical ETH mainnet contract addresses for known tokens when the configured
 * contract address is missing or clearly invalid. Keeps the provided address when valid.
 * @param {string} symbol
 * @param {string} provided
 * @returns {string}
 */
function resolveEthContractAddress(symbol, provided) {
  try {
    const isValid = function(addr) {
      return !!(addr && typeof addr === 'string' && addr.startsWith('0x') && addr.length === 42);
    };
    if (isValid(provided)) return provided;
    const sym = String(symbol || '').toUpperCase();
    var map = {
      'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',
      'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA'
    };
    return map[sym] || provided;
  } catch (e) {
    return provided;
  }
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
    
    const response = fetchWithLogging(rpcUrl, options);
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