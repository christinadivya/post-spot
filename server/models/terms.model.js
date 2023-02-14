import Schema from '../../config/mysql.js';

const Terms = Schema.Bookshelf.Model.extend({
  tableName: 'terms',
  hasTimestamps: true,

});

module.exports = Schema.Bookshelf.model('Terms', Terms);
