import Schema from '../../config/mysql.js';

const Role = Schema.Bookshelf.Model.extend({
  tableName: 'roles',
  hasTimestamps: true,
  role: function () {
    return this.hasMany(User, 'role');
  }
});

module.exports = Schema.Bookshelf.model('Role', Role);
