import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      throw new Error("Missing Firebase Admin / Google Cloud Credentials");
    }

    // --- هذا هو التعديل السحري ---
    // هذه الطريقة تعالج كل السيناريوهات: سواء جاء المفتاح بـ \n كنص،
    // أو جاء محاطاً بعلامات تنصيص إضافية، أو جاء مقطوعاً بمسافات.
    privateKey = privateKey
      .replace(/\\n/g, '\n') // تحويل النص \n إلى سطر جديد فعلي
      .replace(/^"|"$/g, '') // إزالة علامات التنصيص من البداية والنهاية إذا وُجدت
      .trim(); // إزالة أي مسافات فارغة زائدة

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
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