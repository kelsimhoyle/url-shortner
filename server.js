require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors");
const bodyParser = require("body-parser");

const MONGO_URI = process.env.MONGO_URI

const db = require("./models");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  const exp = "(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})";
  const regex = new RegExp(exp);

  if (!req.body.url.match(regex)) return res.json({ "error": "invalid url" });

  db.Url.count({})
    .then(count => {
      const num = count + 1;

      const newUrl = new db.Url({
        original_url: req.body.url,
        short_url: num
      });

      newUrl.save((err, data) => {
        if (err) return console.error(err);

        return res.json({
          original_url: data.original_url,
          short_url: data.short_url
        });
      })
    })
    .catch(error => console.error(error))
});

app.get("/api/shorturl/:short_url", (req, res) => {
  db.Url.findOne({ short_url: req.params.short_url }, (error, data) => {
    if (error) console.error(error)
    if (data) {
      res.redirect(301, data.original_url);
    } else {
      res.json({"error": "no url"})
    }
  })
})

mongoose.connect(MONGO_URI, { useNewUrlParser: true }, () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});