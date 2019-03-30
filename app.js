const express = require("express");
const PORT = 8080; // default port 8080
const app = express();
const moment = require('moment')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
var plaid = require('plaid');

var amountDonated = 0;
const PLAID_CLIENT_ID= "5c9f0563799b0e0012e3ea0a"
const PLAID_SECRET= "8997d2fbb5212241a16663d8e226f9" 
const PLAID_PUBLIC_KEY= "3431d4e744663095f531661528f975"
const PLAID_PRODUCTS="transactions"
const PLAID_ENV= "sandbox"


var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;


var client = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV],
    {version: '2018-05-22'}
  );


//Routes
//Home page
app.get("/", (req, res) => {
    res.render("home");
  });
  
  //Profiles
  app.get("/profiles", (req, res) => {
    res.render("profiles");
  });
  

  //Donate
  app.get('/donate', function(request, response, next) {
    response.render('donate', {
      PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
      PLAID_ENV: PLAID_ENV,
      PLAID_PRODUCTS: PLAID_PRODUCTS,
    });
  });


  app.post('/get_access_token', function(request, response, next) {
    PUBLIC_TOKEN = request.body.public_token;
    client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
      if (error != null) {
        console.log(error)
        return response.json({
          error: error,
        });
      }
      ACCESS_TOKEN = tokenResponse.access_token;
      ITEM_ID = tokenResponse.item_id;
      console.log(tokenResponse)
      response.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });
    });
  });
  
  app.get('/transactions', function(request, response, next) {
    // Pull transactions for the Item for the last 30 days
    var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    var endDate = moment().format('YYYY-MM-DD');
    client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
      count: 250,
      offset: 0,
    }, function(error, transactionsResponse) {
      if (error != null) {
        console.log(error);
        return response.json({
          error: error
        });
      } else {
        var transactions = transactionsResponse
        var total_transactions = transactions.total_transactions;
        var amount = 0.05;
        amountDonated = total_transactions * amount;
        console.log("This is the amount donated", amountDonated)
        response.json({error: null, transactions: transactionsResponse});

        var stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
    (async () => {
      const charge = await stripe.charges.create({
        amount: amountDonated * 100,
        currency: 'usd',
        source: 'tok_visa',
        receipt_email: 'anisa.tahlil@example.com', 
      });
      console.log(charge)
    })();
      }
    });
  });
  


      // See your keys here: https://dashboard.stripe.com/account/apikeys
    


  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });