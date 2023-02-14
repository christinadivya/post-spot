import Schema from '../../config/mysql.js';

const Version = Schema.Bookshelf.Model.extend({
  tableName: 'version',
  hasTimestamps: true,
  
});

module.exports = Schema.Bookshelf.model('Version', Version);
