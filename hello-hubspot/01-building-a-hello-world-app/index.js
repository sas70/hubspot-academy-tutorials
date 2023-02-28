const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.set("view engine", "pug");

app.use(express.static(__dirname + "/public"));

// read the private app access token from the environment variable PRIVATE_APP_ACCESS
const PRIVATE_APP_ACCESS_PROD = process.env.PRIVATE_APP_ACCESS_PROD;
const PRIVATE_APP_ACCESS_DEV = process.env.PRIVATE_APP_ACCESS_DEV;

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
const headers = {
  Authorization: `Bearer ${PRIVATE_APP_ACCESS_PROD}`,
  "Content-Type": "application/json",
};

// create the home route
app.get("/", async (req, res) => {
  try {
    console.log("welcome to the home page to interact with hubspot");
  } catch (error) {
    console.log("Here is my error message: ", error.response.data.message);
  }
});

// create a route to get the contacts
app.get("/contacts", async (req, res) => {
  const contacts_url = "https://api.hubspot.com/crm/v3/objects/contacts";

  try {
    const resp = await axios.get(contacts_url, { headers });
    const data = resp.data.results;
    // Replace all the null values with "N/A"
    data.forEach((contact) => {
      for (const key in contact.properties) {
        if (contact.properties[key] === null) {
          contact.properties[key] = "N/A";
        }
      }
    });

    console.log(data);
    res.render("contacts", { title: "Contacts | HubSpot APIs", data });
  } catch (error) {
    console.log("Here is my error message: ", error.response.data.message);
  }
});

// create a route to get the companies
app.get("/companies", async (req, res) => {
  const companies_url = "https://api.hubspot.com/crm/v3/objects/companies";

  try {
    const resp = await axios.get(companies_url, { headers });
    const data = resp.data.results;
    console.log(data);
    res.render("companies", { title: "Companies | HubSpot APIs", data });
  } catch (error) {
    console.log("Here is my error message: ", error.response.data.message);
  }
});
