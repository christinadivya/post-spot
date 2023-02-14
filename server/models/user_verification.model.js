import Schema from '../../config/mysql.js';

const UserVerifications = Schema.Bookshelf.Model.extend({
  tableName: 'user_verifications',
  hasTimestamps: true,
  user: function () {
    return this.hasMany(User);
  }
});

module.exports = Schema.Bookshelf.model('UserVerifications', UserVerifications);