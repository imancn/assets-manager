# Assests Manager - Crypto Portfolio Management Tool

A comprehensive single-page Google Apps Script web application for managing cryptocurrency assets across multiple networks. Built with modern web technologies and designed for ease of use.

## 🌟 Features

- **Multi-Network Support**: ETH, BSC, SOL, BTC, XRP, TON, TRX
- **Exchange Integration**: KuCoin API support
- **Real-time Pricing**: CoinMarketCap integration
- **Automated Tracking**: Scheduled balance updates
- **Modern UI**: Responsive Bootstrap-based interface
- **Google Sheets Integration**: Seamless data management

## 📁 Project Structure

```
├── setup.gs              # Sheet setup and initialization
├── api.gs                # Main API and orchestration
├── cmc.gs                # CoinMarketCap price fetching
├── kucoin.gs             # KuCoin exchange integration
├── eth.gs                # Ethereum network support
├── bsc.gs                # Binance Smart Chain support
├── solana.gs             # Solana network support
├── bitcoin.gs            # Bitcoin network support
├── xrp.gs                # XRP network support
├── ton.gs                # TON network support
├── tron.gs               # Tron network support
├── ui.html               # Main web interface
├── appsscript.json       # GAS manifest
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Rename project to "Assests Manager"

### 2. Upload Project Files

1. Copy each `.gs` file content into separate script files
2. Copy `ui.html` content into an HTML file
3. Replace `appsscript.json` content with the provided manifest

### 3. Create Google Sheet

1. Create a new Google Sheet
2. Run the `runSetup()` function from `setup.gs`
3. This will create all required sheets with sample data

### 4. Configure API Keys

Edit the `ENV` sheet and add your API keys:

| Key | Value | Description |
|-----|-------|-------------|
| `CMC_API_KEY` | Your CMC API key | CoinMarketCap API key |
| `MORALIS_API_KEY` | Your Moralis key | Ethereum RPC access |
| `INFURA_PROJECT_ID` | Your Infura ID | Ethereum RPC access |
| `TRONGRID_API_KEY` | Your TronGrid key | Tron network access |
| `KUCOIN_API_KEY` | Your KuCoin key | KuCoin exchange access |
| `KUCOIN_SECRET` | Your KuCoin secret | KuCoin API secret |
| `KUCOIN_PASSPHRASE` | Your KuCoin passphrase | KuCoin API passphrase |

### 5. Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as type
3. Set access to "Anyone" or "Anyone with Google Account"
4. Click "Deploy"

## ⚙️ Configuration

### Environment Variables

The `ENV` sheet contains all configuration:

- **API Keys**: External service authentication
- **RPC URLs**: Blockchain network endpoints
- **Retry Settings**: Error handling configuration
- **Dry Run Mode**: Test without writing data
- **Auto-refresh**: Scheduled execution interval

### Wallet Configuration

Configure wallets in the `Wallets` sheet:

| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Name | Wallet display name |
| Network | Blockchain network |
| Address | Wallet address |
| API Keys | Exchange credentials |
| Active | Enable/disable wallet |
| Notes | Additional information |

### Coin Management

Manage supported tokens in `Coins Management`:

| Column | Description |
|--------|-------------|
| Symbol | Token symbol (e.g., BTC) |
| Name | Full token name |
| Network | Supported network |
| Contract Address | Token contract (if applicable) |
| Decimals | Token decimal places |
| CMC ID | CoinMarketCap identifier |
| Active | Enable/disable token |

## 🔧 API Endpoints

### Main Functions

- `runSetup()` - Initialize sheets and sample data
- `fetchAndStoreBalances(triggerType)` - Main balance fetching
- `getLastSync()` - Get last synchronization status
- `testSetup()` - Verify system configuration

### Network Modules

Each network has dedicated functions:

- **Ethereum**: `getEthBalances()`, `getEthNativeBalance()`
- **BSC**: `getBscBalances()`, `getBscNativeBalance()`
- **Solana**: `getSolanaBalances()`, `getSolanaNativeBalance()`
- **Bitcoin**: `getBitcoinBalances()`, `getBitcoinNativeBalance()`
- **XRP**: `getXrpBalances()`, `getXrpNativeBalance()`
- **TON**: `getTonBalances()`, `getTonNativeBalance()`
- **Tron**: `getTronBalances()`, `getTronNativeBalance()`

### Exchange Integration

- **KuCoin**: `getKucoinBalances()`, `getKucoinAccounts()`
- **CoinMarketCap**: `fetchCmcPrices()`, `getCmcPrice()`

## 📊 Data Flow

1. **Configuration**: Read wallet and coin settings from sheets
2. **Balance Fetching**: Query each network for wallet balances
3. **Price Data**: Get current prices from CoinMarketCap
4. **Record Creation**: Generate financial records with USD values
5. **Data Storage**: Append records to Financial Records sheet
6. **Status Update**: Update last sync timestamp and status

## 🎨 User Interface

### Dashboard Overview

- Active wallet count
- Supported coin count
- Last sync information
- System status

### Controls

- **Run Now**: Manual balance fetch
- **Test Setup**: Verify configuration
- **Auto-refresh**: Scheduled execution toggle

### Progress Tracking

- Real-time operation status
- Detailed log entries
- Error reporting

### Financial Records

- Recent balance snapshots
- Network and token information
- USD valuations
- Status tracking

## 🧪 Testing

### Test Functions

Each module includes test functions:

```javascript
// Test CoinMarketCap
testFetchCmcPrices()

// Test Ethereum
testEthFunctions()

// Test BSC
testBscFunctions()

// Test Solana
testSolanaFunctions()

// Test Bitcoin
testBitcoinFunctions()

// Test XRP
testXrpFunctions()

// Test TON
testTonFunctions()

// Test Tron
testTronFunctions()

// Test KuCoin
testKucoinConnection(wallet)
```

### Setup Verification

Run `testSetup()` to verify:

- Sheet existence
- Environment variables
- Wallet configuration
- Coin configuration

## 🔒 Security Considerations

- **API Keys**: Store in ENV sheet, never commit to version control
- **Access Control**: Use Google Apps Script's built-in security
- **Rate Limiting**: Implemented for external APIs
- **Error Handling**: Comprehensive error logging and recovery

## 📈 Performance Optimization

- **Batch Processing**: CoinMarketCap API batching
- **Caching**: RPC response caching where possible
- **Parallel Processing**: Independent network queries
- **Retry Logic**: Exponential backoff for failed requests

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**: Verify keys in ENV sheet
2. **Network Timeouts**: Check RPC endpoint availability
3. **Rate Limiting**: Reduce request frequency
4. **Sheet Errors**: Ensure proper sheet structure

### Debug Mode

Enable detailed logging:

```javascript
// Set in ENV sheet
DEBUG_MODE = true
LOG_LEVEL = DEBUG
```

### Error Logs

Check Google Apps Script execution logs:

1. Go to script.google.com
2. Select your project
3. Click "Executions" in left sidebar
4. View detailed logs for each run

## 🔄 Scheduled Execution

### Time-driven Triggers

Set up automatic execution:

```javascript
// Create trigger for every 5 minutes
ScriptApp.newTrigger('fetchAndStoreBalances')
  .timeBased()
  .everyMinutes(5)
  .create();

// Create trigger for daily execution
ScriptApp.newTrigger('fetchAndStoreBalances')
  .timeBased()
  .everyDays(1)
  .atHour(9)
  .create();
```

### Manual Triggers

- Use "Run Now" button in UI
- Call functions directly from script editor
- Use Google Apps Script API

## 📱 Mobile Support

The UI is fully responsive and optimized for:

- Mobile phones
- Tablets
- Desktop computers
- Touch interfaces

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📚 API Documentation

### External APIs Used

- **CoinMarketCap**: `/v1/cryptocurrency/quotes/latest`
- **KuCoin**: `/api/v1/accounts`, `/api/v2/currencies`
- **Ethereum RPC**: `eth_getBalance`, `eth_call`
- **BSC RPC**: Same as Ethereum
- **Solana RPC**: `getBalance`, `getTokenAccountsByOwner`
- **Blockstream**: Bitcoin address and UTXO data
- **XRP RPC**: `account_info`, `account_lines`
- **TON Center**: `/v2/getAddressBalance`, `/v2/getWalletInfo`
- **TronGrid**: `/v1/accounts`, `/v1/contracts`

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

### Code Standards

- Use ES6+ syntax
- Follow Google Apps Script best practices
- Include comprehensive error handling
- Add test functions for new modules
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Apps Script team
- Bootstrap framework
- CoinMarketCap API
- KuCoin API
- Various blockchain RPC providers

## 📞 Support

For support and questions:

1. Check the troubleshooting section
2. Review execution logs
3. Test individual functions
4. Verify configuration settings

## 🔄 Version History

- **v1.0.0**: Initial release with multi-network support
- **v1.1.0**: Added KuCoin integration
- **v1.2.0**: Enhanced UI and error handling
- **v1.3.0**: Added TON and Tron support

---

**Note**: This tool is designed for educational and personal use. Always verify API keys and test thoroughly before production deployment.