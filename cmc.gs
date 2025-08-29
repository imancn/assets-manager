/**
 * cmc.gs - CoinMarketCap API Integration
 * Handles fetching cryptocurrency prices from CoinMarketCap API
 */

/**
 * Fetch prices for multiple symbols from CoinMarketCap
 * @param {Array} symbols - Array of cryptocurrency symbols
 * @returns {Object} Map of symbol to price data
 */
function fetchCmcPrices(symbols) {
  const maxRetries = parseInt(readEnv('MAX_RETRIES', '3'));
  const apiKey = readEnv('CMC_API_KEY', '');
  
  if (!apiKey || apiKey === 'YOUR_CMC_API_KEY_HERE') {
    console.warn('CMC API key not configured, returning zero prices');
    return createZeroPrices(symbols);
  }
  
  if (!symbols || symbols.length === 0) {
    console.warn('No symbols provided for CMC price fetch');
    return {};
  }
  
  // Batch symbols (CMC allows up to 100 symbols per request)
  const batches = [];
  const batchSize = 100;
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }
  
  const allPrices = {};
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`Fetching CMC prices for batch ${batchIndex + 1}/${batches.length} (${batch.length} symbols)`);
    
    try {
      const batchPrices = fetchCmcBatch(batch, apiKey, maxRetries);
      Object.assign(allPrices, batchPrices);
      
      // Rate limiting: wait between batches
      if (batchIndex < batches.length - 1) {
        Utilities.sleep(1000); // 1 second delay between batches
      }
      
    } catch (error) {
      console.error(`Error fetching batch ${batchIndex + 1}:`, error);
      // Continue with other batches, but mark failed symbols with zero prices
      const failedPrices = createZeroPrices(batch);
      Object.assign(allPrices, failedPrices);
    }
  }
  
  console.log(`Successfully fetched prices for ${Object.keys(allPrices).length} symbols`);
  return allPrices;
}

/**
 * Fetch a single batch of symbols from CMC
 * @param {Array} symbols - Array of symbols for this batch
 * @param {string} apiKey - CMC API key
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Object} Map of symbol to price data
 */
function fetchCmcBatch(symbols, apiKey, maxRetries) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = `${GLOBAL_CONFIG.CMC_QUOTES_ENDPOINT}?symbol=${encodeURIComponent(symbols.join(','))}`;
      const options = {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        },
        muteHttpExceptions: true
      };
      
      console.log(`CMC API request attempt ${attempt}/${maxRetries} for ${symbols.length} symbols`);
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode === 200) {
        const data = JSON.parse(responseText);
        return parseCmcResponse(data, symbols);
        
      } else if (responseCode === 429) {
        // Rate limited - implement exponential backoff
        const backoffMs = Math.pow(2, attempt) * 1000; // 2^attempt * 1000ms
        console.log(`Rate limited (429). Backing off for ${backoffMs}ms before retry ${attempt + 1}`);
        Utilities.sleep(backoffMs);
        lastError = new Error(`Rate limited (HTTP ${responseCode})`);
        
      } else if (responseCode >= 400 && responseCode < 500) {
        // Client error - don't retry
        throw new Error(`CMC API client error: ${responseCode} - ${responseText}`);
        
      } else {
        // Server error - retry
        lastError = new Error(`CMC API server error: ${responseCode} - ${responseText}`);
        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.log(`Server error. Backing off for ${backoffMs}ms before retry ${attempt + 1}`);
          Utilities.sleep(backoffMs);
        }
      }
      
    } catch (error) {
      lastError = error;
      console.error(`CMC API attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`Backing off for ${backoffMs}ms before retry ${attempt + 1}`);
        Utilities.sleep(backoffMs);
      }
    }
  }
  
  // All retries failed
  throw new Error(`Failed to fetch CMC prices after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

/**
 * Parse CMC API response and extract price data
 * @param {Object} data - CMC API response data
 * @param {Array} requestedSymbols - Original symbols requested
 * @returns {Object} Map of symbol to price data
 */
function parseCmcResponse(data, requestedSymbols) {
  const prices = {};
  
  if (!data || !data.data) {
    console.warn('Invalid CMC response format');
    return createZeroPrices(requestedSymbols);
  }
  
  // Process each symbol in the response
  for (const [symbol, coinData] of Object.entries(data.data)) {
    if (coinData && coinData.quote && coinData.quote.USD) {
      const quote = coinData.quote.USD;
      prices[symbol] = {
        price: quote.price || 0,
        market_cap: quote.market_cap || 0,
        last_updated: quote.last_updated || new Date().toISOString(),
        volume_24h: quote.volume_24h || 0,
        percent_change_24h: quote.percent_change_24h || 0
      };
    }
  }
  
  // Fill in zero prices for symbols not found in response
  for (const symbol of requestedSymbols) {
    if (!prices[symbol]) {
      prices[symbol] = {
        price: 0,
        market_cap: 0,
        last_updated: new Date().toISOString(),
        volume_24h: 0,
        percent_change_24h: 0
      };
      console.warn(`Symbol ${symbol} not found in CMC response, setting price to 0`);
    }
  }
  
  return prices;
}

/**
 * Create zero prices for symbols (fallback when API fails)
 * @param {Array} symbols - Array of symbols
 * @returns {Object} Map of symbol to zero price data
 */
function createZeroPrices(symbols) {
  const prices = {};
  for (const symbol of symbols) {
    prices[symbol] = {
      price: 0,
      market_cap: 0,
      last_updated: new Date().toISOString(),
      volume_24h: 0,
      percent_change_24h: 0
    };
  }
  return prices;
}

/**
 * Test CMC price fetching with a small set of symbols
 * @returns {Object} Test results
 */
function testFetchCmcPrices() {
  try {
    console.log('Testing CMC price fetching...');
    
    const testSymbols = ['BTC', 'ETH', 'USDT', 'INVALID_SYMBOL'];
    const prices = fetchCmcPrices(testSymbols);
    
    const result = {
      success: true,
      symbols: testSymbols,
      prices: prices,
      summary: {
        totalRequested: testSymbols.length,
        pricesFound: Object.keys(prices).filter(sym => prices[sym].price > 0).length,
        zeroPrices: Object.keys(prices).filter(sym => prices[sym].price === 0).length
      }
    };
    
    console.log('CMC test results:', JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    console.error('CMC test failed:', error);
    return {
      success: false,
      error: error.toString(),
      symbols: [],
      prices: {}
    };
  }
}

/**
 * Get price for a single symbol (convenience function)
 * @param {string} symbol - Cryptocurrency symbol
 * @returns {number} Price in USD, or 0 if not found
 */
function getCmcPrice(symbol) {
  try {
    const prices = fetchCmcPrices([symbol]);
    return prices[symbol] ? prices[symbol].price : 0;
  } catch (error) {
    console.error(`Error getting price for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Get market cap for a single symbol (convenience function)
 * @param {string} symbol - Cryptocurrency symbol
 * @returns {number} Market cap in USD, or 0 if not found
 */
function getCmcMarketCap(symbol) {
  try {
    const prices = fetchCmcPrices([symbol]);
    return prices[symbol] ? prices[symbol].market_cap : 0;
  } catch (error) {
    console.error(`Error getting market cap for ${symbol}:`, error);
    return 0;
  }
}