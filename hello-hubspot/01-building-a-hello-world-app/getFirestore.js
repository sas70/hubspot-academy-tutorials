// Description: This script gets data from Firestore and saves it to a CSV file

//Initialize the Firebase Admin SDK
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
firtestoreCollection = "hubSpot_companies";

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

// ----------------------- Main ----------------------------
// Get the data from Firestore and assign it to a global object
const myGlobalObject = {};
(async () => {
  const snapshot = await admin
    .firestore()
    .collection(firtestoreCollection)
    .get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  myGlobalObject.data = [];
  snapshot.forEach((doc) => {
    myGlobalObject.data.push(doc.data());
  });
  console.log(myGlobalObject.data.length);
})();

// ----------------------- End of Main ----------------------------
// count how many companies have is_public = true
let public_companies_count = 0;
public_list = [];
setTimeout(() => {
  for (let i = 0; i < myGlobalObject.data.length; i++) {
    if (myGlobalObject.data[i].is_public === "true") {
      public_companies_count++;
      // append the data to a list of public companies
      public_list.push(myGlobalObject.data[i].name);
    }
  }
  console.log(`public_companies_count: ${public_companies_count}`);
  console.log(`public_list  : ${public_list}`);
}, 5000);
// wait 5 seconds to ensure myGlobalObject.data is assigned

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

// Access the CIK number of a company
console.log(companies["A10 Networks"]); // Output: "0001324433"
