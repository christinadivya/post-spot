const config = {
  env: 'production',
  port: 8003,
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  plivo: {
    api_key: 'MAYWM1MWVKNZC5ZDYWNZ',
    secret_key: 'MzdlODUyYTY2NjcxOGExOWM1ZDljMWNhMmJlYjc1'
  },
  twilio: {
    api_key: 'AC029466bdfe2a356ae4c05e7d9a714332',
    secret_key: '69c2f720457ee0796a71d4160a35f2db'
  },
  options: {
    provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyCIa2cGqwUTIR1orGcerdNqBG3A2XbjhSA', // for Mapquest, OpenCage, Google Premier
  formatter: null 
  },
  mail: {
    username: 'shilpakannan',
    password: 'optisol123',
    from: 'info@spotted.com',
    preheader: 'Spotted',
    invite: {
      subject: 'Welcome Email'
    },
    recover: {
      subject: 'Forgot Password'
    },
    customerId: {
      subject: 'Customer Id'
    },
    activeMail: {
      subject: 'Email Verification Code'
    },
    otpMail: {
      subject: 'Your Otp'
    },
  }
};

exports.config = config;
