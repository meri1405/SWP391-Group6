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
    
    console.log('Setting up reCAPTCHA for container:', containerId);
    
    // Ensure complete cleanup first
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        console.log('Existing reCAPTCHA verifier cleared');
      } catch (clearError) {
        console.log('Error clearing existing reCAPTCHA:', clearError);
      }
      window.recaptchaVerifier = null;
    }
    
    // Clear and prepare the container
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }
    
    // Clear everything in the container
    container.innerHTML = '';
    container.removeAttribute('data-sitekey');
    container.removeAttribute('data-callback');
    container.removeAttribute('data-expired-callback');
    
    // Create new reCAPTCHA verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        // Auto cleanup on expiration
        cleanupRecaptcha();
      }
    });
    
    console.log('reCAPTCHA setup completed successfully');
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    // Cleanup on error
    cleanupRecaptcha();
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

    console.log('Sending OTP to:', formattedPhoneNumber);

    // Always cleanup before setting up new reCAPTCHA
    cleanupRecaptcha();
    
    // Wait longer to ensure complete cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Setup reCAPTCHA with multiple attempts and longer delays
    let setupAttempts = 0;
    const maxAttempts = 3;
    
    while (setupAttempts < maxAttempts) {
      try {
        console.log(`reCAPTCHA setup attempt ${setupAttempts + 1}/${maxAttempts}`);
        
        // Wait progressively longer between attempts  
        await new Promise(resolve => setTimeout(resolve, 300 * (setupAttempts + 1)));
        
        setupRecaptcha('recaptcha-container');
        console.log('reCAPTCHA setup successful');
        break; // Success, exit loop
      } catch (setupError) {
        setupAttempts++;
        console.log(`reCAPTCHA setup attempt ${setupAttempts} failed:`, setupError);
        
        if (setupAttempts >= maxAttempts) {
          throw new Error(`Failed to setup reCAPTCHA after ${maxAttempts} attempts: ${setupError.message}`);
        }
        
        // Clean up completely before retry
        cleanupRecaptcha();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      throw new Error('reCAPTCHA verifier not available');
    }

    console.log('Initiating phone sign-in...');
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
    
    // Provide more specific error messages
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Quá nhiều yêu cầu OTP. Vui lòng thử lại sau ít phút.');
    } else if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Số điện thoại không hợp lệ.');
    } else if (error.message && error.message.includes('reCAPTCHA')) {
      throw new Error('Lỗi xác thực reCAPTCHA. Vui lòng thử lại.');
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
  console.log('Starting reCAPTCHA cleanup...');
  
  // Clear verifier first
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      console.log('reCAPTCHA verifier cleared');
    } catch (error) {
      console.log('Error clearing reCAPTCHA verifier:', error);
    }
    window.recaptchaVerifier = null;
  }
  
  // Clear the container content completely
  const container = document.getElementById('recaptcha-container');
  if (container) {
    container.innerHTML = '';
    // Remove any data attributes that might be set by reCAPTCHA
    container.removeAttribute('data-sitekey');
    container.removeAttribute('data-callback');
    container.removeAttribute('data-expired-callback');
    console.log('reCAPTCHA container cleared');
  }
  
  // Remove all reCAPTCHA related elements from DOM
  try {
    // Remove reCAPTCHA widgets
    const widgets = document.querySelectorAll('.grecaptcha-badge, [id^="g-recaptcha-"], iframe[src*="recaptcha"]');
    widgets.forEach(widget => {
      try {
        widget.remove();
        console.log('Removed reCAPTCHA widget:', widget);
      } catch (e) {
        console.log('Error removing reCAPTCHA widget:', e);
      }
    });
    
    // Remove any script tags added by reCAPTCHA
    const scripts = document.querySelectorAll('script[src*="recaptcha"]');
    scripts.forEach(script => {
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (e) {
        console.log('Error removing reCAPTCHA script:', e);
      }
    });
  } catch (error) {
    console.log('Error cleaning up reCAPTCHA DOM elements:', error);
  }
  
  // Reset global reCAPTCHA state
  if (window.grecaptcha) {
    try {
      if (typeof window.grecaptcha.reset === 'function') {
        window.grecaptcha.reset();
      }
    } catch (error) {
      console.log('Error resetting grecaptcha:', error);
    }
  }
  
  // Also reset OTP timer when cleaning up
  otpSentTime = null;
  console.log('reCAPTCHA cleanup completed');
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
