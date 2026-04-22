const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
  databaseURL: `https://${projectId}.firebaseio.com`
});

async function test() {
  try {
    const db = admin.firestore();
    const snap = await db.collection("products").limit(1).get();
    console.log("Success! Found", snap.size, "products.");
  } catch (e) {
    console.error("Firebase Admin Error:", e);
  }
}

test();
