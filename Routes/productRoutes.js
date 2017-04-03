var express = require('express');


var routes = function(Book){
   var bookRouter = express.Router();
   var bookController = require('../controllers/bookController')(Book);
   bookRouter.route('/')
    .get(bookController.get)
    .post(bookController.post);
    
    //Middleware for the route has bookID
    bookRouter.use('/:bookID', function(req, res, next){
         Book.findById(req.params.bookID, function(err, book){
                if (err){
                    res.status(404).send(err);
                }
                else if (book){
                    req.book = book;
                   
                    next();
                    
                }
                else{
                    res.status(404).send('no book found');

                }
         })
    })
    bookRouter.route('/:bookID')  
        .get(function(req, res){
           res.json(req.book);
        })
        .put(function(req, res){
           
             req.book.title = req.body.title;
             req.book.author = req.body.author;
             req.book.genre = req.body.genre;
             req.book.read = req.body.read;
             req.book.save(function(err){
                if (err){
                    res.status(500).send(err);
                }
                else
                {
                    res.json(req.book);
                }
             });
        })
        .patch(function(req, res){
           if (req.body._id){
               delete req.body._id;
           }
           for (var key in req.body){
               req.book[key] = req.body[key];
               console.log(key);
           }
           
           req.book.save(function(err){
               if (err){
                   res.status(500).send(err);

               }
               else
               {
                   res.json(req.book);
               }
           })
        })
        .delete(function(req, res){
            req.book.remove(function(err){
                if (err){
                    res.status(500).send(err);
                }
                else{
                    res.status(204).send('success');
                }
            })
        })
        


    return bookRouter;
};
module.exports = routes;