import Schema from '../../config/mysql.js';

const Share = Schema.Bookshelf.Model.extend({
  tableName: 'share',
  hasTimestamps: true,

  sharedby: function () {
    return this.belongsTo('User', 'user_id');
  },
  
  post:  function () {
    return this.belongsTo('Post', 'post_id');
  },
 
  image: function () {
    return this.belongsTo('Mypicture', 'my_picture_id');
  },
  
  event: function () {
    return this.belongsTo('Event', 'event_id');
  },

  comments: function () {
    return this.belongsTo('Comments', 'post_id');
  },

});

module.exports = Schema.Bookshelf.model('Share', Share);
