
const firebase_auth = require('./firebase_auth');
const asset_handler = require('./asset_handler');

function randstr(n) {
  return "asldkjflakjsdf;lkjb;lkjasdfhgkxvb;kljhdf";
}

function keygen(email, password) { 
  let keyStr = randstr(256); 
  firebase_auth.signIn(email, password)
    .then(() => {
      return asset_handler.push('/post_key', keyStr);
    }).then(() => {
      return firebase_auth.signOut();
    }).catch((error) => {
      console.log(error);
      process.exit(1);
    });
  return keyStr;
}

if("TEST_KEYGEN" === process.argv[2]) {
  let key = keygen(process.env.NFGM_ADDRESS, process.env.NFGM_DB_PASS);
  console.log("POST key: " + key);
}

const post_keygen = {
  keygen: keygen
};

module.exports = post_keygen;

