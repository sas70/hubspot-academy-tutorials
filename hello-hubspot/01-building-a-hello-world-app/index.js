const express = require("express");
const axios = require("axios");

const app = express();

app.set("view engine", "pug");

app.use(express.static(__dirname + "/public"));

const PRIVATE_APP_ACCESS_DEV = "pat-na1-1e475c30-6046-48df-bb87-002077411c17";
const PRIVATE_APP_ACCESS_PROD = "pat-na1-9e55af50-1b4a-4429-b817-f8bb72ac014e";
// process.env.PRIVATE_APP_ACCESS;

app.listen(3000, () => console.log("Listening on http://localhost:3000"));

// create a route to get the contacts
app.get("/contacts", async (req, res) => {
  const contacts_url = "https://api.hubspot.com/crm/v3/objects/contacts";
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS_PROD}`,
    "Content-Type": "application/json",
  };

  try {
    const resp = await axios.get(contacts_url, { headers });
    const data = resp.data.results;
    console.log(data);
    res.render("contacts", { title: "Contacts | HubSpot APIs", data });
  } catch (error) {
    console.error("Here is my error message: ", error);
  }
});
