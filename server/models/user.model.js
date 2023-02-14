import Schema from '../../config/mysql.js';
import UserVerifications from '../models/user_verification.model';
import Location from '../models/location.model';
import Event from '../models/events.model';
import Followup from '../models/follow_ups.model';
import Mycar from '../models/my_cars.model';
import Visited from '../models/visited.model';
import Mypicture from '../models/my_pictures.model';
import Post from '../models/post.model';
import Share from '../models/share.model';

const Promise = require('bluebird');
const bcrypt = require('bcrypt');

const User = Schema.Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hidden: ['encrypted_password'],
  initialize() {
    this.on('creating', this.hashPassword);
    this.on('saving', this.validateExistingPhonenumber);
    this.on('updating', this.updatePassword);
    this.on('saving',this.validateExistingUsername);
    return this.on('saving', this.validateExistingEmail);
  },

  user_verifications: function () {
    return this.hasOne(UserVerifications);
  },

  location: function () {
    return this.hasMany(Location, 'user_id');
  },

  event: function () {
    return this.hasMany(Event);
  },

  visiters: function() {
    return this.hasMany(Visited);
  },

  followers:  function () {
    return this.hasMany(Followup);
  },

  mycar:  function () {
    return this.hasMany(Mycar);
  },

  mypicture:  function () {
    return this.hasMany(Mypicture);
  },

  post:  function () {
    return this.hasMany(Post);
  },

  share:  function () {
    return this.hasMany(Post).through(Share);
  },

  validateExistingEmail(model, attr, options) {
    if (this.hasChanged('email') && this.get('email') !== '') {
      return User.query('where', 'email', this.get('email'))
      .fetch()
      .then((existing) => {
        if (existing) {
          throw new Error('Email already exists');
        }
      });
    } else {
      return 0;
    }
  },

  validateExistingUsername(model, attr, options) {
    if (this.hasChanged('username')) {
      if(this.get('instagram') == null) {
        console.log("&&&")
        return User.where('social_login', '=', 0)
        .fetchAll()
        .then((existing) => {
          var jsonString = JSON.stringify(existing);
          var finalValue = JSON.parse(jsonString);
          console.log("%%((",finalValue);
          let result = [];
          if (finalValue) {
            for(var i =0; i < finalValue.length; i++) {
              result.push(finalValue[i]['username'])
              if( i == finalValue.length -1) {
                if(result.includes(this.get('username'))) {
                  throw new Error('Username already exists');
                }
              }
            }
          }
        });
      }
      else {
        console.log("&&&")
        return User.where('social_login', '=', 1)
        .fetchAll()
        .then((existing) => {
          var jsonString = JSON.stringify(existing);
          var finalValue = JSON.parse(jsonString);
          console.log("%%((",finalValue);
          let result = [];
          if (finalValue) {
            for(var i =0; i < finalValue.length; i++) {
              result.push(finalValue[i]['username'])
              if( i == finalValue.length -1) {
                if(result.includes(this.get('username'))) {
                  throw new Error('Username already exists');
                }
              }
            }
          }
        });
      }
    }
  },

  validateExistingPhonenumber(model, attr, options) {
    if (this.hasChanged('mobile')) {
      return User.query('where', 'mobile', this.get('mobile'))
      .fetch()
      .then((existing) => {
        if (existing) {
          throw new Error('Mobile Number already exists');
        }
      });
    }
  },

  hashPassword(model, attrs, options) {
    return new Promise((resolve, reject) => {
      if (model.has('password')) {
        return bcrypt.hash(model.get('password'), 10, (err, hash) => {
          if (err) { reject(err); }
          model.unset('confirm_password');
          model.set('password', hash);
          return resolve(hash);
        });
      } else {
        return resolve(null);
      }
    });
  },
  
  updatePassword(model, attrs, options) {
    return new Promise((resolve, reject) => {
      if (model.has('new_password')) {
        return bcrypt.hash(model.get('new_password'), 10, (err, hash) => {
          if (err) { reject(err); }
          model.unset('otp_code')
          model.unset('new_password');
          model.unset('old_password');
          model.unset('confirm_password');
          model.set('password', hash);
          return resolve(hash);
        });
      } 
      else {
        return resolve(null);
      }
    });
  },
}, {
  // Model static methods
  comparePassword: function (password, user, cb) {
    return bcrypt.compare(password, user.get('password'), (err, match) => {
      if (err) { cb(err); }
      if (match) { return cb(null, true); } else { return cb(err); }
    });
  }
}, {
  dependents: ['usersInfo']
});

module.exports = Schema.Bookshelf.model('User', User);
