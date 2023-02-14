import Schema from '../../config/mysql.js';

const Followup = Schema.Bookshelf.Model.extend({
  tableName: 'follow_ups',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo('User','user_id');
  },

  following_id: function () {
    return this.belongsTo('User', 'following_id');
  }
});

module.exports = Schema.Bookshelf.model('Followup', Followup);
