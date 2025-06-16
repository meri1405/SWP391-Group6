import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

let firebaseConfig = null;
let firebaseApp = null;
let auth = null;
let otpSentTime = null; // Track when OTP was sent
const OTP_EXPIRE_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds

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
    
    // Clear existing reCAPTCHA if any
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (clearError) {
        console.log('Error clearing existing reCAPTCHA:', clearError);
      }
      window.recaptchaVerifier = null;
    }
    
    // Clear the container content to avoid conflicts
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
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
        formattedPhoneNumber = '+84' + formattedPhoneNumber;      }
    }

    // Always cleanup before setting up new reCAPTCHA
    cleanupRecaptcha();
    
    // Setup reCAPTCHA - always recreate to avoid conflicts
    // Add delay and multiple attempts to ensure DOM is ready
    let setupAttempts = 0;
    const maxAttempts = 3;
    
    while (setupAttempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 150 * (setupAttempts + 1)));
        setupRecaptcha('recaptcha-container');
        break; // Success, exit loop
      } catch (setupError) {
        setupAttempts++;
        console.log(`reCAPTCHA setup attempt ${setupAttempts} failed:`, setupError);
        if (setupAttempts >= maxAttempts) {
          throw setupError;
        }
        // Clean up before retry
        cleanupRecaptcha();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const appVerifier = window.recaptchaVerifier;

    const confirmationResult = await signInWithPhoneNumber(
      auth, 
      formattedPhoneNumber, 
      appVerifier
    );

    // Track when OTP was sent
    otpSentTime = Date.now();    
    console.log('OTP sent successfully');
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Complete cleanup on error
    cleanupRecaptcha();
    
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
    
    // Clear OTP timestamp after successful verification
    otpSentTime = null;
    
    console.log('OTP verified successfully');
    return {
      user,
      idToken,
      phoneNumber: user.phoneNumber
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    // Check if OTP has expired (only after Firebase error)
    if (isOTPExpired()) {
      throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }
    
    // Handle different Firebase error codes
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Mã OTP không đúng. Vui lòng kiểm tra lại.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    } else if (error.code === 'auth/credential-already-in-use') {
      throw new Error('Mã OTP này đã được sử dụng. Vui lòng yêu cầu mã mới.');
    }
    
    throw error;
  }
};

// Check if OTP has expired (2 minutes)
export const isOTPExpired = () => {
  if (!otpSentTime) return false;
  const currentTime = Date.now();
  return (currentTime - otpSentTime) > OTP_EXPIRE_TIME;
};

// Get remaining time for OTP in seconds
export const getOTPRemainingTime = () => {
  if (!otpSentTime) return 0;
  const currentTime = Date.now();
  const elapsedTime = currentTime - otpSentTime;
  const remainingTime = Math.max(0, OTP_EXPIRE_TIME - elapsedTime);
  return Math.ceil(remainingTime / 1000); // Return in seconds
};

// Reset OTP timer
export const resetOTPTimer = () => {
  otpSentTime = null;
};

// Cleanup reCAPTCHA
export const cleanupRecaptcha = () => {
  // Clear verifier first
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (error) {
      console.log('Error clearing reCAPTCHA verifier:', error);
    }
    window.recaptchaVerifier = null;
  }
  
  // Clear the container content
  const container = document.getElementById('recaptcha-container');
  if (container) {
    container.innerHTML = '';
  }
  
  // Clear any global reCAPTCHA state
  if (window.grecaptcha) {
    try {
      const widgets = document.querySelectorAll('.grecaptcha-badge');
      widgets.forEach(widget => {
        try {
          widget.remove();
        } catch (e) {
          console.log('Error removing reCAPTCHA widget:', e);
        }
      });
    } catch (error) {
      console.log('Error cleaning up reCAPTCHA widgets:', error);
    }
  }
  
  // Also reset OTP timer when cleaning up
  otpSentTime = null;
};

// Check if we can retry OTP input (not expired and not used)
export const canRetryOTP = () => {
  return !isOTPExpired();
};

// Reset OTP error state for retry
export const resetOTPError = () => {
  // This function can be used to reset any internal error states
  // Currently just a placeholder for future error state management
  console.log('OTP error state reset for retry');
};

export { initializeFirebase, auth };
export default firebaseApp;
