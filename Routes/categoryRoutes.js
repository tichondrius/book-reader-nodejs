var express = require('express');
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime');

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'dxnapa5zf',
	api_key: '219348637198157',
	api_secret: 'FJl9rCE5dTS_kgkX_rPvUyMTwZY'
});



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});


var upload = multer({ storage: storage });



var routes = function(Category, User, Type){
   var categoryRouter = express.Router();

   categoryRouter.route('/')
    .get(function(req, res){
        Category.find({})
        .limit(req.body.qty == undefined ? 20 : Number(req.body.qty))
        .populate([{
            path: 'postby',
            select: ['name']
        },
        {
            path: 'types',
            select: ['name']
        }, {
            path: 'stories',
            select: ['name', 'part'],
            options: {sort: { 'date': -1 }, limit: 1}
        }])
        .exec(function(err, categories)
        {
            if (err){
                res.status(404).send(err);
            }
            else  res.json(categories);
        });
    })
    .put(upload.single('imgcat'), function(req, res){
        console.log(req.body);
        console.log(req.file);
        if (!req.auth){
            res.status(401).send('Authorized is required');
        }
        var username = req.auth.username;
        var model = JSON.parse(req.body.model);
        var lstErr = [];
        var lstMessErr = [];

        if (!model.name || model.name == ""){
            lstErr.push(1);
            lstMessErr.push("Tên truyện không được để trống");
        }
        if (!model.author || model.author == "")
        {
            lstErr.push(2);
            lstMessErr.push("Tên tác giả hoặc nguồn không được để trống");
        }
        if (!model.introduce || model.introduce == "")
        {
            model.introduce = "Chưa có giới thiệu truyện";
        }
        if (model.type != 1 || model.type != 2)
        {
            model.type = 1;
        }
        if (!model.types || model.types.length == 0){
            lstErr.push(3);
            lstMessErr.push("Truyện chưa có thể loại");
        }
        if (!!req.file)
        {
            model.img = 'no-image-chapter.jpg';
        }
        
       

        var types = [];
        model.types.forEach(function(element){
            if (element != "")
            {
                types.push(element);
            }
        });
        if (lstErr.length)
        {
            res.status(404).json({lstErr: lstErr, lstMessErr: lstMessErr});
        }
        else
        {
           User.findOne({username: username}, function(err, user){
               if (err || !user){
                     lstErr.push(-1);
                     lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                     res.status(404).json({lstErr: lstErr, lstMessErr});
               }
               else
               {
                   var category = new Category({
                        name: model.name,
                        author: model.author,
                        date: new Date(),
                        totalchap: 0,
                        img: model.img,
                        type: model.type,
                        introduce: model.introduce,
                        postby: user._id,
                        stories: [],
                        types: types
                    });
                    category.save(function(err){
                        if (err){
                              lstErr.push(-1);
                              lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                              res.status(404).json({lstErr: lstErr, lstMessErr});
                        }
                        else
                        {
                            user.categories.push(category._id);
                            user.save(function(err){
                                if (err){
                                    lstErr.push(-1);
                                    lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                                    res.status(404).json({lstErr: lstErr, lstMessErr});
                                }
                                else
                                {
                                    
                                    types.forEach(function(type){
                                        Type.findByIdAndUpdate(type, {$push: {"categories": category._id}}, 
                                         {safe: true, upsert: true, new : true}, function(err, model){
                                             if (err){
                                                  lstErr.push(-1);
                                                  lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                                                  res.status(404).json({lstErr: lstErr, lstMessErr});
                                             }
                                             
                                         })
                                    });
                                    console.log('test');
                                     console.log(req.file);
                                    if (req.file)
                                    {
                                        console.log('test');
                                        cloudinary.uploader.upload(req.file.path, function(result){
                                             
                                            category.img = result.url;
                                            console.log(result);
                                            category.save(function(err){
                                                if (err){
                                                    console.log(err);
                                                      lstErr.push(-1);
                                                      lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                                                      res.status(404).json({lstErr: lstErr, lstMessErr}).send();
                                                }
                                                else
                                                {
                                                    console.log(category);
                                                    res.send(category);
                                                }
                                            });
                                        });
                                        
                                    }
                                    else
                                    {
                                        res.json(category);
                                    }
                                    
                                }
                            });
                        }
                    });
               }
           });
        }
        
    });
    categoryRouter.route('/ForNav')
        .get(function(req, res){
            Category.find({}, 'name', function(err, categories){
                if (err){
                    res.status(404).send(err);
                }
                else
                {
                    res.json(categories);
                }

            });
        });
    categoryRouter.route('/getByUser')
        .get(function(req, res){
            console.log(req.auth);
            if (!req.auth)
            {
                res.status(401).send('Authorized is required for this API');            
            }
            else
            {
                var user = req.auth.username;
                var matchQuery = {};
                if (req.query.type)
                {
                    matchQuery.type = req.query.type;
                }
                User.findOne({username: user}, 'categories')
                    .populate({
                        path: 'categories',
                        select: ['name', 'totalchap', 'type'],
                        match: matchQuery
                       
                    })
                    .exec(function(err, user){
                        if (err){
                            res.status(404).send(err);
                        }
                        res.json(user.categories);
                    });
            }
        });
    categoryRouter.route('/:catID')
        .get(function(req, res){
            Category.findById(req.params.catID)
                .populate([{
                    path: 'postby',
                    select: 'name'
                },{
                    path: 'types',
                    select: 'name'
                }])
                .exec(function (err, category) {
                if (err) {
                    res.status(404);
                    res.send(err);
                }
                else  res.json(category);
            // prints "The author is Bob Smith"
            });
        })
    return categoryRouter;
};
module.exports = routes;