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
let properties_dict = {};

// Iterate thru the companies' id & cik to call the function updateCompToHubSpot
(async () => {
  let companies_list = await readFirestore();
  for (let company of companies_list) {
    let companyId = company["companyId"];

    let cik = company["cik"];
    if (cik == "0000000000") {
      continue;
    }
    let new_properties_dict = await propsToChange(company);
    await updateCompToHubSpot(new_properties_dict, companyId);
  }
})();

// ----------------------- Functions ----------------------------

// Function - Prepare the properties to update in HubSpot
async function propsToChange(company) {
  let cik = company["cik"];
  let ticker = company["ticker"];
  let sicNumber = company["sicNumber"];
  let sicLabel = company["sicLabel"];
  let FYE = company["FYE"];
  let businessFullAddress = company["businessFullAddress"];
  let companyId = company["companyId"];

  // create the fields_dict
  // {
  //   "properties":
  //     [
  //       {"property": "firstname", "value": "Derek" },
  //       {"property": "lastname","value": "Gervais"},
  //       {"property": "nps_flag","value": "True"}
  //     ]
  //   }
  // properties_dict = {
  //   FYE: FYE,
  //   "Street Address": businessFullAddress,
  //   CIK: cik,
  //   SIC_Label: sicLabel,
  //   SIC_Number: sicNumber,
  //   Ticker: ticker,
  //   companyId: companyId,
  // };

  // "properties": [
  //   {
  //     "name": "event_id",
  //     "label": "Event Id",
  //     "type": "number",
  //     "fieldType": "number",
  //     "isPrimaryDisplayLabel": true,
  //     "hasUniqueValue": true
  //   },
  //   {
  //     "name": "event_name",

  // "properties": {
  //   "hs_analytics_last_url": {
  //     "value": ""
  //   },
  //   "lead_source": {
  //     "value": "DiscoverOrg"
  //   },

  const properties_dict2 = {
    FYE: { value: FYE },
    "Street Address": { value: businessFullAddress },
    CIK: { value: cik },
    SIC_Label: { value: sicLabel },
    SIC_Number: { value: sicNumber },
    Ticker: { value: ticker },
    companyId: { value: companyId },
  };

  const new_properties_dict = {
    inputs: [
      {
        id: companyId,
        properties: {
          FYE: FYE,
          "Street Address": businessFullAddress,
          CIK: cik,
          SIC_Label: sicLabel,
          SIC_Number: sicNumber,
          Ticker: ticker,
          companyId: companyId,
        },
      },
    ],
  };

  // const properties_list = [
  //   { name: "FYE", label: FYE },
  //   { name: "Street Address", label: businessFullAddress },
  //   { name: "CIK", label: cik },
  //   { name: "SIC_Label", label: sicLabel },
  //   { name: "SIC_Number", label: sicNumber },
  //   { name: "Ticker", label: ticker },
  //   { name: "companyId", label: companyId },
  // ];

  // properties_dict = { properties: properties_list };
  // const output = { "properties": properties };

  // convert the properties_dict to JSON format
  return new_properties_dict;
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
async function updateCompToHubSpot(new_properties_dict, companyId) {
  // let hs_companyId = properties_dict["companyId"];
  // properties_dict = JSON.stringify(properties_dict);
  // const url = `https://api.hubapi.com/crm/v3/objects/companies/`;
  const url = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`;
  //
  // body_value = {};
  // body_value = { properties: properties_dict };
  // console.log(properties_list);

  let inputs = [
    {
      id: "10060321910",
      properties: {
        // FYE: "1231",
        // "Street Address": "25 FIRST STREET, 2ND FLOOR",
        CIK: "0001404655",
        SIC_Label: "SERVICES-PREPACKAGED SOFTWARE",
        SIC_Number: "7372",
        Ticker: "HUBS",
      },
    },
    {
      id: "10060329494",
      properties: {
        // FYE: "1031",
        // "Street Address": "25 FIRST STREET, 2ND FLOOR",
        CIK: "0001111111",
        SIC_Label: "SERVICES-PREPACKAGED SOFTWARE",
        SIC_Number: "7372",
        Ticker: "HUBS",
      },
    },
  ];

  let options = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: inputs,
  };

  console.log(options);
  let responseData;
  const response = await fetch(url, options);

  if (!response.ok) {
    console.log(response);
  }
  responseData = response.json();
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
