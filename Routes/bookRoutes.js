var express = require('express');


var routes = function(Book){
   var bookRouter = express.Router();
   var bookController = require('../controllers/bookController')(Book);
   bookRouter.route('/')
    .get(bookController.get)
    .post(bookController.post);
    return bookRouter;
};
module.exports = routes;