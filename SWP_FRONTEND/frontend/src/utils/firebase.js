import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

let firebaseConfig = null;
let firebaseApp = null;
let auth = null;

// Fetch Firebase config from backend
const initializeFirebase = async () => {
  try {
    if (firebaseApp) return firebaseApp; // Already initialized
    
    const response = await fetch('http://localhost:8080/api/auth/firebase-config');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config');
    }
    
    firebaseConfig = await response.json();
    
    const config = {
      apiKey: firebaseConfig.webApiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId
    };

    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);
    
    console.log('Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Setup reCAPTCHA for phone authentication
export const setupRecaptcha = (containerId) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
    
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    throw error;
  }
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    await initializeFirebase();
    
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    // Format phone number for Firebase (ensure it starts with +84)
    let formattedPhoneNumber = phoneNumber;
    if (!formattedPhoneNumber.startsWith('+84')) {
      if (formattedPhoneNumber.startsWith('0')) {
        formattedPhoneNumber = '+84' + formattedPhoneNumber.substring(1);
      } else {
        formattedPhoneNumber = '+84' + formattedPhoneNumber;
      }
    }

    // Setup reCAPTCHA if not already done
    if (!window.recaptchaVerifier) {
      setupRecaptcha('recaptcha-container');
    }

    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(
      auth, 
      formattedPhoneNumber, 
      appVerifier
    );

    console.log('OTP sent successfully');
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    throw error;
  }
};

// Verify OTP and get Firebase ID token
export const verifyOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    
    // Get Firebase ID token
    const idToken = await user.getIdToken();
    
    console.log('OTP verified successfully');
    return {
      user,
      idToken,
      phoneNumber: user.phoneNumber
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Cleanup reCAPTCHA
export const cleanupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};

export { initializeFirebase, auth };
export default firebaseApp;
