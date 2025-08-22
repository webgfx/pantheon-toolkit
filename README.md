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
└── # Pantheon Toolkit 🧪

A Chrome/Edge browser extension for extracting and analyzing P0 performance regression and improvement data from edgeteam.ms performance comparison pages.

## ✨ Features

- **📊 Data Extraction**: Automatically extracts P0 regression and improvement data with pagination support
- **📋 Excel Export**: Export data to Excel format with separate sheets for regressions and improvements
- **📁 Folder Selection**: Choose your preferred download location
- **🎯 Tab Interface**: Switch between regressions and improvements views
- **📱 Draggable UI**: Movable "Get Results" button that remembers position
- **⚡ Smart Caching**: 5-minute data cache for instant results
- **📊 Sortable Tables**: Click column headers to sort data
- **🎨 Modern UI**: Glass-morphism design with responsive layout

## 🚀 Quick Installation

### For Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `pantheon-toolkit` folder
5. Extension installed! ✅

### For Edge:
1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode" (toggle in left sidebar)
3. Click "Load unpacked"
4. Select the `pantheon-toolkit` folder
5. Extension installed! ✅

## 📖 How to Use

1. **Navigate** to a performance comparison page:
   ```
   https://edgeteam.ms/perf-lab/perf-comparison-requests/details/...
   ```

2. **Click** the draggable "📊 Get Results" button (purple, top-right corner)

3. **Wait** for automatic data extraction (handles pagination)

4. **View Results** in tabs:
   - **⬇️ Regressions** (default): P0 performance regressions
   - **⬆️ Improvements**: P0 performance improvements

5. **Export Data** using the "📋 Export Excel" button:
   - Creates multi-sheet Excel file
   - Choose download location
   - Includes summary sheet with metadata

## 📊 Excel Export Features

- **Multi-sheet workbook**: Separate sheets for regressions, improvements, and summary
- **Rich data format**: Benchmark, Story, Metric, Group, Change %, Baseline, Comparison, Unit
- **Auto-sized columns**: Optimized for readability
- **Timestamped filenames**: `Pantheon_Performance_Analysis_YYYY-MM-DD-HH-MM-SS.xlsx`
- **Metadata included**: Export date, source URL, item counts

## 🎨 UI Features

- **Draggable Button**: Drag the "Get Results" button anywhere on the page
- **Position Memory**: Button remembers its position across page loads
- **Modern Design**: Glass-morphism effects with smooth animations
- **Responsive Layout**: Works on desktop and mobile browsers
- **Smart Caching**: Data cached for 5 minutes to avoid re-extraction
- **Sortable Tables**: Click any column header to sort data

## 🔧 Technical Details

- **Manifest V3**: Modern Chrome/Edge extension standard
- **Content Scripts**: DOM manipulation for data extraction
- **XLSX Library**: Local SheetJS library for Excel generation
- **Chrome Downloads API**: Native save dialog for file downloads
- **Microsoft UI Framework**: Compatible with edgeteam.ms page structure
- **Local Storage**: Persistent button positioning

## 📁 File Structure

```
pantheon-toolkit/
├── manifest.json          # Extension configuration
├── content.js            # Main extension logic
├── styles.css           # Modern UI styling
├── xlsx.min.js          # Excel generation library
├── popup.html           # Extension popup interface
├── popup.js             # Popup logic
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md            # This file
└── INSTALL.md           # Quick installation guide
```

## 🛠️ Development

### Requirements:
- Chrome/Edge browser with developer mode
- Access to edgeteam.ms performance comparison pages

### Key Components:
- **PerformanceAnalyzer Class**: Main logic for data extraction and UI
- **Pagination Handler**: Automatic navigation through result pages
- **Cache System**: 5-minute data cache with timestamp validation
- **Drag System**: Full mouse/touch drag functionality with constraints
- **Excel Export**: SheetJS integration with Chrome downloads API

## 🐛 Troubleshooting

### Common Issues:

1. **"No data found"**: Page may still be loading. Wait and try again.
2. **Export button disabled**: Extension is loading. Refresh the page.
3. **Button not appearing**: Ensure you're on the correct URL pattern.
4. **Data incomplete**: Extension handles pagination automatically.

### Debug Features:
- Console logging for all operations
- Error handling with user-friendly messages
- Debug buttons available in development mode

## 📝 Changelog

### Version 1.0.0
- ✅ Data extraction with pagination support
- ✅ Tab interface for regressions/improvements
- ✅ Excel export with multi-sheet support
- ✅ Draggable UI with position memory
- ✅ Smart caching system
- ✅ Modern responsive design
- ✅ Local XLSX library integration

## 🎯 Future Enhancements

- 📈 Data visualization charts
- 🔍 Advanced filtering options
- 📊 Historical data comparison
- 🎨 Customizable themes
- 📱 Mobile app companion

---

**Made with ❤️ for the Microsoft Edge Performance Team**              # This file
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