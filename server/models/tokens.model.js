const Schema = require('../../config/mysql.js');

const Tokens = Schema.Bookshelf.Model.extend({
  tableName: 'tokens',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo(User);
  }
});

module.exports = Schema.Bookshelf.model('Tokens', Tokens);