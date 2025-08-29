/**
 * test.gs - Test and debugging functions for Assets Manager
 * Use these functions to verify your setup and debug issues
 */

/**
 * Quick test to check if all sheets exist
 */
function testSheets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['ENV', 'Wallets', 'Coins Management', 'Financial Records'];
    
    console.log('=== Sheet Test ===');
    for (const sheetName of requiredSheets) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const rowCount = sheet.getLastRow();
        console.log(`✓ ${sheetName}: ${rowCount} rows`);
      } else {
        console.log(`✗ ${sheetName}: MISSING`);
      }
    }
    
    return 'Sheet test completed. Check console for results.';
  } catch (error) {
    console.error('Sheet test failed:', error);
    return 'Sheet test failed: ' + error.toString();
  }
}

/**
 * Test wallet configuration
 */
function testWallets() {
  try {
    console.log('=== Wallet Test ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    
    if (!sheet) {
      console.log('✗ Wallets sheet not found');
      return 'Wallets sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    console.log(`Wallets sheet has ${data.length} rows`);
    
    if (data.length <= 1) {
      console.log('✗ No wallet data found');
      return 'No wallet data found. Run setup first.';
    }
    
    let activeCount = 0;
    let totalCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Has ID
        totalCount++;
        if (row[7] === true || row[7] === 'TRUE') { // Is active
          activeCount++;
          console.log(`✓ Active: ${row[1]} (${row[2]})`);
        } else {
          console.log(`- Inactive: ${row[1]} (${row[2]})`);
        }
      }
    }
    
    console.log(`Total wallets: ${totalCount}, Active: ${activeCount}`);
    
    if (activeCount === 0) {
      return 'No active wallets found. Check the Active column in Wallets sheet.';
    }
    
    return `Wallet test passed. Found ${activeCount} active wallets.`;
    
  } catch (error) {
    console.error('Wallet test failed:', error);
    return 'Wallet test failed: ' + error.toString();
  }
}

/**
 * Test coin configuration
 */
function testCoins() {
  try {
    console.log('=== Coin Test ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coins Management');
    
    if (!sheet) {
      console.log('✗ Coins Management sheet not found');
      return 'Coins Management sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    console.log(`Coins Management sheet has ${data.length} rows`);
    
    if (data.length <= 1) {
      console.log('✗ No coin data found');
      return 'No coin data found. Run setup first.';
    }
    
    let activeCount = 0;
    let totalCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Has symbol
        totalCount++;
        if (row[6] === true || row[6] === 'TRUE') { // Is active
          activeCount++;
          console.log(`✓ Active: ${row[0]} (${row[2]})`);
        } else {
          console.log(`- Inactive: ${row[0]} (${row[2]})`);
        }
      }
    }
    
    console.log(`Total coins: ${totalCount}, Active: ${activeCount}`);
    
    if (activeCount === 0) {
      return 'No active coins found. Check the Active column in Coins Management sheet.';
    }
    
    return `Coin test passed. Found ${activeCount} active coins.`;
    
  } catch (error) {
    console.error('Coin test failed:', error);
    return 'Coin test failed: ' + error.toString();
  }
}

/**
 * Test environment configuration
 */
function testEnvironment() {
  try {
    console.log('=== Environment Test ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('ENV');
    
    if (!sheet) {
      console.log('✗ ENV sheet not found');
      return 'ENV sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    console.log(`ENV sheet has ${data.length} rows`);
    
    const requiredKeys = ['DRY_RUN', 'MAX_RETRIES', 'DUPLICATE_PROTECTION'];
    const apiKeys = ['CMC_API_KEY', 'MORALIS_API_KEY', 'INFURA_PROJECT_ID'];
    
    console.log('Required configuration:');
    for (const key of requiredKeys) {
      const value = readEnv(key);
      if (value !== '') {
        console.log(`✓ ${key}: ${value}`);
      } else {
        console.log(`✗ ${key}: Not configured`);
      }
    }
    
    console.log('\nAPI Keys (optional):');
    for (const key of apiKeys) {
      const value = readEnv(key);
      if (value && value !== 'YOUR_' + key.replace('_', '_') + '_HERE') {
        console.log(`✓ ${key}: Configured`);
      } else {
        console.log(`- ${key}: Not configured (optional)`);
      }
    }
    
    return 'Environment test completed. Check console for results.';
    
  } catch (error) {
    console.error('Environment test failed:', error);
    return 'Environment test failed: ' + error.toString();
  }
}

/**
 * Comprehensive test of the entire system
 */
function runAllTests() {
  try {
    console.log('=== Running All Tests ===');
    
    const results = [];
    
    // Test 1: Sheets
    results.push('1. Sheets: ' + testSheets());
    
    // Test 2: Wallets
    results.push('2. Wallets: ' + testWallets());
    
    // Test 3: Coins
    results.push('3. Coins: ' + testCoins());
    
    // Test 4: Environment
    results.push('4. Environment: ' + testEnvironment());
    
    // Test 5: Main functions
    try {
      const wallets = readWalletsConfig();
      const coins = readCoinsConfig();
      
      if (wallets.length > 0 && coins.length > 0) {
        results.push('5. Main Functions: ✓ Configuration reading works');
      } else {
        results.push('5. Main Functions: ✗ Configuration reading failed');
      }
    } catch (error) {
      results.push('5. Main Functions: ✗ Error: ' + error.toString());
    }
    
    console.log('\n=== Test Summary ===');
    results.forEach(result => console.log(result));
    
    return results.join('\n');
    
  } catch (error) {
    console.error('All tests failed:', error);
    return 'All tests failed: ' + error.toString();
  }
}

/**
 * Helper function to read environment values
 */
function readEnv(key, defaultValue = '') {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const env = ss.getSheetByName('ENV');
    if (!env) return defaultValue;
    
    const data = env.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === key) return data[i][1];
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading ENV key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Helper function to read wallets configuration
 */
function readWalletsConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const wallets = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && (row[7] === true || row[7] === 'TRUE')) {
        wallets.push({
          id: row[0],
          name: row[1],
          network: row[2],
          address: row[3],
          active: row[7]
        });
      }
    }
    
    return wallets;
  } catch (error) {
    console.error('Error reading wallets config:', error);
    return [];
  }
}

/**
 * Helper function to read coins configuration
 */
function readCoinsConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coins Management');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const coins = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && (row[6] === true || row[6] === 'TRUE')) {
        coins.push({
          symbol: row[0],
          name: row[1],
          network: row[2],
          active: row[6]
        });
      }
    }
    
    return coins;
  } catch (error) {
    console.error('Error reading coins config:', error);
    return [];
  }
}