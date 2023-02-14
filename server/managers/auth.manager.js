import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Mailer from '../mail/mailer';
import User from '../models/user.model';
import Version from '../models/version.model';
import Oauth from '../../server/models/oauth_token.model'
import UserVerifications from '../models/user_verification.model';
import Twilio from '../../../config/twilio.js';
const moment = require('moment');


function create(req, callback) {  
  console.log("Creating user");
  let result = true;
  req.body.email = req.body.email.toLowerCase();
  let otp_code = Math.floor(1000 + Math.random() * 9000);
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
  if(req.body.password) {
    result = /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/.test(req.body.password)
    if(result == false) {
      callback({ message: responseMsg.messages.invalidPass , code: responseCode.badRequest }, null)
    }
  if(req.body.confirm_password) {
    if(req.body.confirm_password == req.body.password) {
      console.log("Compared");
    }
    else {
      result = false;
      callback({ message: responseMsg.messages.confirmPass , code: responseCode.badRequest }, null)
    }
  }
} else if(req.body.instagram) {
    req.body.social_login = 1;
  }
if (result === true) {
  User.forge(req.body)
  .save()
  .then((loginuser) => {
    //     const token = jwt.sign({
    //     id: loginuser.id
    // }, config.config.jwtSecret);
    // Oauth.forge({token: token, user_id: loginuser.id}).save().then((oauth_token) =>{
    //     console.log("Created Token") 

        //  Send SMS
        UserVerifications.forge({otp_code: otp_code, expired_date: expired_date, user_id: loginuser.id, 
           mobile: loginuser.attributes.mobile, countrycode: loginuser.attributes.countrycode }).save().then ((otpuser) => {
          //  Send Email
            Twilio.sendSms(loginuser.attributes.countrycode+loginuser.attributes.mobile, responseMsg.messages.twilio.activatedCode+
          otpuser.attributes.otp_code);
            // Plivo.sendSms(loginuser.attributes.countrycode+loginuser.attributes.mobile, responseMsg.messages.plivo.activatedCode+
            //   otpuser.attributes.otp_code);
          callback(null, { code: responseCode.ok, data: {
             message: responseMsg.messages.register+' '+otpuser.attributes.otp_code,
             user: loginuser,
        } }); 
      })         
// }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
}

}

function login(req, callback) {
  if(req.user.err){    
    callback({ err: { message: req.user.err, code: responseCode.badRequest } }, null);
  } else if(req.user) {
    User.where({id: req.user.id }).fetch().then ((users) => {
      const token = jwt.sign({
              id: req.user.id
            }, config.config.jwtSecret);
            Oauth.where({ user_id: req.user.id, isLogin: 1 }).fetch()
            .then ((token_exists) =>{
                if(token_exists != null) {
                  token_exists.save({ token: token, isLogin: 1 }, { patch: true }).then((updated) => {
                    console.log("Token Updated");
                    callback(null, { code: responseCode.ok, data: {
                      token: token,
                      userId: req.user.id,
                      user: users,
                    } }); 
                  })
                }
                else{
                  Oauth
                  .forge({token: token, user_id: req.user.id})
                  .save()
                  .then((oauth_token) =>{
                    console.log("Created Token")
                    callback(null, { code: responseCode.ok, data: {
                      token: token,
                      userId: req.user.id,
                      user: users,
                    } });              
                  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
                }
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
            
      })
  }    
}


function socialLogin(req, callback) {
  const socialInfo = req.body;
  let query;
  if (socialInfo.instagram) {
    query = { instagram: socialInfo.instagram, is_user_active: 1 }  
  }
  User.where(query).fetch().then((user) => {
    if (user) {
    		const token = jwt.sign({
      	id: user.id
        }, config.config.jwtSecret);	   
	      callback(null, { code: responseCode.ok, data: {
		      token: token,
		      userId: user.id, 
	    	} });
    }
    else {
      callback({ message: responseMsg.messages.userNot , code: responseCode.unauthorised }, null)
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))
 
}


function guestLogin(req, callback) {
	socialLogin(req, callback);
}


function forgotPassword(req, callback) { 
  let otp_code = Math.floor(1000 + Math.random() * 9000);      
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
     User.forge({ mobile: req.query.mobile }).fetch().then((user) => {
       if(!user) {
        callback({ message: responseMsg.messages.invalidReq, code: responseCode.badRequest }, null);       
     } else {   
      UserVerifications.where({ user_id: user.id }).query(function (qb) {
        qb.orderBy('created_at', 'DESC')
        qb.limit(1)
      }).fetch().then((otpSend) => {
        if(otpSend) {
          otpSend.save({user_id: user.id, valid: 0 }).then((updated) => {
          })
        }
        UserVerifications.forge({countrycode:user.attributes.countrycode, otp_code: otp_code, expired_date: expired_date,user_id: user.id, mobile: req.query.mobile }).save().then ((otpuser) => {
          Twilio.sendSms(user.attributes.countrycode+user.attributes.mobile, responseMsg.messages.twilio.passwordCode+
            otpuser.attributes.otp_code);
          // Mailer.sendMail(req.body, 'otpMail', function (err, info){});
          callback(null, { data: { message: responseMsg.messages.checkpho+ otp_code}, code: responseCode.ok })
       }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))
   
      })
        
      }      
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}

function verifyOtp(req, callback) {  
  UserVerifications.where('otp_code', req.query.otp_code).where('expired_date', '>', new Date()).where('valid', 1)
  .fetch().then((otp) => {  
     console.log(otp.attributes.otp_code)	
     if(!otp) {
      callback({ message: responseMsg.messages.otpexp, code: responseCode.badRequest })
     } else { 
    otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
      User.where({ mobile: otp.attributes.mobile }).fetch().then ((user) => {
        if(!user)
           callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest })
        else
          user.save({ is_user_active: 1 }, { patch: true }).then((updatedUser) => {
                const token = jwt.sign({
	              id: otp.attributes.user_id
              }, config.config.jwtSecret);
          Oauth.where({ user_id: otp.attributes.user_id, isLogin: 1 }).fetch()
          .then ((token_exists) =>{
              if(token_exists != null) {
                token_exists.save({ token: token, isLogin: 1 }, { patch: true }).then((updated) => {
                  console.log("Token Updated");
                })
              }
              else{
                Oauth
                .forge({token: token, user_id: otp.attributes.user_id})
                .save()
                .then((oauth_token) =>{
                  console.log("Created Token")              
                  })	    
              }
              req.body.email = user.attributes.email;
              req.body.username = user.attributes.username;
              Mailer.sendMail(req.body, 'invite', function (err, info){});  
              callback(null, { code: responseCode.ok, data: {
                message: responseMsg.messages.otpver,
                user_id: user.id,
                token: token
              } });
            })
            })
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	
        
    })
  }
     
  }).catch(e => callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest }, null));
}

function resendOtp(req, callback) { 
  let otp_code = Math.floor(1000 + Math.random() * 9000);      
  let expired_date = new Date();
  let time =  moment.utc(new Date()).add(5.50, 'h').format("hh:mm a");
  expired_date.setHours(expired_date.getHours() + 8);
     User.forge({ mobile: req.query.mobile }).fetch().then((user) => {
       if(!user){
        callback({ message: responseMsg.messages.invalidReq, code: responseCode.badRequest }, null);       
     }else { 
      //   function(done) {
          UserVerifications.where({ mobile: req.query.mobile, valid: 1 }).fetch().then ((otp) => {
            if(otp) {
              otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
                console.log("***")
                console.log(updateValid)
                // done(null,otp.attributes.country_code)
                UserVerifications.forge({ otp_code: otp_code, expired_date: expired_date,user_id: user.id, mobile: req.query.mobile, countrycode: user.attributes.countrycode }).save().then ((otpuser) => {
                  Twilio.sendSms(otp.attributes.countrycode+user.attributes.mobile, responseMsg.messages.twilio.passwordCode+
                    otpuser.attributes.otp_code+' created at '+time);
                          callback(null, { data: { message: responseMsg.messages.checkpho+ otp_code,
                          }, code: responseCode.ok })
                 })  
            })
            }
           
          })       
      
     }         
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}

function setVersion(req, callback) {
  Version.where({ os: req.body.os }).fetch().then((versions) => {
    if(versions != null) {
      versions.save({ os: req.body.os, version: req.body.version }, { patch: true }).then((updated) => {
        callback(null, { data: updated, code: responseCode.ok }) })
    } else {
      Version.forge(req.body).save().then((created) => {
        callback(null, { data: created, code: responseCode.ok }) })
    }
  })
}

function getVersion(req, callback) {
  Version.where({ os: req.query.os }).fetch().then((versions) => {
    callback(null, { data: versions, code: responseCode.ok }) })
}
export default { login, create, verifyOtp, forgotPassword, 
 socialLogin, guestLogin, resendOtp, setVersion, getVersion };
