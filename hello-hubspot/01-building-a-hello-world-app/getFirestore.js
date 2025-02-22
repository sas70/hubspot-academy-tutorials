// Description: The code initializes the Firebase Admin SDK, imports the necessary modules, and defines a list of companies. It then fetches data from Firestore, counts the number of public companies and creates a list of their names, gets a dictionary of companies' names and IDs from Firestore, merges this dictionary with the list of companies and assigns names and CIKs to each ID. The script then writes the resulting dictionary to a Firestore collection.

// Initialize the Firebase Admin SDK for backend access to Firestore
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get a reference to the Firestore database
const db = admin.firestore();

// define the collections
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
// companies_original is a dictionary of public companies' names and IDs
const companies_original = {
  "A10 Networks": "0001580808",
  Affirm: "0001820953",
  "Arthur J. Gallagher & Co.": "0000354190",
  "Bill.com": "0001786352",
  // "Cadence Bank": "0000764564", Holding
  Clarivate: "0001764046",
  "Dover Corporation": "0000029905",
  Dropbox: "0001467623",
  Globalpayments: "0001123360",
  "Houghton Mifflin Harcourt": "0001580156",
  "Hubspot, Inc.": "0001404655",
  K12: "0001101215",
  Navient: "0001593538",
  // Newegg: "0001474627", // foreign issuer
  "NextEra Energy, Inc.": "0000753308",
  "Northern Trust Corporation": "0000073124",
  "Otis Elevator Company": "0001781335",
  "Procore Technologies, Inc": "0001611052",
  "R1 RCM": "0001910851",
  "The Greenbrier Companies": "0000923120",
  "Twist Bioscience": "0001581280",
  "US Bank": "0000036104",
  Udemy: "0001607939",
  Zuora: "0001423774",
};

// convert the companies dictionary to lower case
const companies = {};
for (const [key, value] of Object.entries(companies_original)) {
  companies[key.toLowerCase()] = value;
}

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

  let companies_id = await getCompaniesId(myGlobalObject.data);
  let companies_id_name_cik = await mergeObjects(companies_id, companies);

  // Delete the existing collection
  const batchSize = 10;
  collectionName = cik_firestoreCollection;
  await deleteCollection(collectionName, batchSize);
  console.log(`The Collection {} was deleted successfully`, collectionName);

  // Write the new collection
  collectionName = cik_firestoreCollection;
  await writeCompaniesIdNameCik(collectionName, companies_id_name_cik);
})();

console.log("3- len ....", Object.keys(companies).length); // Output: 24

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
  for (let [key, value] of Object.entries(companies_id)) {
    // if companies[key] is undefined, then set it to "0000000000"
    key = key.toLowerCase();
    if (companies[key] === undefined) {
      companies[key] = "0000000000";
    }

    companies_id_name_cik[value] = {
      name: key,
      cik: companies[key],
      companyId: value,
    };
  }

  return companies_id_name_cik;
}

// Function - write companies_id_name_cik to a Firestore collection
async function writeCompaniesIdNameCik(collectionName, myDict) {
  const collectionRef = db.collection(collectionName);
  Object.values(myDict).forEach((docData) => {
    const docId = docData.companyId;
    const newDocRef = collectionRef.doc(docId);
    newDocRef
      .set(docData)
      .then(() => {
        console.log(`Document with ID ${docId} added successfully`);
      })
      .catch((error) => {
        console.error(`Error adding document ID  ${docId} : `, error);
      });
  });

  console.log("companies_id_name_cik written to Firestore");
}

// Function to delete a Firestore collection
async function deleteCollection(collectionName, batchSize) {
  const collectionRef = admin.firestore().collection(collectionName);
  const query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve, reject);
  });
}

// Helper function to delete a batch of documents in a collection
async function deleteQueryBatch(query, batchSize, resolve, reject) {
  query
    .get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size == 0) {
        return 0;
      }

      // Delete documents in a batch
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next batch
      process.nextTick(() => {
        deleteQueryBatch(query, batchSize, resolve, reject);
      });
    })
    .catch(reject);
}
