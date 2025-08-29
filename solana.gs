/**
 * solana.gs - Solana Network Integration
 * Handles fetching SOL and SPL token balances
 */

/**
 * Get Solana balances for an address
 * @param {string} address - Solana address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of balance objects
 */
function getSolanaBalances(address, coins) {
  try {
    if (!address || address.length !== 44) {
      throw new Error('Invalid Solana address');
    }
    
    console.log(`Fetching Solana balances for address: ${address}`);
    
    const balances = [];
    
    // Get native SOL balance
    const solBalance = getSolanaNativeBalance(address);
    if (solBalance > 0) {
      balances.push({
        symbol: 'SOL',
        balance: solBalance,
        network: 'SOL',
        contract_address: '',
        decimals: 9
      });
    }
    
    // Get SPL token balances
    const splBalances = getSolanaSplBalances(address, coins);
    balances.push(...splBalances);
    
    console.log(`Found ${balances.length} balances for Solana address ${address}`);
    return balances;
    
  } catch (error) {
    console.error(`Error fetching Solana balances for ${address}:`, error);
    throw error;
  }
}

/**
 * Get native SOL balance
 * @param {string} address - Solana address
 * @returns {number} SOL balance
 */
function getSolanaNativeBalance(address) {
  try {
    const rpcUrl = readEnv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'getBalance',
      params: [address],
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
      if (data.result && data.result.value !== undefined) {
        const balanceLamports = data.result.value;
        const balanceSol = balanceLamports / Math.pow(10, 9);
        return balanceSol;
      }
    }
    
    throw new Error(`Failed to get SOL balance: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Solana native balance:', error);
    return 0;
  }
}

/**
 * Get SPL token balances
 * @param {string} address - Solana address
 * @param {Array} coins - Array of coin configurations
 * @returns {Array} Array of SPL balance objects
 */
function getSolanaSplBalances(address, coins) {
  const balances = [];
  const solanaCoins = coins.filter(coin => coin.network === 'SOL');
  
  console.log(`Checking ${solanaCoins.length} SPL tokens for address ${address}`);
  
  try {
    const rpcUrl = readEnv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'getTokenAccountsByOwner',
      params: [
        address,
        {
          programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          encoding: 'jsonParsed'
        }
      ],
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
      if (data.result && data.result.value) {
        const tokenAccounts = data.result.value;
        
        for (const account of tokenAccounts) {
          try {
            const accountInfo = account.account.data.parsed.info;
            const mint = accountInfo.mint;
            const balance = parseFloat(accountInfo.tokenAmount.uiAmount);
            
            if (balance > 0) {
              // Find coin info for this mint
              const coin = solanaCoins.find(c => c.contract_address === mint);
              const symbol = coin ? coin.symbol : 'UNKNOWN';
              const decimals = coin ? coin.decimals : accountInfo.tokenAmount.decimals;
              
              balances.push({
                symbol: symbol,
                balance: balance,
                network: 'SOL',
                contract_address: mint,
                decimals: decimals
              });
            }
          } catch (tokenError) {
            console.warn('Error parsing token account:', tokenError);
            // Continue with other tokens
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error getting SPL token balances:', error);
  }
  
  return balances;
}

/**
 * Get Solana block height
 * @returns {number} Current block height
 */
function getSolanaBlockHeight() {
  try {
    const rpcUrl = readEnv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'getBlockHeight',
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
        return data.result;
      }
    }
    
    throw new Error(`Failed to get block height: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Solana block height:', error);
    return 0;
  }
}

/**
 * Get Solana slot
 * @returns {number} Current slot
 */
function getSolanaSlot() {
  try {
    const rpcUrl = readEnv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com');
    
    const payload = {
      jsonrpc: '2.0',
      method: 'getSlot',
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
        return data.result;
      }
    }
    
    throw new Error(`Failed to get slot: HTTP ${responseCode}`);
    
  } catch (error) {
    console.error('Error getting Solana slot:', error);
    return 0;
  }
}

/**
 * Test Solana functions
 * @returns {Object} Test results
 */
function testSolanaFunctions() {
  try {
    console.log('Testing Solana functions...');
    
    const testAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Native SOL balance
    try {
      const solBalance = getSolanaNativeBalance(testAddress);
      result.tests.push(`✓ SOL balance: ${solBalance} SOL`);
    } catch (error) {
      result.tests.push(`✗ SOL balance failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 2: Block height
    try {
      const blockHeight = getSolanaBlockHeight();
      result.tests.push(`✓ Block height: ${blockHeight}`);
    } catch (error) {
      result.tests.push(`✗ Block height failed: ${error.toString()}`);
      result.success = false;
    }
    
    // Test 3: Slot
    try {
      const slot = getSolanaSlot();
      result.tests.push(`✓ Slot: ${slot}`);
    } catch (error) {
      result.tests.push(`✗ Slot failed: ${error.toString()}`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ Solana test failed: ${error.toString()}`]
    };
  }
}