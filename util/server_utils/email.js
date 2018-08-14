

var nodemailer = require('nodemailer');
var fs = require('fs');

const address = process.env.NFGM_ADDRESS;
const password = process.env.NFGM_PASSWORD;

const email = {
  sendEmail: function(recipients, message) {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: address,
        pass: password
      }
    });
    let mailOpt = {
        from: '"Natural Fresh Grocery & Meat" <' + address +'>',
        to: recipients.reduce(
          function(list, recipient) {
            if(list) {
              return list + ' , ' + recipient;
            } else {
              return recipient;
            }
          },
          ""),
        subject: message.subject,
        text: message.body
    }
    transporter.sendMail(mailOpt, function(error, info) {
      if(error) {
        return console.log(error);
      } else {
        console.log('Message %s sent: %s', info.messageId, info.response);
      }
    });
  }
}

/** Tests : */
if("TEST" === process.argv[2]) {
  console.log(["Mahmud", "Tayab" , "Czarina"].reduce(function(list, recipient) {
    if(list) {
      return list + ' , ' + recipient;
    } else {
      return recipient;
    }
  }, ""));

  email.sendEmail(['mahmudfasihulazam@gmail.com'],
    { subject: "Hello World", body: "Hello World" });
}

module.exports = email;
