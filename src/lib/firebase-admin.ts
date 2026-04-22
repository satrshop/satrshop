import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      throw new Error("Missing Firebase Admin / Google Cloud Credentials in .env.local");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL: `https://${projectId}.firebaseio.com`
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Firebase Admin initialization error", error);
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
