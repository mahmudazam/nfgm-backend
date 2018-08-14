
const fire = require('../fire').default;

function signIn(email, password) {
  return fire.auth().signInWithEmailAndPassword(email, password);
}

function signOut() {
  return fire.auth().signOut();
}

function isSignedIn() {
  return fire.auth().currentUser ? true : false;
}

const firebase_auth = {
  signIn: signIn,
  signOut: signOut,
  isSignedIn: isSignedIn
};

module.exports = firebase_auth;
