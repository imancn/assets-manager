# Assets Manager - Google Apps Script

A comprehensive cryptocurrency portfolio management system built with Google Apps Script that supports multiple blockchain networks and exchanges.

## 🚀 Quick Start

### 1. Initial Setup
1. **Open the Google Apps Script project** in your Google Drive
2. **Click "Run Setup"** in the web app interface to create all required sheets
3. **Configure your API keys** in the ENV sheet (optional for basic functionality)
4. **Verify setup** by clicking "Test Setup"

### 2. First Run
1. **Click "Run Now"** to fetch your first balance snapshot
2. **Check the Progress section** for real-time updates
3. **View results** in the Financial Records section

## 🔧 Troubleshooting

### Common Issues

#### "No active wallets found in configuration"
- **Solution**: Click "Run Setup" to create the required sheets
- **Check**: Verify the Wallets sheet exists and has data
- **Verify**: Ensure wallet rows have "TRUE" in the Active column

#### "No coins configured in Coins Management"
- **Solution**: Click "Run Setup" to create the required sheets
- **Check**: Verify the Coins Management sheet exists and has data
- **Verify**: Ensure coin rows have "TRUE" in the Active column

#### Dashboard shows incorrect counts
- **Solution**: Click "Refresh Dashboard" button
- **Check**: Verify sheets contain the expected data
- **Run**: Use "Test Setup" to verify configuration

### Setup Verification
The system creates:
- **10 sample wallets** (all active by default)
- **22 supported coins** across multiple networks
- **Configuration sheets** for environment variables
- **Financial records** sheet for balance snapshots

## 📊 Supported Networks

- **Ethereum (ETH)** - Native and ERC-20 tokens
- **Binance Smart Chain (BSC)** - BEP-20 tokens
- **Solana (SOL)** - SPL tokens
- **Bitcoin (BTC)** - Native Bitcoin
- **XRP Ledger (XRP)** - Native XRP
- **TON Blockchain (TON)** - Native TON
- **Tron (TRX)** - TRC-20 tokens
- **KuCoin Exchange** - Exchange balances

## 🎯 Features

- **Real-time balance fetching** across multiple networks
- **Automatic price updates** via CoinMarketCap API
- **Comprehensive logging** with progress tracking
- **Auto-refresh capability** (configurable intervals)
- **Error handling** with detailed feedback
- **Setup validation** and testing tools

## 🔑 API Configuration

### Required APIs (Optional for basic functionality)
- **CoinMarketCap**: For real-time price data
- **Moralis**: For Ethereum/BSC balance fetching
- **BSCScan**: For BSC transaction verification
- **Solscan**: For Solana balance fetching
- **KuCoin**: For exchange balance fetching

### Configuration Steps
1. Get API keys from respective services
2. Update the ENV sheet with your keys
3. Set `DRY_RUN` to `false` when ready for production
4. Test with "Test Setup" button

## 📁 Sheet Structure

### Wallets Sheet
- **ID**: Unique identifier
- **Name**: Human-readable wallet name
- **Network**: Blockchain network (ETH, BSC, SOL, etc.)
- **Address**: Wallet address or API credentials
- **Active**: TRUE/FALSE to enable/disable

### Coins Management Sheet
- **Symbol**: Token symbol (ETH, BTC, USDT, etc.)
- **Name**: Full token name
- **Network**: Supported blockchain
- **Contract Address**: Token contract (if applicable)
- **Active**: TRUE/FALSE to enable/disable

### Financial Records Sheet
- **Timestamp**: When balance was recorded
- **Type**: Balance type (wallet, exchange)
- **Network**: Blockchain network
- **Symbol**: Token symbol
- **Balance**: Token amount
- **Price USD**: USD price at time of recording
- **Value USD**: Total USD value

## 🚨 Error Handling

The system provides detailed error messages and logging:
- **Setup errors**: Clear guidance on missing sheets
- **API errors**: Network and authentication issues
- **Validation errors**: Data format and configuration problems
- **Progress tracking**: Real-time status updates

## 🔄 Maintenance

### Regular Tasks
- **Monitor logs** for errors and warnings
- **Update API keys** when they expire
- **Review wallet configurations** for accuracy
- **Check network status** for blockchain issues

### Troubleshooting Commands
- **Test Setup**: Verify all components are working
- **Run Setup**: Recreate sheets and configuration
- **Refresh Dashboard**: Update display with latest data
- **Test Setup**: Validate configuration integrity

## 📞 Support

If you encounter issues:
1. **Check the logs** in the Progress section
2. **Run "Test Setup"** to identify problems
3. **Verify sheet data** manually in Google Sheets
4. **Check API key configuration** in the ENV sheet

## 🔒 Security Notes

- **API keys** are stored in Google Sheets (not recommended for production)
- **Wallet addresses** are visible in the configuration
- **Use test wallets** for development and testing
- **Enable 2FA** on your Google account

---

**Note**: This is a development tool. For production use, consider additional security measures and proper API key management.