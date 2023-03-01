const hubspot = require("@hubspot/api-client");
const fetch = require("node-fetch");
require("dotenv").config();

const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEV;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

const contactObj = {
  properties: {
    firstname: "David",
    lastname: "Copperfield",
  },
};
const companyObj = {
  properties: {
    domain: "PETSMART.com",
    name: "PetSmart Stores Inc.",
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

  // const contactId = "251";
  // const companyId = "14912563626";

  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}`;

  const data = {
    category: "CUSTOM",
    definitionId: 1,
  };

  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(data),
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
