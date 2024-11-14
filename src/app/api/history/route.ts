import firebaseAdmin from "@/lib/firebase/admin/firebase-admin";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
const db = getFirestore();

export const GET = async (req: NextRequest) => {
  // Authenticate user
  const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
  const decodedToken = idToken
    ? await firebaseAdmin.auth().verifyIdToken(idToken)
    : null;
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = db.collection("user_history").doc(decodedToken.uid);
  const historyData = await history.get();

  if (!historyData.exists) {
    return NextResponse.json({ history: {} });
  }

  return NextResponse.json({ history: historyData.data() });
};
