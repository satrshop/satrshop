import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      console.error("❌ Missing Firebase Admin Credentials:", { 
        hasEmail: !!clientEmail, 
        hasKey: !!privateKey, 
        hasProjectId: !!projectId 
      });
      throw new Error("Missing Firebase Admin / Google Cloud Credentials");
    }

    // Clean the private key from potential extra quotes and fix newlines
    const formattedKey = privateKey
      .replace(/^['"]|['"]$/g, '') // Remove leading/trailing quotes
      .replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedKey,
      }),
      databaseURL: `https://${projectId}.firebaseio.com`
    });
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    throw error; // Re-throw to fail the build loudly with the error message
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
