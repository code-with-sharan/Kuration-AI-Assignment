import admin from "firebase-admin";

const initializeFirebase = () => {
  try {
    let privateKey = process.env.PRIVATE_KEY || "";

    try {
      privateKey = JSON.parse(privateKey);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(
          "Private key is not in JSON format, using as plain string"
        );
      } else {
        // If it's not JSON, use it as is
        console.log("Private key is not in JSON format, using as plain string");
      }
    }

    // Remove any existing quotes from the beginning and end
    privateKey = privateKey.replace(/^['"]|['"]$/g, "");

    // Ensure the key has the correct header and footer if they're missing
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

    // Replace literal \n with actual newlines and clean up any double newlines
    privateKey = privateKey.replace(/\\n/g, "\n").replace(/\n+/g, "\n").trim();

    // Debug log (safely)
    // console.log('Private key format check:', {
    //     hasHeader: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
    //     hasFooter: privateKey.includes('-----END PRIVATE KEY-----'),
    //     containsNewlines: privateKey.includes('\n'),
    //     totalLength: privateKey.length
    // });

    const credentials = {
      type: "service_account",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
      clientEmail: process.env.CLIENT_EMAIL?.trim(),
      privateKey: privateKey,
      private_key_id: "37edc9ce18d737dae158aa4d21793b58354ec785",
      client_id: "111466854328347846006",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-v29ft%40leadenrichmentapp.iam.gserviceaccount.com",
    };

    // Verify all required fields are present
    const missingFields = Object.entries(credentials)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      console.log("Firebase Admin initialized successfully");
    }

    return admin;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Firebase initialization error:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

const firebaseAdmin = initializeFirebase();
export default firebaseAdmin;
