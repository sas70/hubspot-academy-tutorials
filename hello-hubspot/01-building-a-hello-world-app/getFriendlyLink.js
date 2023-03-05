// Description: get an htm friendly link from the htm filingLink in Firestore "Company_Filings" collection

// Initialize the Firebase Admin SDK for backend access to Firestore
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get a reference to the Firestore database
const db = admin.firestore();

// define the collections
firestoreCollection = "New_Company_Filings";
newFirestoreCollection = "Company_Filings";
let myGlobalObject = {};

const headers = {
  "User-Agent": "support@pmsox.com",
  Accept: "application/json",
  "Content-Type": "application/json",
  Host: "www.sec.gov",
};

// import the required modules
const fetch = require("node-fetch");
require("dotenv").config();
const fs = require("fs");

// const myGlobalObject = {};

// get an IIFE to run the main function
(async () => {
  try {
    // get the data from Firestore
    myGlobalObject.data = await getFromFirestore(firestoreCollection);
    // loop through the data with an async iterator and get the filingLinkHtml
    for (let i = 0; i < myGlobalObject.data.length; i++) {
      const item = myGlobalObject.data[i];
      let status,
        friendlyLink = await getFilingLinkHtml(item);
      // update the object with the filingLinkHtml
      item["friendlyLink"] = friendlyLink;
      // replace the current item with the updated one
      myGlobalObject.data[i] = item;

      if (status) {
        console.log("I am in");
      } else {
        console.log("I could not get in");
      }
    }
    // write the data to Firestore
    await writeToFirestore(newFirestoreCollection, myGlobalObject.data);
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
})();

// ----------------------- End of Main ----------------------------
// Get the data from Firestore and assign it to a global object
async function getFromFirestore(firestoreCollection) {
  const snapshot = await admin
    .firestore()
    .collection(firestoreCollection)
    .get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  myGlobalObject.data = [];
  snapshot.forEach((doc) => {
    myGlobalObject.data.push(doc.data());
  });
  console.log(
    "collection 'Company_Filings' size ---",
    myGlobalObject.data.length
  );
  return myGlobalObject.data;
}

// async function to get the filingLinkHtml
// Use the items in the collection to generate the friendly link as follows:
// https://www.sec.gov/ix?doc=/Archives/edgar/data/1423774/000142377422000067/zuo-20220131.htm

async function getFilingLinkHtml(item) {
  let filingDateNew = item.filingDate.replace(/-/g, "");
  const friendlyLink = `https://www.sec.gov/ix?doc=/Archives/edgar/data/${item.cik}/${item.accessionNumberFull}/${item.ticker}-${filingDateNew}.htm`;

  const response = await fetch(friendlyLink, { headers });
  return response.ok, friendlyLink;
}

// Function - write the  myGlobalObject.data to Firestore
async function writeToFirestore(newFirestoreCollection, myDict) {
  try {
    // loop through the data and write it to Firestore
    for (const item of myDict) {
      await admin
        .firestore()
        .collection(newFirestoreCollection)
        .doc(item.docId)
        .set(item);
    }
  } catch (error) {
    console.log(error);
  }
}

firstItem = {
  filingType: "10-K",
  ticker: "ATEN",
  filingLinkHtml:
    "https://www.sec.gov/ix?doc=/Archives/edgar/data/1580808/000158080817000013/ATEN-2017-02-24.htm",
  aTagCIK: "1580808",
  filingSize: null,
  filingDescription: "Annual report",
  mailingFullAddress: "2300 ORCHARD PKWY, SAN JOSE CA 95131",
  cik: "0001580808",
  filingNumber: "001-3634317634246",
  filingLinkTxt:
    "https://www.sec.gov/Archives/edgar/data/1580808/000158080817000013/0001580808-17-000013.txt",
  title: "A10 Networks, Inc.",
  filingDate: "2017-02-24",
  sicLabel: "COMPUTER COMMUNICATIONS EQUIPMENT",
  companyName: "A10 Networks, Inc.",
  sicNumber: "3576",
  fullCIK: "0001580808",
  FYE: "1231",
  accessionNumberFull: "000158080817000013",
  businessFullAddress: "2300 ORCHARD PKWY, SAN JOSE CA 95131",
  accessionNumberFragments: "0001580808-17-000013",
};
