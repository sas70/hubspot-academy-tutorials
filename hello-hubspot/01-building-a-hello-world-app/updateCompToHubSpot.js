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

// create the options
let options = {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
  body: "",
};

// Iterate thru the companies' id & cik to call the function updateCompToHubSpot
(async () => {
  let companies_list = await readFirestore();
  console.log(`companies_list.length: ${companies_list.length} `);
  for (let company of companies_list) {
    let cik = company["cik"];
    if (cik == "0000000000") {
      continue;
    }
    let properties_dict = await propsToChange(company);
    options["body"] = JSON.stringify(properties_dict);

    await updateCompToHubSpot(properties_dict, options);
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

  // create the fields_dict
  properties_dict = {
    FYE: FYE,
    "Street Address": businessFullAddress,
    CIK: cik,
    SIC_Label: sicLabel,
    SIC_Number: sicNumber,
    Ticker: ticker,
    companyId: companyId,
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
async function updateCompToHubSpot(properties_dict, options) {
  let hs_companyId = properties_dict["companyId"];
  const url = `https://api.hubapi.com/crm/v3/objects/companies/${hs_companyId}`;
  console.log(`url: ${url}) `);

  let responseData;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      `Hey, Your Request failed: ${response.status} ${response.statusText}`
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
