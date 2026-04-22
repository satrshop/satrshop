import { NextResponse } from "next/server";
import { google } from "googleapis";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken.email) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    // 2. Authorize Request (Check if admin is active)
    const adminDocs = await adminDb.collection("admins").where("email", "==", decodedToken.email).get();
    if (adminDocs.empty) {
      return NextResponse.json({ error: "Forbidden - Not an admin" }, { status: 403 });
    }
    
    const adminData = adminDocs.docs[0].data();
    if (adminData.status !== "active") {
      return NextResponse.json({ error: "Forbidden - Admin account is inactive" }, { status: 403 });
    }

    const { title, headers, data } = await req.json();

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
      console.error("Missing Google Config");
      return NextResponse.json({ error: "Missing Google Cloud Credentials or Sheet ID" }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Get existing sheets (tabs) in the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets || [];
    
    // Check if a sheet with this title already exists
    const sheetExists = existingSheets.find(s => s.properties?.title === title);

    if (!sheetExists) {
      // Create new sheet tab
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: title,
                }
              }
            }
          ]
        }
      });
    } else {
      // Clear the existing sheet tab if it exists to overwrite fresh data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `'${title}'!A:Z`,
      });
    }

    // 2. Prepare the data array (header + rows)
    const headerRow = headers.map((h: { label: string }) => h.label);
    const rows = data.map((item: Record<string, unknown>) => {
      return headers.map((h: { key: string }) => {
        return h.key.split('.').reduce((obj: Record<string, unknown>, key: string) => (obj?.[key] as Record<string, unknown>), item) ?? '';
      });
    });

    const values = [headerRow, ...rows];

    // 3. Insert data to the specific tab
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${title}'!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    // Refetch to get the ID of the new or existing sheet
    const finalSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const finalSheet = finalSpreadsheet.data.sheets?.find(s => s.properties?.title === title);
    const targetGid = finalSheet?.properties?.sheetId || 0;

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}#gid=${targetGid}`;

    return NextResponse.json({ success: true, url: spreadsheetUrl });
  } catch (error: unknown) {
    console.error("Error updating Google Sheet:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
