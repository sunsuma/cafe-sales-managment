# Cafe Sales Management App

Offline-first café sales manager built with Expo, React Native, TypeScript, Expo Router, Zustand and AsyncStorage. The app has exactly four bottom tabs: Home, Items, Sales and Order History.

## Requirements
- Node.js LTS
- Expo-compatible Android Studio emulator / Android device, or Xcode for iOS

## Install and run
```bash
npm install
npx expo start
```
Use the Expo Go app or an emulator to open the project. For native builds, use the Expo EAS Build workflow appropriate to your Expo SDK.

## Main features
- Local persistent menu and order data (Zustand + AsyncStorage)
- Add/edit/delete menu items; selected images are copied into app document storage
- Create orders with quantity controls and price snapshots
- PAID/PENDING status updates; paid revenue is attributed to `paidAt`
- Dashboard paid-sales totals, pending totals, hourly sales bars and paid-item ranking
- Daily/weekly/monthly report summaries and PDF/CSV sharing
- Searchable order history and order details
- Export/restore local JSON data backup
- INR currency formatting

## Data and privacy
No backend, login, Firebase, Supabase or app API is used. App data is stored locally on the device. AsyncStorage is not cloud backup; export a backup and store it separately. A backup JSON currently includes the menu/order records and their image paths; image files themselves are not bundled into the JSON archive, so move/copy the app's `menu-images` directory separately if you need to preserve item photos across device migrations.

## Important implementation notes
- Paid revenue calculations include only orders with `paymentStatus === 'PAID'` and a `paidAt` timestamp.
- Changing PENDING to PAID stamps `paidAt` at the moment the payment is recorded. Changing PAID back to PENDING clears `paidAt`.
- Historical order lines store item name, image path and unit-price snapshots, so later menu edits do not rewrite prior bills.
- Deleting a menu item does not delete order lines referencing that item.

## Current scope / known limitations
This is a runnable application foundation with working core flows, local persistence, order creation, payment status management, exports and JSON restore. It is not yet a fully audited production release. In particular, native camera capture, report graph rendering inside exported PDFs, a date-range picker in history, bundled image assets in backup archives, robust migrations and automated device-level tests remain to be completed before commercial deployment. Validate on physical Android and iOS devices and run `npm run typecheck` after installing dependencies.
