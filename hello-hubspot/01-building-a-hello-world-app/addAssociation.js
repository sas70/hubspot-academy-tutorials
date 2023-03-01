// Description: This script will create a contact and a company, then associate them together.

const hubspot = require("@hubspot/api-client");
const fetch = require("node-fetch");
require("dotenv").config();

const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEV;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

const contactObj = {
  properties: {
    firstname: "David44",
    lastname: "Copperfield44",
  },
};
const companyObj = {
  properties: {
    domain: "PETSMART44.com",
    name: "PetSmart Stores In44.",
  },
};

async function createContactAndCompany() {
  const createContactResponse =
    await hubspotClient.crm.contacts.basicApi.create(contactObj);
  const createCompanyResponse =
    await hubspotClient.crm.companies.basicApi.create(companyObj);

  return {
    createContactResponse,
    createCompanyResponse,
  };
}

(async () => {
  const { createContactResponse, createCompanyResponse } =
    await createContactAndCompany();

  const contactId = createContactResponse.id;
  const companyId = createCompanyResponse.id;

  const url = `https://api.hubapi.com/crm/v3/associations/Contacts/Companies/batch/create`;

  ///request body
  request_body = {
    inputs: [
      {
        from: {
          id: contactId,
        },
        to: {
          id: companyId,
        },
        type: "contact_to_company",
      },
    ],
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: request_body ? JSON.stringify(request_body) : null,
  };

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
  console.log(responseData);
})();

// new code from the docs:
