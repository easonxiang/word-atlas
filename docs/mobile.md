# Mobile app

The app uses Capacitor to package the existing React app for iOS and Android. The web app remains the shared UI and learning implementation; each native project is a thin platform shell.

## Local development

Requirements: Node.js 20+, Xcode for iOS, and Android Studio with an Android SDK for Android.

```bash
npm ci
npm run build:mobile
npm run ios
# or
npm run android
```

`npm run build:mobile` builds the web app into `dist/` and copies it and the native plugins into both platform projects. Open the generated project in Xcode or Android Studio to select a simulator/device and run it. The first iOS build needs an Apple development team selected in Xcode; store distribution and signing are separate release steps.

If a native platform directory is missing, add it with `npm run ios:add` or `npm run android:add`, then run `npm run build:mobile` again.

## Data and offline behavior

Learning progress and settings continue to use the app's local WebView storage. On iOS and Android this storage belongs to the installed app and is available offline; deleting the app can delete its local data. The existing JSON backup and restore remains the recovery path. In the native app, export opens the system share sheet so the user can save or transfer the backup. Restore uses the platform file picker.

Web browser data and native app data are separate stores. Import an existing browser backup into the app once; installing the app does not silently copy a browser profile.

## Media delivery and app size

The current repository contains roughly 700 MB of compressed media: 199 MB of illustrations, 84 MB of thumbnails, 418 MB of audio, and 4 MB of sound effects. The core word index and entry text are about 7 MB. Bundling every image and recording makes development simple and fully offline, but it makes the app download unnecessarily large.

For a public release, keep the app shell, word index, entry text, and interface sounds in the app. Serve illustrations and pronunciation/example audio from a versioned static CDN and load them as needed. Set `VITE_MEDIA_BASE_URL` to the CDN origin (for example, `https://assets.example.com`) at build time; publish the contents of `public/atlas/` under that origin's `/atlas/` path. Leave it unset to keep media bundled and served locally during development.

That release mode needs a deliberate offline-media layer: cache media the learner has opened, prefetch today's study set, and later offer optional topic packs for full offline use. Browser/WebView HTTP cache alone is not a durable download guarantee. Keep the app useful without media when offline, and show a retryable placeholder when an uncached image or audio file cannot be fetched. Do not point production builds at the upstream author's site; use a storage/CDN account controlled by this fork.

On Android, Google Play Asset Delivery can later host opt-in packs if publishing through Google Play. It is designed around Android App Bundles and has extra native integration; it is not needed for the initial CDN-backed build. On iOS, use the same app-managed downloads initially so both platforms share the media-pack behavior.

## Cross-device sync direction

Keep local data usable without an account or network. Add sync as a separate layer that exchanges versioned progress records rather than making learning screens depend on a remote database. The first sync release should offer explicit sign-in, upload, and restore. Automatic background sync can follow after conflict behavior is settled.

The current progress format is a snapshot (cards, daily totals, bookmarks, and typing rounds). A naive last-write-wins merge can lose FSRS reviews when two devices learn offline. Before enabling automatic bidirectional sync, add stable IDs and timestamps to review events, merge those events, then derive each card's FSRS state in event order. Merge daily aggregates by event ID to avoid double counting. Keep settings and bookmarks as independently versioned records, and retain JSON export/import as a user-controlled escape hatch.

## Platform notes

- Shared React code keeps learning behavior consistent across web, iOS, and Android.
- Capacitor plugins are isolated behind small helpers (currently backup export), so platform-specific APIs do not spread into learning screens.
- Keep app-specific changes in `capacitor.config.ts`, `ios/`, `android/`, and small `src/lib/` adapters. Avoid forking the learning UI by platform unless a real platform limitation requires it.
- Check the native projects into version control so signing, app identifiers, permissions, and future store configuration can be reviewed.
