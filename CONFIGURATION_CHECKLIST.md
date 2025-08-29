# 🔧 Configuration Checklist - Assests Manager

## 📋 **Required API Keys (Must Configure)**

### **Core Services**
- [ ] **`CMC_API_KEY`** - CoinMarketCap API key
  - Get from: [https://coinmarketcap.com/api/](https://coinmarketcap.com/api/)
  - Required for: Price fetching, USD valuations
  - Rate limit: 10,000 calls/month (free tier)

### **Ethereum Network**
- [ ] **`MORALIS_API_KEY`** - Moralis API key
  - Get from: [https://moralis.io/](https://moralis.io/)
  - Required for: ETH/ERC20 balance fetching
  - Alternative: `INFURA_PROJECT_ID`
- [ ] **`INFURA_PROJECT_ID`** - Infura project ID
  - Get from: [https://infura.io/](https://infura.io/)
  - Required for: ETH/ERC20 balance fetching
  - Alternative: `MORALIS_API_KEY`

### **Exchange Integration**
- [ ] **`KUCOIN_API_KEY`** - KuCoin API key
- [ ] **`KUCOIN_SECRET`** - KuCoin API secret
- [ ] **`KUCOIN_PASSPHRASE`** - KuCoin API passphrase
  - Get from: [https://www.kucoin.com/](https://www.kucoin.com/)
  - Required for: KuCoin account balance fetching

## 🔑 **Optional API Keys (Recommended for Production)**

### **Network-Specific APIs**
- [ ] **`BSCSCAN_API_KEY`** - BSCScan API key
  - Get from: [https://bscscan.com/](https://bscscan.com/)
  - Benefits: Higher rate limits, better reliability
- [ ] **`SOLSCAN_API_KEY`** - Solscan API key
  - Get from: [https://public-api.solscan.io/](https://public-api.solscan.io/)
  - Benefits: Higher rate limits, better reliability
- [ ] **`TRONGRID_API_KEY`** - TronGrid API key
  - Get from: [https://www.trongrid.io/](https://www.trongrid.io/)
  - Benefits: Higher rate limits, better reliability
- [ ] **`BLOCKSTREAM_API_KEY`** - Blockstream API key
  - Get from: [https://blockstream.info/](https://blockstream.info/)
  - Benefits: Higher rate limits, better reliability
- [ ] **`RIPPLE_API_KEY`** - Ripple API key
  - Get from: [https://xrpl.org/](https://xrpl.org/)
  - Benefits: Higher rate limits, better reliability
- [ ] **`TONCENTER_API_KEY`** - TON Center API key
  - Get from: [https://toncenter.com/](https://toncenter.com/)
  - Benefits: Higher rate limits, better reliability

## 🌐 **Network RPC URLs (Configured with Fallbacks)**

### **Current Configuration**
- ✅ **`BSC_RPC_URL`** - `https://bsc-dataseed.binance.org/`
- ✅ **`SOLANA_RPC_URL`** - `https://api.mainnet-beta.solana.com`
- ✅ **`ETH_RPC_URL`** - `https://eth.llamarpc.com` (fallback)
- ✅ **`XRP_RPC_URL`** - `https://xrplcluster.com` (fallback)
- ✅ **`TON_RPC_URL`** - `https://toncenter.com/api/v2` (fallback)
- ✅ **`BTC_RPC_URL`** - `https://blockstream.info/api` (fallback)

### **Recommended Custom RPC URLs**
- [ ] **Custom Ethereum RPC** - Your own Infura/Alchemy endpoint
- [ ] **Custom BSC RPC** - Your own BSC endpoint
- [ ] **Custom Solana RPC** - Your own Solana endpoint
- [ ] **Custom XRP RPC** - Your own XRP endpoint
- [ ] **Custom TON RPC** - Your own TON endpoint

## ⚙️ **System Configuration**

### **Performance Settings**
- [ ] **`MAX_RETRIES`** - Set to `3` (default)
- [ ] **`DRY_RUN`** - Set to `false` for production
- [ ] **`DUPLICATE_PROTECTION`** - Set to `true` (recommended)
- [ ] **`AUTO_REFRESH_INTERVAL`** - Set to `300000` (5 minutes)

### **Rate Limiting**
- [ ] **`CMC_RATE_LIMIT_DELAY`** - Set to `1000` (1 second)
- [ ] **`RPC_RATE_LIMIT_DELAY`** - Set to `100` (100ms)
- [ ] **`MAX_CONCURRENT_REQUESTS`** - Set to `5`

### **Network Timeouts**
- [ ] **`ETH_TIMEOUT_MS`** - Set to `10000` (10 seconds)
- [ ] **`BSC_TIMEOUT_MS`** - Set to `10000` (10 seconds)
- [ ] **`SOLANA_TIMEOUT_MS`** - Set to `10000` (10 seconds)
- [ ] **`XRP_TIMEOUT_MS`** - Set to `10000` (10 seconds)
- [ ] **`TON_TIMEOUT_MS`** - Set to `10000` (10 seconds)
- [ ] **`BTC_TIMEOUT_MS`** - Set to `10000` (10 seconds)
- [ ] **`TRON_TIMEOUT_MS`** - Set to `10000` (10 seconds)

## 🚀 **Setup Instructions**

### **1. Run Initial Setup**
```javascript
// In Google Apps Script editor, run:
runSetup()
```

### **2. Configure ENV Sheet**
1. Open the `ENV` sheet
2. Replace all `YOUR_*_HERE` values with actual API keys
3. Adjust timeout and rate limiting values as needed

### **3. Configure Wallets Sheet**
1. Open the `Wallets` sheet
2. Update wallet addresses with your actual addresses
3. Add API keys for exchange wallets (KuCoin)
4. Set `Active` to `TRUE` for wallets you want to monitor

### **4. Configure Coins Management**
1. Open the `Coins Management` sheet
2. Verify token symbols and contract addresses
3. Ensure `CMC ID` values are correct
4. Set `Active` to `TRUE` for tokens you want to track

### **5. Test Configuration**
```javascript
// Test the setup:
testSetup()

// Test CMC integration:
testFetchCmcPrices()

// Test specific networks:
testEthFunctions()
testBscFunctions()
testSolanaFunctions()
```

## 🔍 **Verification Checklist**

### **Before Production Deployment**
- [ ] All required API keys are configured
- [ ] `DRY_RUN` is set to `false`
- [ ] Wallet addresses are correct
- [ ] Token contract addresses are correct
- [ ] CMC IDs are valid
- [ ] Rate limiting is appropriate for your API tier
- [ ] Timeout values are reasonable for your network

### **Testing Results**
- [ ] `testSetup()` returns success
- [ ] `testFetchCmcPrices()` returns valid prices
- [ ] Network-specific tests pass
- [ ] Manual balance fetch works
- [ ] Financial records are created correctly

## 📊 **API Rate Limits & Costs**

### **CoinMarketCap**
- **Free Tier**: 10,000 calls/month
- **Paid Tier**: 100,000+ calls/month
- **Rate Limit**: 1 request/second (free), 10+ requests/second (paid)

### **Moralis**
- **Free Tier**: 25,000 requests/month
- **Paid Tier**: 1M+ requests/month
- **Rate Limit**: Varies by plan

### **Infura**
- **Free Tier**: 100,000 requests/day
- **Paid Tier**: Custom limits
- **Rate Limit**: Varies by plan

### **KuCoin**
- **Free Tier**: 1,800 requests/10 minutes
- **Rate Limit**: 6 requests/second

## 🚨 **Troubleshooting**

### **Common Issues**
1. **API Key Errors**: Check if API keys are correctly copied
2. **Rate Limiting**: Increase delays between requests
3. **Network Timeouts**: Increase timeout values
4. **Invalid Addresses**: Verify wallet addresses are correct
5. **Missing Tokens**: Check if tokens are active in Coins Management

### **Debug Mode**
```javascript
// Enable detailed logging:
writeEnv('DEBUG_MODE', 'true')

// Check last sync status:
getLastSync()

// View configuration:
readEnv('CMC_API_KEY')
```

## 📞 **Support Resources**

- **CoinMarketCap API**: [https://coinmarketcap.com/api/documentation/](https://coinmarketcap.com/api/documentation/)
- **Moralis API**: [https://docs.moralis.io/](https://docs.moralis.io/)
- **Infura API**: [https://docs.infura.io/](https://docs.infura.io/)
- **KuCoin API**: [https://docs.kucoin.com/](https://docs.kucoin.com/)
- **BSCScan API**: [https://docs.bscscan.com/](https://docs.bscscan.com/)
- **Solscan API**: [https://public-api.solscan.io/](https://public-api.solscan.io/)
- **TronGrid API**: [https://www.trongrid.io/docs](https://www.trongrid.io/docs)