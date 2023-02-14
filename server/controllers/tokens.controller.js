import TokenManager from '../managers/tokens.manager';

module.exports = {
  create: create,
};

function create(req, res, next) {    
  TokenManager.create(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function handler(err, data, res, next) {
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    return res.status(data.code).json({data: data.data});
  }