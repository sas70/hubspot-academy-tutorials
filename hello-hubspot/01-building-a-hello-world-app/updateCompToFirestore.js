// Description: This script updates some properties of one company in HubSpot

// import the required modules
const fetch = require("node-fetch");
require("dotenv").config();
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_DEV;

// create the options
properties_dict = {
  properties: { name: "GreatNewName", domain: "GreatNewDomain.com" },
};

const options = {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify(properties_dict),
};

// ----------------------- Main ----------------------------
let companyId = "14917258266";

// start the async function to get the properties from HubSpot for one company at a time
(async () => {
  const url = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`;
  console.log(`url: ${url}) `);

  let responseData;

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      `Hey, Your Request failed: ${response.status} ${response.statusText}`
    );
  }
  responseData = await response.json();
  if (responseData.status === "error") {
    throw new Error(responseData.message);
  }

  console.log(
    `Great! it worked and here is the response: ${JSON.stringify(
      responseData,
      null,
      2
    )}`
  );
})();

// ----------------------- End of Main ----------------------------
