const Schema = {
	users: {
  id: {type: "increments", nullable: false, primary: true},		
  firstname: {type:"string",   nullable: true},
  lastname: {type:"string",   nullable: true},
  username: {type:"string",   nullable: true},
  email: {type:"string", nullable: true},
  address: {type:"string",  nullable: true},
  password: {type: "string", nullable: true},
  mobile: {type:"string", nullable: true},
  instagram: {type: "string", nullable: true},
  countrycode: {type: "string", nullable: true},
  countryname: {type: "string", nullable: true},
  city: {type: "string", nullable: true},
  profile_img_url: {type: "string", nullable: true },
  is_user_active: {type: "tinyint", nullable: false, defaultTo: 0},
  show_location: {type: "tinyint", nullable: false, defaultTo: 0},
  lat: {type: "string", nullable: true},
  lon: {type: "string", nullable: true},
  park_time: {type: "string", nullable: true},
  role:{type: "string", nullable: false, defaultTo: 'owner'},
  social_login: {type: "tinyint", nullable: true, defaultTo: 0},
  abiut: {type: "string", nullable: true },
  created_at: {type: "dateTime", nullable: false},
  updated_at: {type: "dateTime", nullable: true}
	},
	
	roles:{
		id: {type: "increments", nullable: false, primary: true},
		role: {type: "string", nullable: true}		
  },
  
  user_verifications:{
    id: {type: "increments", nullable: false, primary: true},
    otp_code: {type: "string", nullable: true},		
    expired_date: {type: "dateTime", nullable: true},
    user_id: {type: "integer", require:true, foreign: true },
    mobile: {type:"string", nullable: true},
    email: {type:"string", nullable: true},
    valid:  {type: "tinyint", nullable: true, defaultTo: 1},
    countrycode: {type: "string", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
 },
 
  tokens: {
   id: { type: "increments", nullable: false, primary: true },
   user_id: { type: "integer", require:true, foreign: true },
   token: { type: "string", nullable: true },
   isLogin : {type: "tinyint", nullable: false, defaultTo: 1},
   platform : {type: "tinyint", nullable: false },
   created_at: {type: "dateTime", nullable: false},
   updated_at: {type: "dateTime", nullable: true}
  },
  
  notifications: {
    id : { type: "increments", nullable: false, primary: true },
    message: { type: "string", nullable: true },
    to_user_id: { type: "integer", nullable:true, foreign: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    post_id: { type: "integer", nullable:true, foreign: true },
    my_picture_id: { type: "integer", nullable:true, foreign: true },
    event_id: { type: "integer", nullable:true, foreign: true },
    shared_id: { type: "integer", nullable:true, foreign: true },
    shared: { type: "integer", nullable:true },
    event_date: { type: "string", nullable: true },
    tag_id: { type: "integer", nullable:true, foreign: true },
    status: {type: "string", nullable: false, defaultTo: 'unread'},
    notification_type: { type: "integer", nullable:true, foreign: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  notification_type: {
    id : { type: "increments", nullable: false, primary: true },
    type: { type: "string", maxlength: 3000, nullable: true },
  },

  oauth_token: {
    id: { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", require:true, foreign: true },
    token: { type: "string", nullable: true },
    isLogin : {type: "tinyint", nullable: false, defaultTo: 1},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
   },
  
   country_codes: {
    id: {type: "increments", nullable: false, primary: true},
    country_code: {type:"string", maxlength: 250,nullable: true},
    country_code_three: {type:"string", maxlength: 250,nullable: true},
    country_dial_code: {type:"string", maxlength: 250,nullable: true},
    country_name: {type:"string", maxlength: 1000,nullable: true},
  },

  location: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: { type: "integer", require:true, foreign: true },
    car_lat: {type:"string",nullable: true},
    car_lon: {type:"string",nullable: true},
    des_lat: {type:"string",nullable: true},
    des_lon: {type:"string",nullable: true},
    isLive : {type: "tinyint", nullable: false, defaultTo: 0},
    take_photo :{type: "tinyint", nullable: false, defaultTo: 0 },
    park :{type: "tinyint", nullable: false, defaultTo: 0 },
    car_name: {type:"string",nullable: true },
    static_car_id: {type: "integer", require:true, foreign: true},
    my_car_id: {type: "integer", require:true, foreign: true},
    car_model: {type:"string",nullable: true },
    destination: {type:"string",nullable: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  follow_ups: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: { type: "integer", require:true, foreign: true },
    following_id: { type: "integer", require:true, foreign: true },
    follows : {type: "tinyint", nullable: false, defaultTo: 1},
    block : { type: "tinyint", nullable: false, defaultTo: 0},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  visited: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: { type: "integer", require:true, foreign: true },
    visiter_id: { type: "integer", require:true, foreign: true },
    visited : {type: "tinyint", nullable: false, defaultTo: 1},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  events: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: { type: "integer", require:true, foreign: true },
    event_name: {type:"string",nullable: true},
    event_date: {type:"dateTime",nullable: true},
    event_description: {type:"string",nullable: true},
    event_location: {type:"string",nullable: true},
    event_lat: {type:"string",nullable: true},
    event_lon: {type:"string",nullable: true},
    image_url: {type:"string",nullable: true},
    image_type: {type:"string",nullable: true},
    image_dimension: {type:"string",nullable: true},
    image_width: { type: "string", nullable:true },
    image_height: { type: "string", nullable:true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  my_cars: {
    id : { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    car_image_url: {type: "string", nullable: true },
    car_image_type: { type: "string", nullable:true },
    car_image_dimension: {type: "string", nullable:true},
    car_name: { type: "string", nullable: true },
    review:{ type: "string", nullable: true },
    model: { type: "string", nullable:true },
    details: { type: "string", nullable:true},
    color: { type: "string", nullable: true },
    engine_size: { type: "string", nullable:true },
    fuel_type: { type: "string", nullable:true},
    wheel_drive : {type: "string", nullable: true },
    engine_power: { type: "string", nullable:true },
    engine_torque: {type: "string", nullable:true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  my_pictures: {
    id : { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    image_name: { type: "string", nullable: true },
    image_model: { type: "string", nullable:true },
    image_details: { type: "string", nullable:true},
    image_url: { type: "string", nullable: true },
    image_type: { type: "string", nullable:true },
    image_dimension: { type: "string", nullable:true },
    image_width: { type: "string", nullable:true },
    image_height: { type: "string", nullable:true },
    type: {type: "string", nullable:false, default: 'gallery'},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  car_specifications: {
    id : { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    my_car_id: { type: "integer", nullable:true, foreign: true },
    image_url: { type: "string", nullable: true },
    image_type: { type: "string", nullable:true },
    image_dimension: { type: "string", nullable:true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },
    
  static_cars: {
    id : { type: "increments", nullable: false, primary: true },
    car_name: { type: "string", nullable: true },
    car_model: { type: "string", nullable:true },
    car_details: { type: "string", nullable:true},
    full_image_url: {type: "string", nullable: true },
    thumbnail_image_url: { type: "string", nullable:true },
    large_image_url: {type: "string", nullable:true},
  },

  comments: {
    id : { type: "increments", nullable: false, primary: true },
    post_id: { type: "integer", nullable:true, foreign: true },
    my_picture_id: { type: "integer", nullable:true, foreign: true },
    my_car_id: { type: "integer", nullable:true, foreign: true },
    event_id: { type: "integer", nullable:true, foreign: true },
    commenter_id: { type: "string", nullable:true},
    comments: {type: "string", nullable: true },
    like: { type: "integer", nullable:true, defaultTo: 0 },
    tag: {type: "tinyint", nullable: false, defaultTo: 0},
    type:  {type: "string", nullable: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  block: {
    id : { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    block_id: { type: "integer", nullable:true, foreign: true },
    block: { type: "tinyint", nullable: false, defaultTo: 0},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  fuel_type: {
    id : { type: "increments", nullable: false, primary: true },
    type:  {type: "string", nullable: true }
  },

  city: {
    id : { type: "increments", nullable: false, primary: true },
    name:  {type: "string", nullable: true },
    country_code_id: { type: "integer", nullable:true, foreign: true }
  },

  state: {
    id : { type: "increments", nullable: false, primary: true },
    country_id: { type: "integer", nullable:true, foreign: true },
    name:  {type: "string", nullable: true },
    code:  {type: "string", nullable: true },
  },

  post: {
      id : { type: "increments", nullable: false, primary: true },
      my_picture_id: { type: "integer", nullable:true, foreign: true },
      my_car_id: { type: "integer", nullable:true, foreign: true },
      event_id: { type: "integer", nullable:true, foreign: true },
      user_id: { type: "integer", nullable:true, foreign: true},
      comment_id: {type: "string", nullable: true },
      tag: { type: "integer", nullable:true, defaultTo: 0 },
      share: { type: "string", nullable: true },
      created_at: {type: "dateTime", nullable: false},
      updated_at: {type: "dateTime", nullable: true}
  },

  tag: {
      id : { type: "increments", nullable: false, primary: true },
      post_id: { type: "integer", nullable:true, foreign: true },
      comment_id: { type: "integer", nullable:true, foreign: true },
      user_id: { type: "integer", nullable:true, foreign: true},
      tag_id: { type: "integer", nullable:true, foreign: true},
      created_at: {type: "dateTime", nullable: false},
      updated_at: {type: "dateTime", nullable: true}
  },

  share: {
    id : { type: "increments", nullable: false, primary: true },
    post_id: { type: "integer", nullable:true, foreign: true },
    user_id: { type: "integer", nullable:true, foreign: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
},

  report: {
    id : { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    reporting_id: { type: "integer", nullable:true, foreign: true },
    report: { type: "string", nullable:true,},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  about_us: {
    id : { type: "increments", nullable: false, primary: true },
    about: { type: "string", maxlength: 3000, nullable: true },
  },

  terms:{
    id: {type: "increments", nullable: false, primary: true},
    content:{type: "string", maxlength: 3000,  nullable: true},
    url: {type: "string", nullable: true},
  },

  version: {
    id: {type: "increments", nullable: false, primary: true},
    version:{type: "string", maxlength: 3000,  nullable: true},
    os: {type: "string", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  }

};

module.exports = Schema;

