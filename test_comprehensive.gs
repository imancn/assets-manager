/**
 * test_comprehensive.gs - Comprehensive testing suite for Assets Manager
 * This file contains detailed tests to ensure system stability
 */

/**
 * Run comprehensive system test
 */
function runComprehensiveTest() {
  console.log('=== COMPREHENSIVE SYSTEM TEST ===');
  console.log('Starting at: ' + new Date().toISOString());
  
  const results = {
    sheets: testSheetsExistence(),
    configuration: testConfiguration(),
    wallets: testWalletsDetailed(),
    coins: testCoinsDetailed(),
    apiKeys: testApiKeys(),
    dataIntegrity: testDataIntegrity(),
    mainFunctions: testMainFunctions()
  };
  
  // Generate summary
  console.log('\n=== TEST SUMMARY ===');
  let passCount = 0;
  let failCount = 0;
  
  for (const [category, result] of Object.entries(results)) {
    console.log(`${category}: ${result.status}`);
    if (result.status === 'PASS') passCount++;
    else failCount++;
    
    if (result.details) {
      console.log(`  Details: ${result.details}`);
    }
  }
  
  console.log(`\nTotal: ${passCount} passed, ${failCount} failed`);
  
  return results;
}

/**
 * Test sheets existence and structure
 */
function testSheetsExistence() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['ENV', 'Wallets', 'Coins Management', 'Financial Records'];
    const missingSheets = [];
    
    for (const sheetName of requiredSheets) {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        missingSheets.push(sheetName);
      }
    }
    
    if (missingSheets.length > 0) {
      return {
        status: 'FAIL',
        details: `Missing sheets: ${missingSheets.join(', ')}`
      };
    }
    
    return { status: 'PASS', details: 'All required sheets exist' };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Test configuration reading
 */
function testConfiguration() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const env = ss.getSheetByName('ENV');
    
    if (!env) {
      return { status: 'FAIL', details: 'ENV sheet not found' };
    }
    
    const data = env.getDataRange().getValues();
    const config = {};
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        config[data[i][0]] = data[i][1];
      }
    }
    
    // Check required configurations
    const required = ['DRY_RUN', 'MAX_RETRIES', 'DUPLICATE_PROTECTION'];
    const missing = [];
    
    for (const key of required) {
      if (!config[key]) {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      return {
        status: 'FAIL',
        details: `Missing required config: ${missing.join(', ')}`
      };
    }
    
    return { status: 'PASS', details: `Found ${Object.keys(config).length} config entries` };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Detailed wallet testing
 */
function testWalletsDetailed() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    
    if (!sheet) {
      return { status: 'FAIL', details: 'Wallets sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Verify headers
    const requiredHeaders = ['ID', 'Name', 'Network', 'Address', 'Active'];
    const missingHeaders = [];
    
    for (const header of requiredHeaders) {
      if (!headers.some(h => h.toString().toLowerCase() === header.toLowerCase())) {
        missingHeaders.push(header);
      }
    }
    
    if (missingHeaders.length > 0) {
      return {
        status: 'FAIL',
        details: `Missing headers: ${missingHeaders.join(', ')}`
      };
    }
    
    // Count wallets
    const activeIdx = headers.findIndex(h => h.toString().toLowerCase() === 'active');
    let totalCount = 0;
    let activeCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Has ID
        totalCount++;
        const activeVal = data[i][activeIdx];
        if (activeVal === true || activeVal === 'TRUE' || activeVal === 'true') {
          activeCount++;
        }
      }
    }
    
    if (totalCount === 0) {
      return { status: 'FAIL', details: 'No wallets found' };
    }
    
    if (activeCount === 0) {
      return { 
        status: 'WARNING', 
        details: `Found ${totalCount} wallets but none are active. Run activateAllWallets() to activate them.`
      };
    }
    
    return { 
      status: 'PASS', 
      details: `${activeCount} active wallets out of ${totalCount} total`
    };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Detailed coin testing
 */
function testCoinsDetailed() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coins Management');
    
    if (!sheet) {
      return { status: 'FAIL', details: 'Coins Management sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Verify headers
    const requiredHeaders = ['Symbol', 'Name', 'Network', 'Active'];
    const missingHeaders = [];
    
    for (const header of requiredHeaders) {
      if (!headers.some(h => h.toString().toLowerCase() === header.toLowerCase())) {
        missingHeaders.push(header);
      }
    }
    
    if (missingHeaders.length > 0) {
      return {
        status: 'FAIL',
        details: `Missing headers: ${missingHeaders.join(', ')}`
      };
    }
    
    // Count coins
    const activeIdx = headers.findIndex(h => h.toString().toLowerCase() === 'active');
    let totalCount = 0;
    let activeCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Has symbol
        totalCount++;
        const activeVal = data[i][activeIdx];
        if (activeVal === true || activeVal === 'TRUE' || activeVal === 'true') {
          activeCount++;
        }
      }
    }
    
    if (totalCount === 0) {
      return { status: 'FAIL', details: 'No coins found' };
    }
    
    if (activeCount === 0) {
      return { 
        status: 'WARNING', 
        details: `Found ${totalCount} coins but none are active. Run activateAllCoins() to activate them.`
      };
    }
    
    return { 
      status: 'PASS', 
      details: `${activeCount} active coins out of ${totalCount} total`
    };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Test API keys configuration
 */
function testApiKeys() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const env = ss.getSheetByName('ENV');
    
    if (!env) {
      return { status: 'FAIL', details: 'ENV sheet not found' };
    }
    
    const data = env.getDataRange().getValues();
    const config = {};
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        config[data[i][0]] = data[i][1];
      }
    }
    
    const apiKeys = {
      'CMC_API_KEY': config['CMC_API_KEY'] || '',
      'MORALIS_API_KEY': config['MORALIS_API_KEY'] || '',
      'INFURA_PROJECT_ID': config['INFURA_PROJECT_ID'] || ''
    };
    
    const configured = [];
    const notConfigured = [];
    
    for (const [key, value] of Object.entries(apiKeys)) {
      if (value && value !== '' && !value.includes('YOUR_')) {
        configured.push(key);
      } else {
        notConfigured.push(key);
      }
    }
    
    if (configured.length === 0) {
      return {
        status: 'FAIL',
        details: 'No API keys configured'
      };
    }
    
    return {
      status: configured.length >= 2 ? 'PASS' : 'WARNING',
      details: `Configured: ${configured.join(', ')}${notConfigured.length > 0 ? '; Not configured: ' + notConfigured.join(', ') : ''}`
    };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Test data integrity
 */
function testDataIntegrity() {
  try {
    const issues = [];
    
    // Test wallet addresses format
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const walletsSheet = ss.getSheetByName('Wallets');
    
    if (walletsSheet) {
      const data = walletsSheet.getDataRange().getValues();
      const addressIdx = data[0].findIndex(h => h.toString().toLowerCase() === 'address');
      const networkIdx = data[0].findIndex(h => h.toString().toLowerCase() === 'network');
      
      for (let i = 1; i < data.length; i++) {
        const network = data[i][networkIdx];
        const address = data[i][addressIdx];
        
        if (network === 'ETH' || network === 'BSC') {
          if (address && !address.startsWith('0x')) {
            issues.push(`Row ${i + 1}: Invalid ETH/BSC address format`);
          }
        }
      }
    }
    
    // Test coin contract addresses
    const coinsSheet = ss.getSheetByName('Coins Management');
    
    if (coinsSheet) {
      const data = coinsSheet.getDataRange().getValues();
      const contractIdx = data[0].findIndex(h => h.toString().toLowerCase().includes('contract'));
      const networkIdx = data[0].findIndex(h => h.toString().toLowerCase() === 'network');
      
      for (let i = 1; i < data.length; i++) {
        const network = data[i][networkIdx];
        const contract = data[i][contractIdx];
        
        if ((network === 'ETH' || network === 'BSC') && contract && contract !== '0x0000000000000000000000000000000000000000') {
          if (!contract.startsWith('0x')) {
            issues.push(`Coin row ${i + 1}: Invalid contract address format`);
          }
        }
      }
    }
    
    if (issues.length > 0) {
      return {
        status: 'WARNING',
        details: `Found ${issues.length} data integrity issues`
      };
    }
    
    return { status: 'PASS', details: 'Data integrity check passed' };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Test main functions
 */
function testMainFunctions() {
  try {
    // Test readWalletsConfig
    const wallets = readWalletsConfig();
    
    // Test readCoinsConfig
    const coins = readCoinsConfig();
    
    if (!wallets || !Array.isArray(wallets)) {
      return { status: 'FAIL', details: 'readWalletsConfig() failed' };
    }
    
    if (!coins || !Array.isArray(coins)) {
      return { status: 'FAIL', details: 'readCoinsConfig() failed' };
    }
    
    if (wallets.length === 0 && coins.length === 0) {
      return { 
        status: 'WARNING', 
        details: 'No active wallets or coins. Run activateAll() to activate them.'
      };
    }
    
    return { 
      status: 'PASS', 
      details: `Config functions working. Active: ${wallets.length} wallets, ${coins.length} coins`
    };
    
  } catch (error) {
    return { status: 'FAIL', details: error.toString() };
  }
}

/**
 * Quick fix function to resolve common issues
 */
function quickFix() {
  console.log('=== QUICK FIX ===');
  console.log('Attempting to fix common issues...');
  
  const results = [];
  
  try {
    // 1. Check if sheets exist
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['ENV', 'Wallets', 'Coins Management', 'Financial Records'];
    let missingSheets = false;
    
    for (const sheetName of requiredSheets) {
      if (!ss.getSheetByName(sheetName)) {
        missingSheets = true;
        break;
      }
    }
    
    if (missingSheets) {
      console.log('Missing sheets detected. Running setup...');
      runSetup();
      results.push('✓ Created missing sheets');
    }
    
    // 2. Activate all wallets and coins
    console.log('Activating all wallets and coins...');
    activateAllWallets();
    activateAllCoins();
    results.push('✓ Activated all wallets and coins');
    
    // 3. Run comprehensive test
    console.log('\nRunning comprehensive test...');
    const testResults = runComprehensiveTest();
    
    // Check if all tests pass
    let allPass = true;
    for (const [category, result] of Object.entries(testResults)) {
      if (result.status === 'FAIL') {
        allPass = false;
        break;
      }
    }
    
    if (allPass) {
      results.push('✓ All tests passing');
      console.log('\n=== SYSTEM READY ===');
      console.log('Your Assets Manager is now ready to use!');
    } else {
      results.push('⚠ Some tests still failing. Check test results above.');
    }
    
    return results.join('\n');
    
  } catch (error) {
    console.error('Quick fix failed:', error);
    return 'Quick fix failed: ' + error.toString();
  }
}