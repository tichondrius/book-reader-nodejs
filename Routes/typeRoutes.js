var express = require('express');


var routes = function(Type){
   var typeRouter = express.Router();
  
   typeRouter.route('/')
    .get(function(req, res){
        Type.find({}, function(err, types){
            if (err){
                res.status(404).send(err);
            }
            else
            {
                res.json(types);
            }
            
        });
    });
    typeRouter.route('/ForNav')
        .get(function(req, res){
            Type.find({}, 'name', function(err, types){
                if (err){
                    res.status(404).send(err);
                }
                else
                {
                    res.json(types);
                }

            });
        });
    typeRouter.route('/GetStoryByTypeId/:typeID')
        .get(function(req, res){ 
            var typeID = req.params.typeID;
            var query = {};
            query._id = typeID;
            
                     Type.findOne(query)
                .populate({
                    path: 'categories',
                    select: ['name', 'stories'],
                    populate: {
                        path: 'stories',
                        populate: {
                             path: 'cat',
                             select: ['name', 'author', 'postby', 'types'],
                             populate: [{
                                path: 'postby',
                                select: ['name']
                             }, {
                                path: 'types',
                                select: ['_id','name'],
                                }]
                        }
                    }
                })
                .exec(function (err, type) {
                if (err){
                    res.status(404).send(err);
                }
                res.json(type);
            // prints "The author is Bob Smith"
            });
           
           
        })
    return typeRouter;
};
module.exports = routes;