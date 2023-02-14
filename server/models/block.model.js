import Schema from '../../config/mysql.js';

const Block = Schema.Bookshelf.Model.extend({
  tableName: 'block',
  hasTimestamps: true,

  user: function () {
    return this.belongsTo('User');
  },

  block: function () {
    return this.belongsTo('User');
  },
 
});

module.exports = Schema.Bookshelf.model('Block', Block);
