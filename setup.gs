/**
 * Setup.gs - Assests Manager Google Apps Script Setup
 * Creates and seeds the required sheets for the crypto assets management app
 */

function runSetup() {
  try {
    console.log('Starting setup for Assests Manager...');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create ENV sheet with configuration
    createEnvSheet(ss);
    
    // Create Wallets sheet with wallet configurations
    createWalletsSheet(ss);
    
    // Create Coins Management sheet with token metadata
    createCoinsManagementSheet(ss);
    
    // Create Financial Records sheet for storing balance snapshots
    createFinancialRecordsSheet(ss);
    
    console.log('Setup completed successfully!');
    return { success: true, message: 'Setup completed successfully!' };
    
  } catch (error) {
    console.error('Setup failed:', error);
    return { success: false, error: error.toString() };
  }
}

function createEnvSheet(ss) {
  let envSheet = ss.getSheetByName('ENV');
  if (envSheet) {
    ss.deleteSheet(envSheet);
  }
  
  envSheet = ss.insertSheet('ENV');
  
  // Headers
  envSheet.getRange('A1:B1').setValues([['KEY', 'VALUE']]);
  
  // Configuration values - Updated to include all API keys from config text
  const config = [
    // Core API Keys
    ['CMC_API_KEY', 'e3d2cce1-758b-490d-848a-6123d5473d3d'],
    ['MORALIS_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjE3NmI0ZjU3LTA4ZmItNGJlMy04NjYyLWRiODU2Y2ViN2E1NyIsIm9yZ0lkIjoiNDY2NzI4IiwidXNlcklkIjoiNDgwMTYxIiwidHlwZUlkIjoiOGMxNGI3YTktMmZlZS00NDVlLWIyZjktZDFmMWQyZjQ3OWQwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTU5MzcwMzksImV4cCI6NDkxMTY5NzAzOX0.OnDYZNw983she_yNBpMtW_CY1muJw13QWrrX6qDjPxg'],
    ['INFURA_PROJECT_ID', 'YOUR_INFURA_PROJECT_ID_HERE'],
    ['TRON_API_KEY', ''],
    ['BLOCKFROST_API_KEY', ''],
    
    // Blockchain Explorer API Keys
    ['ETHSCAN_API_KEY', ''],
    ['BSCSCAN_API_KEY', ''],
    ['TRONSCAN_API_KEY', ''],
    ['SOLSCAN_API_KEY', ''],
    ['ADASCAN_API_KEY', ''],
    ['BTCSCAN_API_KEY', ''],
    ['XRPSCAN_API_KEY', ''],
    ['TONSCAN_API_KEY', ''],
    
    // Additional Optional Network Keys
    ['TRONGRID_API_KEY', 'YOUR_TRONGRID_API_KEY_HERE'],
    ['BLOCKSTREAM_API_KEY', 'YOUR_BLOCKSTREAM_API_KEY_HERE'],
    ['RIPPLE_API_KEY', 'YOUR_RIPPLE_API_KEY_HERE'],
    ['TONCENTER_API_KEY', 'YOUR_TONCENTER_API_KEY_HERE'],
    
    // Network RPC URLs
    ['ETH_RPC_URL', 'https://eth.llamarpc.com'],
    ['BSC_RPC_URL', 'https://bsc-dataseed.binance.org/'],
    ['SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'],
    ['XRP_RPC_URL', 'https://xrplcluster.com'],
    ['TON_RPC_URL', 'https://toncenter.com/api/v2'],
    ['BTC_RPC_URL', 'https://blockstream.info/api'],
    
    // System Configuration
    ['MAX_RETRIES', '3'],
    ['DRY_RUN', 'true'],
    ['DUPLICATE_PROTECTION', 'true'],
    ['AUTO_REFRESH_INTERVAL', '300000'], // 5 minutes in ms
    ['LAST_SYNC_TIMESTAMP', ''],
    ['LAST_SYNC_STATUS', 'Never'],
    
    // Rate Limiting
    ['CMC_RATE_LIMIT_DELAY', '1000'], // 1 second between CMC requests
    ['RPC_RATE_LIMIT_DELAY', '100'], // 100ms between RPC requests
    ['MAX_CONCURRENT_REQUESTS', '5'], // Max concurrent API requests
    
    // Network Timeouts
    ['ETH_TIMEOUT_MS', '10000'],
    ['BSC_TIMEOUT_MS', '10000'],
    ['SOLANA_TIMEOUT_MS', '10000'],
    ['XRP_TIMEOUT_MS', '10000'],
    ['TON_TIMEOUT_MS', '10000'],
    ['BTC_TIMEOUT_MS', '10000'],
    ['TRON_TIMEOUT_MS', '10000']
  ];
  
  envSheet.getRange(2, 1, config.length, 2).setValues(config);
  
  // Format headers
  envSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  envSheet.autoResizeColumns(1, 2);
  
  console.log('ENV sheet created successfully with comprehensive configuration');
}

function createWalletsSheet(ss) {
  let walletsSheet = ss.getSheetByName('Wallets');
  if (walletsSheet) {
    ss.deleteSheet(walletsSheet);
  }
  
  walletsSheet = ss.insertSheet('Wallets');
  
  // Headers
  walletsSheet.getRange('A1:J1').setValues([[
    'ID', 'Name', 'Network', 'Address', 'API_KEY', 'API_SECRET', 'PASSPHRASE', 
    'Active', 'Last Sync', 'Notes'
  ]]);
  
  // Default wallets and accounts from provided configuration (wallets only live in Wallets sheet)
  const wallets = [
    // Ethereum
    ['1', 'ETH_DIRTY', 'ETH', '0x66E35642dd0a0eAaF622c33b99F1a87DaB23E15B', '', '', '', true, '', 'Dirty wallet address for Ethereum'],
    ['2', 'ETH_CLEAN', 'ETH', '0xf96B6397e26173beaBB4ce26215C65b7f590F338', '', '', '', true, '', 'Clean wallet address for Ethereum'],
    // BSC
    ['3', 'BSC_DIRTY', 'BSC', '0x66E35642dd0a0eAaF622c33b99F1a87DaB23E15B', '', '', '', true, '', 'Dirty wallet address for BSC'],
    ['4', 'BSC_CLEAN', 'BSC', '0xf96B6397e26173beaBB4ce26215C65b7f590F338', '', '', '', true, '', 'Clean wallet address for BSC'],
    // Tron
    ['5', 'TRX_DIRTY', 'TRX', 'TUDpHcoPZpuwpf6FdyH83b7VCf4FWcHSSm', '', '', '', true, '', 'Dirty wallet address for Tron'],
    ['6', 'TRX_CLEAN', 'TRX', 'TYyzbobn3UXD1PGBwRQ8AHAhm7RHWNUdNC', '', '', '', true, '', 'Clean wallet address for Tron'],
    // KuCoin accounts (credentials from provided configuration)
    ['7', 'KUCOIN_ACCOUNT1', 'KUCOIN', '', '68a5f274d12f8b0001f035fc', 'bfd14289-e533-4223-b931-5c155eb45b33', 'w3dLrUJ0XVpE6K', true, '', 'KuCoin Account 1'],
    ['8', 'KUCOIN_ACCOUNT2', 'KUCOIN', '', '68a5ed6354d535000172c30e', 'fa72eb3a-a403-4472-badb-dc9cc2e3d575', 'q@poCkj25l#px27', true, '', 'KuCoin Account 2']
  ];
  
  walletsSheet.getRange(2, 1, wallets.length, wallets[0].length).setValues(wallets);
  
  // Format headers
  walletsSheet.getRange('A1:J1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  walletsSheet.autoResizeColumns(1, 10);
  
  // Add data validation for Active column (checkbox)
  const activeRange = walletsSheet.getRange(2, 8, wallets.length, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(rule);
  
  // Validate the data was written correctly
  const writtenData = walletsSheet.getDataRange().getValues();
  console.log(`Wallets sheet created with ${writtenData.length - 1} wallet rows (excluding header)`);
  
  // Verify active wallets
  let activeCount = 0;
  for (let i = 1; i < writtenData.length; i++) {
    if (writtenData[i][7] === true || writtenData[i][7] === 'TRUE') {
      activeCount++;
    }
  }
  console.log(`Found ${activeCount} active wallets`);
  
  console.log('Wallets sheet created successfully');
}

function createCoinsManagementSheet(ss) {
  let coinsSheet = ss.getSheetByName('Coins Management');
  if (coinsSheet) {
    ss.deleteSheet(coinsSheet);
  }
  
  coinsSheet = ss.insertSheet('Coins Management');
  
  // Headers
  coinsSheet.getRange('A1:G1').setValues([[
    'Symbol', 'Name', 'Network', 'Contract Address', 'Decimals', 'CMC ID', 'Active'
  ]]);
  
  // Sample token data - Updated with comprehensive network coverage
  const tokens = [
    // Ethereum Network
    ['ETH', 'Ethereum', 'ETH', '0x0000000000000000000000000000000000000000', '18', '1027', true],
    ['USDT', 'Tether USD', 'ETH', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '6', '825', true],
    ['USDC', 'USD Coin', 'ETH', '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8', '6', '3408', true],
    ['WBTC', 'Wrapped Bitcoin', 'ETH', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '8', '1', true],
    ['LINK', 'Chainlink', 'ETH', '0x514910771AF9Ca656af840dff83E8264EcF986CA', '18', '1975', true],
    
    // Binance Smart Chain
    ['BNB', 'Binance Coin', 'BSC', '0x0000000000000000000000000000000000000000', '18', '1839', true],
    ['BUSD', 'Binance USD', 'BSC', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', '18', '4687', true],
    ['CAKE', 'PancakeSwap', 'BSC', '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', '18', '7186', true],
    
    // Solana Network
    ['SOL', 'Solana', 'SOL', '', '9', '5426', true],
    ['USDC', 'USD Coin', 'SOL', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', '6', '3408', true],
    ['RAY', 'Raydium', 'SOL', '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', '6', '5884', true],
    
    // Bitcoin Network
    ['BTC', 'Bitcoin', 'BTC', '', '8', '1', true],
    
    // XRP Network
    ['XRP', 'XRP', 'XRP', '', '6', '52', true],
    
    // TON Network
    ['TON', 'Toncoin', 'TON', '', '9', '11419', true],
    
    // Tron Network
    ['TRX', 'TRON', 'TRX', '0x0000000000000000000000000000000000000000', '6', '1958', true],
    ['USDT', 'Tether USD', 'TRX', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', '6', '825', true],
    ['USDC', 'USD Coin', 'TRX', 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', '6', '3408', true],
    
    // Cardano Network
    ['ADA', 'Cardano', 'ADA', '', '6', '2010', true],
    
    // Polygon Network
    ['MATIC', 'Polygon', 'MATIC', '0x0000000000000000000000000000000000000000', '18', '3890', true],
    ['USDC', 'USD Coin', 'MATIC', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', '6', '3408', true]
  ];
  
  coinsSheet.getRange(2, 1, tokens.length, tokens[0].length).setValues(tokens);
  
  // Format headers
  coinsSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  coinsSheet.autoResizeColumns(1, 7);
  
  // Add data validation for Active column (checkbox)
  const activeRange = coinsSheet.getRange(2, 7, tokens.length, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(rule);
  
  // Validate the data was written correctly
  const writtenData = coinsSheet.getDataRange().getValues();
  console.log(`Coins Management sheet created with ${writtenData.length - 1} coin rows (excluding header)`);
  
  // Verify active coins
  let activeCount = 0;
  for (let i = 1; i < writtenData.length; i++) {
    if (writtenData[i][6] === true || writtenData[i][6] === 'TRUE') {
      activeCount++;
    }
  }
  console.log(`Found ${activeCount} active coins`);
  
  console.log('Coins Management sheet created successfully');
}

function createFinancialRecordsSheet(ss) {
  let recordsSheet = ss.getSheetByName('Financial Records');
  if (recordsSheet) {
    ss.deleteSheet(recordsSheet);
  }
  
  recordsSheet = ss.insertSheet('Financial Records');
  
  // Headers
  recordsSheet.getRange('A1:I1').setValues([[
    'Timestamp', 'Type', 'Network', 'Symbol', 'Address', 'Balance', 'Price USD', 'Value USD', 'Status'
  ]]);
  
  // Format headers
  recordsSheet.getRange('A1:I1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  recordsSheet.autoResizeColumns(1, 9);
  
  console.log('Financial Records sheet created successfully');
}

// Helper function to read environment values
function readEnv(key, defaultValue = '') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const env = ss.getSheetByName('ENV');
  if (!env) return defaultValue;
  
  const data = env.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === key) return data[i][1];
  }
  return defaultValue;
}

// Helper function to write environment values
function writeEnv(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const env = ss.getSheetByName('ENV');
  if (!env) return false;
  
  const data = env.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === key) {
      env.getRange(i + 1, 2).setValue(value);
      return true;
    }
  }
  return false;
}