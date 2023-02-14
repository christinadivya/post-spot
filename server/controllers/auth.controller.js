import AuthManager from '../managers/auth.manager';

module.exports = {
  create: create,
  login: login,
  verifyOtp: verifyOtp,
  forgotPassword: forgotPassword,
  socialLogin: socialLogin,  
  resendOtp: resendOtp,
  setVersion: setVersion,
  getVersion: getVersion
};

function create(req, res, next) {    
  AuthManager.create(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function setVersion(req, res, next) {    
  AuthManager.setVersion(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getVersion(req, res, next) {    
  AuthManager.getVersion(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function login(req, res, next) {    
  AuthManager.login(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function verifyOtp(req, res, next) {    
  AuthManager.verifyOtp(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function socialLogin(req, res, next) {    
  AuthManager.socialLogin(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function forgotPassword(req, res, next) {
    AuthManager.forgotPassword(req,function(err, data) {
        handler(err, data, res, next)
    });
}


function resendOtp(req, res, next) {
    AuthManager.resendOtp(req,function(err, data) {
        handler(err, data, res, next)
    });
}


function handler(err, data, res, next) {
  if (err) { 
  return next({message: err.message, status: err.code})
  }
  return res.status(data.code).json({data: data.data});
}
