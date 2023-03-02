// Description: This script will get all properties for a certain number (companies_max) of  companies in your HubSpot account

const fetch = require("node-fetch");
require("dotenv").config();
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;
companies_count = 0;
const companies_max = 1;

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
    if (companies_count === companies_max) {
      return;
    } else {
      const companyProperties = Object.keys(company.properties);
      companyProperties.forEach((property) => {
        if (company.properties[property] !== null) {
          console.log(property, company); //
        }
      });
      companies_count++;
    }
  });

  //
  console.log(`Great! it worked and I printed ${companies_count} companies`);
})();
