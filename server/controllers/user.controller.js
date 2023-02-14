import UserManager from '../managers/user.manager';

module.exports = {  
  getProfile: getProfile,
  resetPassword: resetPassword,
  changePassword: changePassword,
  logout: logout,
  viewAll: viewAll,
  updateProfile: updateProfile,
  addSpecification: addSpecification,
  myCommentsList: myCommentsList,
  viewCar: viewCar,
  getcaruserList: getcaruserList,
  editCar: editCar,
  getcarList: getcarList,
  getmodelList: getmodelList,
  deletepersonalPictures: deletepersonalPictures,
  deleteTag: deleteTag,
  deleteCars: deleteCars,
  getmymodelList: getmymodelList,
  visitedUsers: visitedUsers,
  changeMobile: changeMobile,
  verifyOtpMobileChange: verifyOtpMobileChange,
  resendOtp: resendOtp
};


function resetPassword(req, res, next) {    
  UserManager.resetPassword(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function visitedUsers(req, res, next) {    
  UserManager.visitedUsers(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function updateProfile(req, res, next) {    
  UserManager.updateProfile(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function deleteTag(req, res, next) {    
  UserManager.deleteTag(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getcaruserList(req, res, next) {    
  UserManager.getcaruserList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getcarList(req, res, next) {    
  UserManager.getcarList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getmymodelList(req, res, next) {    
  UserManager.getmymodelList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function deletepersonalPictures(req, res, next) {    
  UserManager.deletepersonalPictures(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function deleteCars(req, res, next) {    
  UserManager.deleteCars(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getmodelList(req, res, next) {    
  UserManager.getmodelList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function editCar(req, res, next) {    
  UserManager.editCar(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getProfile(req, res, next) {    
  UserManager.getProfile(req,function(err, data) {
    handler(err, data, res, next)
});
}

function changePassword(req, res, next) {    
  UserManager.changePassword(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function addSpecification(req, res, next) {    
  UserManager.addSpecification(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function viewCar(req, res, next) {    
  UserManager.viewCar(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function logout(req, res, next) {    
  UserManager.logout(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function viewAll(req, res, next) {    
  UserManager.viewAll(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function myCommentsList(req, res, next) {    
  UserManager.myCommentsList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function changeMobile(req, res, next) {  
  UserManager.changeMobile(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyOtpMobileChange(req, res, next) {  
  UserManager.verifyOtpMobileChange(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function resendOtp(req, res, next) {    
  UserManager.resendOtp(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function handler(err, data, res, next){
  if (err) { 
  return next({message: err.message, status: err.code})
  }
  res.status(data.code).json({data: data.data});
}

