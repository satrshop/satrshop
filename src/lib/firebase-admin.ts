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

    // النسخة النووية للتنظيف
    // 1. فك التشفير من أي أسطر مكسرة أو كوتيشن
    let rawKey = privateKey.replace(/\\n/g, '\n').replace(/['"]/g, '').trim();

    // دعم خاص لفك تشفير الـ Base64 (لحل مشاكل الدوكر نهائياً)
    if (!rawKey.includes('-----')) {
      rawKey = Buffer.from(rawKey, 'base64').toString('utf8');
    }
    
    // 2. استخراج محتوى الـ Base64 فقط (بين BEGIN و END)
    const body = rawKey
      .replace(/-----BEGIN[^-]*-----/g, '')
      .replace(/-----END[^-]*-----/g, '')
      .replace(/\s+/g, ''); 
    
    // 3. إعادة بناء المفتاح بالصيغة القياسية (5 شرطات بالظبط)
    const finalKey = `-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

    console.log("🔑 Key Reconstructed Successfully. Length:", finalKey.length);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: finalKey,
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
