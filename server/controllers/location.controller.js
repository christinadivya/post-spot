import LocationManager from '../managers/location.manager';

module.exports = {
  location: location,
  showLocation: showLocation,
  getLocation: getLocation,
  getCurrentLocation: getCurrentLocation,
  trackLive: trackLive,
  updateGoLive: updateGoLive,
  isLive: isLive,
  getCurrent: getCurrent
};

function location(req, res, next) {    
  LocationManager.location(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function trackLive(req, res, next) {    
  LocationManager.trackLive(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function isLive(req, res, next) {    
  LocationManager.isLive(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function updateGoLive(req, res, next) {    
  LocationManager.updateGoLive(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getCurrentLocation(req, res, next) {    
  LocationManager.getCurrentLocation(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getCurrent(req, res, next) {    
  LocationManager.getCurrent(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function showLocation(req, res, next) {    
  LocationManager.showLocation(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getLocation(req, res, next) {    
  LocationManager.getLocation(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function handler(err, data, res, next) {
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    return res.status(data.code).json({data: data.data});
  }