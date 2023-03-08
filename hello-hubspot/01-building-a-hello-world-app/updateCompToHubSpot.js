// Description: This script updates some properties of one company in HubSpot

// import the required modules

const fetch = require("node-fetch");
require("dotenv").config();
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

//Initialize the Firebase Admin SDK
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
firestoreCollection = "public_companies";

// Iterate thru the companies' id & cik to call the function updateCompToHubSpot
(async () => {
  let companies_list = await readFirestore();
  for (let company of companies_list) {
    let cik = company["cik"];
    if (cik == "0000000000") {
      continue;
    }
    let properties_dict = await propsToChange(company);

    await updateCompToHubSpot(properties_dict);
  }
})();
// how to stop the file here

// ----------------------- Functions ----------------------------

// Function - Prepare the properties to update in HubSpot
async function propsToChange(company) {
  let properties_dict = {};
  let cik = company["cik"];
  let ticker = company["ticker"];
  let sicNumber = company["sicNumber"];
  let sicLabel = company["sicLabel"];
  let FYE = company["FYE"];
  let businessFullAddress = company["businessFullAddress"];
  let companyId = company["companyId"];

  let properties_internal_names = {
    fye: "fiscal_year_end_month",
    "street address": "address",
    cik: "cik",
    sic_label: "sic_label",
    sic_number: "sic_number",
    ticker: "ticker",
    companyId: "companyid",
  };

  // create the fields_dict
  properties_dict = {
    [properties_internal_names.fye]: FYE,
    [properties_internal_names["street address"]]: businessFullAddress,
    [properties_internal_names.cik]: cik,
    [properties_internal_names.sic_label]: sicLabel,
    [properties_internal_names.sic_number]: sicNumber,
    [properties_internal_names.ticker]: ticker,
    [properties_internal_names.companyId]: companyId,
  };

  return properties_dict;
}

// Function - Read the firestore collection "public_companies" into a list of companies' id & cik
async function readFirestore() {
  let companies_list = [];
  let companiesRef = admin.firestore().collection(firestoreCollection);
  let snapshot = await companiesRef.get();
  snapshot.forEach((doc) => {
    companies_list.push(doc.data());
  });
  return companies_list;
}

// Function - Update the properties of one company at a time in HubSpot
async function updateCompToHubSpot(properties_dict) {
  // create the options
  let headers = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };

  let hs_companyId = properties_dict["companyid"];
  const url = `https://api.hubapi.com/crm/v3/objects/companies/${hs_companyId}`;
  // const url = `https://api.hubapi.com/crm/v3/objects/companies/`;

  console.log(url);

  let body = { inputs: { id: hs_companyId, properties: properties_dict } };
  // let new_body = JSON.stringify(body);

  console.log(body);
  let responseData;
  const response = await fetch(url, (headers = headers), (body = body));
  if (!response.ok) {
    console.log(response);
    throw new Error(
      `Your Request failed: ${response.status} ${response.statusText} `
    );
  }
  responseData = await response.json();
  if (responseData.status === "error") {
    throw new Error(responseData.message);
  }

  console.log(
    `Great! it worked and here is the response: ${JSON.stringify(
      responseData,
      null,
      2
    )}`
  );
}
