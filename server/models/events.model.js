import Schema from '../../config/mysql.js';
import Post from '../models/post.model';
import Notification from '../models/notifications.model';

const Event = Schema.Bookshelf.Model.extend({
  tableName: 'events',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo('User', 'user_id');
  },

  joinee: function () {
    return this.hasMany('Joinevent', 'events_id');
  },

  post: function () {
    return this.hasMany(Post);
  },

  joinee_id: function () {
    return this.hasMany('User', 'joinee_id');
  },

  comments: function () {
    return this.hasMany('Comments', 'event_id');
  },

  notifications: function () {
    return this.hasMany(Notification);
  }
});

module.exports = Schema.Bookshelf.model('Event', Event);
