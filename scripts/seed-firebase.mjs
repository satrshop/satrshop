import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const ALL_PRODUCTS = [
  { name: "هودي المبرمج (Dark Mode)", price: 29.90, image: "/images/img.png", category: "هوديز تقنية", rating: 4.9, isNew: true },
  { name: "تيشرت 'console.log'", price: 14.90, image: "/images/background.png", category: "تيشرتات", rating: 4.7 },
  { name: "سترة المطورين الشتوية", price: 39.90, image: "/images/img.png", category: "جواكيت", rating: 5.0, isNew: true },
  { name: "هودي Python Edition", price: 28.90, image: "/images/background.png", category: "هوديز تقنية", rating: 4.8 },
  { name: "حقيبة ظهر للمبرمجين", price: 19.90, image: "/images/img.png", category: "حقائب", rating: 4.6 },
  { name: "تيشرت 'Bug fixes'", price: 12.90, image: "/images/background.png", category: "تيشرتات", rating: 4.5 },
  { name: "قبعة سطر (كاب)", price: 8.90, image: "/images/img.png", category: "إكسسوارات", rating: 4.8, isNew: true },
  { name: "جاكيت مبطن 'Open Source'", price: 45.00, image: "/images/background.png", category: "جواكيت", rating: 5.0 },
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const productsCol = collection(db, "products");

  console.log("Checking for existing products...");
  const snapshot = await getDocs(productsCol);
  
  if (snapshot.size > 0) {
    console.log(`Found ${snapshot.size} existing products. Cleaning up...`);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, "products", d.id));
    }
    console.log("Cleanup complete.");
  }

  console.log("Seeding products...");
  for (const product of ALL_PRODUCTS) {
    const docRef = await addDoc(productsCol, product);
    console.log(`Added product: ${product.name} (ID: ${docRef.id})`);
  }

  console.log("Seeding finished successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding products:", err);
  process.exit(1);
});
