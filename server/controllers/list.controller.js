import ListManager from '../managers/list.manager';

module.exports = {  
  countryCode: countryCode,
  staticCars:staticCars,
  city: city,
  state: state,
  fuels: fuels,
  termsCondition: termsCondition,
  aboutUs: aboutUs,
  notificationType: notificationType
};

function fuels(req, res, next) {    
  ListManager.fuels(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function termsCondition(req, res, next) {    
  ListManager.termsCondition(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function notificationType(req, res, next) {    
  ListManager.notificationType(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function aboutUs(req, res, next) {    
  ListManager.aboutUs(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function countryCode(req, res, next) {    
  ListManager.countryCode(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function state(req, res, next) {    
  ListManager.state(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function city(req, res, next) {    
  ListManager.city(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function staticCars(req, res, next) {    
  ListManager.staticCars(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function handler(err, data, res, next){
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    res.status(data.code).json({data: data.data});
  }
  