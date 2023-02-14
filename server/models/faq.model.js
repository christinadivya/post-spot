import Schema from '../../config/mysql.js';

const Faq = Schema.Bookshelf.Model.extend({
  tableName: 'faqs',
  hasTimestamps: true,
 
});

module.exports = Schema.Bookshelf.model('Faq', Faq);
