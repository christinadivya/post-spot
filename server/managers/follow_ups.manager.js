import User from '../models/user.model';
import Followup from '../models/follow_ups.model';
import Comments from '../models/comments.model';
import Mypicture from '../../server/models/my_pictures.model';
import Post from '../models/post.model';
import Event from '../models/events.model';
import Share from '../models/share.model';
import Tag from '../models/tag.model';
import Block from '../models/block.model';
import Report from '../models/report.model';
import responseMsg from '../../../config/message';
import responseCode from '../../../config/responseCode';
import pick from 'lodash.pick';
import notification from '../../config/gcm';
import async from 'async';
var convert = require('xml-js');
var fs = require('fs');
var moment = require('moment');
var http = require('https');
var knex = require('knex');

function followUser(req, callback) {  
    req.body.user_id = req.user.id;
    let message;
    Followup.where({user_id: req.user.id, following_id: req.body.following_id }).fetch().then((user_exists) => {
      if(user_exists) {
        user_exists.save({follows: req.body.follows}, { patch: true }).then((updatedUser) => {
          console.log("User updated");
          if(req.body.follows == 1) {
            User.where({id: req.user.id }).fetch().then((users) => {
              message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " start to follow you";
                notification.sendNotification({ message: message,
                  to_user_id: [req.body.following_id], user_id: req.user.id, notification_type: 3, post_id: null, my_picture_id: null, event_id: null, tag_id: null,  shared_id: null, share: null, event_date: null}) 
            })
          }
          callback(null,{data: updatedUser, code: responseCode.ok })
        })
      }
      else {
        Followup
        .forge(req.body)
        .save()
        .then((userFollow) => {
          User.where({id: req.user.id }).fetch().then((users) => {
            message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " start to follow you";
              notification.sendNotification({ message: message,
                to_user_id: [req.body.following_id], user_id: req.user.id, notification_type: 3, post_id: null, my_picture_id: null, event_id: null, tag_id: null,  shared_id: null, share: null, event_date: null}) 
          })
            callback(null,{data: userFollow, code: responseCode.ok })
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
    })          
  }

function post(req,callback) {
  req.body.user_id = req.user.id;
  User.where({ id: req.user.id }).fetch().then((users) => {
    async.waterfall([ 
      function(done) {
        if(req.body.description != null || req.body.description != undefined) {
          Mypicture.where({ id: req.body.my_picture_id }).fetch().then((pics) => {
            pics.save({ id: req.body.my_picture_id, image_description: req.body.description }, { patch: true }).then((updated) => {
              done();
            })
          })
        }
      },
      function(done) {
       let param = pick(req.body,['user_id', 'my_picture_id', 'description', 'my_car_id', 'event_id','tag', 'type'])
         Post.forge(param).save().then((posts) => {
           if(req.body.tag == 1) {
              for( let i = 0; i <= req.body.tag_id.length - 1; i++) {
                Tag.forge({ user_id: req.user.id, tag_id: req.body.tag_id[i], post_id: posts.attributes.id }).save().then((tags) => {
                let message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " has tagged you."
                notification.sendNotification({ message: message,
                  to_user_id: [req.body.tag_id[i]], user_id: req.user.id, notification_type: 8, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: tags.id,  shared_id: null, share: null, event_date: null });
              })
            if(i == req.body.tag_id.length - 1) 
                 done(null, posts.attributes.id)
           }
         }else {
          done(null, posts.attributes.id)
         }
      })
    }
  ], function(err, done) {
     Post.where({ id: done }).fetchAll({ withRelated: ['image', 'car', 'event']}).then((posts) => {
      callback(null, {data: posts, code: responseCode.ok })
     })
  })
  })
}

function editPicture(req, callback) {
  console.log(req.body.my_picture_id);
  Mypicture.where({id: req.body.my_picture_id }).fetch().then((pics) => {
    if(pics != null) {
        pics.save({ id: req.body.my_picture_id, image_description: req.body.description }, { patch: true }).then((updated) => {
          callback(null, {data: updated, code: responseCode.ok })
      })
    } else {
        callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
    }
  })
}

function listFollow(req, callback) {
  let pageNo = req.query.page || 1, result = [];
  let user = (req.query.user_id == undefined || req.query.user_id == null)? req.user.id : req.query.user_id;
  async.waterfall([
    function(done) {
        Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
          let jsonString = JSON.stringify(report);
          let finalReport = JSON.parse(jsonString);
          if(finalReport.length> 0) { 
            finalReport.forEach(element => {
              result.push(element.reporting_id)
              if(finalReport.length == result.length)   done(null, result)
          });
         }
         else {
           done(null,result)
         }
         })
    },  function(err, done) {
      Followup.where({ user_id: user, follows: 1, block: 0 } ).query(function(qb) {
        if(result.length> 0) {
          qb.where('following_id', 'NOT IN', result)
        }
    }).query( function(qb) {
    if(req.query.search != null && req.query.search != undefined) {
      qb.join('users','follow_ups.following_id', '=','users.id')
      qb.andWhere(function (qb1){
        qb1.orWhere('users.username','LIKE', '%'+req.query.search+'%')
        qb1.orWhere(knex.raw("concat(users.firstname, \' \', users.lastname) LIKE '%"+req.query.search+"%'"))
        // qb1.orWhere('users.firstname','LIKE', '%'+req.query.search+'%')
        // qb1.orWhere('users.lastname','LIKE', '%'+req.query.search+'%')
        qb1.orWhere('users.mobile','LIKE', '%'+req.query.search+'%')
        qb1.orWhere('users.email','LIKE', '%'+req.query.search+'%')
  
      })
    }
  }
  ).fetchPage({ page: pageNo, pageSize: 20, withRelated: ['following_id']})
  .then((follows) => {
    let jsonString = JSON.stringify(follows);
    let finalfollows = JSON.parse(jsonString);
    if(finalfollows.length > 0) {
      if(user) {
        let following_ids = finalfollows.map((res) => {
          return res['following_id']['id']
        });
        if(following_ids.length > 0) {
          Promise.all(Followup.where('following_id', 'IN', following_ids).where({user_id: 
            req.user.id, follows: 1, block: 0 }).fetchAll().then((following) => {
              let jsonString = JSON.stringify(following);
              let finalfollowing = JSON.parse(jsonString)
              finalfollowing = finalfollowing.map((fol) => { return fol['following_id']; });
              return finalfollows.map((res) => {    
                res['i_am_following'] = finalfollowing.includes(res['following_id']['id']) ? 1 : 0; 
                return res;
              });
            })).then(data => {
              console.log(data);
                Promise.all(Block.where('block_id', 'IN', following_ids).where({ user_id: req.user.id, block: 1}).fetchAll().then((blockers) => {
                let jsonString = JSON.stringify(blockers);
                let finalblocks = JSON.parse(jsonString);
                finalblocks = finalblocks.map((block) => { return block['block_id']; });
                  return finalfollows.map((res) => {    
                    res['blocked_user'] = finalblocks.includes(res['following_id']['id']) ? 1 : 0; 
                    return res;
                  });
              }))
                .then(value => {
                 console.log(value);
                 callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
                })
            })
          
        } else {
          finalfollows = finalfollows.map((res) => {    
            res['i_am_following'] = 0;
            res['blocked_user'] = 0; 
            return res;
          })
          callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
        }
           
      }else {
        callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
      }
    }
    else {
      callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
  
       }
     })
    }
  ],)
   
}

function listFollowing(req, callback) {
  let pageNo = req.query.page || 1;
  let block_ids = [], result = [];
  let user = (req.query.user_id == undefined || req.query.user_id == null)? req.user.id : req.query.user_id;
  async.waterfall([ function(done){
    Block.where({ user_id: user, block: 1 }).fetchAll({ columns: ['block_id']}).then((blockers) => {
      let jsonString = JSON.stringify(blockers);
      let blocks = JSON.parse(jsonString);
      if(blockers.length > 0) {
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
        Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
          let jsonString = JSON.stringify(report);
          let finalReport = JSON.parse(jsonString);
          if(finalReport.length> 0) { 
            finalReport.forEach(element => {
              result.push(element.reporting_id)
              if(finalReport.length == result.length) done(null, result)
          });
         }
         else {
           done(null,result)
         }
         })
    },
    function(err, done) {
      console.log(done)
      Followup.where({ following_id: user, follows: 1, block: 0 }).query(
        function(qb) {
          if(result.length > 0) {
            qb.where('user_id', 'NOT IN', result )
          }
          }).query(
        function(qb) {
          if(block_ids.length > 0) {
            qb.where('user_id', 'NOT IN', block_ids )
          }
          }).query( function(qb) {
      if(req.query.search != null && req.query.search != undefined) {
        qb.join('users','follow_ups.user_id', '=','users.id')
        qb.andWhere(function (qb1){
          qb1.orWhere('users.username','LIKE', '%'+req.query.search+'%')
          qb1.orWhere(knex.raw("concat(users.firstname, \' \', users.lastname) LIKE '%"+req.query.search+"%'"))
          // qb1.orWhere('users.firstname','LIKE', '%'+req.query.search+'%')
          // qb1.orWhere('users.lastname','LIKE', '%'+req.query.search+'%')
          qb1.orWhere('users.mobile','LIKE', '%'+req.query.search+'%')
          qb1.orWhere('users.email','LIKE', '%'+req.query.search+'%')
  
        })
      }
    }
      
    ).fetchPage({ page: pageNo, pageSize: 20, withRelated: [ 'user']}).then((follows) => {
      let jsonString = JSON.stringify(follows);
      let finalfollows = JSON.parse(jsonString);
      if(finalfollows.length > 0) {
        if(user) {
          let following_ids = finalfollows.map((res) => {
            return res['user']['id']
          });
          console.log(following_ids)
        if(following_ids.length > 0) {
                Promise.all(Followup.where('following_id', 'IN', following_ids).where({ user_id: req.user.id, follows: 1, block: 0 }).fetchAll().then((following) => {
                  let jsonString = JSON.stringify(following);
                  let finalfollowing = JSON.parse(jsonString)
                  finalfollowing = finalfollowing.map((fol) => { return fol['following_id']; });
                  console.log(finalfollowing)
                  return finalfollows.map((res) => {    
                    res['i_am_following'] = finalfollowing.includes(res['user']['id']) ? 1 : 0; 
                    return res;
                  });
                  
                })).then(data => {
                  console.log(data);
                    Promise.all(Block.where('block_id', 'IN', following_ids).where({ user_id: req.user.id, block: 1}).fetchAll().then((blockers) => {
                    let jsonString = JSON.stringify(blockers);
                    let finalblocks = JSON.parse(jsonString);
                    finalblocks = finalblocks.map((block) => { return block['block_id']; });
                      return finalfollows.map((res) => {    
                        res['blocked_user'] = finalblocks.includes(res['user']['id']) ? 1 : 0; 
                        return res;
                      });
                  }))
                    .then(value => {
                     console.log(value);
                     callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
                })
              })
              } else {
                finalfollows = finalfollows.map((res) => {    
                  res['i_am_following'] = 0;
                  res['blocked_user'] = 0;
                  return res;
                })
                callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
              }
            
        }else {
          callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
        }
      } else {
        callback(null,{data:  { data: finalfollows, total_page: follows.pagination.pageCount }, code: responseCode.ok }) 
      }
     
    })
  }
  ], )
}

function listwithoutPage(req, callback) {
  Followup.where({ user_id: req.query.user_id, follows: 1, block: 0 }).fetchAll({ withRelated: ['user', 'following_id']}).then((follows) => {
    callback(null,{ data: follows , code: responseCode.ok })
  })
}

function comments(req, callback) {
  let shared_id, share, isDelete, likeUpdate = 0;
  req.body.commenter_id = req.user.id;
  User.where({ id: req.user.id }).fetch().then((users) => {
    Post.where( { id: req.body.post_id }).fetch().then((posts) => {
      console.log(posts)
    async.waterfall([
      function(done) {
        if(req.body.shared_by_id) {
          Share.where({ post_id: req.body.post_id, user_id: req.body.shared_by_id }).fetch({columns: ['id', 'is_delete']}).then((share_id) => {
            console.log(share_id.attributes.id)
            isDelete = share_id.attributes.is_delete;
            done(null,share_id.attributes.id)
        })
      }
      else {
        done(null, 0)
      }
    }
  ], function(err,done) {
    if(done != 0) req.body.share_id = done;
    // console.log("%%%", isDelete)
    done != 0 ? shared_id = req.body.shared_by_id : shared_id = null;
    shared_id == null ? share = 0 : share = 1;
   
    let param = pick(req.body,['post_id', 'my_picture_id', 'share_id', 'commenter_id', 'comments', 'like' ]);
    if(req.body.comments) {
      let message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " commented your photo/post."
    if(req.body.shared_by_id) {
      console.log("&&&", typeof req.body.shared_by_id, typeof req.user.id, req.body.shared_by_id, req.user.id)
      if(req.user.id != parseInt(req.body.shared_by_id) && isDelete == 0) {
      notification.sendNotification({ message: message,
        to_user_id: [req.body.shared_by_id], user_id: req.user.id, notification_type: 11, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: shared_id, share: share, event_date: null})
      }
    }
    if(req.body.shared_by_id == null && req.body.shared_by_id == undefined) {
      if(req.user.id != posts.attributes.user_id && posts.attributes.is_delete == 0) {
      notification.sendNotification({ message: message,
        to_user_id: [posts.attributes.user_id], user_id: req.user.id, notification_type: 11, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: shared_id, share: share, event_date: null}) 
      }
    }
        Comments.forge(param).save().then((comments) => {
          callback(null,{data: comments, code: responseCode.ok })
        })
  }
  else if(req.body.like) {
    if(done != 0) req.body.share_id = done;
    let query = (done != 0) ? { commenter_id: req.user.id, post_id: req.body.post_id, share_id: done } :{ commenter_id: req.user.id, post_id: req.body.post_id };
    Comments.where(query).where('comments','IS',null).fetch().then((likes) => {
      if(likes == null) {
        Comments.forge(param).save().then((comments) => {
          if(req.body.like == 1) {
            let message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " liked your photo/post."
            if(req.body.shared_by_id) {
              if(req.user.id != parseInt(req.body.shared_by_id) && isDelete == 0) {
                notification.sendNotification({ message: message,
                  to_user_id: [req.body.shared_by_id], user_id: req.user.id, notification_type: 10, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: shared_id, share: share, event_date: null }) 
                }
            }
            if(req.body.shared_by_id == null && req.body.shared_by_id == undefined) {
              if(req.user.id != posts.attributes.user_id && posts.attributes.is_delete == 0) {
                notification.sendNotification({ message: message,
                  to_user_id: [posts.attributes.user_id], user_id: req.user.id, notification_type: 10, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: shared_id, share: share, event_date: null }) 
                }
            }
            
          }
          callback(null,{data: comments, code: responseCode.ok })
        })
    }
    else {
      // console.log('***', req.body.like)
      likeUpdate = parseInt(req.body.like)
      // console.log('***', likeUpdate, typeof likeUpdate)
      Comments.where(query).where('comments','IS',null).save({
        like: likeUpdate
      }, { patch: true }).then((updated) => {
        if(req.body.like == 1) {
          let message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " liked your photo/post."
          if(req.body.shared_by_id) {
            if(req.user.id != parseInt(req.body.shared_by_id) && isDelete == 0) {
               notification.sendNotification({ message: message,
                  to_user_id: [req.body.shared_by_id], user_id: req.user.id, notification_type: 10, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: shared_id, share: share, event_date: null }) 
            }
          }
          if(req.body.shared_by_id == null && req.body.shared_by_id == undefined) {
            if(req.user.id != posts.attributes.user_id && posts.attributes.is_delete == 0) {
              notification.sendNotification({ message: message,
                to_user_id: [posts.attributes.user_id], user_id: req.user.id, notification_type: 10, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: shared_id, share: share, event_date: null }) 
              }
          }
          
        }
        callback(null,{data: updated, code: 201 })
      })
    }
  })
  
     }
    })
   })
  })
}
 
 
  // async.waterfall([ 
  //   function(done) {
  //     let param = pick(req.body,['my_picture_id', 'my_car_id', 'event_id','comments', 'tag', 'type'])
  //     Comments.forge(param).save().then((comments) => {
  //        if(req.body.tag == 1) {
  //          for( let i = 0; i <= req.body.tag_id.length; i++) {
  //             Tag.forge({ user_id: req.user.id, tag_id: req.body.tag_id, comment_id: comments.attributes.id }).save().then((tags) => {
  //               console.log(tags);
  //             })
  //           if(i == req.body.tag_id.length) 
  //                done(null, comments.attributes.id)
  //          }
  //        }
  //        else {
  //         done(null, comments.attributes.id)
  //        }
  //     })
  //   }
  // ], function(err, done) {
  //    Comments.where({ id: done }).fetchAll({ withRelated: ['image', 'car', 'event']}).then((comment) => {
  //     callback(null, {data: comment, code: responseCode.ok })
  //    })
  // })

function listcomments(req, callback) {
  Comments.forge().fetchAll({ withRelated: ['image', 'car', 'event', 'commenter'] }).then((comments) => {
    callback(null,{data: comments, code: responseCode.ok })
  })
}

function listPost(req, callback) {
  let finalPost, share;
  let result = [], report_id =[];
  let today_date = moment.utc(new Date()).format('YYYY-MM-DD');
  let end_date = moment(today_date).add(60, 'days').format('YYYY-MM_DD');
    async.waterfall([
      function(done) {
        Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
          let jsonString = JSON.stringify(report);
          let finalReport = JSON.parse(jsonString);
          if(finalReport.length> 0) { 
            finalReport.forEach(element => {
              report_id.push(element.reporting_id)
              if(finalReport.length == report_id.length) done(null, report_id)
          });
         }
         else {
           done(null,report_id)
         }
         })
      },
      function(err,done) {
        // console.log('**', report_id)
        Followup.where({ user_id: req.user.id, follows: 1, block: 0}).query(function(qb) {
          if(report_id.length > 0) {
            qb.where('following_id', 'NOT IN', report_id)
          }
        }).fetchAll({columns: ['following_id']}).then((follows) => {
         let jsonString = JSON.stringify(follows);
         let finalResult = JSON.parse(jsonString);
        //  console.log(finalResult)
         if(finalResult.length > 0) {
            finalResult.forEach(element => {
                result.push(element.following_id)
                if(finalResult.length == result.length)
                    done(null,result)
            });
         } 
         else {
           done(null,result)  
         } 
        
        })
    },
    function(err,done) {
      // console.log("$$$", result)
      result.push(req.user.id)
      Post.where('post.user_id', 'IN', result).where('post.is_delete', '=', 0).query(function(qb) {
        qb.orderBy('updated_at', 'DESC')
      }).fetchAll({ withRelated: [  {'image': function(qb) {
          qb.select('id','image_url', 'image_dimension', 'image_height', 'image_width', 'image_description')
        },'user': function(qb) {
          qb.select('id','username', 'firstname', 'lastname', 'profile_img_url')
        }, 'event': function(qb) {
          qb.whereBetween('event_date',[today_date, end_date])
          qb.select('user_id', 'id', 'event_name', 'event_date', 'event_location','event_description', 'image_url', 'image_dimension', 'image_height', 'image_width', 'updated_at')
        }, 'comments': function(qb) {
          qb.orWhere('share_id', '=', '')
          qb.orWhere('share_id','IS', null)
        }
        }]}).then((posts) => {
          let jsonString = JSON.stringify(posts);
          finalPost = JSON.parse(jsonString);
          finalPost = finalPost.map((res) => { 
            res['shared'] = 0;
            return res;
          }) 
          
       Share.where('user_id', 'IN', result).where('is_delete','=', 0).fetchAll().then((shares) => {
            let jsonString = JSON.stringify(shares);
            share = JSON.parse(jsonString);
            // console.log('000000', share)
            Promise.all(share.map((r)=> {
              return r['id']
            })).then((share_id) => {
              // console.log(share_id)
              Share.where('user_id', 'IN', result).where('is_delete','=', 0).fetchAll({ withRelated: ['post', { 'post.image': function(qb) {
                qb.select('id','image_url', 'image_dimension', 'image_height', 'image_width')
              },'sharedby': function(qb) {
                qb.select('id','username', 'firstname', 'lastname', 'profile_img_url')
              }, 'post.user':  function(qb) {
                qb.select('id','username', 'firstname', 'lastname', 'profile_img_url')
              },
              'post.event': function(qb) {
                qb.whereBetween('event_date',[today_date, end_date])
                qb.select('user_id', 'id', 'event_name', 'event_date', 'event_location', 'event_description', 'image_url', 'image_dimension', 'image_height', 'image_width', 'updated_at')
              }, 'post.comments': function(qb) {
                qb.where('share_id', 'IN', share_id)
              }}]}).then((shared) => {
                // let jsonString = JSON.stringify(shared);
                //   let finalShared = JSON.parse(jsonString);
                // console.log(1111, finalShared);
                let indx = ((req.query.page||1)-1)*20;
                if(shared.length > 0) {
                  let jsonString = JSON.stringify(shared);
                  let finalShared = JSON.parse(jsonString);
                  // console.log(finalShared)
                  finalShared = finalShared.map((res) => { 
                    res['post']['sharedby'] = res['sharedby'];
                    res['post']['shared'] = 1;
                    res['post']['share_id'] = res['id']
                    res['post']['updated_at'] = res['updated_at'];
                    return res['post'];
                  })              
                  finalPost = finalPost.concat(finalShared)
                  finalPost = finalPost.filter((eve) =>{
                    return (eve.event_id != null && Object.keys(eve.event).length != 0) || eve.event_id == null;
                  })
                  Promise.all(finalPost.sort((a, b) => {
                    let dateA = new Date(a['updated_at']), 
                        dateB = new Date(b['updated_at']);
                    return dateB - dateA;
                  }));
                  // console.log(finalPost)
                  let total_page = finalPost.length%20 == 0 ? finalPost.length/20 : (finalPost.length/20+1);
                  finalPost = finalPost.slice(indx, indx+20);
                  // finalPost = finalPost.sort((a, b) => {                    
                  //   let dateA = a['event_id'] != null ? new Date(a['event']['event_date']) : new Date(0,0,0), 
                  //     dateB = b['event_id'] != null ? new Date(b['event']['event_date']) : new Date(0,0,0),
                  //     dateC = new Date(a['updated_at']),
                  //     dateD = new Date(b['updated_at']);
                  //     console.log(dateA)
                  //     return dateA - dateB || dateD - dateC;
                  // })
                  finalPost = finalPost.map((res) => {
                    let comments = res['comments'];
                    let comment_count = 0;
                    let like_count = 0;
                    let liked_already = 0;
                    console.log(333, res)

                    if(comments) {
                      res['comments'] = [];
                      comments.forEach((com) => {
                        // console.log(com)
                        if (com['share_id'] == res['share_id']) {                   
                          if (com['comments'] !== null) {
                            comment_count = comment_count + 1;
                          } 
                          if(com['like'] == 1 && com['comments'] == null) {
                            like_count = like_count + 1;
                            if(req.user.id == com['commenter_id'] && com['like'] == 1 && com['comments'] == null) {
                              liked_already = 1;
                            }
                          }
                          res['comments'].push(com)
                        }
                        // console.log(comment_count, like_count)
                      });
                    }
                  
                    res['comment_count'] = comment_count;
                    res['like_count'] = like_count;
                    res['liked_already'] = liked_already;
                    return res;
                  })
                  callback(null,{ data: { data: finalPost, total_page: Math.floor(total_page) }, code: responseCode.ok})
                }
                else {
                  let total_page = finalPost.length%20 == 0 ? finalPost.length/20 : (finalPost.length/20+1);
                  finalPost = finalPost.slice(indx, indx+20);
                  finalPost = finalPost.map((res) => {
                    let comments = res['comments'];
                    let comment_count = 0;
                    let like_count = 0;
                    let liked_already = 0;
                    // console.log(333, comments)
                    if(comments) {
                      comments.filter((com) => {
                        // console.log(com)
                        if (com['comments'] !== null) {
                          comment_count = comment_count + 1;
                        } 
                        if(com['like'] == 1) {
                          like_count = like_count + 1;
                          if(req.user.id == com['commenter_id']) {
                            liked_already = 1;
                          }
                        }
                        // console.log(comment_count, like_count)
                      });
                    }
                  
                    res['comment_count'] = comment_count;
                    res['like_count'] = like_count;
                    res['liked_already'] = liked_already;
                    return res;
                  });
                  callback(null,{ data: { data: finalPost, total_page: Math.floor(total_page) }, code: responseCode.ok})
                }
              });
          });           
          }); 
        });
    },])
}

function block(req,callback) {
  async.waterfall([
    function(done) {
      Followup.where({ user_id: req.user.id, following_id: req.body.block_id }).fetch().then((user) => {
        if(user) {
          user.save({ user_id: req.user.id, following_id: req.body.block_id, follows: 0, block: req.body.block}, { patch: true }).then((blocked) =>{
          done() 
          })
        }
        else {
          Followup.where({ user_id: req.body.block_id, following_id:req.user.id}).fetch().then((user) =>{
            if(user) {
              user.save({ user_id: req.body.block_id, following_id: req.user.id , follows: 0, block: req.body.block}, { patch: true }).then((blocked) =>{
                done()
            })
            }else {
              done()
            }
            
          })
        }
      })
    }
  ], function(err, done) {
  Block.where({ user_id: req.user.id, block_id: req.body.block_id }).fetch().then((user) => {
    if(user) {
      user.save({ user_id: req.user.id, block_id: req.body.block_id, block: req.body.block}).then((blockUpdated) => {
         callback(null, { data: blockUpdated, code: responseCode.ok }); 
      })
    }else {
      Block.forge({ user_id: req.user.id, block_id: req.body.block_id, block: req.body.block}).save().then((blocked) => {
        callback(null,{ data: blocked, code: responseCode.ok });
      })
    }
    
  })
})
}

function countList(req, callback) {
  let total_likes = 0, total_comments = 0, liked = 0, result =[];
    async.waterfall([
      function(done) {
        if(req.query.user_id != null && req.query.user_id != undefined) {
          Share.where({ post_id: req.query.post_id, user_id: req.query.user_id }).fetch({columns: ['id']}).then((share_id) => {
            console.log(share_id)
            done(null, share_id.attributes.id)
          })
        }
        else {
          done(null, 0)
        }
      }
    ], function(err, done) {
    Post.where({ id: req.query.post_id }).fetchAll({ withRelated: ['user', 'tags.tag_id', 'image', 'comments.commenter' ,{
      'comments': function(qb) {
        if(done != 0) {
          qb.where('share_id', '=', done)
          qb.orderBy('updated_at', 'DESC')
        }
        else {
          qb.orWhere('share_id', 'IS', null)
          qb.orWhere('share_id', '=', '')
          qb.orderBy('updated_at', 'DESC')
        }
      }
     }]}).then((lists) => {
      let jsonString = JSON.stringify(lists);
      let finalCount = JSON.parse(jsonString);
      // console.log("$$", finalCount )
      async.waterfall([
        function(done) {
          if(finalCount[0].comments.length > 0) {
            if(finalCount[0].comments != null) {
              for(let i = 0; i < finalCount[0].comments.length; i++) {
                if(finalCount[0].comments[i]['like'] == 1) {
                  total_likes = total_likes + 1;
                }
            if(i == finalCount[0].comments.length - 1) {
              result.push(total_likes);
              done(null, result)
          }
          }
        }
          }
          else {
        result.push(total_likes);
        done(null,result)
      }
    },
    function(err,done) {
      if(finalCount[0].comments.length > 0) {
        if(finalCount[0].comments != null) {
        for(let i = 0; i < finalCount[0].comments.length; i++) {
          if(finalCount[0].comments[i]['comments'] != null) {
              total_comments = total_comments + 1;
         }
         if(i == finalCount[0].comments.length - 1 ) {
          result.push(total_comments);
          done(null, result)
        }
        }
      }
    } else {
         result.push(total_comments);
         done(null,result)
        }
      },
      function(err,done) {
          if(finalCount[0].comments.length > 0) {
          if(finalCount[0].comments != null) {
          for(let i = 0; i < finalCount[0].comments.length; i++) {
            // console.log('$$', finalCount[0].comments[i]['commenter_id']);
            // console.log(req.user.id);
              (finalCount[0].comments[i]['commenter_id'] == req.user.id &&
              finalCount[0].comments[i]['comments'] == null && finalCount[0].comments[i]['like'] == 1) ? liked = 1 : '';
            // console.log(liked)
             if(i == finalCount[0].comments.length - 1 ) {
                result.push(liked);
                done(null, result)
          }
      }
    } } else {
          result.push(liked);
          done(null, result);
      }
  }],
  function(err,done) {
          if(err)
            callback({message: err, code: responseCode.badRequest }, null)
          else {
            // console.log("PP",done);
            // Post.where({ id: req.query.post_id }).fetchAll({ withRelated: ['user', 'image','comments.commenter', {
            //   'comments' : function(qb) {
            //     qb.where('like', '<>', 1)
            //     qb.where('comments', 'IS NOT', null)
            //     qb.where('comments', '<>', '')
            //     qb.orderBy('updated_at', 'DESC')
            //   }
            // } ]}).then((list) => {
              let finalData = finalCount.map((res) => {
                res['comments'] = res['comments'].map((cmnt) => {
                  let a = (cmnt['comments'] == null || cmnt['comments'] == '') ? null : cmnt;
                  return a;
                }).filter(Boolean)
                return res;
              });
              callback(null, { code: responseCode.ok, data: { data: finalData, total_likes: done[0], total_comments: done[1], liked: done[2] }});
        //  })
          }         
    })
    })
   })
}

function newsFeed(req,callback) {
  let finalValue;
  async.waterfall([
    function(done) {
        fs.unlink('file.xml', (err)=>{
          console.log(err)
        })
        var request = http.request("https://feeds.highgearmedia.com/", function (res) {    
            res.on('data', (d) => {               
                let bufferOriginal = Buffer.from(d);                
                fs.appendFileSync('file.xml', bufferOriginal.toString());
            });   
            res.on("end", (data) => {
                console.log("end")
                done()
            })
        });
        request.end();        
    },
    function(done) {
        // console.log("&&&")
        var xml = fs.readFileSync('file.xml', 'utf8').replace(/&/g,"&amp;")
        .replace(/-/g,"&#45;");
        var result1 = convert.xml2json(xml, {compact: true, spaces: 4});
        // var result2 = convert.xml2json(xml, {compact: false, spaces: 4});
        // console.log(result1, '\n', result2);
        var rex = /<.*?img.*?src=\"(.*?)\".*?\/>/g;
        fs.writeFile('./result.json', result1, (err) => {
            console.log(err, "writing JSON")
            // let jsonString = JSON.stringify(result1);
            result1 = result1.replace(/&amp;/g, "&").replace(/&#45;/g, "-")
            finalValue = JSON.parse(result1); 
            let items = finalValue['rss']['channel']['item'];            
            finalValue['rss']['channel']['item'] = items.map((item) => {
              let cdata = item['description']['_cdata']              
              if (item && item['description'] && cdata) {
                let img_srcc= cdata.match(rex)
                if (img_srcc) {
                  item['description']['_cdata'] = item['description']['_cdata'].replace(img_srcc[0], '')
                  console.log(img_srcc)
                  let img = img_srcc[0],
                      img_src = img.match(/\"(.*?)\"/)[1],
                      img_width = img.match(/width(.*?)(\d+)"/)[2],
                      img_height = img.match(/height(.*?)(\d+)"/)[2];
                  if (img) {
                    let img_detail = {
                      image_url: img_src,
                      image_width: img_width,
                      image_height: img_height
                    }
                    item['description']['image'] = img_detail
                  }
                }
                return item;              
              }
            })
            done(null, finalValue);
        });
    },
    // function(err, done) {}

], function(err, done) {
  if(err) {
    callback({message: err, code: responseCode.badRequest }, null);
  } else {
    console.log(typeof done)
    callback(null,{ data: { data: done }, code: responseCode.ok });
  }
})

}

function report(req, callback){
   req.body.user_id = req.user.id;
   async.waterfall([
    function(done) {
      Followup.where({ user_id: req.user.id, following_id: req.body.reporting_id }).fetch().then((user) => {
        if(user) {
          user.save({ user_id: req.user.id, following_id: req.body.reporting_id , block: 1}, { patch: true }).then((blocked) =>{
          done() 
          })
        }
        else {
          Followup.where({ user_id: req.body.reporting_id, following_id:req.user.id}).fetch().then((user) =>{
            if(user) {
              user.save({ user_id: req.body.reporting_id, following_id: req.user.id , block: 1}, { patch: true }).then((blocked) =>{
                done()
            })
            }else {
              done()
            }
            
          })
        }
      })
    },
  function(done) {
  Block.where({ user_id: req.user.id, block_id: req.body.reporting_id }).fetch().then((user) => {
    if(user) {
      user.save({ user_id: req.user.id, block_id: req.body.reporting_id, block: 1}).then((blockUpdated) => {
        done(); 
      })
    }else {
      Block.forge({ user_id: req.user.id, block_id: req.body.reporting_id, block: 1}).save().then((blocked) => {
       done();
          })
    }
    
  })
}], function(err, done){
  Report.forge(req.body).save().then((reports) => {
    callback(null,{ data: reports, code: responseCode.ok });

   })
})
   
}

function share(req, callback) {
  let following_id = [], message, event, event_date, event_name;
  let id = (req.body.flag == 1)? { id: req.body.post_id } : { event_id: parseInt(req.body.event_id) };
  User.where({ id: req.user.id }).fetch().then((users) => {
    Post.where(id).fetch({ columns: ['id', 'my_picture_id', 'user_id', 'is_delete'] }).then((posts) => {
      if(posts) {
        Share.where({ user_id: req.user.id, post_id: posts.attributes.id }).fetch().then((share) => {
         if(share) {
            callback(null, { data: share, code: responseCode.created});
        }
        else {
          Share.forge({ user_id: req.user.id, post_id: posts.attributes.id }).save().then((shareCreated) => {
            if(req.body.flag == 1) {
              if(req.user.id != posts.attributes.user_id && posts.attributes.is_delete == 0) {
                message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " shared your post."
                notification.singleNotification({ message: message,
                  to_user_id: [posts.attributes.user_id], user_id: req.user.id, notification_type: 9, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: req.user.id, share: 1, event_date: null });
              }
            }
            if(req.body.event_id) {
              Event.where({ id: req.body.event_id}).fetch().then((events) => {
                event = events.attributes.id;
                event_date = events.attributes.event_date;
                event_name = events.attributes.event_name;
                if(req.user.id != posts.attributes.user_id && posts.attributes.is_delete == 0) {
                  message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " shared your" + event_name + "."
                  notification.singleNotification({ message: message,
                    to_user_id: [posts.attributes.user_id], user_id: req.user.id, notification_type: 13, post_id: null, my_picture_id: null, event_id: event, tag_id: null, shared_id: null, share: null, event_date: event_date });
                }
              })
            }
            Followup.where({ user_id: req.user.id, follows: 1, block: 0 }).fetchAll({ columns: ['following_id'] }).then((following_ids) => {
              let jsonString = JSON.stringify(following_ids);
              following_ids = JSON.parse(jsonString);
              console.log("YYY", following_ids);
              Promise.all(following_ids.map((res) => {
                    following_id.push(res['following_id']);
                            if(following_id.length == following_ids.length) {
                              if(req.body.flag == 1) {
                                 message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " shared a post.";
                                 
                                 if(following_id.length > 0)
                                    notification.sendNotification({ message: message,
                                       to_user_id: following_id, user_id: req.user.id, notification_type: 9, post_id: posts.attributes.id, my_picture_id: posts.attributes.my_picture_id, event_id: null, tag_id: null, shared_id: req.user.id, share: 1, event_date: null });
                              }
                              if(req.body.event_id) {
                                message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " shared a " + event_name + "."
                                if(following_id.length > 0)
                                    notification.sendNotification({ message: message,
                                       to_user_id: following_id, user_id: req.user.id, notification_type: 13, post_id: null, my_picture_id: null, event_id: event, tag_id: null, shared_id: null, share: null, event_date: event_date });
                              }
                            }
                return;
              }))
              
                callback(null, { data: shareCreated, code: responseCode.ok });
            })
            
        })
      }
    })


      // let share = posts.attributes.share;
      // if(share) {
      //   share = share.split(',');
      //   if(!share.includes(req.user.id.toString())) {
      //     share.push(req.user.id); 
      //   }
      //   share = [...new Set(share)];
      //   share = share.join(',');
      // }
      // else {
      //   share = req.user.id.toString();
      // }
      // id['share'] = share;
      // id['id'] = posts.attributes.id;
      // console.log(id)

      // posts.save(id, { patch: true }).then((shared) => {
      //   callback(null, { data: shared, code: responseCode.ok });
      // })
      } else {
        callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
      }
    })
  })
}

function deletePost(req, callback) {
  if(req.body.flag == 1) {
    Post.where({ id: req.body.post_id, user_id: req.body.user_id }).fetch().then((deleted) => {
      if(deleted != null) {
        deleted.save({ id: req.body.post_id, is_delete: 1 }, { patch: true }).then((updated) => {
          Share.where({ post_id: req.body.post_id }).fetchAll().then((shares) => {
            console.log("**", shares)
            if(shares.length > 0) {
              console.log("**")
              Share.where({ post_id: req.body.post_id }).save({  is_delete: 1}, { patch: true}).then((updatedShare) => {
                console.log(updatedShare)
              })
            }
          })
        //   Tag.where({ post_id: req.body.post_id }).fetchAll().then((tags) => {
        //     if(tags.length > 0) {
        //        Tag.where({ post_id: req.body.post_id }).save({ is_delete: 1}, { patch: true}).then((updatedTag) => {
        //          console.log(updatedTag)
        //        })
        //     }
        // })
      })
      callback(null, { code: responseCode.ok, data:{ message: "Post Deleted" }});
    }
      else {
        callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
      }
    })
  }
  else if(req.body.flag == 2) {
    Share.where({ user_id: req.body.user_id, post_id: req.body.post_id }).save({ is_delete: 1}, { patch: true}).then((updatedShare) => {
      callback(null, { code: responseCode.ok, message: "Shared Post Deleted" });
    })
  }
  else if(req.body.flag == 3) {
    Tag.where({ user_id: req.body.user_id, post_id: req.body.post_id }).save({ is_delete: 1}, { patch: true}).then((updatedShare) => {
      callback(null, { code: responseCode.ok, message: "Tagged Post Deleted" });
    })
  }
  
}

function deleteComment(req, callback) {
  Comments.where({ id: req.body.comment_id }).fetch().then((comments) => {
    if(comments != null) {
      comments.destroy().then((destroyed) => {
        callback(null, { code: responseCode.ok, data: { message: "Comments deleted successfully "}});
      })
    } else {
        callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
    }
   
  })
}

export default { followUser, listFollow, comments, listFollowing, listwithoutPage, block, newsFeed, post, report, share, listPost, countList, deletePost, deleteComment, editPicture };