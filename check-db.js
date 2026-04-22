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
  const snapshot = await db.collection("orders").orderBy("createdAt", "desc").limit(10).get();
  snapshot.forEach(doc => {
     console.log(doc.id, doc.data().customer?.name, doc.data().status, doc.data().createdAt);
  });
}
run();
