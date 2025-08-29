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
  
  // Configuration values
  const config = [
    ['CMC_API_KEY', 'YOUR_CMC_API_KEY_HERE'],
    ['MORALIS_API_KEY', 'YOUR_MORALIS_API_KEY_HERE'],
    ['INFURA_PROJECT_ID', 'YOUR_INFURA_PROJECT_ID_HERE'],
    ['BSC_RPC_URL', 'https://bsc-dataseed.binance.org/'],
    ['SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'],
    ['TRONGRID_API_KEY', 'YOUR_TRONGRID_API_KEY_HERE'],
    ['MAX_RETRIES', '3'],
    ['DRY_RUN', 'true'],
    ['DUPLICATE_PROTECTION', 'true'],
    ['AUTO_REFRESH_INTERVAL', '300000'], // 5 minutes in ms
    ['LAST_SYNC_TIMESTAMP', ''],
    ['LAST_SYNC_STATUS', 'Never']
  ];
  
  envSheet.getRange(2, 1, config.length, 2).setValues(config);
  
  // Format headers
  envSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  envSheet.autoResizeColumns(1, 2);
  
  console.log('ENV sheet created successfully');
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
  
  // Sample wallet configurations
  const wallets = [
    ['1', 'My ETH Wallet', 'ETH', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '', '', '', 'TRUE', '', 'Main Ethereum wallet'],
    ['2', 'My BSC Wallet', 'BSC', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '', '', '', 'TRUE', '', 'Binance Smart Chain wallet'],
    ['3', 'My KuCoin Account', 'KUCOIN', '', 'YOUR_KUCOIN_API_KEY', 'YOUR_KUCOIN_SECRET', 'YOUR_KUCOIN_PASSPHRASE', 'TRUE', '', 'KuCoin exchange account'],
    ['4', 'My Solana Wallet', 'SOL', '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', '', '', '', 'TRUE', '', 'Solana wallet'],
    ['5', 'My Bitcoin Wallet', 'BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', '', '', '', 'TRUE', '', 'Bitcoin wallet']
  ];
  
  walletsSheet.getRange(2, 1, wallets.length, wallets[0].length).setValues(wallets);
  
  // Format headers
  walletsSheet.getRange('A1:J1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  walletsSheet.autoResizeColumns(1, 10);
  
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
  
  // Sample token data
  const tokens = [
    ['ETH', 'Ethereum', 'ETH', '0x0000000000000000000000000000000000000000', '18', '1027', 'TRUE'],
    ['USDT', 'Tether USD', 'ETH', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '6', '825', 'TRUE'],
    ['USDC', 'USD Coin', 'ETH', '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', '6', '3408', 'TRUE'],
    ['BNB', 'Binance Coin', 'BSC', '0x0000000000000000000000000000000000000000', '18', '1839', 'TRUE'],
    ['SOL', 'Solana', 'SOL', '', '9', '5426', 'TRUE'],
    ['BTC', 'Bitcoin', 'BTC', '', '8', '1', 'TRUE'],
    ['XRP', 'XRP', 'XRP', '', '6', '52', 'TRUE'],
    ['TON', 'Toncoin', 'TON', '', '9', '11419', 'TRUE'],
    ['ADA', 'Cardano', 'ADA', '', '6', '2010', 'TRUE']
  ];
  
  coinsSheet.getRange(2, 1, tokens.length, tokens[0].length).setValues(tokens);
  
  // Format headers
  coinsSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  coinsSheet.autoResizeColumns(1, 7);
  
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