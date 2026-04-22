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

async function testOrders() {
  const db = admin.firestore();
  const snapshot = await db.collection("orders").limit(1).get();
  const order = snapshot.docs[0].data();
  console.log("Raw order:", order.createdAt);
  console.log("JSON stringified:", JSON.stringify(order.createdAt));
}

testOrders();
