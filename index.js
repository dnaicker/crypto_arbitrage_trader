const axios = require('axios');
const Luno = require('luno-api')
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require("fs");
const cc = require('cryptocompare')
const { Spot } = require('@binance/connector')
global.fetch = require('node-fetch')
const dotenv = require('dotenv').config();  // reads the .env file and sets the environment variables
const encode = require('nodejs-base64-encode');

const valr_api_key_id = process.env.valr_api_key_id;
const valr_api_secret = process.env.valr_api_secret;
const crypto_compare = process.env.crypto_compare;
const binance_api_key_id = process.env.binance_api_key_id;
const binance_api_secret = process.env.binance_api_secret;
const luno_api_key_id = process.env.luno_api_key_id;
const luno_api_secret = process.env.luno_api_secret;
const binance_client = new Spot(binance_api_key_id, binance_api_secret)

cc.setApiKey(crypto_compare)
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));

// load index html starter page
app.get("/binance_account", function (req, res) {
  binance_client.account().then(response => {
    res.send(response.data);
  })
});

// load index html starter page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// run server
var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port

  console.log(host, port)
  console.log("Example app listening at http://%s:%s", host, port)
})

// params: unix timestamp, verb: get/post/put/delete, path: /v1/account/balances
function valr_sign_request(apiSecret, timestamp, verb, path, body = '') {
  return crypto
    .createHmac("sha512", apiSecret)
    .update(timestamp.toString())
    .update(verb.toUpperCase())
    .update(path)
    .update(body)
    .digest("hex");
}

// Valr: 
// publish rest api calls

// https://api.valr.com/v1/public/marketsummary
// https://api.valr.com/v1/public/:currencyPair/marketsummary


// --------------------
// ui: list latest prices
// find library to do currency conversion 
// 1. compare current trading prices
// https://www.npmjs.com/package/cryptocompare
// BTC/ZAR
// ETH/ZAR
// ZAR/USD
// ZAR/EURO
app.get('/getLatestPrices', function (req, res) {
  cc.priceMulti(['BTC', 'ETH', 'SOL'], ['USD', 'EUR', 'ZAR'])
  .then(prices => {
    // console.log(prices)
    res.send(prices)
  })
})

// --------------------
// 2. https://api.valr.com/v1/account/balances
// i can display wallet stats as well
// how much bitcoin i currently have
// how much ethereum i currently have

// conduct basic end to end api call and return data to frontend
app.get('/valrAccountBalance', function (req, res) {
  let current_timestamp = Date.now();
  let header_signature = valr_sign_request(valr_api_secret, current_timestamp, "get", "/v1/account/balances");

  axios({
    method: 'get',
    url: 'https://api.valr.com/v1/account/balances',
    headers: {
      'X-VALR-API-KEY': valr_api_key_id,
      'X-VALR-SIGNATURE': header_signature,
      'X-VALR-TIMESTAMP': current_timestamp
    }
  })
    .then(function (response) {
      res.send(response.data);
      // console.log(JSON.stringify(response.data));
      // for(let sell_items in response.data['Asks']) {
      //   console.log(response.data['Asks'][sell_items])
      // }
    })
    .catch(function (error) {
      res.send(error);
      console.log(error);
    });
})


// --------------------
// 3. https://api.valr.com/v1/simple/:currencyPair/quote
// create a buy sell trade
// store order id to find status and to log to text field
// retrieve textfield input 
// where to from here
// ui: purchase modal or screen container
// add dropdown to select exchange
// add dropd to buy/sell
// add input for price 
// add drop down for currency
// add call to request trade
app.post('/postValrOrder', function (req, res) {
  let current_timestamp = Date.now();
  let header_signature = valr_sign_request(valr_api_secret, current_timestamp, "post", "/v1/simple/BTCZAR/quote");

  var data = JSON.stringify({
    "payInCurrency": "BTC",
    "payAmount": "0.0000001",
    "side": "SELL"
  })

  axios({
    method: 'post',
    url: 'http://api.valr.com/v1/simple/BTCZAR/quote',
    headers: {
      'Content-Type': 'application/json', 
      'X-VALR-API-KEY': valr_api_key_id,
      'X-VALR-SIGNATURE': header_signature,
      'X-VALR-TIMESTAMP': current_timestamp,
      data: data
    }
  })
    .then(function (response) {
      console.log(response.data);
      // console.log(JSON.stringify(response.data));
      // for(let sell_items in response.data['Asks']) {
      //   console.log(response.data['Asks'][sell_items])
      // }
    })
    .catch(function (error) {
      res.send(error);
      // console.log(error);
    });
})


// --------------------
// --------------------
// --------------------
// 4. https://api.valr.com/v1/public/:currencyPair/marketsummary
// with market summary i can view ask price, bid price, high price, low price
// i can get that for a specific currency
// ui: change per currency to reflect different stats
// refresh table as new price comes through every 20 seconds
// ui: table displaying list of prices from exchanges with different bid, sell prices, volume traded
// nest the exchanges diff to indicate comparison of arbitrage
// ui table: display identify best exchanges to buy/sell to using arbitrage 
// logic: write out the algorithm for arbitrage
// minus the active 'selling/asking' price from two exchanges
// 
// find api calls to get the data
// find library to do currency conversion
app.post('/getValrMarketSummary', function (req, res) {
  let current_timestamp = Date.now();
  let header_signature = valr_sign_request(valr_api_secret, current_timestamp, "get", "/v1/public/"+ req.body.currency_pair + "/marketsummary");

  console.log('Got body:', req.body);

  let url = 'https://api.valr.com/v1/public/' + req.body.currency_pair + '/marketsummary'

  var config = {
    method: 'get',
    url: url,
    headers: {}
  };

  axios(config)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      res.send(error);
    });

})


// sql database: order table with transaction history done
// rest api send to front-end
// 1 currencyStats
    // general
// 2 walletStats
    // valr
// 3 buySellTrade
    // valr
// 4 arbitrageExchangeData
    // combine luno, valr, binance, coingap, marketcap


// headers: {
//   'key id': luno_api_key_id,
//   'key secret': luno_api_secret
// }  

axios({
    method: 'get',
    url: 'https://api.luno.com/api/1/orderbook',
    headers:{
      "Authorization": "Basic " + encode.encode(luno_api_key_id + ":" + luno_api_secret, 'base64')
    }
  })
    .then(function (response) {
      // res.send(response.data);
      // console.log(JSON.stringify(response));
    })
    .catch(function (error) {
      // console.log(error);
    });