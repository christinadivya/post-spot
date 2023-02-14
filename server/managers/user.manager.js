import User from '../models/user.model';
import UserVerifications from '../models/user_verification.model';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Visited from '../../server/models/visited.model';
import Mycar from '../../server/models/my_cars.model';
import Mypicture from '../../server/models/my_pictures.model';
import Carspecification from '../../server/models/car_specifications.model';
import Event from '../models/events.model';
import Post from '../models/post.model';
import Tag from '../models/tag.model';
import Tokens from '../models/tokens.model';
import Followup from '../models/follow_ups.model';
import Location from '../models/location.model';
import Block from '../models/block.model';
import Report from '../models/report.model';
import Twilio from '../../../config/twilio.js';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import pick from 'lodash.pick';
import async from 'async';
const distance = require('google-distance');
const moment = require('moment');
const _ = require('lodash');
var knex = require('knex');

function calculate(current,view,callback) {
  let park, finalValue;
  Location.where({ user_id: view, isLive: 1, take_photo: 0 }).query(function(qb){
    qb.orderBy('updated_at','DESC')
    }).fetchAll({ withRelated: ['user', 'mycar']}).then((locations) => {
    if(locations) {
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
          // console.log(finalValue);
          // console.log(park)
          if(park === 1) {
            let park_time;
            Location.where({ user_id: view, isLive: 1, take_photo: 0, park: 1 }).query(function(qb){
              qb.orderBy('updated_at','ASC')
              qb.limit(1)}).fetch().then((parking) => {
              let jsonstring = JSON.stringify(parking);
              finalValue =  JSON.parse(jsonstring);
              console.log(finalValue)
            const startTime = moment.utc(new Date()).format();
            const endTime = moment.utc(finalValue.updated_at).format();
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
          let origin;
          User.where({ id: current }).fetch().then((users) => {
            origin = users.attributes.lat+","+users.attributes.lon;
        
          if (finalValue.car_lat != null && finalValue.car_lon != null && users.attributes.lat != null &&
            users.attributes.lon != null) {
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
        })
}
      ], function(err,done) {
           console.log(done);
           let values = {
              park_time: done[0],
              distance: done[1],
              details: locations
           }
           if(err) {
             callback(err, null);
           }
           else {
             callback(null, values);
           }
      })
    }   
  })
}


function changePassword(req,callback) {
  User.where({ id: req.user.id }).fetch().then ((user) => {
    if(!user)
       callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
    else {
          User.comparePassword(req.body.old_password, user, (err, valid) => {
            if (err) {
              callback(null,{ code: responseCode.ok, data: { message: "Old password is wrong" }});
            }
            if (!valid) {
              callback(null,{ code: responseCode.ok, data: { message: "Old password is wrong" }});
            } else {
             
            user.save(req.body).then ((updatePassword) => {
              if(!updatePassword)
                callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
              else
               callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.passUpdated }});
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
          }
        })       
    
    }
  
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function updateProfile(req, callback) {
  let otp_code = null;
  if(req.body) {
   async.waterfall([
    function(done) {
      if(req.body.mobile) {
        User.where({ mobile: req.body.mobile }).fetch().then((alreadyExist) => {
          if(alreadyExist) {
            console.log(alreadyExist);
            callback({ message: responseMsg.messages.mobExist, code: responseCode.badRequest },null)
          }
          else {
            otp_code = Math.floor(1000 + Math.random() * 9000);
            let expired_date = new Date();
            expired_date.setHours(expired_date.getHours() + 8);
            UserVerifications.forge({countrycode: req.body.countrycode, otp_code: otp_code, expired_date: expired_date, user_id: req.user.id, mobile: req.body.mobile }).save().then ((otpuser) => {
            Twilio.sendSms(req.body.countrycode+req.body.mobile, responseMsg.messages.twilio.mobileCode+
            otpuser.attributes.otp_code);
            done(null, otp_code);
            // User.where({ id: req.user.id }).fetch().then((users) => {
            //   UserVerifications.forge({countrycode: users.attributes.countrycode, otp_code: otp_code, expired_date: expired_date, user_id: req.user.id, mobile: req.body.mobile }).save().then ((otpuser) => {
            //     Twilio.sendSms( users.attributes.countrycode+req.body.mobile, responseMsg.messages.twilio.mobileCode+
            //     otp_code);
            //     done(null, otp_code);
            // })
        })
        }
      })
      } else {
        done(null,otp_code)
      }
    },
    function(err,done){
      let params = pick(req.body, ['id', 'firstname', 'lastname', 'username', 'email', 'countrycode', 'profile_img_url', 'show_localtion', 'lat', 'lon', 'countryname', 'city', 'about', 'state']);
      User.where({ id: req.user.id }).fetch().then((users) => {
      if(users) {
         users.save(params, { patch: true })
         .then((user) => {
           done()
          })
        }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    },
    function(done){
      if(req.body.my_car) {
        for(var i = 0; i < req.body.my_car.length; i++) {
          Mycar.forge({
               user_id: req.user.id,
               car_image_url: req.body.my_car[i].car_image_url,
               car_image_dimension:  req.body.my_car[i].car_image_dimension,
               car_image_type: req.body.my_car[i].car_type,
               car_name: req.body.my_car[i].car_name,
               review: req.body.my_car[i].review,
               model: req.body.my_car[i].model,
               details: req.body.my_car[i].details,
               color: req.body.my_car[i].color,
               engine_size: req.body.my_car[i].engine_size,
               fuel_type: req.body.my_car[i].fuel_type,
               wheel_drive : req.body.my_car[i].wheel_drive,
               engine_power: req.body.my_car[i].engine_power,
               engine_torque: req.body.my_car[i].engine_torque
        }).save().then((cars) => {
            console.log("Car inserted")
        })
        if(i == req.body.my_car.length - 1)
            done()
      }
    } 
    else {
      done()
    }
          },
          function(done){
            console.log(req.body.my_picture);
            if(req.body.my_picture) {
              for(var i = 0; i < req.body.my_picture.length; i++) {
                Mypicture.forge({
                     user_id: req.user.id,
                     image_url: req.body.my_picture[i].image_url,
                     image_dimension:  req.body.my_picture[i].image_dimension,
                     image_width: req.body.my_picture[i].image_width,
                     image_height: req.body.my_picture[i].image_height,
                     image_name: req.body.my_picture[i].image_name,
                     image_type: req.body.my_picture[i].image_type,
                     image_details: req.body.my_picture[i].image_details,
                     image_model: req.body.my_picture[i].image_model
              }).save().then((cars) => {
                  console.log("Car inserted")
              })
              if(i == req.body.my_picture.length - 1)
                  done()
            }
          } 
          else {
            done()
          }
              
                }, ],function(err,done) {
                  if(err) {
                    callback({ message: err, code: responseCode.badRequest }, null)
                  }
                  else {
                    User.where({id: req.user.id }).fetchAll({ withRelated: ['followers',{ 'mycar': function(qb) {
                      qb.orderBy('updated_at', 'DESC')
                    }, 
                      'mypicture': function(qb) {
                        qb.where({is_delete: 0})
                        qb.orderBy('updated_at', 'DESC')
                       }}]})
                      .then((users) => {
                        let jsonString = JSON.stringify(users);
                        let user = JSON.parse(jsonString);         
                        Promise.all(user.map((res) =>{
                          res['otp_code'] = otp_code;
                          return res;
                        }))
                        callback(null, { data: user, code: responseCode.ok });
                      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
                  }
              })
      }
      else {
        User.where({id: req.user.id }).fetchAll({ withRelated: ['followers',{ 'mycar': function(qb) {
          qb.orderBy('updated_at', 'DESC')
        }, 
          'mypicture': function(qb) {
            qb.where({is_delete: 0})
            qb.orderBy('updated_at', 'DESC')
           }}]})
        .then((users) => {
          let jsonString = JSON.stringify(users);
          let user = JSON.parse(jsonString);         
          Promise.all(user.map((res) =>{
            res['otp_code'] = otp_code;
            return res;
          }))
          callback(null, { data: user, code: responseCode.ok });
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));      }
}

function editCar(req, callback) {
    req.body.user_id = req.user.id;
    // req.body.my_car_id = req.body.car_id;
    let params = pick(req.body,['id', 'user_id', 'car_name', 'review', 'model', 
    'details', 'color', 'engine_size', 'fuel_type', 'wheel_drive', 
    'engine_power', 'engine_torque', 'car_image_url', 'car_image_dimension', 'car_image_type']);
    Mycar.where({ id: req.body.id }).fetch().then((specifics) => {
      if(specifics) {
        specifics.save(params,{ patch: true }).then((updated) => {
          callback(null, { data: updated, code: responseCode.ok });
        })
       } 
    })
  
}
function addSpecification(req, callback) {
  req.body.user_id = req.user.id;
  req.body.my_car_id = req.body.car_id;
  let params = pick(req.body,['my_car_id', 'user_id', 'image_url', 'image_dimension', 'image_type',])
  Carspecification.where({ my_car_id: req.body.car_id }).fetch().then((specifics) => {
    if(specifics) {
      specifics.save(params,{ patch: true }).then((updated) => {
        callback(null, { data: updated, code: responseCode.ok });
      })
    } else {
      Carspecification.forge(params).save().then((cars) => {
        callback(null, { data: cars, code: responseCode.ok });
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }
  })
}

function getProfile(req, callback) {
  let user = (req.query.user_id == undefined || req.query.user_id == null)? req.user.id : req.query.user_id; 
  let result = [], details = {}, block = {}, report ={};
  async.waterfall([
   function(done) {
    if(req.user.id != user) {
      if(req.query.user_id){
        Visited.where({ user_id: req.user.id, visiter_id: req.query.user_id }).fetch().then((visiter) => {
          if(visiter) {
            Visited.where({ visiter_id: user}).fetchPage({ page: 1, pageSize: 10}).then((visiters) => {
              result.push(visiters.pagination.rowCount);
              done(null, result)
            })
          }
          else {
            Visited.forge({ user_id: req.user.id, visiter_id: req.query.user_id, visited: 1}).save().then((added) => {
              Visited.where({ visiter_id: user }).fetchPage({ page: 1, pageSize: 10}).then((visiters) => {
                result.push(visiters.pagination.rowCount);
                done(null, result)
              })
            })
          }
            
        })
      } 
    }else {
        result.push(0);
        done(null,result);
      }
      
    },
    function(err,done){
      Followup.where({ user_id: user, follows: 1, block: 0 }).fetchPage({ page: 1, pageSize: 10}).then((follwings) => {
        result.push(follwings.pagination.rowCount)
        done(null,result);
      })
    }, function(err,done) {
      Followup.where({ following_id: user, follows: 1, block: 0 }).fetchPage({ page: 1, pageSize: 10}).then((follwers) => {
        result.push(follwers.pagination.rowCount)
        done(null,result);
      })
    },
    function(err,done) {
      if(req.query.user_id == null && req.query.user_id == undefined) {
       Post.where({ user_id: req.user.id, is_delete : 0 }).fetchPage({ page: 1, pageSize: 10}).then((posts) => {
        result.push(posts.pagination.rowCount)
        done(null,result);
       })
      }
      else {
        done(null,result)
      }
    },
    function(err,done) {
      let query = function(qb){
        qb.andWhere((qb1)=> {
          qb1.where('is_delete', '=', 0)
          qb1.where({ user_id: user })
          qb1.orWhere((qb2) => {
            qb2.where('is_delete', '=', 0)
            qb2.where({ tag_id: user})
          })
      })
    }
      Tag.query(query).orderBy('updated_at', 'DESC').fetchAll({withRelated: [ 'post','post.image', 'tag_id','user' ]}).then((posts) => {
        if(posts.length > 0) {
          let post_arr = {};
          let tagged_users = { 'tagged_user': [] };
          posts.forEach((post)=>{     
            let jsonString = JSON.stringify(post);
            post = JSON.parse(jsonString); 
            tagged_users['tagged_user'].push([post['tag_id'], post['post_id']]);
            post['post']['tagged_user'] = tagged_users['tagged_user'].map((res) => {
              if (res[1] === post['post_id'])
              {
                return res[0];
              }
            }).filter(Boolean);
            post['post']['user'] = post['user']
            post_arr[post['post_id']] = post['post']            
          })
          post_arr = Object.values(post_arr);
          result.push(post_arr)
          done(null,result);
        }else {
          result.push(null)
          done(null,result)
        }
        
       })
    },
     function(err, done) {
        if(user != req.user.id) {
          Followup.query(function(qb) {
            qb.where({ user_id: req.user.id, following_id: user, follows: 1 })
            qb.where({ user_id: user, following_id: req.user.id, follows: 1 })
          }).fetch().then((follows) => {
               if(follows) {
                details = {
                  i_follow : 1,
                  following_me : 1
                }
                result.push(details);
                done(null, result)
               } else {
                Followup.where({ user_id: req.user.id, following_id: user, follows: 1 }).fetch().then((follwing) => {
                  if(follwing != null) {
                    details = {
                      i_follow : 1,
                      following_me : 0
                    }
                    result.push(details);
                    done(null, result)  
                  } else {
                    Followup.where({ user_id: user, following_id: req.user.id, follows: 1 }).fetch().then((follows) => {
                      if(follows != null) {
                        details = {
                          i_follow :0,
                          following_me : 1
                        }
                        result.push(details);
                        done(null, result)
                      } else {
                        details = {
                          follow_is : 0,
                          following_me : 0
                        }
                        result.push(details);
                        done(null, result)
                      }
                    })
                  }
                })
               }
          })
        }else {
          details = {
            follow_is : 0,
            following_me : 0
          }
          result.push(details);
          done(null, result)
        }
        
     }, function(err,done) {
      if(req.user.id != user){
        Block.query(function(qb) {
          qb.where({ user_id: req.user.id, block_id: user, block: 1 })
          qb.where({ user_id: user, block_id: req.user.id, block: 1 })
        }).fetch().then((blocks) => {
             if(blocks) {
              block = {
                blocked_me : 1,
                block_user : 1
              }
              result.push(block);
              done(null, result)
             } else {
              Block.where({ user_id: req.user.id, block_id: user, block: 1 }).fetch().then((blocked) => {
                if(blocked != null) {
                  block = {
                    blocked_me : 0,
                    block_user : 1
                  }
                  result.push(block);
                  done(null, result) 
                } else {
                  Block.where({ user_id: user, block_id: req.user.id, block: 1  }).fetch().then((blockedMe) => {
                    if(blockedMe != null) {
                      block = {
                        blocked_me : 1,
                        block_user : 0
                      }
                      result.push(block);
                      done(null, result) 
                    } else {
                      block = {
                        blocked_me : 0,
                        block_user : 0
                      }
                      result.push(block);
                      done(null, result)
                    }
                  })
                }
              })
             }
        })
      } else {
        block = {
          blocked_me: 0,
          block_user: 0
        }
        result.push(block)
        done(null, result)
      }
     },
     function(err, done) {
       if(user != req.user.id) {
        Report.where({ user_id: req.user.id, reporting_id: user}).fetch().then((reports) => {
          if(reports != null) {
            report = {
              reported: 1
            }
            result.push(report);
            done(null, result)
          }
          else {
            report = {
              reported: 0
            }  
            result.push(report);  
            done(null, result)
            }
        })

       }
       else {
        report = {
          reported: 0
        }  
        result.push(report);  
        done(null, result)
       }
     },
     function(err, done) {
      if(req.query.user_id != null && req.query.user_id !=undefined){
        if(req.user.id != req.query.user_id) {
          Location.where({ user_id: req.query.user_id, isLive: 1, take_photo: 0 }).query(function(qb){
          qb.orderBy('updated_at','DESC')
          qb.limit(1)}).fetchAll().then((locations) => {
          console.log(locations)
          console.log("$$");
          if(locations.length > 0) {
              calculate(req.user.id, req.query.user_id, function(err, values) {
                  if(err) {
                    console.log(err);
                  } else {
                    result.push(values);
                    done(null,result);
                  }
              })
          }else {
            done(null,result)
          }
      })
     }
     else {
       done(null,result)
     }
    }else {
      done(null,result)
    }
    }
  ],function(err, done) {
      if(err) {
        callback({message: err, code: responseCode.badRequest},null)
      }
      else {
        User.where({id: user})
          .fetchAll({ withRelated: [{ 'mycar': function(qb) {
            qb.orderBy('updated_at', 'DESC')
          }, 
            'mypicture': function(qb) {
              qb.where({is_delete: 0})
              qb.orderBy('updated_at', 'DESC')
             }}]})
          .then((users) => {
            if(req.query.user_id == null && req.query.user_id == undefined) {
              users = users.push({
                followers: done[2],
                following: done[1],
                visited: done[0], 
                post: done[3],
                tag: done[4]
              })
              callback(null, { data: users, code: responseCode.ok });

            } else {
              if(done.length > 4) {
                users = users.push({
                  followers: done[2],
                  following: done[1],
                  visited: done[0],
                  tag: done[3],
                  details: done[4],
                  block: done[5],
                  report: done[6],
                  isLive: done[7]
                })
                callback(null, { data: users, code: responseCode.ok });
  
              }
              else {
                users = users.push({
                  followers: done[2],
                  following: done[1],
                  visited: done[0],
                  tag: done[3],
                  details: done[4],
                  block: done[5],
                  report: done[6],
                })
                callback(null, { data: users, code: responseCode.ok });
  
              }
            }          
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  
              }
   
    })
}

function viewAll(req, callback) {
  let pageNo = req.query.page || 1;
  let result = [], result1 = [], result2 = [];
  async.waterfall([
    function(done) {
        Followup.where({ user_id: req.user.id, follows: 1, block: 0}).fetchAll({columns: ['following_id']}).then((follows) => {
         let jsonString = JSON.stringify(follows);
         let finalValue = JSON.parse(jsonString);  
         if(finalValue.length> 0) { 
            finalValue.forEach(element => {
             result.push(element.following_id)
             if(finalValue.length == result.length)
                 done(null, result)
         });
        }
        else {
          done(null,result)
        }
        })
    },
    function(err,done) {
      Block.where({ user_id: req.user.id, block: 1 }).fetchAll({ columns: ['block_id']}).then((block) => {
        let jsonString = JSON.stringify(block);
        let finalValue = JSON.parse(jsonString);
        if(finalValue.length> 0) { 
           finalValue.forEach(element => {
            result1.push(element.block_id)
            if(finalValue.length == result1.length)
                done(null, result1)
        });
       }
       else {
         done(null,result)
       }
       })
    }, function(err,done) {
      Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
        let jsonString = JSON.stringify(report);
        let finalReport = JSON.parse(jsonString);
        if(finalReport.length> 0) { 
          finalReport.forEach(element => {
            result2.push(element.reporting_id)
            result.push(element.reporting_id)
            if(finalReport.length == result2.length)   done(null, result)
        });
       }
       else {
         done(null,result)
       }
       })
    },
  function(err, done) {
    result.push(req.user.id)
  let query = function (qb) {
    if(req.query.search != null || req.query.search != undefined) {
      qb.andWhere((qb1)=> {
        qb1.where('id', 'not in', result)
        qb1.where('role', 'owner')
        qb1.andWhere((qb2)=> {
          qb2.orWhere('username','LIKE', '%'+req.query.search+'%')
          qb2.orWhere(knex.raw("concat(users.firstname, \' \', users.lastname) LIKE '%"+req.query.search+"%'"))
          // qb2.orWhere('firstname','LIKE', '%'+req.query.search+'%')
          // qb2.orWhere('lastname','LIKE', '%'+req.query.search+'%')
          qb2.orWhere('mobile','LIKE', '%'+req.query.search+'%')
          qb2.orWhere('email', 'LIKE', '%'+req.query.search+'%')
      })
    })      
  } 
  else {
    qb.where('id', 'not in', result)

  }
}
    User.query(query).orderBy('updated_at','DESC').fetchPage({ page: pageNo, pageSize: 20}).then((user) => {
      console.log(result1)
      let jsonString = JSON.stringify(user);
      let finalUser = JSON.parse(jsonString);
      Promise.all(finalUser.map((res) => {
        console.log(res['id'])
        res['blocked'] = result1.includes(res['id']) ?  1 : 0;
        console.log(res['blocked'])
        return res;
      }))
      console.log(finalUser)
      callback(null, { data : { data: finalUser, total_page: user.pagination.pageCount },code: responseCode.ok } );
  })

 }])
  
}

function logout(req,callback) {
  User.where({ id: req.user.id }).fetch().then ((user) => {
    if(user) {
      user.save({ show_location: 0, lat: null, lon: null }, { patch: true }).then((updated) => {
          Location.where({ user_id: req.user.id, isLive: 1 }).fetch().then((users) => {
            if(users) {
              Location.where({ user_id: req.user.id, isLive: 1 }).save({ isLive: 0 }, { patch: true}).then((updated) => {
                console.log(updated);
            })
            }
            else {
              console.log("No rows updated");
            }
          })
          Tokens.where({ token: req.body.token }).fetch().then((tokens) => {
            if(tokens != null) {
              tokens.destroy().then((token_destroyed) => {
                // callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.logout } });
              })
            }
          })   
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.logout } });
          })    
  }
    else {
      callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)) 
}

function resetPassword(req, callback) {   
  UserVerifications.where('user_id', req.user.id).query(function (qb) {
    qb.limit(1);
  }).orderBy('updated_at', 'DESC').fetch().then((otp) => {  
    var jsonString = JSON.stringify(otp);
    var otps = JSON.parse(jsonString);
     if(otps.valid == 1) {
      callback({ message: responseMsg.messages.otpNot, code: responseCode.badRequest },null)
     } else { 
        User.where({id: req.user.id }).fetch().then ((user) => {
          user.save(req.body).then ((updatePassword) => {
            if(!updatePassword)
              callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
            else
             callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.passUpdated }});
        })
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}


function myCommentsList(req, callback) {
  let total_likes = 0;
  if(req.query.type == 'vehicle' ) {
    Mycar.where({ id: req.query.id }).fetchAll({ withRelated: ['comments'] }).then((lists) => {
      if(lists) {
          var jsonString = JSON.stringify(lists);
          var list = JSON.parse(jsonString);
          async.waterfall([
            function(done) {
              if(list[0].comments != null) {
                for(let i = 0; i < list[0].comments.length; i++) {
                  total_likes = total_likes + list[0].comments[i]['like'];
                  if(i == list[0].comments.length - 1 ) {
                      done(null, total_likes)
              }
            }
          }else {
            done(null,total_likes)
          }
        }],function(err,done) {
          callback(null, { code: responseCode.ok, data: { data: lists, total_likes: total_likes }});
        })
      } else
          callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
    })
  } else if(req.query.type == 'gallery') {
    Mypicture.where({ id: req.query.id }).fetchAll({ withRelated: ['comments'] }).then((lists) => {
      if(lists) {
          var jsonString = JSON.stringify(lists);
          var list = JSON.parse(jsonString);
          async.waterfall([
            function(done) {
              if(list[0].comments != null) {
                for(let i = 0; i < list[0].comments.length; i++) {
                  total_likes = total_likes + list[0].comments[i]['like'];
                  if(i == list[0].comments.length - 1 ) {
                      done(null, total_likes)
              }
            }
          }else {
            done(null,total_likes)
          }
        }],function(err,done) {
          callback(null, { code: responseCode.ok, data: { data: lists, total_likes: total_likes }});
        })
      } else
          callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
    })
  } else if(req.query.type == 'event') {
    Event.where({ id: req.query.id }).fetchAll({ withRelated: ['comments'] }).then((lists) => {
      if(lists) {
          var jsonString = JSON.stringify(lists);
          var list = JSON.parse(jsonString);
          console.log("***",list)
          async.waterfall([
            function(done) {
              if(list[0].comments != null) {
                for(let i = 0; i < list[0].comments.length; i++) {
                  total_likes = total_likes + list[0].comments[i]['like'];
                  if(i == list[0].comments.length - 1 ) {
                      done(null, total_likes)
              }
            }
          }else {
            done(null,total_likes)
          }
        }],function(err,done) {
          callback(null, { code: responseCode.ok, data: { data: lists, total_likes: total_likes }});
        })
      } else
          callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
    })
  }
 
}

function viewCar(req, callback) {
  Mycar.where({ id: req.query.car_id }).fetchAll().then((lists) => {
    if(lists) {
      callback(null, { code: responseCode.ok, data: lists });
    }
    else {
      callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
    }
  })
}

function getcaruserList(req, callback) {
 let block_ids = [], result, finalValue, finalCars, user_ids = [], following_ids =[];
 let indx = ((req.query.page||1)-1)*20;
  async.waterfall([
    function(done) {
      Block.where({ user_id: req.user.id, block: 1}).fetchAll({ columns: ['block_id']}).then((blockers) => {
        let jsonString = JSON.stringify(blockers);
        let blocks = JSON.parse(jsonString);
        if(blocks.length > 0 ) {
          blocks.map((element) => {
            block_ids.push(element['block_id'])
            if(block_ids.length == blockers.length) {
              done(null, block_ids)
            }
          })
        } else {
          done(null, block_ids)
        } 
      })
    },
    function(err, done) {
      console.log(block_ids)
      Mycar.query(function(qb) {
        if(block_ids) {
          qb.where('my_cars.car_name','LIKE', '%'+req.query.car_name+'%')
          qb.where('user_id', 'NOT IN', block_ids)
          qb.where('user_id', '<>', req.user.id)
          qb.orderBy('updated_at', 'DESC')

        }else {
          qb.where('my_cars.car_name','LIKE', '%'+req.query.car_name+'%')
          qb.where('user_id', '<>', req.user.id)
          qb.orderBy('updated_at', 'DESC')
        }     
        
      }).query( function(qb) {
        if(req.query.search != null && req.query.search != undefined) {
          qb.join('users','my_cars.user_id', '=','users.id')
          qb.andWhere(function (qb1){
            qb1.orWhere('users.username','LIKE', '%'+req.query.search+'%')
            qb1.orWhere(knex.raw("concat(users.firstname, \' \', users.lastname) LIKE '%"+req.query.search+"%'"))
            // qb1.orWhere('users.firstname','LIKE', '%'+req.query.search+'%')
            // qb1.orWhere('users.lastname','LIKE', '%'+req.query.search+'%')
            qb1.orWhere('users.mobile','LIKE', '%'+req.query.search+'%')
            qb1.orWhere('users.email','LIKE', '%'+req.query.search+'%')
            qb1.orWhere('users.state','LIKE', '%'+req.query.search+'%')
            qb1.orWhere('users.city','LIKE', '%'+req.query.search+'%')
            qb1.orWhere('users.countryname','LIKE', '%'+req.query.search+'%')
          })
        }
      }).fetchAll({ withRelated: [{ 'user': function(qb) {
        qb.select('id','firstname', 'lastname')
      }}]}).then((users) => {
        let jsonString = JSON.stringify(users);
        finalValue = JSON.parse(jsonString);
        users.forEach((res) => {
          user_ids.push(res.attributes.user_id)
        })
        console.log(user_ids)
        
            Mycar.where('user_id', 'IN', user_ids).fetchAll({ withRelated: [{ 'user': function(qb) {
              qb.select('id','firstname', 'lastname')
              }}]}).then((mycars) => {
                 let jsonString = JSON.stringify(mycars);
                  finalCars = JSON.parse(jsonString);  
                  finalValue = finalValue.concat(finalCars);
                   // console.log(finalValue);
                  User.where('id', 'IN', user_ids).fetchAll().then((users) => {
                    let jsonString = JSON.stringify(users);
                    users = JSON.parse(jsonString);
                    async.waterfall( [
                      function(done) {
                        Followup.where('following_id', 'IN', user_ids).where({ user_id: req.user.id, follows: 1 }).fetchAll({
                          columns: ['following_id']
                        }).then((follows) => {
                          if(follows.length > 0) {
                            follows.forEach((element) => {
                              following_ids.push(element.attributes.following_id)
                            })
                          }
                            done(null,following_ids)
                        })
                      }], function(err,done) {
                   result = _(finalValue).groupBy('user_id').map(function (v, id) { 
                   return {
                       user: users.find((usr) => usr['id'] == id ),
                        car_list: _(v).groupBy('car_name').map(function (vcar, car_name) {
                        let car_model = {};
                          vcar.forEach((value) => {
                            value['user']['i_am_following']  = done.includes(value['user']['id'])? 1 : 0;
                            car_model[value.id] = value;
                         })  
                                      
                    return  {
                     car_name: car_name,
                     model: Object.values(car_model)
                   }
                  })
                }
              }).value();
           let total_page = result.length%20 == 0 ? result.length/20 : (result.length/20+1);
           result = result.slice(indx, indx+20);
            callback(null, { code: responseCode.ok,  data: { data: result, total_page: Math.floor(total_page)} });
          })
        })
      })
      })
    },
   
  ])
  
}

function getcarList(req, callback) {
    Mycar.where({ user_id: req.user.id }).query(function(qb){
      qb.orderBy('updated_at', 'DESC')
    }).fetchAll({ column : ['car_name']}).then((cars) => {
      let jsonString = JSON.stringify(cars);
      let finalValue = JSON.parse(jsonString);
      let result = _(finalValue).groupBy('car_name').map(function (v, car_name) {
        return {
          car_name: car_name,
        };
      }).value();
      callback(null, { code: responseCode.ok, data: result });
    })
}

function deletepersonalPictures(req, callback) {
  console.log(req.body.my_pic_id)
  Mypicture.where('id', 'IN', req.body.my_pic_id).where({ user_id: req.user.id }).save({ is_delete: 1}, { patch: true}).then((pics) => {
    console.log(pics);
      callback(null, { code: responseCode.ok, data: responseMsg.messages.deleteContent });
  })
}

function deleteCars(req, callback) {
  Mycar.where({ user_id: req.user.id, id: req.body.my_car_id }).fetch().then((pics) => {
    pics.destroy().then((detleted) => {
      callback(null, { code: responseCode.ok, data: responseMsg.messages.deleteContent });
    })
  })
}

function getmodelList(req, callback) {
  Mycar.where({ car_name: req.query.car_name, user_id: req.user.id }).fetchAll().then((cars) => {
    let jsonString = JSON.stringify(cars);
    let finalValue = JSON.parse(jsonString);
    console.log(cars)
    let result = _(finalValue).groupBy('car_name').map(function (v, car_name) {
      return {
        car_name: car_name,
        model: _.map(v, _.partialRight(_.pick, 'model','id'))
      };
    }).value();
    callback(null, { code: responseCode.ok, data: result });
  })
}

function getmymodelList(req, callback) {
  Mycar.where({ car_name: req.query.car_name, user_id: req.query.user_id }).fetchAll({ withRelated: ['specifications']}).then((cars) => {
    let jsonString = JSON.stringify(cars);
    let finalValue = JSON.parse(jsonString);
    console.log(cars)
    let result = _(finalValue).groupBy('car_name').map(function (v, car_name) {
      return {
        car_name: car_name,
        model: v };
    }).value();
    
    callback(null, { code: responseCode.ok, data: result });
  })
}

function visitedUsers(req,callback) {
  Visited.where({ visiter_id: req.user.id }).fetchAll({ withRelated: ['user']}).then((visiters) => {
    callback(null, { code: responseCode.ok, data: visiters });
  })
}

function changeMobile(req, callback) {
  User.forge({ id: req.user.id }).fetch().then((user) => {
    if (!user) {
     callback({ message: responseMsg.messages.invalidUser, code: responseCode.badRequest }, null);
    }
    else {
      User.where({ mobile: req.body.mobile }).fetch().then((alreadyExist) => {
        if(alreadyExist) {
          console.log(alreadyExist);
          callback({ message: responseMsg.messages.mobExist, code: responseCode.badRequest },null)
        }
        else {
          console.log(req.body)
          let otp_code = Math.floor(100000 + Math.random() * 900000);
          let expired_date = new Date();
          expired_date.setHours(expired_date.getHours() + 8);
          UserVerifications.forge({countrycode: req.body.countrycode, otp_code: otp_code, expired_date: expired_date, user_id: req.user.id, mobile: req.body.mobile }).save().then ((otpuser) => {
          Twilio.sendSms(req.body.countrycode+req.body.mobile, responseMsg.messages.twilio.PhoneNumber+
          otpuser.attributes.otp_code);
         
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.twilio.PhoneNumber + otpuser.attributes.otp_code } });
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
    })
  }
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function verifyOtpMobileChange(req,callback) {
  UserVerifications.where('otp_code', req.body.otp_code).where('user_id',req.user.id).where('valid',1).fetch().then((otp) => {  	
     if(!otp) {
      callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest },null)
     } else { 
    User.where({ id: req.user.id }).fetch().then ((user) => {
      if(!user)
         callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
      else {
        user.save({ countrycode: otp.attributes.countrycode, mobile: otp.attributes.mobile }).then ((updateMobile) => {
          if(!updateMobile)
            callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
          else {
            otp.save({ valid: 0 },{ patch: true }).then((otpUpdated) => {
              const token = jwt.sign({
	              id: user.id
              }, config.config.jwtSecret);
              callback(null, { code: responseCode.ok, data: { 
                message: responseMsg.messages.mobileUpdate,
                user_id: user.id,
                token: token }});
            })
          }
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function resendOtp(req, callback) { 
  let otp_code = Math.floor(1000 + Math.random() * 9000);
  let expired_date = new Date();
  let time = moment.utc(new Date()).add(5.50,'h').format('hh:mm a');
  expired_date.setHours(expired_date.getHours() + 8);
  console.log("**")
      UserVerifications.where({ mobile: req.query.mobile, valid: 1 }).query(function(qb) {
        qb.orderBy('updated_at','DESC')
        qb.limit(1)
      }).fetch().then ((otp) => {
        if(otp) {
          console.log("**")
          otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
            UserVerifications.forge({ countrycode: otp.attributes.countrycode, otp_code: otp_code, expired_date: expired_date,user_id: otp.attributes.user_id, mobile: req.query.mobile }).save().then ((otpuser) => {
              Twilio.sendSms(otp.attributes.countrycode+req.query.mobile, responseMsg.messages.twilio.mobileCode+
                otp_code +' created at '+ time);
                callback(null, { data: { message: responseMsg.messages.resendpho + otp_code }, code: responseCode.ok })
           }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));  
        })
       
      }
      }) 
}

function deleteTag(req, callback) {
  Tag.where({ post_id: req.body.post_id, user_id: req.body.user_id }).save({
    is_delete:1
  }, { patch: true }).then((tags) => {
    callback(null, { code: responseCode.ok, data: responseMsg.messages.deleteContent });

  })
}


export default { getProfile, resetPassword, changePassword, logout, getcarList, getmodelList, deleteCars,
  viewAll, updateProfile, changeMobile, myCommentsList, addSpecification, viewCar, getcaruserList, editCar,
  deletepersonalPictures, getmymodelList, visitedUsers, verifyOtpMobileChange, resendOtp, deleteTag };
