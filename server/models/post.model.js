import Schema from '../../config/mysql.js';
import Notification from '../models/notifications.model';

const Post = Schema.Bookshelf.Model.extend({
  tableName: 'post',
  hasTimestamps: true,
 
  comments: function () {
    return this.hasMany('Comments','post_id');
  },

  likes: function () {
    return this.hasMany('Comments','post_id');
  },

  commenter: function () {
    return this.hasMany('User','commenter_id');
  },

  shared_user: function () {
    return this.hasMany('User').through('Share', 'id');
  },

  tags: function () {
    return this.hasMany('Tag','post_id');
  },

  user: function () {
    return this.belongsTo('User','user_id');
  },

  tag_id: function () {
    return this.hasMany('User', 'tag_id')
 },

  image: function () {
    return this.belongsTo('Mypicture', 'my_picture_id');
  },

  car: function () {
    return this.belongsTo('Mycar', 'my_car_id');
  },

  event: function () {
    return this.belongsTo('Event', 'event_id');
  },

  notifications: function () {
    return this.hasMany(Notification);
  }
  
});

module.exports = Schema.Bookshelf.model('Post', Post);
