# Container Contents

An  offline-first PWA for managing container inventories with QR code scanning. Keep track of what's in your physical containers by scanning QR code labels and adding photos with descriptions.

## Features

- **QR Code Scanning**: Scan plain-text QR codes containing container IDs (C-XXXX format)
- **Offline-First**: Works completely offline after initial load using IndexedDB and service workers
- **Photo Management**: Add multiple photos per container with optional descriptions
- **Smart Search**: Search across container IDs, labels, locations, and photo descriptions
- **Export/Import**: Backup and restore all your data as .containervault files
- **PWA Support**: Install on iOS (Add to Home Screen) and desktop browsers

## Container ID Format

Container IDs must follow this format:
- **Format**: `C-XXXX`
- **C-** prefix is required
- **XXXX** = exactly 4 characters using only 0-9 and A-Z
- Examples: `C-0001`, `C-A7B2`, `C-ZZQQ`
- IDs are automatically normalized to uppercase

## Quick Start

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser (usually http://localhost:5173)

### Production Build

1. Build the app:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder using any static file server:
   ```bash
   # Using Python
   cd dist
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server dist -p 8000

   # Using any other static file server
   ```

3. Access the app at http://localhost:8000

### Installing on iOS

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"
5. The app will appear on your home screen and work offline

## Usage

### Creating Containers

**Method 1: Scan QR Code**
1. Tap "Scan QR"
2. Point camera at a QR code containing a container ID (e.g., C-0001)
3. If container exists, it opens; if not, you'll be prompted to create it

**Method 2: Manual Entry**
1. Tap "Add Container"
2. Enter a container ID manually or tap "Generate ID"
3. Add label, location, and notes
4. Tap "Create Container"

### Adding Photos

1. Open a container
2. Tap "Add Photo"
3. Take a photo or select from library
4. Photos are automatically resized and compressed
5. Tap on a photo to add a description

### Searching

- Use the search box on the home screen
- Searches across:
  - Container IDs
  - Labels
  - Locations
  - Photo descriptions
- Results update as you type

### Backup & Restore

**Export Backup:**
1. Open Settings
2. Tap "Export Backup"
3. Save the .containervault file
4. Share via email, cloud storage, etc.

**Import Backup:**
1. Open Settings
2. Tap "Import Backup"
3. Select a .containervault file
4. Confirm replacement of current data

## QR Code Generation

This app does NOT generate QR codes. To create QR labels:

1. Use any QR code generator (online or app)
2. Generate a plain-text QR code containing only the container ID
3. Print and apply to your physical container

Example sites for QR generation:
- qr-code-generator.com
- qrcode.tec-it.com
- Any other QR code generator that supports plain text

## Technical Details

### Stack
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Dexie.js for IndexedDB
- ZXing for QR scanning
- JSZip for export/import

### Storage
- All data stored locally in IndexedDB
- No backend or cloud sync
- Photos stored as compressed Blobs
- Automatic thumbnail generation

### PWA Features
- Service worker for offline operation
- Web manifest for installability
- Works on iOS Safari, desktop browsers
- Optimized for mobile devices

## Browser Support

- iOS Safari 14+
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Privacy

- All data stays on your device
- No analytics or tracking
- No external services or APIs
- Export/import files are fully portable

## License

MIT
