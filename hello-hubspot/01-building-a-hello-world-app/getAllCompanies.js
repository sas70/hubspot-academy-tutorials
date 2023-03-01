// Description: This script will get all properties for a company in your HubSpot account

const hubspot = require("@hubspot/api-client");
const fetch = require("node-fetch");
require("dotenv").config();

const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

// const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

const url = `https://api.hubapi.com/properties/v1/companies/properties`;

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
  console.log("Great! it worked ", responseData[0]);
})();
