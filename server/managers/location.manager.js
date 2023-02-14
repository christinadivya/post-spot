import Location from '../models/location.model';
import User from '../models/user.model';
import Visited from '../models/visited.model';
import Report from '../models/report.model';
import notification from '../../config/gcm';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import config from '../../../config/config';
import async from 'async';

const moment = require('moment');
const _ = require('lodash');
const distance = require('google-distance'); 
distance.apiKey = config.config.options.apiKey;

function location(req, callback) {
  let lat = (req.body.lat) ? req.body.lat: req.body.car_lat;
  let lon = (req.body.lon) ? req.body.lon: req.body.car_lon;
  req.body.user_id = req.user.id;
  if(req.body.take_photo != undefined && req.body.take_photo != null) req.body.isLive = 0
  else req.body.isLive = 1
  let result1 =[], user_ids = [], message;
  async.waterfall([
    function(done) {
      Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
        let jsonString = JSON.stringify(report);
        let finalReport = JSON.parse(jsonString);
        if(finalReport.length> 0) { 
          finalReport.forEach(element => {
            result1.push(element.reporting_id)
            if(finalReport.length == result1.length)   done(null, result1)
        });
       }
       else {
         done(null,result1)
       }
       })
  }
  , function(err,done) {
  Location.forge(req.body)
  .save()
  .then(() => {
    User.where({ id: req.user.id }).fetch().then((users) => {
      if(users) {
       users.save({ show_location: 1, lat: lat, lon: lon}, { patch: true }).then((updated)=> {
        if(result1.includes(req.user.id)) {
          result1.splice(result1.indexOf(req.user.id), 1)
        }
        Location.query(function(qb) {
         if(result1.length > 0) {
          qb.where('user_id', 'NOT IN', result1)
         }
         qb.where('user_id', '<>', req.user.id )
         qb.where({ isLive: 1, take_photo: 0 })
         }).fetchAll({ withRelated: ['user', 'mycar'] }).then((liveCars) => {
          let jsonString = JSON.stringify(liveCars);
          let distanceUesrs = JSON.parse(jsonString);
          User.forge().query(function(qb){
            if(result1.length > 0) {
              qb.where('id', 'NOT IN', result1)
             }
             qb.where('id', '<>', req.user.id)
          }).fetchAll().then((appUsers) => {
            let jsonString = JSON.stringify(appUsers);
            appUsers = JSON.parse(jsonString);
            appUsers.map((res) => {
              user_ids.push(res['id']);
              return res;
            })
          if(req.body.park != undefined || req.body.park != null) {
            if(req.body.park == 0) {
              Location.where({ user_id: req.user.id }).save({ park : 0 }, { patch: true}).then(() => {
                message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " unparked the vehicle."
                if(user_ids.length > 0)
                  notification.sendNotification({ message: message,
                    to_user_id: user_ids, user_id: req.user.id, notification_type: 5, post_id: null, my_picture_id: null, event_id: null, tag_id: null, shared_id: null, share: null, event_date: null });
              })
            }
            if(req.body.park == 1) {
              Location.where({ user_id: req.user.id, isLive: 1, park: 1 }).count().then((countParam) => {
                if(countParam == 1) {
                  message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " parked the vehicle."
                  if(user_ids.length > 0)
                      notification.sendNotification({ message: message,
                  to_user_id: user_ids, user_id: req.user.id, notification_type: 4, post_id: null, my_picture_id: null, event_id: null, tag_id: null, shared_id: null, share: null, event_date: null });
                }
              })    
            }
          } else {
            if(req.body.take_photo == undefined || req.body.take_photo == null) {
              Location.where({ user_id: req.user.id, isLive: 1 }).count().then((countParam) => {
                if(countParam == 1) {
                  message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " has go live."
                  if(user_ids.length > 0)  
                    notification.sendNotification({ message: message,
                      to_user_id: user_ids, user_id: req.user.id, notification_type: 1, post_id: null, my_picture_id: null, event_id: null , tag_id: null, shared_id: null, share: null, event_date: null });
              }
            })
            }
          }
      
    let result = _(distanceUesrs)
      .groupBy('user_id')
      .map((v, user_id) => ({
      user_id,
      values: _.first(v, (value)=> [value])
    }))
      .value();
    result.map((res) => {
      res['distance_in_meters'] = calcCrow(lat, lon ,res['values']['car_lat'], res['values']['car_lon']).toFixed(2)
      return res;
    })
    Promise.all(result.sort((a, b) => {
            return a['distance_in_meters'] - b['distance_in_meters'];
    }));

      callback(null, { data: result, code: responseCode.ok });
    })
  })
  })
  }
  else {
    callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
  }
  })
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
 }
])
}

  function showLocation(req, callback) {
    if(req.body.show) {
      User.where({ id: req.user.id }).fetch().then((users) => {
        if(users) {
         users.save({ show_location: req.body.show, lat: req.body.lat, lon:req.body.lon}, { patch: true }).then((updated)=> {
          if(req.body.show == 1) {
          Location.forge({ user_id: req.user.id, car_lat: req.body.lat, car_lon:req.body.lon }).save().then((locations) => {
              callback(null, { code: responseCode.ok, data: { data: updated }});
          })
             
           }
           else {
            callback(null, { code: responseCode.ok, data: { data: [] }});
           }
         })
        }
        else {
          callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
         }
      })
    }
    
 }

 function getCurrentLocation(req,callback) {
  Location.where({ user_id: req.user.id }).query(function(qb){
    qb.orderBy('updated_at','DESC')
    qb.limit(1)
  }).fetch().then((locations) => {
    callback(null, { code: responseCode.ok, data: locations });
  })
 }

 function getLocation(req, callback) {
    let park, finalValue;
    Location.where({ user_id: req.query.user_id, isLive: 1, take_photo: 0 }).query(function(qb){
      qb.orderBy('updated_at','DESC')
     }).fetchAll({ withRelated: ['user', 'mycar']}).then((locations) => {
      if(location) {
        let jsonString = JSON.stringify(locations);
        let finalvalue = JSON.parse(jsonString);
        finalValue = JSON.parse(jsonString);
        Promise.all(finalvalue.map((res) => {
          if(res['park'] === 1) {
            park = 1;
        }
        return;
      }))
        async.waterfall([
          function(done) {
            Visited.where({ user_id: req.user.id, visiter_id: req.query.user_id }).fetch().then((visiter) => {
              console.log(visiter)
              if(visiter) {
                 done()
              }
              else {
                Visited.forge({ user_id: req.user.id, visiter_id: req.query.user_id, visited: 1}).save().then((added) => {
                 done()
                })
              }
            })  
          },
          function(done) {
            if(park === 1) {
              let park_time;
              Location.where({ user_id: req.query.user_id, isLive: 1, take_photo: 0, park: 1 }).query(function(qb){
                qb.orderBy('updated_at','ASC')
                qb.limit(1)}).fetch().then((parking) => {
                  let jsonstring = JSON.stringify(parking);
                  finalValue =  JSON.parse(jsonstring);
                  const startTime = moment.utc(new Date()).format();
                  const endTime = moment.utc(parking.attributes.updated_at).format();
                  const ms = moment(startTime).diff(moment(endTime));
                  const d = moment.duration(ms);
              if (d.get('days') > 0) {
                      park_time = d.get('days') + 'd ' + d.get('h') + 'h ' + d.get('minute') + 'm ' // + d.get('s') + 's '
              } else {
                      park_time = d.get('h') + 'h ' + d.get('minute') + 'm ';  // + d.get('s') + 's '
               }
              done(null, park_time);
                })
            }
            else {
              done(null, "0h 0m");
            }
           
          },
          function(park_time,done) {
            let result= [];
            result.push(park_time);
            let des = finalValue.car_lat+","+finalValue.car_lon;
            let origin = req.query.car_lat+","+req.query.car_lon;
            if (finalValue.car_lat != null && finalValue.car_lon != null && req.query.car_lat != null &&
              req.query.car_lon != null) {
              distance.get( 
                {
                  index: 1,
                  origin: origin,
                  destination: des
                },
                function(err, data) {
                  if (err) {
                    result.push("Could not fetch the distance");
                    done(null,result);
                  }
                  if(data) {
                    result.push(data.duration);
                    done(null,result);
                  }
                });
            }
            else {
              result.push("0");
              done(null,result);
            }
    }
        ], function(err,done) {
             callback(null, { code: responseCode.ok, data: { data: locations, park_time: done[0], duration: done[1] }});
        })
      }
      else {
        callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest }, null);
      }
     
    })
  }

  function exploreCars(req, callback) {
    Location.forge(req.body)
    .save()
    .then(() => {
      Location.where({ isLive: 1 }).fetchAll({ withRelated: ['user', 'user.mycar', 'user.mypicture'] }).then((liveCars) => {
        let jsonString = JSON.stringify(liveCars);
        let finalValue = JSON.parse(jsonString);
        let result = _(finalValue)
        .groupBy('user_id')
        .map((v, user_id) => ({
        user_id,
        values: _.last(v, (value)=> [value])
      }))
        .value();
        callback(null, { data: result, code: responseCode.ok });
      })
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

  function trackLive(req, callback) {
      User.where({ id: req.user.id }).fetch().then((users) => {
        if(users) {
          async.waterfall([
            function(done) {
                Location.where({ user_id: req.user.id, isLive: 1 }).query(function(qb){
                  qb.orderBy('updated_at','DESC')
                  qb.limit(1)
                  }).fetch().then((locations) => {
                      Location.forge({
                        user_id: req.user.id,
                        car_lat: req.body.car_lat,
                        car_lon: req.body.car_lon,
                        des_lat: req.body.des_lat,
                        des_lon: req.body.des_lon,
                        car_name: locations.attributes.car_name,
                        car_model: locations.attributes.car_model,
                        destination: req.body.destination,
                        my_car_id: locations.attributes.my_car_id,
                        isLive: 1
                      }).save().then(() => {
                        console.log("User current location updated");
                        done();
                      })
    
                  })
            }], function(err,done) {
              Location.where({ user_id: req.body.user_id, isLive: 1 }).query(function(qb){
                qb.orderBy('updated_at','DESC')
                qb.limit(1)
              }).fetchAll({ withRelated: ['user', 'my_car'] }).then((liveCars) => {
                if(liveCars) {
                  callback(null, { data: liveCars, code: responseCode.ok });
                }
                else {
                  callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
                }
          })
            })
         
    }
    else {
      callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
    }
    })
    
  }

  function isLive(req, callback) {
    let park;
    Location.where({ user_id: req.user.id, isLive: 1, take_photo: 0}).query(function(qb){
      qb.orderBy('updated_at','DESC')
    }).fetchAll({ withRelated: ['user', 'mycar']}).then((live) => {
      let jsonString = JSON.stringify(live);
      let finalValue = JSON.parse(jsonString);
      Promise.all(finalValue.map((res) => {
        if(res['park'] === 1) {
          park = 1;
        }
      }))
      if(live) {
        if(park === 1) {
          Location.where({ user_id: req.user.id, isLive: 1, take_photo: 0, park: 1}).query(function(qb){
            qb.orderBy('updated_at','ASC')
          }).fetchAll({ withRelated: ['user', 'mycar']}).then((lives) => {
            callback(null, { data: lives, code: responseCode.ok });
          })
        }
      else {
        Location.where({ user_id: req.user.id, isLive: 1, take_photo: 0}).query(function(qb){
          qb.orderBy('created_at','DESC')
          qb.limit(1)
        }).fetchAll({ withRelated: ['user', 'mycar']}).then((livein) => {
          callback(null, { data: livein, code: responseCode.ok });
        })
      }
      }
      else {
        callback(null, { data: [], code: responseCode.ok });
      }
    })
  }


  function updateGoLive(req,callback) {
    console.log("**");
    let message, user_ids = [], result1 =[];
    User.where({ id: req.user.id }).fetch().then((users) => {
      Location.where({ user_id: req.user.id, isLive: 1 }).save({ isLive: 0, park: 0 }, { patch: true}).then((updated) => {
        console.log(updated)
        async.waterfall([
          function(done) {
            Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
              let jsonString = JSON.stringify(report);
              let finalReport = JSON.parse(jsonString);
              if(finalReport.length> 0) { 
                finalReport.forEach(element => {
                  result1.push(element.reporting_id)
                  if(finalReport.length == result1.length) {
                    done(null, result1)
                  }
                })
              }
              else {
                done(null, result1)
              }
            })
          }, function(err, done) {
          User.forge().query(function(qb){
            if(result1.length > 0) {
              qb.where('id', 'NOT IN', result1)
             }
             qb.where('id', '<>', req.user.id)
          }).fetchAll({ columns: ['id']}).then((appUsers) => {
            let jsonString = JSON.stringify(appUsers);
            appUsers = JSON.parse(jsonString);
            appUsers.map((res) => {
              user_ids.push(res['id']);
              return res;
            })
            message = "User "+ users.attributes.firstname+' '+ users.attributes.lastname + " has gone out of live."
            if(user_ids.length > 0)
              notification.sendNotification({ message: message,
                to_user_id: user_ids, user_id: req.user.id, notification_type: 2, post_id: null, my_picture_id: null, event_id: null, tag_id: null, shared_id: null, share: null, event_date: null });
            callback(null, { data: { data:{ message: responseMsg.messages.goneOut } }, code: responseCode.ok });    
          })
        }])
       
      })
    })
  }

function getCurrent(req, callback) {

  Location.where({ user_id: req.user.id }).query(function(qb) {
    qb.orderBy('updated_at', 'DESC')
    qb.limit(1)
  }).fetchAll().then((last) => {
    callback(null, { data: last, code: responseCode.ok });    
  })
}

    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    function calcCrow(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var latt1 = toRad(lat1);
      var latt2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(latt1) * Math.cos(latt2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }

export default { location, showLocation, getLocation, getCurrentLocation, trackLive, updateGoLive, isLive, getCurrent }
