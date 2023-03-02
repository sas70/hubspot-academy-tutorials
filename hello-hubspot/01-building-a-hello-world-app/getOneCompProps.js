const fetch = require("node-fetch");
require("dotenv").config();
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

// read the properties from the json file and create a list of properties to pass to the API
const fs = require("fs");
const properties = JSON.parse(
  fs.readFileSync("companiesPropertiesNameLabel.json", "utf8")
);
const properties_list = properties.map((property) => property.name).join(",");

const companyId = "10060298063";
const url = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?limit=10&properties=${properties_list}`;

const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};

let responseData; // declare variable here

(async () => {
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
  nonNull_properties = await deleteNullProperties(companyId);

  // save the properties to Firestore
  await saveToFirestore(nonNull_properties);
})();

// function to delete all null properties & those that start with "hs_analytics"
async function deleteNullProperties(companyId) {
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
  console.log(nonNull_properties);
  return nonNull_properties;
}

// Function to save the properties to Firestore
async function saveToFirestore(nonNull_properties) {
  const admin = require("firebase-admin");
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  let docID = nonNull_properties.name + "_" + nonNull_properties.companyId;
  const db = admin.firestore();
  const docRef = db.collection("hubSpot_companies").doc(`${docID}`);
  docRef.set(nonNull_properties);
}
