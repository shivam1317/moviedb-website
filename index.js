var requests = require("requests");
const path = require("path");
const express = require("express");
const { config } = require("process");
const router = express.Router();
var app = express();
require("dotenv").config(); // dotenv
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const apiKey = process.env.API_KEY;
const apiBaseUrl = "http://api.themoviedb.org/3";
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}&region=in`;
const imageBaseUrl = "http://image.tmdb.org/t/p/w300";

app.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
});

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/home", (req, res, next) => {
  requests(nowPlayingUrl)
    .on("data", function (chunk) {
      let parsed = JSON.parse(chunk);
      //   console.log(parsed);
      //   res.json(parsed);
      res.render("home", {
        parsedData: parsed.results,
      });
    })
    .on("end", function (err) {
      if (err) return console.log("connection closed due to errors", err);
    });
});

app.get("/movie/:id", (req, res, next) => {
  const movieId = req.params.id;
  const movieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;
  requests(movieUrl)
    .on("data", (chunk) => {
      let parsed = JSON.parse(chunk);
      res.render("single_movie", {
        parsed,
      });
    })
    .on("end", function (err) {
      if (err) return console.log("connection closed due to errors", err);
    });
  //   res.send(movieUrl);
});

app.post("/search", (req, res, next) => {
  const searchText = req.body.searchTerm;
  const category = req.body.category;
  const searchUrl = `${apiBaseUrl}/search/${category}?query=${encodeURI(
    searchText
  )}&api_key=${apiKey}`;

  requests(searchUrl)
    .on("data", (chunk) => {
      let parsed = JSON.parse(chunk);
      if (category === "person") {
        let knownForArr = []; // the api data is an array of array means there is a one result array which have known_for arrays in which each array have 2-3 data so we have to make 2 forEach loops.
        parsed.results.forEach((result) => {
          result.known_for.forEach((data) => {
            knownForArr.push(data);
          });
        });
        res.render("home", {
          parsedData: knownForArr,
        });
      } else {
        res.render("home", {
          parsedData: parsed.results,
        });
      }
    })
    .on("end", function (err) {
      if (err) return console.log("connection closed due to errors", err);
      knownForArr = []; // at last we have to make that array empty
    });
});

app.listen(3000, () => {
  console.log("listening on port 3000...");
});
