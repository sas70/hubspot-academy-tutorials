// Description: This script will get all companies in your HubSpot account

const hubspot = require("@hubspot/api-client");
require("dotenv").config();

// read the private app access token from the environment variable PRIVATE_APP_ACCESS
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

console.log("==========================================");

const allCompanies = hubspotClient.crm.companies
  .getAll()
  .then((results) => {
    console.log(results);
  })
  .catch((err) => {
    console.error(err);
  });
