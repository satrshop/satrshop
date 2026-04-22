require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection("orders").get();
  const batch = db.batch();
  let count = 0;
  snapshot.forEach(doc => {
     const data = doc.data();
     if (data.createdAt && data.createdAt._methodName === "serverTimestamp") {
       console.log("Deleting bad order:", doc.id);
       batch.delete(doc.ref);
       count++;
     }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Deleted ${count} bad orders.`);
  } else {
    console.log("No bad orders found.");
  }
}
run();
