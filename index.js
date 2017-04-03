var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jsonwebtoken');


var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'dxnapa5zf',
	api_key: '219348637198157',
	api_secret: 'FJl9rCE5dTS_kgkX_rPvUyMTwZY'
});






//connection to db
var db = mongoose.connect('mongodb://admin:123456@ds157459.mlab.com:57459/heroku_bq5nlpcf');

//var Book = require('./models/bookModel');
//var Product = require('./models/productModel');
var User = require('./models/userModel');
var Category = require('./models/categoryModel')
var Type = require('./models/typeModel');
var Story = require('./models/storyModel');

var app = express();
app.use(cors());

var port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// Add headers


//var bookRouter = require('./Routes/bookRoutes')(Book, User);
//var productRouter = require('./Routes/productRoutes')(Product);
//var tokenRouter = require('./Routes/tokenRoutes');
var storyRouter = require('./Routes/storyRoutes')(Story, Category);
var categoryRouter = require('./Routes/categoryRoutes')(Category, User, Type);
var typeRouter = require('./Routes/typeRoutes')(Type);
var authRouter = require('./Routes/authRoutes')(User);
var userRouter = require('./Routes/userRoutes')(User);

//app.use('/api/Books', bookRouter);
//app.use('/api/Products', productRouter)

app.route('/token')
    .post(function(req, res){
        User.findOne({username: req.body.username,
                   password: req.body.password},
                   function(err, user){
                       if (err){
                           res.status(403).send({message: 'Username hoặc password không đúng!'});
                       }
                       else
                       {
                           if (user)
                           {  
                               var data = {};
                               data.username = req.body.username;
                               data.name = user.name;
                               jwt.sign(data, 'khintmam', {expiresIn: "2 days", algorithm: 'HS256'}, function(err, token){
                                   res.send({token: token, username: user.username, name: user.name});
                               });
                           }
                           else
                           {
                                 res.status(403).send({message: 'Username hoặc password không đúng!'});
                           }
                       }
        });
    });
//Middleware collects info from the token

app.use('/api', function(req, res, next){
    var auth = req.headers["authorization"];
    if (auth)
    {
        var token = auth.split(' ')[1];

        jwt.verify(token, 'khintmam', {algorithm: 'HS256'}, function(err, verified){
            if (err){
                req.auth = undefined;
            }
            else req.auth = verified;
            next();
        });
    }
    else {
        req.auth = undefined;
        next();
    }
    
});
app.use('/api/stories/', storyRouter);
app.use('/api/categories/', categoryRouter);
app.use('/api/types', typeRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use(express.static(__dirname + '/public'));
app.listen(port, function(){
    console.log('The server is listening on PORT: ' + port);
});
