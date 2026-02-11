# Stock Scanner - Web Version

A modern, browser-based stock scanner providing advanced technical analysis and trading signals. This web app can be hosted on GitHub Pages for free and accessed from any device.

## ✨ Features

- **9-Factor Scoring System**: Automated BUY/SELL/WAIT recommendations
- **Technical Indicators**: RSI, MACD, Bollinger Bands, ATR, ADX, Stochastic, OBV, RVOL
- **Candlestick Patterns**: Doji, Hammer, Bullish Engulfing with detailed explanations
- **Position Sizing Guidance**: Automatic calculation based on signal strength
- **Warning Flags**: ADX, RVOL, Bollinger Squeeze detection
- **Suggested Actions**: Entry/exit levels, stop-loss, risk/reward calculations
- **Trading Tips**: Actionable insights for each indicator
- **Modern UI**: Sleek dark theme, responsive design, smooth animations

## 🚀 Quick Start

### 1. Get a Free API Key

1. Go to [Finnhub.io](https://finnhub.io/register)
2. Sign up for a free account (no credit card required)
3. Copy your API key

### 2. Configure the App

Edit `js/api.js` and replace `YOUR_API_KEY_HERE` with your Finnhub API key:

```javascript
const FINNHUB_API_KEY = 'your_actual_api_key_here';
```

### 3. Run Locally

Simply open `index.html` in your web browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code
# Right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:8000`

## 📦 Deploy to GitHub Pages

### Option 1: Using GitHub Web Interface

1. Create a new repository on GitHub
2. Upload all files from the `web/` directory
3. Go to Settings → Pages
4. Select "main" branch as source
5. Click Save
6. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 2: Using Git Command Line

```bash
cd web
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/stock-scanner.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

## 💡 Usage

1. Enter a stock ticker symbol (e.g., ONDS, TSLA, AAPL)
2. Click "Analyze" or press Enter
3. View comprehensive analysis including:
   - Technical indicators
   - Signal strength score
   - BUY/SELL/WAIT recommendation
   - Suggested actions with price targets
   - Trading tips

## 🎨 UI Features

- **Dark Mode**: Easy on the eyes for extended viewing
- **Responsive**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished user experience
- **Color-Coded Signals**: Green (buy), Red (sell), Yellow (wait)
- **Real-time Loading States**: Visual feedback during analysis

## ⚠️ Important Notes

### API Limits
- Free tier: 60 calls/minute
- More than enough for personal use
- Upgrade to paid plan if needed

### Data Source
- All stock data from Finnhub API
- Real-time quotes and historical candles
- Same data quality as premium platforms

### Disclaimer
⚠️ **This tool is for educational and informational purposes only. Not financial advice. Always do your own research before making investment decisions.**

## 🔧 Technical Details

### Project Structure
```
web/
├── index.html          # Main HTML page
├── css/
│   └── styles.css      # Modern dark theme styling
├── js/
│   ├── api.js          # Finnhub API integration
│   ├── indicators.js   # Technical indicator calculations
│   ├── patterns.js     # Candlestick pattern detection
│   ├── scoring.js      # 9-factor scoring system
│   └── main.js         # Main application logic
└── README.md           # This file
```

### Indicators Implemented
- **RSI** (14-period): Overbought/Oversold detection
- **MACD** (12, 26, 9): Trend momentum
- **Bollinger Bands** (20, 2): Volatility & squeeze detection
- **EMA** (20, 50, 200): Trend alignment
- **SMA** (5): Short-term trend
- **ATR** (14): Volatility measurement
- **ADX** (14): Trend strength
- **Stochastic** (14, 3, 3): Momentum oscillator
- **OBV**: Volume trend
- **RVOL**: Relative volume vs 20-day average

### Scoring System
- **+6 to +10**: STRONG BUY (100% position)
- **+3 to +5**: BUY (50-75% position)
- **+1 to +2**: WEAK BUY (25% position)
- **-1 to +1**: WAIT (0% - stay in cash)
- **-2 to -1**: WEAK SELL
- **-5 to -3**: SELL
- **-10 to -6**: STRONG SELL

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📝 License

MIT License - Free to use and modify

## 🆘 Troubleshooting

### "API key not configured" error
- Make sure you've replaced `YOUR_API_KEY_HERE` in `js/api.js`
- Double-check there are no extra spaces in the API key

### "No data available" error
- Verify the ticker symbol is correct
- Try a well-known ticker like AAPL or TSLA
- Some tickers may not have 200 days of data

### Blank page
- Check browser console for errors (F12)
- Make sure all files are in correct directories
- Try using a local server instead of opening directly

---

Built with ❤️ for traders | Powered by Finnhub API
