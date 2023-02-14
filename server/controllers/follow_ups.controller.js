import FollowupManager from '../managers/follow_ups.manager';

module.exports = {
   followUser: followUser,
   listFollow: listFollow,
   comments: comments,
   listFollowing: listFollowing,
   block: block,
   newsFeed: newsFeed,
   post: post,
   share: share,
   report: report,
   listPost: listPost,
   listwithoutPage: listwithoutPage,
   countList: countList,
   deletePost: deletePost,
   deleteComment: deleteComment,
   editPicture: editPicture
};

function followUser(req, res, next) {    
    FollowupManager.followUser(req,function(err, data) {
    handler(err, data, res, next)
});
}

function deleteComment(req, res, next) {    
    FollowupManager.deleteComment(req,function(err, data) {
    handler(err, data, res, next)
});
}

function countList(req, res, next) {    
    FollowupManager.countList(req,function(err, data) {
    handler(err, data, res, next)
});
}

function deletePost(req, res, next) {    
    FollowupManager.deletePost(req,function(err, data) {
    handler(err, data, res, next)
});
}

function editPicture(req, res, next) {    
    FollowupManager.editPicture(req,function(err, data) {
    handler(err, data, res, next)
});
}

function listwithoutPage(req, res, next) {    
    FollowupManager.listwithoutPage(req,function(err, data) {
    handler(err, data, res, next)
});
}

function report(req, res, next) {    
    FollowupManager.report(req,function(err, data) {
    handler(err, data, res, next)
});
}

function post(req, res, next) {    
    FollowupManager.post(req,function(err, data) {
    handler(err, data, res, next)
});
}

function listPost(req, res, next) {    
    FollowupManager.listPost(req,function(err, data) {
    handler(err, data, res, next)
});
}

function block(req, res, next) {    
    FollowupManager.block(req,function(err, data) {
    handler(err, data, res, next)
});
}

function share(req, res, next) {    
    FollowupManager.share(req,function(err, data) {
    handler(err, data, res, next)
});
}

function newsFeed(req, res, next) {    
    FollowupManager.newsFeed(req,function(err, data) {
    handler(err, data, res, next)
});
}

function listFollowing(req, res, next) {    
    FollowupManager.listFollowing(req,function(err, data) {
    handler(err, data, res, next)
});
}

function comments(req, res, next) {    
    FollowupManager.comments(req,function(err, data) {
    handler(err, data, res, next)
});
}

function listFollow(req, res, next) {    
    FollowupManager.listFollow(req,function(err, data) {
        handler(err, data, res, next)
    });
}

function handler(err, data, res, next) {
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    return res.status(data.code).json({data: data.data});
  }