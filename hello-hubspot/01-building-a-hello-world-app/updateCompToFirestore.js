// Description: This script updates some properties of one company in HubSpot

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
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEC;

// create the options
const options = {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};

// ----------------------- Main ----------------------------
let companyId = "xxxxxxx";
properties_dict = {
  name: "newName",
  state: "XY",
}(
  // start the async function to get the properties from HubSpot for one company at a time
  async () => {
    const url = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?limit=10&properties=${properties_dict}`;

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

    let properties_count = Object.keys(responseData.properties).length;
    let hs_companyId = responseData.id;
    if (hs_companyId !== companyId) {
      throw new Error(
        `Hey, the company ID retrieved from HubSpot ${hs_companyId} does not match the provided company ID ${companyId}`
      );
    }

    console.log(
      `Great! it worked and there are ${properties_count} properties for this company named ${responseData.properties.name}`
    );

    // delete all null properties & those that start with "hs_analytics"
    nonNull_properties = await deleteNullProperties(companyId, responseData);

    // save the properties to Firestore
    await saveToFirestore(nonNull_properties);
  }
)();

// ----------------------- Functions ----------------------------

// Function to process the 2 json files & return the 2 lists of properties & companies
async function getLists() {
  // read the properties from the json file and create a list of properties to pass to the API
  const properties = JSON.parse(
    fs.readFileSync("companiesPropertiesNameLabel.json", "utf8")
  );
  const properties_list = properties.map((property) => property.name).join(",");

  // Get the company ID from the json file "simple_companies.json" and save it to a list
  const companies = JSON.parse(
    fs.readFileSync("simple_companies.json", "utf8")
  );
  const companies_list = companies.map((company) => company.id);
  console.log("size of the companies_list is  --- ", companies_list.length);

  return { properties_list, companies_list };
}

// function to delete all null properties & those that start with "hs_analytics"
async function deleteNullProperties(companyId, responseData) {
  let nonNull_properties = responseData.properties;
  for (let key in responseData.properties) {
    if (
      responseData.properties[key] === null ||
      key.startsWith("hs_analytics")
    ) {
      delete nonNull_properties[key];
    }
  }
  nonNull_properties["companyId"] = companyId;
  properties_count = Object.keys(nonNull_properties).length;
  console.log(
    `There are ${properties_count} non-null properties for this company named ${nonNull_properties.name}`
  );
  return nonNull_properties;
}

// Function to save the properties to Firestore
async function saveToFirestore(nonNull_properties) {
  let companyName = nonNull_properties.name;
  // replace the spaces with "_"
  companyName = companyName.replace(/\s/g, "_");
  // Keep only the first 2 words
  companyName = companyName.split("_").slice(0, 2).join("_");

  let docID = companyName + "_" + nonNull_properties.companyId;
  const db = admin.firestore();
  const docRef = db.collection(firtestoreCollection).doc(`${docID}`);
  docRef.set(nonNull_properties);
}
