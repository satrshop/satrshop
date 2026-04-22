const admin = require("firebase-admin");
const serviceAccount = require("./firebase.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function check() {
  try {
    const snapshot = await db.collection("orders")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    
    console.log("Latest orders in Firestore:");
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt ? data.createdAt.toDate().toISOString() : "No date";
      console.log(`- ID: ${doc.id}, Name: ${data.customer.name}, Total: ${data.total}, Date: ${date}, Status: ${data.status}`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
