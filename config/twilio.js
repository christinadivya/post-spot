const config = require('./config');
const twilio = require('twilio');

const client = new twilio(config.config.twilio.api_key, config.config.twilio.secret_key);
// const client = new twilio.RestClient(config.config.twilio.api_key, config.config.twilio.secret_key);

module.exports.sendSms = function (to, body) {
  console.log(body)
  client.messages.create({
    to: to,
    from: '+447723449633',
    body: body
  }, (error, message) => {
    if (!error) {
      console.log('Success! The SID for this SMS message is:');
      console.log(message.sid);
      console.log('Message sent on:');
      console.log(message.dateCreated);
    } else {
      console.log(error);
      console.log('Oops! There was an error.');
    }
  });
};
