import fs from 'fs';
import handlebars from 'handlebars'
import env_const from '../../config/config.js';
import path from 'path';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';

// env_const.config = env_const.config.config;

const options = {
  auth: {
    api_user: env_const.config.mail.username,
    api_key: env_const.config.mail.password
  }
}
const transporter = nodemailer.createTransport(sgTransport(options));

function sendMail1(userInput,callback){
 
  fs.readFile(path.join(process.cwd()+'/template'+userInput.path), {encoding: 'utf-8'}, function (err, html) {
  if (err) {
  console.log(err);
  throw err;
  // callback(err);
  }
  else {
  console.log(userInput.email)
  var template = handlebars.compile(html);
  var replacements = {
  otp: userInput.otp,
  username: userInput.name,
  deal: userInput.deal
  };
  var htmlToSend = template(replacements);
  // console.log(htmlToSend);
  const mailOptions = {
  from: env_const.config.mail.from,
  to: userInput.email,
  subject: env_const.config.mail[userInput.templateName].subject,
  // preheader: env_const.config.mail.preheader,
  html:htmlToSend
   };

   transporter.sendMail(mailOptions, (error, info) => {    
    console.log(error)

      console.log(`Message sent: ${info}`);
      callback(error, info)
  });
 }
 })
}
   

export default {
  sendMail,
  sendMail1,
  getHtml
};

function sendMail(userInput, templateName, callback) {
  console.log(userInput)
    var html = getHtml(templateName, userInput)    
    const mailOptions = {
        from: env_const.config.mail.from,  
        to: userInput.email,
        subject: env_const.config.mail[templateName].subject,
        preheader: env_const.config.mail.preheader,
        html       
    };
 
    transporter.sendMail(mailOptions, (error, info) => {    
      console.log(error)

        console.log(`Message sent: ${info}`);
        callback(error, info)
    });
}

function getHtml(templateName, data) { 
   // const templatePath = path.join(__dirname,`${templateName}.js`)   
   // var templateContent = fs.readFileSync(templatePath, 'utf8');
   switch(templateName) {
    case 'invite':
       return "<h4>Hi,"+data.username+"</h4><span> Thanks for signup. Welcome to Spotted<span>"
        break;
    case 'activeMail':    
         return "<label>Your Email Verification Code:</label><span>"+data.email_otp_code+"</span><br>"
        break;
      }
   
   // return  templateContent  
}
// });
