const express = require("express");
const PORT = 8080; // default port 8080
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));



//Routes
//Home page
app.get("/", (req, res) => {
    res.render("home");
  });
  

  //Profiles
  app.get("/profiles", (req, res) => {
    res.render("profiles");
  });
  










  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });