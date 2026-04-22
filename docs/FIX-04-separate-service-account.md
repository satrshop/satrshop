# FIX-04: Creating a Separate Service Account

## Why This Is Important
Currently, the same service account (`satrshop-sheets@...`) is used for both:
- Google Sheets export (needs only Sheets API access)
- Firebase Admin SDK operations (has full Firestore + Auth access)

A compromised Sheets-only key would give an attacker full database access. Separating them limits the blast radius.

## Steps to Create a Dedicated Firebase Admin Service Account

### 1. Go to Google Cloud Console
Navigate to: https://console.cloud.google.com/iam-admin/serviceaccounts

### 2. Select Your Project
Choose `satrshop-8ad70` from the project dropdown.

### 3. Create a New Service Account
- Click **"+ CREATE SERVICE ACCOUNT"**
- **Name**: `satrshop-admin` (or similar)
- **Description**: "Firebase Admin SDK for Satr Shop server-side operations"
- Click **"CREATE AND CONTINUE"**

### 4. Assign Roles
Add these roles:
- `Firebase Admin SDK Administrator Service Agent`
- `Cloud Datastore User` (for Firestore)
- `Firebase Authentication Admin`

Click **"CONTINUE"** → **"DONE"**

### 5. Generate a Key
- Click on the new service account
- Go to the **"KEYS"** tab
- Click **"ADD KEY"** → **"Create new key"** → **JSON**
- Download the key file

### 6. Update Your `.env.local`
Replace the existing credentials with the new service account:

```env
# Dedicated Firebase Admin SDK service account
FIREBASE_ADMIN_CLIENT_EMAIL=satrshop-admin@satrshop-8ad70.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Keep the existing Google Sheets service account separate
GOOGLE_CLIENT_EMAIL=satrshop-sheets@satrshop-8ad70.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="<existing sheets key>"
```

### 7. Update `firebase-admin.ts`
Change the environment variable names:
```typescript
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
```

### 8. Update Google Sheets Export Route
Ensure `src/app/api/export/sheets/route.ts` continues using `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`.

### 9. Deploy and Test
- Test admin login
- Test order placement
- Test Google Sheets export

### 10. Revoke Old Combined Key (Optional)
Once everything works, you can revoke the old key from the Google Cloud Console if desired.
