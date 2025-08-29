/**
 * api.gs - Assests Manager Main API
 * Handles web app endpoints and orchestrates balance fetching operations
 */

// Global configuration
const GLOBAL_CONFIG = {
  CMC_QUOTES_ENDPOINT: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
  MORALIS_BASE_URL: 'https://deep-index.moralis.io/api/v2',
  INFURA_BASE_URL: 'https://mainnet.infura.io/v3',
  BSC_BASE_URL: 'https://api.bscscan.com/api',
  SOLSCAN_BASE_URL: 'https://public-api.solscan.io',
  TRONGRID_BASE_URL: 'https://api.trongrid.io',
  KUCOIN_BASE_URL: 'https://api.kucoin.com'
};

/**
 * Main entry point for the web app
 */
function doGet(e) {
  try {
    const template = HtmlService.createTemplateFromFile('ui');
    const html = template.evaluate()
      .setTitle('Assests Manager')
      .setFaviconUrl('https://www.google.com/images/icons/product/sheets-32.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    
    return html;
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput(`
      <html>
        <body>
          <h1>Error</h1>
          <p>Failed to load the application: ${error.toString()}</p>
        </body>
      </html>
    `);
  }
}

/**
 * Include HTML files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Main function to fetch and store balances
 * @param {string} triggerType - 'MANUAL' or 'SCHEDULE'
 * @returns {Object} Summary of the operation
 */
function fetchAndStoreBalances(triggerType = 'MANUAL') {
  const startTime = Date.now();
  const summary = {
    triggerType,
    startTime: new Date(startTime).toISOString(),
    fetchedRecords: 0,
    errors: [],
    durationMs: 0,
    walletsProcessed: 0
  };
  
  try {
    console.log(`Starting balance fetch for trigger: ${triggerType}`);
    
    // Read wallets configuration
    const wallets = readWalletsConfig();
    console.log(`Read ${wallets.length} wallets from configuration`);
    
    if (!wallets || wallets.length === 0) {
      const error = 'No active wallets found in configuration. Please run setup first or check Wallets sheet.';
      console.error(error);
      throw new Error(error);
    }
    
    // Read coins configuration
    const coins = readCoinsConfig();
    console.log(`Read ${coins.length} coins from configuration`);
    
    if (!coins || coins.length === 0) {
      const error = 'No coins configured in Coins Management. Please run setup first or check Coins Management sheet.';
      console.error(error);
      throw new Error(error);
    }
    
    // Get unique symbols for CMC price fetch
    const symbols = [...new Set(coins.map(coin => coin.symbol))];
    console.log(`Fetching prices for ${symbols.length} symbols from CMC`);
    
    // Fetch CMC prices with graceful fallback
    let prices = {};
    try {
      prices = fetchCmcPrices(symbols);
      console.log(`Fetched prices for ${Object.keys(prices).length} symbols`);
    } catch (cmcError) {
      console.warn('CMC price fetch failed, falling back to zero prices:', cmcError);
      try {
        prices = createZeroPrices(symbols);
      } catch (fallbackErr) {
        // If helper is unavailable for any reason, still continue with empty map
        prices = {};
      }
      summary.errors.push(`CMC price fetch failed: ${cmcError.message || cmcError.toString()}`);
    }
    
    // Process each wallet
    for (const wallet of wallets) {
      if (wallet.active !== 'TRUE') {
        console.log(`Skipping inactive wallet: ${wallet.name}`);
        continue;
      }
      
      try {
        console.log(`Processing wallet: ${wallet.name} (${wallet.network})`);
        
        let balances = [];
        
        // Fetch balances based on network type
        switch (wallet.network.toUpperCase()) {
          case 'ETH':
            balances = getEthBalances(wallet.address, coins);
            break;
          case 'BSC':
            balances = getBscBalances(wallet.address, coins);
            break;
          case 'SOL':
            balances = getSolanaBalances(wallet.address, coins);
            break;
          case 'BTC':
            balances = getBitcoinBalances(wallet.address, coins);
            break;
          case 'XRP':
            balances = getXrpBalances(wallet.address, coins);
            break;
          case 'TON':
            balances = getTonBalances(wallet.address, coins);
            break;
          case 'KUCOIN':
            balances = getKucoinBalances(wallet);
            break;
          default:
            console.warn(`Unsupported network: ${wallet.network}`);
            continue;
        }
        
        // Create financial records for each balance
        for (const balance of balances) {
          // Prices map returns objects like { price, market_cap, ... }
          const price = (prices[balance.symbol] && prices[balance.symbol].price)
            ? prices[balance.symbol].price
            : 0;
          // Normalize balance amount across different providers (e.g., KuCoin uses `total`)
          const amount = (typeof balance.balance === 'number' && !isNaN(balance.balance))
            ? balance.balance
            : (typeof balance.total === 'number' && !isNaN(balance.total)
              ? balance.total
              : (typeof balance.available === 'number' && !isNaN(balance.available) ? balance.available : 0));
          const valueUsd = amount * price;
          
          const record = {
            timestamp: new Date().toISOString(),
            type: 'BALANCE_SNAPSHOT',
            network: wallet.network,
            symbol: balance.symbol,
            address: wallet.address || wallet.name,
            balance: amount,
            price_usd: price,
            value_usd: valueUsd,
            status: 'SUCCESS'
          };
          
          // Append to Financial Records (unless DRY_RUN is enabled)
          const dryRun = readEnv('DRY_RUN', 'true') === 'true';
          if (!dryRun) {
            appendFinancialRecord(record);
            summary.fetchedRecords++;
          } else {
            console.log(`DRY_RUN: Would append record:`, record);
            summary.fetchedRecords++;
          }
        }
        
        summary.walletsProcessed++;
        
        // Update wallet last sync
        updateWalletLastSync(wallet.id, new Date().toISOString());
        
      } catch (walletError) {
        const errorMsg = `Error processing wallet ${wallet.name}: ${walletError.toString()}`;
        console.error(errorMsg);
        summary.errors.push(errorMsg);
      }
    }
    
    // Update last sync timestamp and status based on errors
    writeEnv('LAST_SYNC_TIMESTAMP', new Date().toISOString());
    if (summary.errors.length === 0) {
      writeEnv('LAST_SYNC_STATUS', 'Success');
    } else {
      writeEnv('LAST_SYNC_STATUS', 'Failed');
    }
    
  } catch (error) {
    const errorMsg = `Fatal error in fetchAndStoreBalances: ${error.toString()}`;
    console.error(errorMsg);
    summary.errors.push(errorMsg);
    writeEnv('LAST_SYNC_STATUS', 'Failed');
  }
  
  summary.durationMs = Date.now() - startTime;
  summary.endTime = new Date().toISOString();
  // Consider run successful if at least one wallet was processed, even with partial errors
  summary.success = summary.walletsProcessed > 0;
  
  console.log(`Balance fetch completed in ${summary.durationMs}ms. Records: ${summary.fetchedRecords}, Errors: ${summary.errors.length}`);
  
  return summary;
}

/**
 * Get the last sync information
 * @returns {Object} Last sync details
 */
function getLastSync() {
  try {
    const lastSync = readEnv('LAST_SYNC_TIMESTAMP', '');
    const lastStatus = readEnv('LAST_SYNC_STATUS', 'Never');
    
    return {
      timestamp: lastSync,
      status: lastStatus,
      formatted: lastSync ? new Date(lastSync).toLocaleString() : 'Never'
    };
  } catch (error) {
    console.error('Error getting last sync:', error);
    return { timestamp: '', status: 'Error', formatted: 'Error' };
  }
}

/**
 * Get dashboard statistics
 * @returns {Object} Dashboard stats including wallet count, coin count, and last sync info
 */
function getDashboardStats() {
  try {
    const wallets = readWalletsConfig();
    const coins = readCoinsConfig();
    const lastSync = getLastSync();
    
    return {
      success: true,
      totalWallets: wallets.length,
      totalCoins: coins.length,
      lastSync: lastSync
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      success: false,
      error: error.toString(),
      totalWallets: 0,
      totalCoins: 0,
      lastSync: { timestamp: '', status: 'Error', formatted: 'Error' }
    };
  }
}

/**
 * Get configuration summary for UI display
 * @returns {Object}
 */
function getConfigurationSummary() {
  try {
    const dryRun = readEnv('DRY_RUN', 'true') === 'true';
    const maxRetries = parseInt(readEnv('MAX_RETRIES', '3')) || 3;
    const duplicateProtection = readEnv('DUPLICATE_PROTECTION', 'true') === 'true';
    const cmcKey = readEnv('CMC_API_KEY', '');
    const moralisKey = readEnv('MORALIS_API_KEY', '');
    const infuraId = readEnv('INFURA_PROJECT_ID', '');
    
    const wallets = readWalletsConfig();
    const anyKucoin = wallets.some(w => String(w.network).toUpperCase() === 'KUCOIN' && w.api_key && w.api_secret && w.passphrase);
    
    let ethStatus = 'Not Configured';
    if (moralisKey && moralisKey !== 'YOUR_MORALIS_API_KEY_HERE') {
      ethStatus = 'Moralis';
    } else if (infuraId && infuraId !== 'YOUR_INFURA_PROJECT_ID_HERE') {
      ethStatus = 'Infura';
    } else {
      ethStatus = 'Public RPC';
    }
    
    return {
      success: true,
      dryRun,
      maxRetries,
      duplicateProtection,
      apiStatus: {
        cmc: (cmcKey && cmcKey !== 'YOUR_CMC_API_KEY_HERE') ? 'Configured' : 'Not Configured',
        kucoin: anyKucoin ? 'Configured' : 'Not Configured',
        eth: ethStatus
      }
    };
  } catch (error) {
    console.error('Error building configuration summary:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Read wallets configuration from the Wallets sheet
 * @returns {Array} Array of wallet objects
 */
function readWalletsConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    if (!sheet) {
      console.log('Wallets sheet not found');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    console.log(`Wallets sheet has ${data.length} rows`);
    
    if (data.length <= 1) {
      console.log('Wallets sheet has no data rows');
      return [];
    }
    // Build header index map for resilience to column order changes
    const headers = data[0].map(h => String(h).trim());
    const indexOf = (name) => headers.findIndex(h => h.toLowerCase() === String(name).toLowerCase());
    const idIdx = indexOf('ID');
    const nameIdx = indexOf('Name');
    const networkIdx = indexOf('Network');
    const addressIdx = indexOf('Address');
    const apiKeyIdx = indexOf('API_KEY');
    const apiSecretIdx = indexOf('API_SECRET');
    const passphraseIdx = indexOf('PASSPHRASE');
    const activeIdx = indexOf('Active');
    const lastSyncIdx = indexOf('Last Sync');
    const notesIdx = indexOf('Notes');

    const isTrue = (val) => {
      if (val === true) return true;
      const normalized = String(val).trim().toUpperCase();
      return normalized === 'TRUE' || normalized === 'YES' || normalized === '1';
    };

    const wallets = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const activeVal = activeIdx >= 0 ? row[activeIdx] : undefined;
      console.log(`Row ${i}: Active=${activeVal}, Active type=${typeof activeVal}`);
      if (!isTrue(activeVal)) {
        continue;
      }

      const wallet = {
        id: idIdx >= 0 && row[idIdx] ? row[idIdx] : String(i),
        name: nameIdx >= 0 ? row[nameIdx] : `Wallet ${i}`,
        network: networkIdx >= 0 ? row[networkIdx] : '',
        address: addressIdx >= 0 ? row[addressIdx] : '',
        api_key: apiKeyIdx >= 0 ? row[apiKeyIdx] : '',
        api_secret: apiSecretIdx >= 0 ? row[apiSecretIdx] : '',
        passphrase: passphraseIdx >= 0 ? row[passphraseIdx] : '',
        active: 'TRUE',
        last_sync: lastSyncIdx >= 0 ? row[lastSyncIdx] : '',
        notes: notesIdx >= 0 ? row[notesIdx] : ''
      };

      wallets.push(wallet);
    }

    console.log(`Found ${wallets.length} active wallets`);
    return wallets;
    
  } catch (error) {
    console.error('Error in readWalletsConfig:', error);
    return [];
  }
}

/**
 * Read coins configuration from the Coins Management sheet
 * @returns {Array} Array of coin objects
 */
function readCoinsConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coins Management');
    if (!sheet) {
      console.log('Coins Management sheet not found');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    console.log(`Coins Management sheet has ${data.length} rows`);
    
    if (data.length <= 1) {
      console.log('Coins Management sheet has no data rows');
      return [];
    }
    // Build header index map for resilience to column order changes
    const headers = data[0].map(h => String(h).trim());
    const indexOf = (name) => headers.findIndex(h => h.toLowerCase() === String(name).toLowerCase());
    const symbolIdx = indexOf('Symbol');
    const nameIdx = indexOf('Name');
    const networkIdx = indexOf('Network');
    const contractIdx = indexOf('Contract Address');
    const decimalsIdx = indexOf('Decimals');
    const cmcIdIdx = indexOf('CMC ID');
    const activeIdx = indexOf('Active');

    const isTrue = (val) => {
      if (val === true) return true;
      const normalized = String(val).trim().toUpperCase();
      return normalized === 'TRUE' || normalized === 'YES' || normalized === '1';
    };

    const coins = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const symbol = symbolIdx >= 0 ? row[symbolIdx] : row[0];
      const activeVal = activeIdx >= 0 ? row[activeIdx] : undefined;
      console.log(`Row ${i}: Symbol=${symbol}, Active=${activeVal}, Active type=${typeof activeVal}`);
      if (!symbol || !isTrue(activeVal)) {
        continue;
      }
      coins.push({
        symbol: symbol,
        name: nameIdx >= 0 ? row[nameIdx] : '',
        network: networkIdx >= 0 ? row[networkIdx] : '',
        contract_address: contractIdx >= 0 ? row[contractIdx] : '',
        decimals: parseInt(decimalsIdx >= 0 ? row[decimalsIdx] : 18) || 18,
        cmc_id: cmcIdIdx >= 0 ? row[cmcIdIdx] : '',
        active: 'TRUE'
      });
    }

    console.log(`Found ${coins.length} active coins`);
    return coins;
    
  } catch (error) {
    console.error('Error in readCoinsConfig:', error);
    return [];
  }
}

/**
 * Update wallet's last sync timestamp
 * @param {string} walletId - Wallet ID
 * @param {string} timestamp - ISO timestamp
 */
function updateWalletLastSync(walletId, timestamp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(walletId)) {
        sheet.getRange(i + 1, 9).setValue(timestamp); // Column I (Last Sync)
        break;
      }
    }
  } catch (error) {
    console.error(`Error updating wallet ${walletId} last sync:`, error);
  }
}

/**
 * Append a financial record to the Financial Records sheet
 * @param {Object} record - Record object
 */
function appendFinancialRecord(record) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Financial Records');
    if (!sheet) {
      throw new Error('Financial Records sheet not found');
    }
    
    const row = [
      record.timestamp,
      record.type,
      record.network,
      record.symbol,
      record.address,
      record.balance,
      record.price_usd,
      record.value_usd,
      record.status
    ];
    
    sheet.appendRow(row);
    console.log(`Appended financial record for ${record.symbol} on ${record.network}`);
    
  } catch (error) {
    console.error('Error appending financial record:', error);
    throw error;
  }
}

/**
 * Test function to verify the setup
 * @returns {Object} Test results
 */
function testSetup() {
  try {
    const result = {
      success: true,
      tests: []
    };
    
    // Test 1: Check if sheets exist
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['ENV', 'Wallets', 'Coins Management', 'Financial Records'];
    
    for (const sheetName of requiredSheets) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        result.tests.push(`✓ ${sheetName} sheet exists`);
      } else {
        result.tests.push(`✗ ${sheetName} sheet missing`);
        result.success = false;
      }
    }
    
    // Test 2: Check environment variables
    const envVars = ['CMC_API_KEY', 'DRY_RUN', 'MAX_RETRIES'];
    for (const envVar of envVars) {
      const value = readEnv(envVar);
      if (value !== '') {
        result.tests.push(`✓ ${envVar} is configured`);
      } else {
        result.tests.push(`✗ ${envVar} is not configured`);
      }
    }
    
    // Test 3: Check wallets configuration
    const wallets = readWalletsConfig();
    if (wallets.length > 0) {
      result.tests.push(`✓ Found ${wallets.length} active wallets`);
    } else {
      result.tests.push(`✗ No active wallets found`);
      result.success = false;
    }
    
    // Test 4: Check coins configuration
    const coins = readCoinsConfig();
    if (coins.length > 0) {
      result.tests.push(`✓ Found ${coins.length} active coins`);
    } else {
      result.tests.push(`✗ No active coins found`);
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      tests: [`✗ Test failed with error: ${error.toString()}`]
    };
  }
}

/**
 * Manually run setup to create/refresh sheets
 * @returns {Object} Setup result
 */
function runSetupFromUI() {
  try {
    console.log('Running setup from UI...');
    const result = runSetup();
    
    if (result.success) {
      // Update environment variables after setup
      writeEnv('LAST_SYNC_TIMESTAMP', '');
      writeEnv('LAST_SYNC_STATUS', 'Never');
      
      console.log('Setup completed successfully from UI');
      return {
        success: true,
        message: 'Setup completed successfully! Sheets have been created/refreshed.',
        timestamp: new Date().toISOString()
      };
    } else {
      console.error('Setup failed from UI:', result.error);
      return {
        success: false,
        error: result.error || 'Setup failed',
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('Error running setup from UI:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check if the system has been properly set up
 * @returns {Object} Setup status information
 */
function checkSetupStatus() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['ENV', 'Wallets', 'Coins Management', 'Financial Records'];
    const missingSheets = [];
    const existingSheets = [];
    
    for (const sheetName of requiredSheets) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        existingSheets.push(sheetName);
      } else {
        missingSheets.push(sheetName);
      }
    }
    
    const wallets = readWalletsConfig();
    const coins = readCoinsConfig();
    
    const isSetupComplete = missingSheets.length === 0 && wallets.length > 0 && coins.length > 0;
    
    return {
      success: true,
      isSetupComplete,
      existingSheets,
      missingSheets,
      walletCount: wallets.length,
      coinCount: coins.length,
      message: isSetupComplete ? 
        'System is properly configured and ready to use.' : 
        'System needs setup. Missing sheets: ' + missingSheets.join(', ') + 
        (wallets.length === 0 ? ' No active wallets found.' : '') +
        (coins.length === 0 ? ' No active coins found.' : '')
    };
    
  } catch (error) {
    console.error('Error checking setup status:', error);
    return {
      success: false,
      error: error.toString(),
      isSetupComplete: false,
      message: 'Error checking setup status: ' + error.toString()
    };
  }
}