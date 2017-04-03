var express = require('express');

var routes = function(){
   var tokenRouter = express.Router();
  
   tokenRouter.route('/')
    .get(function(req, res){
        res.json({token: 'abc'});
    });
    return tokenRouter;
};
module.exports = routes;