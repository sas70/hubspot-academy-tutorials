// Description: This script will get all companies in your HubSpot account

const hubspot = require("@hubspot/api-client");
require("dotenv").config();

// read the private app access token from the environment variable PRIVATE_APP_ACCESS
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

console.log("==========================================");

url =
  "https://api.hubapi.com/crm/v3/objects/companies?limit=10&properties=domain%2Cname%2Cstate&archived=false";

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

// new code

//   const hubspot = require('@hubspot/api-client');

// const hubspotClient = new hubspot.Client({"accessToken":"YOUR_ACCESS_TOKEN"});

// const objectType = "objectType";
// const archived = false;

// try {
//   const apiResponse = await hubspotClient.crm.properties.coreApi.getAll(objectType, archived);
//   console.log(JSON.stringify(apiResponse, null, 2));
// } catch (e) {
//   e.message === 'HTTP request failed'
//     ? console.error(JSON.stringify(e.response, null, 2))
//     : console.error(e)
// }
