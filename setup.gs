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
  
  // Configuration values - Updated with all missing configurations
  const config = [
    // Core API Keys
    ['CMC_API_KEY', 'YOUR_CMC_API_KEY_HERE'],
    ['MORALIS_API_KEY', 'YOUR_MORALIS_API_KEY_HERE'],
    ['INFURA_PROJECT_ID', 'YOUR_INFURA_PROJECT_ID_HERE'],
    
    // Network RPC URLs
    ['ETH_RPC_URL', 'https://eth.llamarpc.com'],
    ['BSC_RPC_URL', 'https://bsc-dataseed.binance.org/'],
    ['SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'],
    ['XRP_RPC_URL', 'https://xrplcluster.com'],
    ['TON_RPC_URL', 'https://toncenter.com/api/v2'],
    ['BTC_RPC_URL', 'https://blockstream.info/api'],
    
    // Network-Specific API Keys
    ['BSCSCAN_API_KEY', 'YOUR_BSCSCAN_API_KEY_HERE'],
    ['SOLSCAN_API_KEY', 'YOUR_SOLSCAN_API_KEY_HERE'],
    ['TRONGRID_API_KEY', 'YOUR_TRONGRID_API_KEY_HERE'],
    ['BLOCKSTREAM_API_KEY', 'YOUR_BLOCKSTREAM_API_KEY_HERE'],
    ['RIPPLE_API_KEY', 'YOUR_RIPPLE_API_KEY_HERE'],
    ['TONCENTER_API_KEY', 'YOUR_TONCENTER_API_KEY_HERE'],
    
    // Exchange API Keys
    ['KUCOIN_API_KEY', 'YOUR_KUCOIN_API_KEY_HERE'],
    ['KUCOIN_SECRET', 'YOUR_KUCOIN_SECRET_HERE'],
    ['KUCOIN_PASSPHRASE', 'YOUR_KUCOIN_PASSPHRASE_HERE'],
    
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
  
  // Sample wallet configurations
  const wallets = [
    ['1', 'My ETH Wallet', 'ETH', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '', '', '', 'TRUE', '', 'Main Ethereum wallet'],
    ['2', 'My BSC Wallet', 'BSC', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '', '', '', 'TRUE', '', 'Binance Smart Chain wallet'],
    ['3', 'My KuCoin Account', 'KUCOIN', '', 'YOUR_KUCOIN_API_KEY', 'YOUR_KUCOIN_SECRET', 'YOUR_KUCOIN_PASSPHRASE', 'TRUE', '', 'KuCoin exchange account'],
    ['4', 'My Solana Wallet', 'SOL', '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', '', '', '', 'TRUE', '', 'Solana wallet'],
    ['5', 'My Bitcoin Wallet', 'BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', '', '', '', 'TRUE', '', 'Bitcoin wallet'],
    ['6', 'My XRP Wallet', 'XRP', 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', '', '', '', 'TRUE', '', 'XRP Ledger wallet'],
    ['7', 'My TON Wallet', 'TON', 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t', '', '', '', 'TRUE', '', 'TON blockchain wallet'],
    ['8', 'My Tron Wallet', 'TRX', 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8', '', '', '', 'TRUE', '', 'Tron blockchain wallet'],
    ['9', 'My Test ETH Wallet', 'ETH', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'YOUR_MORALIS_API_KEY', '', '', 'TRUE', '', 'Test wallet with Moralis API'],
    ['10', 'My BSC Test Wallet', 'BSC', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'YOUR_BSCSCAN_API_KEY', '', '', 'TRUE', '', 'BSC wallet with BSCScan API']
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
  
  // Sample token data - Updated with comprehensive network coverage
  const tokens = [
    // Ethereum Network
    ['ETH', 'Ethereum', 'ETH', '0x0000000000000000000000000000000000000000', '18', '1027', 'TRUE'],
    ['USDT', 'Tether USD', 'ETH', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '6', '825', 'TRUE'],
    ['USDC', 'USD Coin', 'ETH', '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8', '6', '3408', 'TRUE'],
    ['WBTC', 'Wrapped Bitcoin', 'ETH', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '8', '1', 'TRUE'],
    ['LINK', 'Chainlink', 'ETH', '0x514910771AF9Ca656af840dff83E8264EcF986CA', '18', '1975', 'TRUE'],
    
    // Binance Smart Chain
    ['BNB', 'Binance Coin', 'BSC', '0x0000000000000000000000000000000000000000', '18', '1839', 'TRUE'],
    ['BUSD', 'Binance USD', 'BSC', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', '18', '4687', 'TRUE'],
    ['CAKE', 'PancakeSwap', 'BSC', '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', '18', '7186', 'TRUE'],
    
    // Solana Network
    ['SOL', 'Solana', 'SOL', '', '9', '5426', 'TRUE'],
    ['USDC', 'USD Coin', 'SOL', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', '6', '3408', 'TRUE'],
    ['RAY', 'Raydium', 'SOL', '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', '6', '5884', 'TRUE'],
    
    // Bitcoin Network
    ['BTC', 'Bitcoin', 'BTC', '', '8', '1', 'TRUE'],
    
    // XRP Network
    ['XRP', 'XRP', 'XRP', '', '6', '52', 'TRUE'],
    
    // TON Network
    ['TON', 'Toncoin', 'TON', '', '9', '11419', 'TRUE'],
    
    // Tron Network
    ['TRX', 'TRON', 'TRX', '0x0000000000000000000000000000000000000000', '6', '1958', 'TRUE'],
    ['USDT', 'Tether USD', 'TRX', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', '6', '825', 'TRUE'],
    ['USDC', 'USD Coin', 'TRX', 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', '6', '3408', 'TRUE'],
    
    // Cardano Network
    ['ADA', 'Cardano', 'ADA', '', '6', '2010', 'TRUE'],
    
    // Polygon Network
    ['MATIC', 'Polygon', 'MATIC', '0x0000000000000000000000000000000000000000', '18', '3890', 'TRUE'],
    ['USDC', 'USD Coin', 'MATIC', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', '6', '3408', 'TRUE']
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