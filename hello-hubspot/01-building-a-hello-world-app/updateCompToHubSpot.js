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
firtestoreCollection = "public_companies";

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
  let companies_id_cik = await getCompaniesIdCik(companies_list);
  for (let i = 0; i < companies_id_cik.length; i++) {
    let company = companies_id_cik[i];
    let companyId = company.companyId;
    let cik = company.cik;
    let properties_dict = {
      properties: { cik: cik },
    };
    await updateCompToHubSpot(companyId, properties_dict);
  }
})();

// ----------------------- Functions ----------------------------
// Function - Read the firestore collection "public_companies" into a list of companies' id & cik
async function readFirestore() {
  let companies_list = [];
  let companiesRef = admin.firestore().collection(firtestoreCollection);
  let snapshot = await companiesRef.get();
  snapshot.forEach((doc) => {
    companies_list.push(doc.data());
  });
  console.log(`companies_list.length: ${companies_list.length}`);
  return companies_list;
}

// Function - Get the companies' id & cik from the collection "public_companies"
async function getCompaniesIdCik(companies_list) {
  let companies_id_cik = [];
  for (let i = 0; i < companies_list.length; i++) {
    let company = companies_list[i];
    let companyId = company.companyId;
    let cik = company.cik;
    companies_id_cik.push({ companyId, cik });
  }
  console.log(`companies_id_cik.length: ${companies_id_cik.length}`);
  return companies_id_cik;
}

// Function - Update the properties of one company at a time in HubSpot
async function updateCompToHubSpot(companyId, properties_dict) {
  // update the options.body
  options["body"] = JSON.stringify(properties_dict);

  const url = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`;
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
