const express = require("express");
const mongoose = require("mongoose");

// Connect to MongoDB via Mongoose using the URI in our config.
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected."))
  .catch(err => console.error(err));

// Set up our server app with routes.
const app = express();

app.get("/", (req, res) => res.send("hello, world"));

// Start our server app
// Use an environment variable for the port to listen on. Default to 5000
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
