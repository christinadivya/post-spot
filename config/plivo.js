const config = require('./config');
const plivo = require('plivo');
const client = new plivo.Client(config.config.plivo.api_key,  config.config.plivo.secret_key);
// const client = plivo.RestAPI({
//     authId: config.config.twilio.api_key,
//     authToken: config.config.twilio.secret_key
//   });
// const client = new twilio.RestClient(config.config.twilio.api_key, config.config.twilio.secret_key);
module.exports.sendSms = function (to,body) {
console.log("###",body)
client.messages.create(
    '+447576686638',
     to,
     body
  ).then(function (response) {
    console.log(" 888", response);
}, function (err) {
    console.error(err);
});
};
