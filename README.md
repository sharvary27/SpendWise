📱 SpendWise
SpendWise is a modern and intuitive personal expense tracking app built using React Native and Expo. Designed to help users manage their finances better, the app allows you to:

Track expenses and income

Organize finances by creating multiple wallets (e.g., groceries, rent, travel)

Upload receipts with image capture support

Store images efficiently using Cloudinary CDN

🚀 Features
✅ Multi-Wallet Support: Create and manage multiple wallets to organize expenses and income across categories.

📊 Transaction Tracker: Add, edit, and view expense and income entries by category and date.

🧾 Receipt Upload: Capture or upload receipts for each transaction as visual proof.

☁️ Cloudinary Integration: Efficient and fast cloud storage for all uploaded images.

📱 Cross-Platform: Runs on Android, iOS, and Web using Expo Go.

🛠️ Tech Stack
React Native (via Expo Go)

Cloudinary (for image storage)

React Navigation (for routing and navigation)

Expo MediaLibrary & ImagePicker (for image upload)

AsyncStorage / SecureStore (for local data storage)

📦 Getting Started
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/yourusername/spendwise-app.git
cd spendwise-app
2. Install Dependencies
bash
Copy
Edit
npm install
3. Run the App
bash
Copy
Edit
npx expo start
Use the QR code to open in Expo Go on your mobile device

Or press a for Android emulator, i for iOS simulator

📁 Project Structure
bash
Copy
Edit
spendwise-app/
│
├── app/                  # Screens and navigation
├── assets/               # Images, fonts
├── components/           # Reusable UI components
├── constants/            # Color themes, global styles
├── utils/                # Utility functions, Cloudinary config
├── App.js                # Entry point
└── package.json
☁️ Cloudinary Setup
Sign up at Cloudinary

Create a cloud

Save your Cloud name, API key, and API secret

Configure them in your .env file or a secure constants file:

js
Copy
Edit
// utils/cloudinary.js
export const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/<cloud_name>/image/upload';
export const CLOUDINARY_UPLOAD_PRESET = '<upload_preset>';
📸 Receipt Upload Flow
User selects or captures a receipt image

Image is uploaded to Cloudinary

The secure URL is stored with the transaction

On viewing the transaction, image is fetched and displayed

🛡️ Security
No sensitive API keys are exposed in the frontend

All image uploads use unsigned presets

✅ Future Enhancements
Add monthly budget limits per wallet

Export expenses to CSV

Add OCR for extracting data from receipts

Enable authentication with Firebase/Auth0

🙌 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

📚 Learn More
Expo Documentation

Cloudinary Docs

React Native Docs
