# Quick Installation Guide

## Install the Browser Extension

### For Chrome:
1. Open Chrome browser
2. Type `chrome://extensions/` in the address bar
3. Turn on "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `pantheon-toolkit` folder
6. The extension is now installed!

### For Edge:
1. Open Edge browser  
2. Type `edge://extensions/` in the address bar
3. Turn on "Developer mode" (toggle in left sidebar)
4. Click "Load unpacked"
5. Select the `pantheon-toolkit` folder
6. The extension is now installed!

## How to Use

1. **Go to a performance page** like:
   ```
   https://edgeteam.ms/perf-lab/perf-comparison-requests/details/...
   ```

2. **Look for the purple button** in the top-right corner:
   ```
   📊 Analyze Performance
   ```

3. **Click the button** and wait for data extraction

4. **View the results** in the modal that appears:
   - Green section = P0 Improvements
   - Red section = P0 Regressions

## Notes

- The extension only works on `edgeteam.ms` performance comparison pages
- It automatically handles pagination to get all data
- You need to replace the placeholder icon files with actual PNG images
- The extension uses Manifest V3 (modern Chrome/Edge standard)

## Creating Icons

You can create icons using:
- Online icon generators (search "favicon generator")
- Image editing software (GIMP, Photoshop, etc.)
- Simple drawing apps

Required sizes: 16x16, 48x48, and 128x128 pixels in PNG format.