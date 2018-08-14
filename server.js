
// External modules:
const express = require('express');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Post request handlers:
const db_edit_post_handler =
  require('./util/server_utils/db_edit_post_handler');
const email_post_handler =
  require('./util/server_utils/email_post_handler');

// Express configurations:
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.json({limit : '3mb'}));

// Configure post request handlers for database edits:
db_edit_post_handler.configure(app); // refer to db_edit_post_handler.js

// Configure post request handler for email:
email_post_handler.configure(app);

const server = app.listen(8080, function() {
  const host = server.address().address;
  const port = server.address().port;
  console.log('NFGM listening at http://%s:%s', host, port);
});

