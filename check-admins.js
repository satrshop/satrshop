const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL: `https://${projectId}.firebaseio.com`
  });
}

async function checkAdmins() {
  const db = admin.firestore();
  const admins = await db.collection("admins").get();
  console.log(`Found ${admins.size} admins.`);
  admins.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

checkAdmins();
