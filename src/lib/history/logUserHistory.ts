import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

const logUserHistory = (userId: string, companyId: string) => {
  const userHistoryRef = db.collection("user_history").doc(userId);

  userHistoryRef.set(
    {
      [companyId]: {
        last_visited: new Date(),
      },
    },
    { merge: true }
  );
};

export default logUserHistory;
