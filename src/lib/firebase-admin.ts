import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      console.error("❌ Missing Firebase Admin Credentials:", { 
        hasEmail: !!clientEmail, 
        hasKey: !!privateKey, 
        hasProjectId: !!projectId 
      });
      throw new Error("Missing Firebase Admin / Google Cloud Credentials");
    }

    // الحل الجبار: إعادة بناء المفتاح مهما كان شكل المدخلات
    let cleanedKey = privateKey.replace(/\\n/g, '\n').replace(/['"]/g, '').trim();
    
    if (cleanedKey.includes('PRIVATE KEY-----')) {
      const header = "-----BEGIN PRIVATE KEY-----";
      const footer = "-----END PRIVATE KEY-----";
      // استخراج النص اللي بالنص وتنظيفه من أي فراغات أو أسطر قديمة
      const body = cleanedKey
        .replace(header, '')
        .replace(footer, '')
        .replace(/\s+/g, ''); 
      
      // إعادة بناء المفتاح بأسطر حقيقية (كل 64 حرف سطر)
      cleanedKey = `${header}\n${body.match(/.{1,64}/g)?.join('\n')}\n${footer}`;
    }

    console.log("🔑 Key Reconstructed Successfully (First 40 chars):", cleanedKey.substring(0, 40));

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: cleanedKey,
      }),
      databaseURL: `https://${projectId}.firebaseio.com`
    });
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    throw error;
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
