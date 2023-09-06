/**
 * Created by bioz on 1/13/2017.
 */
// our components
const bookService = require('../services/book.service');
const authMiddlewares = require('../middlewares/auth.middelwares')

module.exports = function (app) {
    app.get('/api/v1/books', authMiddlewares, bookService.getAll);
    app.get('/api/v1/books/:id', bookService.getOne);
    app.post('/api/v1/auth/books', authMiddlewares, bookService.create);
    app.put('/api/v1/auth/books/:id', bookService.update);
    app.delete('/api/v1/auth/books/:id', bookService.delete);
};
