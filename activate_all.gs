/**
 * activate_all.gs - Helper functions to activate/deactivate wallets and coins
 * Use these functions to quickly enable or disable all items for testing
 */

/**
 * Activate all wallets in the Wallets sheet
 */
function activateAllWallets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    
    if (!sheet) {
      console.log('Wallets sheet not found');
      return 'Wallets sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('No wallet data found');
      return 'No wallet data found.';
    }
    
    // Find the Active column index
    const headers = data[0];
    const activeIdx = headers.indexOf('Active');
    
    if (activeIdx === -1) {
      console.log('Active column not found');
      return 'Active column not found in Wallets sheet.';
    }
    
    // Set all wallets to active
    const updates = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Has ID
        updates.push([true]);
      }
    }
    
    if (updates.length > 0) {
      const range = sheet.getRange(2, activeIdx + 1, updates.length, 1);
      range.setValues(updates);
      
      // Add checkbox validation
      const rule = SpreadsheetApp.newDataValidation()
        .requireCheckbox()
        .build();
      range.setDataValidation(rule);
    }
    
    console.log(`Activated ${updates.length} wallets`);
    return `Successfully activated ${updates.length} wallets`;
    
  } catch (error) {
    console.error('Error activating wallets:', error);
    return 'Error: ' + error.toString();
  }
}

/**
 * Activate all coins in the Coins Management sheet
 */
function activateAllCoins() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coins Management');
    
    if (!sheet) {
      console.log('Coins Management sheet not found');
      return 'Coins Management sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('No coin data found');
      return 'No coin data found.';
    }
    
    // Find the Active column index
    const headers = data[0];
    const activeIdx = headers.indexOf('Active');
    
    if (activeIdx === -1) {
      console.log('Active column not found');
      return 'Active column not found in Coins Management sheet.';
    }
    
    // Set all coins to active
    const updates = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Has symbol
        updates.push([true]);
      }
    }
    
    if (updates.length > 0) {
      const range = sheet.getRange(2, activeIdx + 1, updates.length, 1);
      range.setValues(updates);
      
      // Add checkbox validation
      const rule = SpreadsheetApp.newDataValidation()
        .requireCheckbox()
        .build();
      range.setDataValidation(rule);
    }
    
    console.log(`Activated ${updates.length} coins`);
    return `Successfully activated ${updates.length} coins`;
    
  } catch (error) {
    console.error('Error activating coins:', error);
    return 'Error: ' + error.toString();
  }
}

/**
 * Activate all wallets and coins
 */
function activateAll() {
  const results = [];
  results.push('Activating all wallets and coins...');
  results.push('Wallets: ' + activateAllWallets());
  results.push('Coins: ' + activateAllCoins());
  
  console.log(results.join('\n'));
  return results.join('\n');
}

/**
 * Deactivate all wallets in the Wallets sheet
 */
function deactivateAllWallets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Wallets');
    
    if (!sheet) {
      return 'Wallets sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return 'No wallet data found.';
    }
    
    // Find the Active column index
    const headers = data[0];
    const activeIdx = headers.indexOf('Active');
    
    if (activeIdx === -1) {
      return 'Active column not found in Wallets sheet.';
    }
    
    // Set all wallets to inactive
    const updates = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Has ID
        updates.push([false]);
      }
    }
    
    if (updates.length > 0) {
      const range = sheet.getRange(2, activeIdx + 1, updates.length, 1);
      range.setValues(updates);
    }
    
    return `Successfully deactivated ${updates.length} wallets`;
    
  } catch (error) {
    return 'Error: ' + error.toString();
  }
}

/**
 * Deactivate all coins in the Coins Management sheet
 */
function deactivateAllCoins() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coins Management');
    
    if (!sheet) {
      return 'Coins Management sheet not found. Run setup first.';
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return 'No coin data found.';
    }
    
    // Find the Active column index
    const headers = data[0];
    const activeIdx = headers.indexOf('Active');
    
    if (activeIdx === -1) {
      return 'Active column not found in Coins Management sheet.';
    }
    
    // Set all coins to inactive
    const updates = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Has symbol
        updates.push([false]);
      }
    }
    
    if (updates.length > 0) {
      const range = sheet.getRange(2, activeIdx + 1, updates.length, 1);
      range.setValues(updates);
    }
    
    return `Successfully deactivated ${updates.length} coins`;
    
  } catch (error) {
    return 'Error: ' + error.toString();
  }
}

/**
 * Deactivate all wallets and coins
 */
function deactivateAll() {
  const results = [];
  results.push('Deactivating all wallets and coins...');
  results.push('Wallets: ' + deactivateAllWallets());
  results.push('Coins: ' + deactivateAllCoins());
  
  console.log(results.join('\n'));
  return results.join('\n');
}

/**
 * Activate specific networks only
 * @param {Array} networks - Array of network names to activate (e.g., ['ETH', 'BSC'])
 */
function activateNetworks(networks = ['ETH', 'BSC']) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const results = [];
    
    // Activate wallets for specified networks
    const walletsSheet = ss.getSheetByName('Wallets');
    if (walletsSheet) {
      const walletsData = walletsSheet.getDataRange().getValues();
      const networkIdx = walletsData[0].indexOf('Network');
      const activeIdx = walletsData[0].indexOf('Active');
      
      if (networkIdx >= 0 && activeIdx >= 0) {
        for (let i = 1; i < walletsData.length; i++) {
          const isTargetNetwork = networks.includes(walletsData[i][networkIdx]);
          walletsSheet.getRange(i + 1, activeIdx + 1).setValue(isTargetNetwork);
        }
        results.push(`Updated wallets for networks: ${networks.join(', ')}`);
      }
    }
    
    // Activate coins for specified networks
    const coinsSheet = ss.getSheetByName('Coins Management');
    if (coinsSheet) {
      const coinsData = coinsSheet.getDataRange().getValues();
      const networkIdx = coinsData[0].indexOf('Network');
      const activeIdx = coinsData[0].indexOf('Active');
      
      if (networkIdx >= 0 && activeIdx >= 0) {
        for (let i = 1; i < coinsData.length; i++) {
          const isTargetNetwork = networks.includes(coinsData[i][networkIdx]);
          coinsSheet.getRange(i + 1, activeIdx + 1).setValue(isTargetNetwork);
        }
        results.push(`Updated coins for networks: ${networks.join(', ')}`);
      }
    }
    
    return results.join('\n');
    
  } catch (error) {
    return 'Error: ' + error.toString();
  }
}

/**
 * Quick test activation - activate ETH network only for testing
 */
function activateEthOnly() {
  return activateNetworks(['ETH']);
}

/**
 * Quick test activation - activate BSC network only for testing
 */
function activateBscOnly() {
  return activateNetworks(['BSC']);
}