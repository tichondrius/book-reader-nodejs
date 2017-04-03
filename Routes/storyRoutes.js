var express = require('express');


var routes = function(Story, Category){
   var storyRouter = express.Router();



   var storyController = require('../controllers/storyController')(Story, Category);
  /*
   storyRouter.use('/', function(req, res, next){
       console.log(req.auth);
       if (!req.auth){
           res.status(402);
           res.json({message: 'Authorized is required'});
       }
       else next();
   });
   */
   


   storyRouter.route('/')
    .get(storyController.get)
    .post(storyController.post)
    .put(storyController.put);
   

   storyRouter.route('/:storyID')
    .get(function(req, res){
        Story.findById(req.params.storyID).populate({
                path: 'cat',
                select: ['name', 'author', 'postby', 'types'],
                populate: [{
                    path: 'postby',
                    select: ['name']
                }, {
                    path: 'types',
                    select: ['name']
                }]
            })
            .exec(function (err, story) {
                if (err){
                    res.status(404).send(err);
                }
                else{
                    res.json(story);
                }
                
            // prints "The author is Bob Smith"
            });
       
    });
    return storyRouter;
};
module.exports = routes;