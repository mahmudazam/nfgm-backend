
const multiparty = require('multiparty');
const asset_handler = require('./asset_handler');
const firebase_auth = require('./firebase_auth');
const post_keygen = require('./post_keygen');
var express_rate_limit = require('express-rate-limit');

// Mapping of post handlers:
const postHandlers = [
  {
    relUrl: '/add_item',
    handler: addItemPost
  },
  {
    relUrl: '/delete_item',
    handler: deleteItemPost
  },
  {
    relUrl: '/add_category',
    handler: addCategoryPost
  },
  {
    relUrl: '/delete_category',
    handler: deleteCategoryPost
  },
  {
    relUrl: '/add_carousel_image',
    handler: addCarouselImagePost
  },
  {
    relUrl: '/delete_carousel_image',
    handler: deleteCarouselImagePost
  }
];

// Rate limiter:
var limiter = new express_rate_limit({
  windowMs: 30 * 60 * 1000, // block for 30 minutes after max number of requests
  max: 50, // a maximum of 50 requests
  delayAfter: 1, // start delay after the first request
  delayMs: 10, // delay 10 ms each time
  message: "Too many edits in a short time: please try again later"
});


function configure(expressAppInstance) {
  let app = expressAppInstance;
  let i = 0;
  for(i = 0; i < postHandlers.length; i++) {
    dbEdit(postHandlers[i].relUrl, postHandlers[i].handler, app);
  }
}

const db_edit_post_handler = {
  configure: configure
};

module.exports = db_edit_post_handler;

// Function for parsing fields to remove single-element arrays:
function simplifyFields(fields) {
  return Object.keys(fields).reduce((result, fieldName) => {
    if('categories' !== fieldName) {
      result[fieldName] = fields[fieldName] ? fields[fieldName][0] : undefined;
    } else {
      result['categories'] = JSON.parse(fields['categories'][0]);
    }
    return result
  }, {});
}

// Database Edits:
const DB_EMAIL = process.env.NFGM_ADDRESS;
const DB_PASS = process.env.NFGM_DB_PASS;
const PUBLIC_PATH = process.env.PUBLIC_PATH;

var ENV_ERROR = false;

if(undefined === DB_EMAIL) {
  console.error("Server email not provided.");
  ENV_ERROR = true;
}
if(undefined === DB_PASS) {
  console.error("Server email password not provided.");
  ENV_ERROR = true;
}
if(undefined === PUBLIC_PATH) {
  console.error("Path to public directory not provided.");
  ENV_ERROR = true;
}

if(ENV_ERROR) {
  console.error("Please provide a suitable environment file.");
  process.exit(1);
}

var POST_KEY = post_keygen.keygen(DB_EMAIL, DB_PASS);

function dbEdit(post, editFunction, app) {
  app.post(post, limiter, function(req, res) {
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if(err) {
        res.send("ERROR");
      }
      if(fields) {
        if(POST_KEY === fields.post_key[0]) {
          fields.post_key[0] = undefined;
          firebase_auth.signIn(DB_EMAIL, DB_PASS).then(() => {
            return editFunction(fields, files, res).catch((error) => {
              console.log(error);
              res.send("Error occured while applying change. "
                + "Please contact support.");
            })
          }).then(() => {
            POST_KEY = post_keygen.keygen(DB_EMAIL, DB_PASS);
          }).catch((error) => {
            console.log(error);
            res.send("Permission denied");
          })
        } else {
          console.log(fields);
          res.send("Permission denied");
        }
      }
    });
  });
}

function addItemPost(fields, files, res) {
  fields.uploading = undefined;
  return asset_handler.pushItem(simplifyFields(fields), files.image[0],
                                PUBLIC_PATH)
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully added item"); });
}

function deleteItemPost(fields, files, res) {
  return asset_handler.deleteItem(simplifyFields(fields), PUBLIC_PATH)
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully deleted item"); });
}

function addCategoryPost(fields, files, res) {
  return asset_handler.pushCategory(fields.name[0])
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully added category"); })
}

function deleteCategoryPost(fields, files, res) {
  return asset_handler.deleteCategory(fields.name[0], PUBLIC_PATH)
    .then(() => {
        return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully removed category") });
}

function addCarouselImagePost(fields, files, res) {
  fields.uploading = undefined;
  return asset_handler.pushCarouselImage(
      simplifyFields(fields), files.image[0], PUBLIC_PATH)
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully added carousel image"); });
}

function deleteCarouselImagePost(fields, files, res) {
  return asset_handler.deleteCarouselImage(fields.image[0], PUBLIC_PATH)
    .then(() => {
        return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully deleted carousel image") });
}

