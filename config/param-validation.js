import Joi from 'joi';

export default {

  // POST /api/users
  createUser: {
    body: {
      firstname: Joi.string().required().label('First Name'),
      lastname: Joi.string().required().label('Last Name'),
      username: Joi.string().required().label('UserName'),
      email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
      .label('Email'),
    },
    options: { abortEarly: true },
  },
  
  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required().label('Username'),
      password: Joi.string().required().label('Password')
    }
  },

  //POST /api/user/changepassword
  changePassword: {
    body: {
      old_password: Joi.string().required().regex( /^[a-zA-Z0-9!-\/:-@\[-{-~]{6,30}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('Old Password'),
      new_password: Joi.string().required().regex( /^[a-zA-Z0-9!-\/:-@\[-{-~]{6,30}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('New Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'must match new_password' }, label: 'Password Confirmation' } })
    }
  },

   //GET /api/auth/forgotPassword
   forgotPassword: {
    query: {
      mobile: Joi.string().required().label('Mobile Number'),
    }
  },

  //POST /api/user/resetpassword
  resetPassword: {
    body: {
      new_password: Joi.string().required().regex( /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'New Password and Confirm password must be same' }, label: 'Password Confirmation' } })
    }
  },

  changeMobile: {
    body: {
      mobile: Joi.number().required().label('Mobile Number'),
      confirm_mobile: Joi.number().valid(Joi.ref('mobile')).required().options({ language: { any: { allowOnly: 'must match mobile' }, label: 'Mobile confirmation' } })
    }
  },

  verifyOtpMobile: {
    body: {
      otp_code: Joi.number().required().label('Enter Otp code'),
    }
  },

  //GET /api/auth/resend-otp
  
  resendOtp: {
    query: {
      mobile: Joi.string().required().label('Mobile Number'),
    }
  },

  
   //GET /api/auth/verify-otp
  
   verifyOtp: {
    query: {
      otp_code: Joi.string().required().label("Enter the OTP"),
    }
  },

   
    
    tracking: {
      body: {
        user_id: Joi.number().required().label("User Id required"),
        car_lat: Joi.string().required().label("Current Lattitude required"),
        car_lon: Joi.string().required().label("Current Longitude required"),
        des_lat: Joi.string().required().label("Destination Lattitude required"),
        des_lon: Joi.string().required().label("Destination Lattitude required"),
        destination: Joi.string().required().label("Destination required"),
      }
    },

    verifyCode: {
      body: {
        otp_code: Joi.number().required().label("Enter OTP code"),
      }
    },
 
    viewProfile: {
      query: {
        user_id: Joi.number().required().label("User ID required"),
      }
    },

    carList: {
      query: {
        car_id: Joi.number().required().label("Car ID required"),
      }
    },


  
  getUser: {
    query: {
      user_id: Joi.number().required().label("User ID required"),
    }
  },

  verifyUser: {
    body: {
      id: Joi.number().required().label("ID required"),
      verify: Joi.number().required().label('Send verification code'),
    }
  },

  updateStatus: {
    body: {
      notification_id: Joi.number().required().label("Notification ID required"),
      status: Joi.string().required().label("Status required"),
    }
  },

  getDetail:{
    query: {
      notification_id: Joi.number().required().label("Notification ID required"),
    }
  },

  location: {
    body: {
      car_lat: Joi.string().required().label("Current Lattitude required"),
      car_lon: Joi.string().required().label("Current Longittude required"),
      des_lat: Joi.string().required().label("Destination Lattitude required"),
      des_lon: Joi.string().required().label("Destination Longittude required"),
    }
  },

  latest: {
    query: {
      request_id: Joi.number().required().label(" Request ID required")

    }
  },

  password: {
    body: {
      old_password: Joi.string().required().label("Enter Old password"),
      new_password: Joi.string().required().regex( /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters and alphanumeric' } } } })
      .label('Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'New Password and Confirm password must be same' }, label: 'Password Confirmation' } })
    }
  },

};


