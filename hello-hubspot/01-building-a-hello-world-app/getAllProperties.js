// Description: This script will get all properties for a company in your HubSpot account

const fetch = require("node-fetch");
require("dotenv").config();

const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;
// const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

const url = `https://api.hubapi.com/properties/v1/companies/properties`;

const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};
(async () => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      `Hey, Your Request failed: ${response.status} ${response.statusText}`
    );
  }
  const responseData = await response.json();
  if (responseData.status === "error") {
    throw new Error(responseData.message);
  }
  console.log("Great! it worked ", responseData);

  // save two fields (name and label) to a json file

  const fs = require("fs");
  const properties = responseData.map((property) => {
    return {
      name: property.name,
      label: property.label,
    };
  });
  fs.writeFile(
    "companiesPropertiesNameLabel.json",
    JSON.stringify(properties),
    (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully wrote file");
      }
    }
  );
})();
