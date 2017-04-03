var express = require('express');


var routes = function(User){
   var userRouter = express.Router();
  
   userRouter.route('/GetInfo')
    .get(function(req, res){
        if (!req.auth)
        {
            res.status(401).send('Authorized is required for this API');            
        }
        else
        {
            User.findOne({username: req.auth.username}, function(err, user){
                if (err)
                {
                    res.status(404).send(err);
                }
                else res.json({username: user.username, name: user.name});
            });
        }
    });
    
    return userRouter;
};
module.exports = routes;