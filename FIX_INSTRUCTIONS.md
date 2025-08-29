# Assets Manager - Quick Fix Instructions

## Problem Summary
The tests are failing because:
1. Wallets and coins are created as inactive by default
2. The configuration reading functions expect active items to process

## Quick Solution

### Method 1: Run the Quick Fix Function (Recommended)
1. Open your Google Apps Script editor
2. Run the following function:
```javascript
quickFix()
```

This will:
- Check if all required sheets exist (and create them if missing)
- Activate all wallets and coins
- Run comprehensive tests to verify everything is working

### Method 2: Manual Activation
If you prefer to manually control which items are active:

1. **Activate All Items:**
```javascript
activateAll()
```

2. **Activate Only Wallets:**
```javascript
activateAllWallets()
```

3. **Activate Only Coins:**
```javascript
activateAllCoins()
```

4. **Activate Specific Networks Only:**
```javascript
// For Ethereum only
activateEthOnly()

// For BSC only
activateBscOnly()

// For custom networks
activateNetworks(['ETH', 'BSC', 'TRX'])
```

### Method 3: Manual Sheet Edit
1. Open your Google Sheet
2. Go to the "Wallets" tab
3. Check the boxes in the "Active" column for wallets you want to use
4. Go to the "Coins Management" tab
5. Check the boxes in the "Active" column for coins you want to track

## Verification

After applying the fix, run the comprehensive test:
```javascript
runComprehensiveTest()
```

You should see output like:
```
=== TEST SUMMARY ===
sheets: PASS
configuration: PASS
wallets: PASS
coins: PASS
apiKeys: PASS
dataIntegrity: PASS
mainFunctions: PASS

Total: 7 passed, 0 failed
```

## What Changed?

### 1. Setup Improvements
- Active column now uses boolean values (true/false) instead of strings
- Added checkbox data validation to Active columns
- Created helper functions for activation/deactivation

### 2. Configuration Reading
- Updated `readWalletsConfig()` and `readCoinsConfig()` to handle both boolean and string values
- Added proper validation for Active column values

### 3. New Helper Files
- `activate_all.gs` - Functions to activate/deactivate wallets and coins
- `test_comprehensive.gs` - Comprehensive testing suite with quick fix
- `FIX_INSTRUCTIONS.md` - This documentation

## API Keys Configuration

The system is configured with the following API keys:
- **CMC_API_KEY**: ✅ Configured (CoinMarketCap)
- **MORALIS_API_KEY**: ✅ Configured (Moralis)
- **INFURA_PROJECT_ID**: ⚠️ Not configured (optional)

To add missing API keys:
1. Go to the "ENV" sheet
2. Find the row with the API key name
3. Add your API key in the VALUE column

## Troubleshooting

If you still see errors after running `quickFix()`:

1. **Check Sheet Structure:**
```javascript
testSheetsExistence()
```

2. **Check Configuration:**
```javascript
testConfiguration()
```

3. **Check Wallets:**
```javascript
testWalletsDetailed()
```

4. **Check Coins:**
```javascript
testCoinsDetailed()
```

5. **Check API Keys:**
```javascript
testApiKeys()
```

## Next Steps

Once the system is stable:
1. Configure your actual wallet addresses in the "Wallets" sheet
2. Add/remove coins as needed in the "Coins Management" sheet
3. Set up triggers for automatic balance fetching (if desired)
4. Use the web UI to monitor your assets

## Support

If issues persist:
1. Check the console logs for detailed error messages
2. Ensure all sheets have the correct structure
3. Verify API keys are properly configured
4. Try running `runSetup()` to recreate all sheets from scratch