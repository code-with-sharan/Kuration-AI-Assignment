import firebaseAdmin from "@/lib/firebase/admin/firebase-admin";
import logUserHistory from "@/lib/history/logUserHistory";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const db = getFirestore();

export interface AbstractApiResponse {
  domain: string;
  company_name: string | null;
  description: string | null;
  logo: string | null;
  year_founded: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  country_iso_code: string | null;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  sic_code: string | null;
  naics_code: string | null;
  industry: string | null;
  employee_count: string | null;
  employee_range: string | null;
  annual_revenue: string | null;
  revenue_range: string | null;
  type: string | null;
  ticker: string | null;
  exchange: string | null;
  global_ranking: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  crunchbase_url: string | null;
}

export const POST = async (req: NextRequest) => {
  // Authenticate user
  const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
  const decodedToken = idToken
    ? await firebaseAdmin.auth().verifyIdToken(idToken)
    : null;
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  let domain = body.domain;

  // Remove www. from domain
  if (domain.startsWith("www.")) {
    domain = domain.replace("www.", "");
  }
  //   Validate domain
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/;
  if (!domainRegex.test(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  //   Check if company is already in database
  const companySnapshot = await db
    .collection("searched_companies")
    .where("domain", "==", domain)
    .limit(1)
    .get();

  if (!companySnapshot.empty) {
    // Log to user history
    await logUserHistory(decodedToken.uid, domain);
    // Return from CACHE
    const company = companySnapshot.docs[0].data();
    return NextResponse.json(company);
  }

  //   Fetch company data from enrichment API

  const response: AbstractApiResponse = await fetch(
    `https://companyenrichment.abstractapi.com/v2/?api_key=${process.env.ABSTRACT_API_KEY}&domain=${domain}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  //   If company name is there, then data is valid
  const hasValidData = response.company_name;

  if (!hasValidData) {
    return NextResponse.json(
      { error: "Unable to fetch data for this domain" },
      { status: 400 }
    );
  }

  //   Store data in database
  await logUserHistory(decodedToken.uid, domain);
  await db.collection("searched_companies").add(response);

  return NextResponse.json(response);
};
