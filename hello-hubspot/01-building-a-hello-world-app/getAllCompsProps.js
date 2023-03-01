// Description: This script will get all properties for a company in your HubSpot account

const fetch = require("node-fetch");
require("dotenv").config();

const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

// read the properties from the json file and create a list of properties to pass to the API
const fs = require("fs");
const properties = JSON.parse(
  fs.readFileSync("companiesPropertiesNameLabel.json", "utf8")
);
const properties_list = properties.map((property) => property.name).join(",");
console.log(properties_list.length);

const url = `https://api.hubapi.com/crm/v3/objects/companies?limit=10&properties=${properties_list}`;

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
  // console log only those properties that are not null
  responseData["results"].forEach((company) => {
    const companyProperties = Object.keys(company.properties);
    companyProperties.forEach((property) => {
      if (company.properties[property] !== null) {
        console.log(property, company); // .properties[property]);
      }
    });
  });
  //
  console.log("Great! it worked ");
})();
