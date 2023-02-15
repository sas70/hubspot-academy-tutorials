const express = require("express");
const axios = require("axios");

const app = express();

app.set("view engine", "pug"); // set the view engine to pug (instead of ejs) so we can use pug templates in our views folder (instead of ejs templates in our views folder). We'll need to create a new folder called views and a new file called contacts.pug in that folder.  We'll also need to create a new folder called public and a new file called style.css in that folder. ejs stands for Embedded JavaScript. pug stands for Pretty, Unobtrusive, Generated HTML.  We'll need to change the file extension of our index.ejs file to index.pug.  We'll also need to change the file extension of our style.css file to style.pug.

app.use(express.static(__dirname + "/public")); // serve static files from the public folder i.e.  style.css file from the public folder    // __dirname is a global variable that gives us the path to the current directory (i.e. 01-building-a-hello-world-app) // __dirname + "/public" is the path to the public folder

const PRIVATE_APP_ACCESS = "pat-na1-1e475c30-6046-48df-bb87-002077411c17";
// process.env.PRIVATE_APP_ACCESS;

app.listen(3000, () => console.log("Listening on http://localhost:3000"));

// create a route to get the contacts
app.get("/contacts", async (req, res) => {
  const contacts_url = "https://api.hubspot.com/crm/v3/objects/contacts";
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  try {
    const resp = await axios.get(contacts_url, { headers });
    const data = resp.data.results;
    res.render("contacts", { title: "Contacts | HubSpot APIs", data });
  } catch (error) {
    console.error("Here is my error message: ", error);
  }
});
