// Description: This script will get all companies in your HubSpot account

const hubspot = require("@hubspot/api-client");
require("dotenv").config();

// read the private app access token from the environment variable PRIVATE_APP_ACCESS
production = false;
json_file = "test_companies.json";
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEV;

if (production == true) {
  ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;
  json_file = "simple_companies.json";
}

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

console.log("==========================================");

url =
  "https://api.hubapi.com/crm/v3/objects/companies?limit=10&properties=domain%2Cname%2Cstate&archived=false";

async function getCompanies() {
  const allCompanies = hubspotClient.crm.companies
    .getAll()
    .then((results) => {
      saveComapnies(results);
      console.log(results);
      console.log(
        "There are " + results.length + " companies in your HubSpot account"
      );
    })
    .catch((err) => {
      console.error(err.message);
    });
}

getCompanies();

// Function to save companies in a JSON file
async function saveComapnies(companies) {
  const fs = require("fs");
  fs.writeFile(json_file, JSON.stringify(companies), (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
  });
}
