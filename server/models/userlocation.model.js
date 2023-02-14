import Schema from '../../config/mysql.js';
import User from '../models/user.model';

const UserLocation = Schema.Bookshelf.Model.extend({
  tableName: 'userlocation',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo(User);
  },
  
});

module.exports = Schema.Bookshelf.model('UserLocation', UserLocation);
