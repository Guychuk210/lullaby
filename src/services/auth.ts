import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string,
  phoneNumber?: string
): Promise<User> => {
  console.log('registerUser: Starting registration process for email:', email);
  try {
    console.log('registerUser: Creating user with Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('registerUser: Firebase Auth successful, user ID:', user.uid);
    
    // Update profile with display name
    console.log('registerUser: Updating profile with display name...');
    await updateProfile(user, { displayName });
    console.log('registerUser: Profile updated successfully');
    
    // Create user document in Firestore
    console.log('registerUser: Preparing to create Firestore document...');
    const userDoc = {
      id: user.uid,
      email: user.email,
      displayName,
      phoneNumber: phoneNumber || '',
      hasActiveSubscription: false, // Default is false until they subscribe
      createdAt: serverTimestamp(),
    };
    
    console.log('registerUser: User document to create:', { ...userDoc, createdAt: 'serverTimestamp()' });
    console.log('registerUser: Creating document at path: users/' + user.uid);
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log('registerUser: Firestore document created successfully!');
    
    // Verify the document was created
    console.log('registerUser: Verifying document creation...');
    const verifyDoc = await getDoc(doc(db, 'users', user.uid));
    console.log('registerUser: Document verification - exists:', verifyDoc.exists());
    if (verifyDoc.exists()) {
      console.log('registerUser: Verified document data:', verifyDoc.data());
    }
    
    // Return user data with timestamp converted to number for local use
    const returnData = {
      ...userDoc,
      createdAt: Date.now(), // Use current timestamp for local object
    } as User;
    
    console.log('registerUser: Returning user data:', returnData);
    return returnData;
  } catch (error) {
    console.error('registerUser: Error during registration:', error);
    throw error;
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user data from Firestore
export const getCurrentUserData = async (userId: string): Promise<User | null> => {
  console.log('Getting user data from Firestore for user ID:', userId);
  try {
    const userDocRef = doc(db, 'users', userId);
    console.log('Firestore document path:', userDocRef.path);
    
    const userDoc = await getDoc(userDocRef);
    console.log('Document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      console.log('User data retrieved from Firestore:', userData);
      return userData;
    }
    console.log('No user document found in Firestore');
    return null;
  } catch (error) {
    console.error('Error getting user data from Firestore:', error);
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update user profile data
export const updateUserProfile = async (
  userId: string,
  data: { deviceId?: string; phoneNumber?: string }
): Promise<void> => {
  try {
    // Get reference to the user document
    const userDocRef = doc(db, 'users', userId);
    
    // Update only the provided fields
    await setDoc(userDocRef, data, { merge: true });
    
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
