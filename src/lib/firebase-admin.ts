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

    // Super-robust cleaning for the private key
    const formattedKey = privateKey
      .replace(/\\n/g, '\n')      // Fix escaped newlines
      .replace(/"/g, '')         // Remove all double quotes
      .replace(/'/g, '');        // Remove all single quotes

    console.log("🔑 Formatted Key Preview:", formattedKey.substring(0, 30) + "...");

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
