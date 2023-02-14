import Schema from '../../config/mysql.js';

const About = Schema.Bookshelf.Model.extend({
  tableName: 'about_us',
  hasTimestamps: true,
 
});

module.exports = Schema.Bookshelf.model('About', About);
