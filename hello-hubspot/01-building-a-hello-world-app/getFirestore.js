// Description: The code initializes the Firebase Admin SDK, imports the necessary modules, and defines a list of companies. It then fetches data from Firestore, counts the number of public companies and creates a list of their names, gets a dictionary of companies' names and IDs from Firestore, merges this dictionary with the list of companies and assigns names and CIKs to each ID. The script then writes the resulting dictionary to a Firestore collection.

//Initialize the Firebase Admin SDK
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
hs_firestoreCollection = "hubSpot_companies";
cik_firestoreCollection = "public_companies";

// import the required modules
const fetch = require("node-fetch");
require("dotenv").config();
const fs = require("fs");
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

// create the options
const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};

const companies = {
  "A10 Networks": "0001324433",
  Affirm: "0001759822",
  "Arthur J. Gallagher & Co.": "0000350797",
  "Bill.com": "0001720760",
  "Cadence Bank": "0000764564",
  Clarivate: "0001755044",
  "Dover Corporation": "0000029905",
  Dropbox: "0001467623",
  Globalpayments: "0001123360",
  "Houghton Mifflin Harcourt": "0001493160",
  "Hubspot, Inc.": "0001408108",
  K12: "0001101215",
  Navient: "0001593538",
  Newegg: "0001490291",
  "NextEra Energy, Inc.": "0000753309",
  "Northern Trust Corporation": "0000073124",
  "Otis Elevator Company": "0001644778",
  "Procore Technologies, Inc": "0001736566",
  "R1 RCM": "0001646203",
  "The Greenbrier Companies": "0000923123",
  "Twist Bioscience": "0001746798",
  "US Bank": "0000036104",
  Udemy: "0001667296",
  Zuora: "0001641641",
};

// ----------------------- Main ----------------------------
// Get the data from Firestore and assign it to a global object
const myGlobalObject = {};
async function getFromFirestore() {
  const snapshot = await admin
    .firestore()
    .collection(hs_firestoreCollection)
    .get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  myGlobalObject.data = [];
  snapshot.forEach((doc) => {
    myGlobalObject.data.push(doc.data());
  });
  console.log("0- all lenght ---", myGlobalObject.data.length);
  return myGlobalObject.data;
}

// ----------------------- End of Main ----------------------------
// count how many companies have is_public = true
let public_companies_count = 0;
public_list = [];
(async () => {
  myGlobalObject.data = await getFromFirestore();
  for (let i = 0; i < myGlobalObject.data.length; i++) {
    if (myGlobalObject.data[i].is_public === "true") {
      public_companies_count++;
      // append the data to a list of public companies
      public_list.push(myGlobalObject.data[i].name);
    }
  }
  console.log(`1- public_companies_count: ${public_companies_count}`);
  // console.log(`2- public_list  : ${public_list}`);

  let companies_id = await getCompaniesId(myGlobalObject.data);
  let companies_id_name_cik = await mergeObjects(companies_id, companies);
  await writeCompaniesIdNameCik(companies_id_name_cik);
})();

// wait 5 seconds to ensure myGlobalObject.data is assigned
// console.log("1- all companies: ", myGlobalObject.data);
// get size of an object
console.log("3- len ....", Object.keys(companies).length); // Output: 24

// Function - Access the CIK number of a company
console.log("4- value...", companies["Zuora"]); // Output: "0001324433"

// get a dict of companies names & id from Firestore
async function getCompaniesId(myData) {
  let companies_id = {};
  for (let i = 0; i < myData.length; i++) {
    companies_id[myData[i].name] = myData[i].companyId;
  }
  return companies_id;
}

// Function - merge the two objects in a new object with the id as the key and the name & cik as the value
async function mergeObjects(companies_id, companies) {
  const companies_id_name_cik = {};
  for (const [key, value] of Object.entries(companies_id)) {
    // if companies[key] is undefined, then set it to "0000000000"
    if (companies[key] === undefined) {
      companies[key] = "0000000000";
    }

    companies_id_name_cik[value] = {
      name: key,
      cik: companies[key],
    };
  }
  console.log("7- companies_id_name_cik ....", companies_id_name_cik);

  return companies_id_name_cik;
}

// Function - write companies_id_name_cik to a Firestore collection
async function writeCompaniesIdNameCik(companies_id_name_cik) {
  const companies_id_name_cik_ref = admin
    .firestore()
    .collection(cik_firestoreCollection);
  for (const [key, value] of Object.entries(companies_id_name_cik)) {
    await companies_id_name_cik_ref.doc(key).set(value);
  }
  console.log("8- companies_id_name_cik written to Firestore");
}
