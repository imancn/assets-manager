# 🌐 Network Configuration Guide - Assests Manager

## 📊 **Network Overview**

This document provides detailed configuration requirements for each supported blockchain network in the Assests Manager application.

## 🔗 **Ethereum (ETH)**

### **Required Configuration**
- **API Key**: `MORALIS_API_KEY` OR `INFURA_PROJECT_ID`
- **RPC URL**: `ETH_RPC_URL` (with fallback to `https://eth.llamarpc.com`)

### **Supported Features**
- ✅ Native ETH balance
- ✅ ERC20 token balances
- ✅ Contract interaction
- ✅ Gas estimation

### **Configuration Options**
```javascript
// Option 1: Moralis (Recommended)
MORALIS_API_KEY = "your_moralis_api_key_here"

// Option 2: Infura
INFURA_PROJECT_ID = "your_infura_project_id_here"
ETH_RPC_URL = "https://mainnet.infura.io/v3/your_project_id"

// Option 3: Custom RPC
ETH_RPC_URL = "https://your-custom-eth-rpc.com"
```

### **Rate Limits**
- **Moralis Free**: 25,000 requests/month
- **Infura Free**: 100,000 requests/day
- **Custom RPC**: Depends on provider

---

## 🟡 **Binance Smart Chain (BSC)**

### **Required Configuration**
- **RPC URL**: `BSC_RPC_URL` (default: `https://bsc-dataseed.binance.org/`)
- **Optional**: `BSCSCAN_API_KEY` for better rate limits

### **Supported Features**
- ✅ Native BNB balance
- ✅ BEP20 token balances
- ✅ Contract interaction
- ✅ Gas estimation

### **Configuration Options**
```javascript
// Basic (Public RPC)
BSC_RPC_URL = "https://bsc-dataseed.binance.org/"

// Enhanced (with BSCScan API)
BSCSCAN_API_KEY = "your_bscscan_api_key_here"
BSC_RPC_URL = "https://bsc-dataseed1.binance.org/"
```

### **Rate Limits**
- **Public RPC**: Limited, may have rate limiting
- **BSCScan API**: 5 requests/second (free), 10+ requests/second (paid)

---

## 🔵 **Solana (SOL)**

### **Required Configuration**
- **RPC URL**: `SOLANA_RPC_URL` (default: `https://api.mainnet-beta.solana.com`)
- **Optional**: `SOLSCAN_API_KEY` for better rate limits

### **Supported Features**
- ✅ Native SOL balance
- ✅ SPL token balances
- ✅ Account info
- ✅ Token account discovery

### **Configuration Options**
```javascript
// Basic (Public RPC)
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"

// Enhanced (with Solscan API)
SOLSCAN_API_KEY = "your_solscan_api_key_here"
SOLANA_RPC_URL = "https://your-custom-solana-rpc.com"
```

### **Rate Limits**
- **Public RPC**: Limited, may have rate limiting
- **Solscan API**: Varies by plan

---

## 🟠 **Bitcoin (BTC)**

### **Required Configuration**
- **API Endpoint**: `BTC_RPC_URL` (default: `https://blockstream.info/api`)
- **Optional**: `BLOCKSTREAM_API_KEY` for better rate limits

### **Supported Features**
- ✅ Native BTC balance
- ✅ UTXO information
- ✅ Transaction history
- ✅ Address validation

### **Configuration Options**
```javascript
// Basic (Public API)
BTC_RPC_URL = "https://blockstream.info/api"

// Enhanced (with API key)
BLOCKSTREAM_API_KEY = "your_blockstream_api_key_here"
BTC_RPC_URL = "https://blockstream.info/api"
```

### **Rate Limits**
- **Public API**: Limited, may have rate limiting
- **API Key**: Higher limits available

---

## 💎 **XRP Ledger (XRP)**

### **Required Configuration**
- **RPC URL**: `XRP_RPC_URL` (default: `https://xrplcluster.com`)
- **Optional**: `RIPPLE_API_KEY` for better rate limits

### **Supported Features**
- ✅ Native XRP balance
- ✅ IOU token balances
- ✅ Account info
- ✅ Trust lines

### **Configuration Options**
```javascript
// Basic (Public RPC)
XRP_RPC_URL = "https://xrplcluster.com"

// Alternative public RPCs
XRP_RPC_URL = "https://s1.ripple.com:51234"
XRP_RPC_URL = "https://s2.ripple.com:51234"

// Enhanced (with API key)
RIPPLE_API_KEY = "your_ripple_api_key_here"
```

### **Rate Limits**
- **Public RPC**: Limited, may have rate limiting
- **Ripple API**: Varies by plan

---

## 🔶 **TON Blockchain (TON)**

### **Required Configuration**
- **API Endpoint**: `TON_RPC_URL` (default: `https://toncenter.com/api/v2`)
- **Optional**: `TONCENTER_API_KEY` for better rate limits

### **Supported Features**
- ✅ Native TON balance
- ✅ Jetton balances
- ✅ Account info
- ✅ Transaction history

### **Configuration Options**
```javascript
// Basic (Public API)
TON_RPC_URL = "https://toncenter.com/api/v2"

// Alternative public APIs
TON_RPC_URL = "https://ton.org/api"
TON_RPC_URL = "https://your-custom-ton-api.com"

// Enhanced (with API key)
TONCENTER_API_KEY = "your_toncenter_api_key_here"
```

### **Rate Limits**
- **Public API**: Limited, may have rate limiting
- **API Key**: Higher limits available

---

## 🟢 **Tron (TRX)**

### **Required Configuration**
- **API Key**: `TRONGRID_API_KEY` (recommended)
- **API Endpoint**: `TRONGRID_BASE_URL` (default: `https://api.trongrid.io`)

### **Supported Features**
- ✅ Native TRX balance
- ✅ TRC20 token balances
- ✅ Account info
- ✅ Contract interaction

### **Configuration Options**
```javascript
// Basic (Public API - limited)
TRONGRID_API_KEY = "" // No key, limited access

// Enhanced (with API key)
TRONGRID_API_KEY = "your_trongrid_api_key_here"
TRONGRID_BASE_URL = "https://api.trongrid.io"
```

### **Rate Limits**
- **Public API**: Very limited (2 requests/second)
- **API Key**: 2,000 requests/second (free), higher with paid plans

---

## 🏦 **KuCoin Exchange**

### **Required Configuration**
- **API Key**: `KUCOIN_API_KEY`
- **API Secret**: `KUCOIN_SECRET`
- **Passphrase**: `KUCOIN_PASSPHRASE`

### **Supported Features**
- ✅ Account balances
- ✅ Spot trading balances
- ✅ Token information
- ✅ Market data

### **Configuration Options**
```javascript
// Required for all KuCoin operations
KUCOIN_API_KEY = "your_kucoin_api_key_here"
KUCOIN_SECRET = "your_kucoin_secret_here"
KUCOIN_PASSPHRASE = "your_kucoin_passphrase_here"
```

### **Rate Limits**
- **Free Tier**: 1,800 requests/10 minutes
- **Rate Limit**: 6 requests/second

---

## 🔧 **Network Configuration Best Practices**

### **1. API Key Management**
- Store API keys securely in the `ENV` sheet
- Use environment-specific keys for development/production
- Rotate API keys regularly
- Monitor API usage and rate limits

### **2. RPC URL Selection**
- **Development**: Use public RPCs with fallbacks
- **Production**: Use dedicated RPC endpoints
- **High Volume**: Consider multiple RPC providers
- **Geographic**: Choose RPCs close to your location

### **3. Rate Limiting Strategy**
- Implement exponential backoff for retries
- Use delays between requests (`RPC_RATE_LIMIT_DELAY`)
- Monitor rate limit headers
- Implement request queuing for high-volume operations

### **4. Fallback Configuration**
```javascript
// Example fallback strategy
const rpcUrls = [
  readEnv('ETH_RPC_URL', 'https://eth.llamarpc.com'),
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://cloudflare-eth.com'
];

// Try each RPC until one works
for (const url of rpcUrls) {
  try {
    const result = await fetchFromRPC(url);
    if (result.success) break;
  } catch (error) {
    console.warn(`RPC ${url} failed:`, error);
    continue;
  }
}
```

### **5. Error Handling**
- Implement proper error handling for each network
- Log network-specific errors
- Provide fallback mechanisms
- Graceful degradation when APIs are unavailable

---

## 📊 **Network Status Monitoring**

### **Health Check Functions**
```javascript
// Test network connectivity
function testNetworkHealth() {
  const networks = ['ETH', 'BSC', 'SOL', 'BTC', 'XRP', 'TON', 'TRX'];
  
  for (const network of networks) {
    try {
      const status = testNetworkConnection(network);
      console.log(`${network}: ${status ? '✅' : '❌'}`);
    } catch (error) {
      console.error(`${network}: Error - ${error.message}`);
    }
  }
}

// Test specific network
function testNetworkConnection(network) {
  switch (network.toUpperCase()) {
    case 'ETH':
      return testEthConnection();
    case 'BSC':
      return testBscConnection();
    case 'SOL':
      return testSolanaConnection();
    // ... other networks
  }
}
```

### **Performance Metrics**
- Response time monitoring
- Success rate tracking
- Rate limit usage
- Error rate monitoring
- Network latency

---

## 🚨 **Troubleshooting Common Issues**

### **Network-Specific Problems**

#### **Ethereum**
- **Issue**: "Invalid project ID"
  - **Solution**: Verify `INFURA_PROJECT_ID` or `MORALIS_API_KEY`
- **Issue**: "Rate limited"
  - **Solution**: Increase delays between requests

#### **BSC**
- **Issue**: "Connection timeout"
  - **Solution**: Try alternative RPC URLs
- **Issue**: "Invalid response"
  - **Solution**: Check if RPC endpoint is healthy

#### **Solana**
- **Issue**: "RPC node overloaded"
  - **Solution**: Use dedicated RPC endpoint
- **Issue**: "Invalid address format"
  - **Solution**: Verify Solana address format (44 characters)

#### **Bitcoin**
- **Issue**: "API rate limited"
  - **Solution**: Add `BLOCKSTREAM_API_KEY`
- **Issue**: "Invalid address"
  - **Solution**: Check Bitcoin address format

#### **XRP**
- **Issue**: "Connection failed"
  - **Solution**: Try alternative RPC endpoints
- **Issue**: "Account not found"
  - **Solution**: Verify XRP address format

#### **TON**
- **Issue**: "API unavailable"
  - **Solution**: Check TON Center API status
- **Issue**: "Invalid address"
  - **Solution**: Verify TON address format

#### **Tron**
- **Issue**: "Rate limit exceeded"
  - **Solution**: Add `TRONGRID_API_KEY`
- **Issue**: "Invalid address"
  - **Solution**: Check Tron address format

### **General Solutions**
1. **Check API keys**: Verify all required API keys are set
2. **Verify addresses**: Ensure wallet addresses are in correct format
3. **Check rate limits**: Increase delays between requests
4. **Use fallbacks**: Implement multiple RPC endpoints
5. **Monitor logs**: Check console logs for specific error messages
6. **Test individually**: Test each network separately to isolate issues