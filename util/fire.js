"use strict";

var path = require('path');

// Firebase App:

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _firebase = require("firebase");

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
    apiKey: "AIzaSyDib8fiktUwM4h_yPTmNtYA5aC-Zrzufeg",
    authDomain: "exim-food.firebaseapp.com",
    databaseURL: "https://exim-food.firebaseio.com",
    projectId: "exim-food",
    storageBucket: "exim-food.appspot.com",
    messagingSenderId: "769795342410"
};

const fire = _firebase2.default.initializeApp(config)

exports.default = fire;
