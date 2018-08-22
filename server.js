const express = require('express');
const mongoose = require('mongoose');

// Load middleware modules
const bodyParser = require('body-parser');
const passport = require('passport');

// Load our routes
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');
const users = require('./routes/api/users');

// Connect to MongoDB via Mongoose using the URI in our config.
const db = require('./config/sensitive/keys').mongoURI;

mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error(err));

// Create our server app
const app = express();

// Use middleware ...
// Passport for authentication configured by a config file.
app.use(passport.initialize());
require('./config/passport')(passport);

// body-parser for parsing the body of received http requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up our routes
app.get('/', (req, res) => res.send('hello, world'));

app.use('/api/posts', posts);
app.use('/api/profile', profile);
app.use('/api/users', users);

// Start our server app
// Use an environment variable for the port to listen on. Default to 5000
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
