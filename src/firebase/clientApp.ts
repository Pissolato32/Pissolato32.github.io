
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";

// Fallback to placeholder strings if environment variables are not set.
// The user MUST provide their actual Firebase config in a .env.local file for Firebase services to work.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN_HERE",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID_HERE",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID_HERE",
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  // Check if we are using placeholder values and warn the user if so.
  if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
    console.warn(
      "Firebase is initialized with placeholder credentials. " +
      "Please create a .env.local file with your actual Firebase project configuration " +
      "for Firebase services (like Authentication) to work correctly."
    );
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

// Initialize Firebase App Check
let appCheck: AppCheck | undefined;
if (typeof window !== 'undefined') { // Ensure App Check is initialized only on the client-side
  const reCaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  if (reCaptchaSiteKey && reCaptchaSiteKey !== "YOUR_RECAPTCHA_V3_SITE_KEY_HERE") {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(reCaptchaSiteKey),
        // Optional: set to true if you want to allow clients without App Check tokens
        // (useful during development and testing, but disable for production)
        isTokenAutoRefreshEnabled: true,
      });
      console.log("Firebase App Check initialized with reCAPTCHA v3.");
    } catch (error) {
      console.error("Error initializing Firebase App Check:", error);
      console.warn(
        "Ensure you have provided a VALID reCAPTCHA v3 site key in your .env.local file " +
        "as NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY. " +
        "The key you might have provided previously (6LeNw1YrAAAAAEKnnAKRaZns6OBo2U0xzVzQsPWt) " +
        "appears to be a reCAPTCHA v2 key and WILL NOT WORK with ReCaptchaV3Provider. " +
        "Also, ensure you have configured App Check in your Firebase project console."
      );
    }
  } else {
    console.warn(
      "Firebase App Check not initialized. " +
      "NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY is missing or is a placeholder in your .env.local file. " +
      "For App Check to work, please provide a valid reCAPTCHA v3 site key and " +
      "configure App Check in your Firebase project console."
    );
  }
}

export { app, auth, appCheck };
