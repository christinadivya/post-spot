import Schema from '../../config/mysql.js';

const Visited = Schema.Bookshelf.Model.extend({
  tableName: 'visited',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo('User', 'user_id');
  },
  visiter: function ()
 {
    return this.belongsTo('User', 'visiter_id');

 }
});

module.exports = Schema.Bookshelf.model('Visited', Visited);
