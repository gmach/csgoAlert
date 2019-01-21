var TelstraMessaging = require('Telstra_Messaging');

module.exports = function (to, body) {
    var smsInitialised = TelstraMessaging.ApiClient.instance.authentications['auth'].accessToken != undefined;
    var response;
    if (!smsInitialised) {
      initAndSendSMS(to, body);
    } else {
      sendSMS(to, body);
    }
}

var clientId = '6Mf9oLOQygzmATr6V4t1SsGnMM18yP5s'; //'8Es4Lddps6Iu2RiUow7Ogf4oDnRNc0Ej';
var clientSecret = '26In4kXhJglCKuQA'; //'XzToGrnUYBGx34nF';
var grantType = "client_credentials";

function initAndSendSMS(to, body){
  new TelstraMessaging.AuthenticationApi().authToken(clientId, clientSecret, grantType, function(error, data, response) {
    if (error) {
      console.error(error);
    } else {
      TelstraMessaging.ApiClient.instance.authentications['auth'].accessToken = data.access_token;
      sendSMS(to, body);
    }
  });
}

function sendSMS(to, body) {
  var payload = { to: to,
    body: body
  };
  new TelstraMessaging.MessagingApi().sendSMS(payload, function(error, data, response) {
    if (error) {
      console.error(error);
    } else {
     // console.log(body + ', msgURL =  ' + data.messages[0].messageStatusURL);
    }
  });
}

