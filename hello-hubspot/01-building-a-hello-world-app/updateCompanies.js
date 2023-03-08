// Description: Update a company in HubSpot
// Source: https://developers.hubspot.com/docs/api/crm/companies (Update a company)

const hubspot = require("@hubspot/api-client");

require("dotenv").config();
const ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_PROD;

const hubspotClient = new hubspot.Client({ accessToken: ACCESS_TOKEN });

properties_internal_names = {
  fye: "fiscal_year_end_month",
  "street address": "address",
  cik: "cik",
  sic_label: "sic_label",
  sic_number: "sic_number",
  ticker: "ticker",
};

const properties = {
  [properties_internal_names.fye]: "1231",
  [properties_internal_names["street address"]]: "25 FIRST STREET, 2ND FLOOR",
  [properties_internal_names.cik]: "0001404659",
  [properties_internal_names.sic_label]: "SERVICES-PREPACKAGED SOFTWARE",
  [properties_internal_names.sic_number]: "7777",
  [properties_internal_names.ticker]: "HUBS",
};

const SimplePublicObjectInput = { properties };
const companyId = "11515596724";
const idProperty = undefined;
(async function () {
  try {
    const apiResponse = await hubspotClient.crm.companies.basicApi.update(
      companyId,
      SimplePublicObjectInput,
      idProperty
    );
    console.log(JSON.stringify(apiResponse, null, 2));
  } catch (e) {
    e.message === "HTTP request failed"
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
})();
