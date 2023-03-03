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
