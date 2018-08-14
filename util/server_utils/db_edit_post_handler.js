
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
            return editFunction(fields, files, res);
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
  return asset_handler.pushItem(simplifyFields(fields), files.image[0], './www/')
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully added item"); })
    .catch((error) => {
      console.log(error);
      if(error instanceof Object) res.send(JSON.stringify(error));
      else res.send(error);
    });
}

function deleteItemPost(fields, files, res) {
  return asset_handler.deleteItem(simplifyFields(fields), './www/')
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully deleted item"); })
    .catch((error) => {
      console.log(error);
      if(error instanceof Object) res.send(JSON.stringify(error));
      else res.send(error);
    });
}

function addCategoryPost(fields, files, res) {
  return asset_handler.pushCategory(fields.name[0])
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully added category"); })
    .catch((error) => {
      console.log(error);
      if(error instanceof Object) res.send(JSON.stringify(error));
      else res.send(error);
    });
}

function deleteCategoryPost(fields, files, res) {
  return asset_handler.deleteCategory(fields.name[0], './www/')
    .then(() => {
        return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully removed category") })
    .catch((error) => {
        console.log(error);
        if(error instanceof Object) res.send(JSON.stringify(error));
        else res.send(error);
    })
}

function addCarouselImagePost(fields, files, res) {
  fields.uploading = undefined;
  return asset_handler.pushCarouselImage(
      simplifyFields(fields), files.image[0], './www/')
    .then(() => {
      return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully added carousel image"); })
    .catch((error) => {
      console.log(error);
      if(error instanceof Object) res.send(JSON.stringify(error));
      else res.send(error);
    });
}

function deleteCarouselImagePost(fields, files, res) {
  return asset_handler.deleteCarouselImage(fields.image[0], './www/')
    .then(() => {
        return firebase_auth.signOut();
    })
    .then(() => { res.send("Successfully deleted carousel image") })
    .catch((error) => {
        console.log(error);
        if(error instanceof Object) res.send(JSON.stringify(error));
        else res.send(error);
    })
}
