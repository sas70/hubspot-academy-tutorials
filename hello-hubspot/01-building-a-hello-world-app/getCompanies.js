// Description: This script will get all companies in your HubSpot account

const hubspot = require("@hubspot/api-client");
require("dotenv").config();

// read the private app access token from the environment variable PRIVATE_APP_ACCESS
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEV;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

console.log("==========================================");

const allCompanies = hubspotClient.crm.companies
  .getAll()
  .then((results) => {
    console.log(results);
    console.log(
      "There are " + results.length + " companies in your HubSpot account"
    );
  })
  .catch((err) => {
    console.error(err.message);
  });