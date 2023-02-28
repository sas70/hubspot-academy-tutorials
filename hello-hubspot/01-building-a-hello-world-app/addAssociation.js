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
}

// call an async function
createContactAndCompany();
console.log("==========================================");

const objectType = "contact";
const objectId = createContactResponse.id;
const toObjectType = "company";
const toObjectId = createCompanyResponse.id;

const url = `/crm/v4/objects/${objectType}/${objectId}/associations/${toObjectType}/${toObjectId}`;

const data = {
  category: "CUSTOM", // replace with your desired category
  typeId: "789", // replace with the type ID of the association you want to create
};

const options = {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify(data),
};

fetch(url, options)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
