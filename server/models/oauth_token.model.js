const Schema = require('../../config/mysql.js');

const Oauth = Schema.Bookshelf.Model.extend({
  tableName: 'oauth_token',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo(User);
  }
});

module.exports = Schema.Bookshelf.model('Oauth', Oauth);