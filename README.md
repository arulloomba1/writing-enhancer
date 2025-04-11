# MedWriter Enhancer

A Chrome extension that helps medical school applicants enhance their personal statements and application essays by providing real-time writing suggestions.

## Features

- Real-time writing analysis
- Detection of wordy phrases
- Medical cliché detection
- Medical terminology validation
- Google Docs integration

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension directory

## Development

### Project Structure

```
medwriter-enhancer/
├── src/
│   ├── js/
│   │   ├── content.js     # Google Docs integration
│   │   └── popup.js       # Extension popup logic
│   ├── css/
│   │   └── sidebar.css    # Styles for the suggestions sidebar
│   └── popup.html         # Extension popup interface
├── icons/                 # Extension icons
└── manifest.json          # Extension configuration
```

### Building

No build step required. The extension can be loaded directly into Chrome in developer mode.

### Testing

1. Load the extension in Chrome
2. Open a Google Doc
3. Start writing your medical school application
4. The extension will provide real-time suggestions in the sidebar

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details 