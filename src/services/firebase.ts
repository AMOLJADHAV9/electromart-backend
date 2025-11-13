import * as admin from 'firebase-admin';
import { firebaseConfig } from '../config/index';

const isDebug = process.env.NODE_ENV !== 'production';
const debugLog = (...args: unknown[]) => {
  if (isDebug) {
    console.log('[Firebase]', ...args);
  }
};

// Initialize Firebase Admin SDK
let app: admin.app.App | null = null;
let isFirebaseConfigured = false;

try {
  debugLog('Checking Firebase configuration...');

  const hasValidCredentials =
    Boolean(firebaseConfig.projectId) &&
    Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
    Boolean(process.env.FIREBASE_PRIVATE_KEY) &&
    !process.env.FIREBASE_CLIENT_EMAIL?.includes('your-project') &&
    !process.env.FIREBASE_PRIVATE_KEY?.includes('...');

  debugLog('Firebase credentials present:', hasValidCredentials);

  if (hasValidCredentials && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      const serviceAccount = require("../config/serviceAccountKey.json");

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
      isFirebaseConfigured = true;
      debugLog('Firebase Admin SDK initialized with service account credentials');
    } catch (error) {
      console.error('Failed to initialize Firebase with service account:', error);
      debugLog('Attempting to initialize Firebase using default credentials');
      try {
        app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId,
        });
        isFirebaseConfigured = true;
        debugLog('Firebase initialized with application default credentials');
      } catch (fallbackError) {
        console.error('Failed to initialize Firebase with default credentials:', fallbackError);
        console.warn('Firebase functionality will be disabled until valid credentials are provided.');
      }
    }
  } else {
    console.warn('Firebase configuration is incomplete. Firebase functionality will be disabled.');
  }
} catch (error) {
  console.error('Unexpected error during Firebase initialization:', error);
  console.warn('Firebase functionality will be disabled.');
}

// Initialize Firestore and Auth only if app is initialized
const db = app ? admin.firestore() : null;
const auth = app ? admin.auth() : null;

debugLog('Firebase initialization summary:', {
  hasApp: Boolean(app),
  hasDb: Boolean(db),
  hasAuth: Boolean(auth),
  isFirebaseConfigured,
});

// Firebase service functions
export const firebaseService = {
  // Get a document by ID
  async getDocument(collectionName: string, docId: string) {
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not available. Firebase is not properly configured.');
    }
    
    try {
      const docRef = db.collection(collectionName).doc(docId);
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error: any) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Get all documents in a collection
  async getCollection(collectionName: string) {
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not available. Firebase is not properly configured.');
    }
    
    try {
      const snapshot = await db.collection(collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error('Error getting collection:', error);
      throw error;
    }
  },

  // Get documents in a collection filtered by userId
  async getCollectionByUserId(collectionName: string, userId: string) {
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not available. Firebase is not properly configured.');
    }
    
    try {
      const snapshot = await db.collection(collectionName)
        .where('userId', '==', userId)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error('Error getting collection by userId:', error);
      throw error;
    }
  },

  // Add a new document to a collection
  async addDocument(collectionName: string, data: any) {
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not available. Firebase is not properly configured.');
    }
    
    try {
      const docRef = await db.collection(collectionName).add(data);
      return { id: docRef.id, ...data };
    } catch (error: any) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  // Update a document
  async updateDocument(collectionName: string, docId: string, data: any) {
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not available. Firebase is not properly configured.');
    }
    
    try {
      await db.collection(collectionName).doc(docId).update(data);
      return { id: docId, ...data };
    } catch (error: any) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(collectionName: string, docId: string) {
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not available. Firebase is not properly configured.');
    }
    
    try {
      await db.collection(collectionName).doc(docId).delete();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Verify Firebase ID token
  async verifyIdToken(idToken: string) {
    // Check if Auth is initialized
    if (!auth) {
      throw new Error('Firebase Auth is not available. Firebase is not properly configured.');
    }
    
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error: any) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  },
  
  // Check if Firebase is properly configured
  isConfigured(): boolean {
    return isFirebaseConfigured && !!app && !!db && !!auth;
  }
};