# Deployment Instructions

## Testing Locally

### Option 1: Development Mode
```bash
npm run dev
```
Visit http://localhost:5173

### Option 2: Production Build + Static Server
```bash
# Build the app
npm run build

# Serve the dist folder
npx http-server dist -p 8000
```
Visit http://localhost:8000

## Installing as PWA on iOS

1. **Open in Safari** (Chrome/Firefox don't support Add to Home Screen on iOS)
   - Visit your hosted URL or local server

2. **Add to Home Screen**
   - Tap the Share button (box with arrow pointing up)
   - Scroll down and tap "Add to Home Screen"
   - Edit the name if desired
   - Tap "Add"

3. **Test Offline Mode**
   - Enable Airplane Mode
   - Open the app from your home screen
   - It should work completely offline!

## Deploying to Production

The app is a static site that can be hosted anywhere:

### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Pages
```bash
# Build
npm run build

# Push dist folder to gh-pages branch
# Or use GitHub Actions
```

### Option 4: Any Static Host
Upload the contents of the `dist` folder to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Firebase Hosting
- Cloudflare Pages
- Any web server (nginx, Apache, etc.)

## HTTPS Requirement

For full PWA functionality (especially on iOS), the app MUST be served over HTTPS in production. This includes:
- Service Worker registration
- Camera access for QR scanning
- Install prompts

Local development (localhost) works over HTTP.

## Testing the App

### Acceptance Tests

1. **Offline Test**
   - Add to home screen on iPhone
   - Turn on Airplane Mode
   - Launch app from home screen
   - Verify it loads and works

2. **Container ID Validation**
   - Try creating container with ID "C-00A7" ✓
   - Try creating container with ID "C-00a7" (should normalize to C-00A7) ✓
   - Try invalid IDs: "123", "BOX-1", "C-12" (should reject) ✓

3. **QR Scanning**
   - Generate QR code with text "C-0001"
   - Scan it - if container doesn't exist, should prompt to create
   - Create the container
   - Scan again - should open the container

4. **Photo Management**
   - Add 3 photos with descriptions
   - View in container
   - Thumbnails should load quickly
   - Full images should load when tapped

5. **Search**
   - Create containers with different locations
   - Add photos with descriptions
   - Search for words in locations and descriptions
   - Verify correct containers appear

6. **Export/Import**
   - Export backup as .containervault file
   - Send via email or save to cloud
   - Open on another device (or clear data)
   - Import the backup
   - Verify all containers and photos are restored

7. **Delete Container**
   - Delete a container
   - Verify photos are also removed
   - Check storage stats update

## QR Code Testing

To test QR scanning without physical labels:

1. Visit any online QR generator
2. Create a QR code with plain text: `C-0001`
3. Display the QR code on another screen or print it
4. Use the app to scan it

Example generators:
- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/

## Troubleshooting

### Camera doesn't work
- Check browser permissions
- iOS requires Safari for camera access in web apps
- Ensure HTTPS in production
- Use "Manual Entry" as fallback

### Service Worker not registering
- Check browser console for errors
- Verify sw.js is accessible
- Clear cache and reload
- Check HTTPS requirement

### Can't install on iOS
- Must use Safari browser
- Clear Safari cache
- Try force-refreshing (hold refresh button)
- Check that manifest.json is valid

### IndexedDB errors
- Check available storage space
- Try clearing browser data
- Safari may have stricter limits

### Photos not saving
- Check available storage
- Verify camera/file permissions
- Try smaller images
- Check browser console for errors
