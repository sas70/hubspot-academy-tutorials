// Description: This script will get all contacts in your HubSpot account

const hubspot = require("@hubspot/api-client");
require("dotenv").config();

// read the private app access token from the environment variable PRIVATE_APP_ACCESS
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEV;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

console.log("==========================================");

const contactObj = {
  properties: {
    firstname: "John",
    lastname: "Monroe",
  },
};
const companyObj = {
  properties: {
    domain: "Walmart.com",
    name: "Walamrt Stores Inc.",
  },
};
// get a function that will create a contact & company
async function createContactAndCompany() {
  const createContactResponse =
    await hubspotClient.crm.contacts.basicApi.create(contactObj);
  const createCompanyResponse =
    await hubspotClient.crm.companies.basicApi.create(companyObj);
  await hubspotClient.crm.companies.associationsApi.create(
    createCompanyResponse.id,
    "contacts",
    createContactResponse.id,
    [
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: AssociationTypes.companyToContact,
        // AssociationTypes contains the most popular HubSpot defined association types
      },
    ]
  );
}
// call an async function
createContactAndCompany();
console.log("==========================================");


// To create an association type through the API, make a POST request to /crm/v4/associations/{fromObjectType}/{toObjectType}/labels.

