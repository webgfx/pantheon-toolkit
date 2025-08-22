# Pantheon Performance Analyzer - Browser Extension

A Chrome/Edge browser extension that extracts and formats P0 regression and improvement data from performance comparison pages on edgeteam.ms.

## Features

- 🎯 **Auto-Detection**: Automatically detects P0 improvements and regressions on performance comparison pages
- 📋 **Clean Formatting**: Displays data in organized, color-coded sections
- 🔄 **Pagination Handling**: Automatically navigates through all pages to collect complete data
- ⚡ **One-Click Extraction**: Simple floating button for instant data analysis
- 📊 **Visual Display**: Beautiful, responsive interface with detailed metrics

## Installation

### Method 1: Developer Mode (Recommended for development)
1. Open Chrome or Edge browser
2. Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select this folder (`pantheon-toolkit`)
5. The extension should now appear in your extensions list

### Method 2: Create Extension Package
1. Install the `web-ext` tool: `npm install -g web-ext`
2. Run `web-ext build` in the project directory
3. Install the generated `.zip` file through the browser extensions page

## Usage

1. **Navigate to a Performance Page**: Go to any performance comparison URL like:
   ```
   https://edgeteam.ms/perf-lab/perf-comparison-requests/details/689b18f21271ce9c179c8dfd?metricId=689b1a10210baaf8fc31e136&showDetails=false
   ```

2. **Look for the Floating Button**: A purple "📊 Analyze Performance" button will appear in the top-right corner of the page

3. **Extract Data**: Click the button to start data extraction
   - The extension will automatically find P0 improvement and regression sections
   - It will navigate through all pages to collect complete data
   - A loading indicator will show progress

4. **View Results**: 
   - Results appear in a beautiful modal overlay
   - **Green section**: P0 Improvements with positive performance changes
   - **Red section**: P0 Regressions with negative performance changes
   - Each metric shows benchmark/story/metric path, group, percentage change, and baseline/comparison values

## Data Structure

Each performance metric displays:
- **Benchmark/Story/Metric**: The hierarchical path of the performance test
- **Group**: The classification group of the metric
- **Percentage Change**: The performance change (positive for improvements, negative for regressions)
- **Baseline Value**: The original performance measurement
- **Comparison Value**: The new performance measurement
- **Unit**: The measurement unit (ms, MB, etc.)

## Technical Details

### Content Script Features
- Runs only on performance comparison pages
- Uses the provided JavaScript extraction logic
- Handles pagination automatically
- Parses metric names, values, and percentage changes
- Extracts baseline and comparison values with units

### UI Components
- **Floating Action Button**: Non-intrusive access to functionality
- **Modal Overlay**: Full-screen results display with close functionality
- **Responsive Design**: Works on different screen sizes
- **Loading States**: Clear feedback during data extraction
- **Error Handling**: Graceful handling of missing elements or data

### Browser Compatibility
- Chrome (Manifest V3)
- Edge (Manifest V3)
- Modern browsers supporting ES6+ features

## File Structure

```
pantheon-toolkit/
├── manifest.json          # Extension configuration
├── content.js             # Main extension logic
├── styles.css             # Styling for the UI
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── icons/                 # Extension icons
│   ├── icon16.png         # 16x16 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
└── README.md              # This file
```

## Development

### Making Changes
1. Edit the relevant files (`content.js`, `styles.css`, etc.)
2. Go to the extensions page in your browser
3. Click the refresh button for the extension
4. Reload the performance comparison page to see changes

### Debugging
- Use browser developer tools to debug content script
- Check the extension's background page for errors
- Use `console.log()` statements in `content.js` for debugging

### Adding Features
- Modify `content.js` for new extraction logic
- Update `styles.css` for UI changes
- Adjust `manifest.json` for permissions or new functionality

## Icon Requirements

The extension currently uses placeholder icon files. To complete the installation:

1. Create or find 16x16, 48x48, and 128x128 PNG icons
2. Replace the placeholder files in the `icons/` directory
3. Suggested icon design: A simple chart, graph, or performance-related symbol

## Troubleshooting

### Extension Not Working
- Ensure you're on a valid performance comparison page
- Check that the extension is enabled in your browser
- Verify the page has fully loaded before clicking the analyze button

### Data Extraction Fails
- Make sure the page contains P0 improvement and regression sections
- Check browser console for any JavaScript errors
- Verify the page structure matches the expected selectors

### UI Issues
- Try refreshing the page and running the analysis again
- Check if any other extensions are interfering
- Ensure your browser supports modern CSS features

## Contributing

Feel free to submit issues and enhancement requests! This extension is designed to be easily extensible for additional performance analysis features.