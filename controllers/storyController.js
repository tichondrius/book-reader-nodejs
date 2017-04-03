var storyController = function(Story, Category){

    var get = function(req, res){
            var query = {};
            if (req.query.category) {
                query.cat = req.query.category;
            }
             Story.find(query)
            .populate({
                path: 'cat',
                select: ['name', 'author', 'postby', 'types'],
                populate: [{
                    path: 'postby',
                    select: ['name']
                }, {
                    path: 'types',
                    select: ['_id','name'],
                }]
            })
            .exec(function (err, story) {
                if (err){
                    res.status(404).send(err);
                }
                else res.json(story);
            // prints "The author is Bob Smith"
            });
       
       
    }
    
    var post = function(req,res){
        
    }
    var put = function(req, res){
        console.log(req.body);
        if (!req.auth){
            res.status(401).send('Authorized is required');
        }
        else
        {
            var lstErr = [];
            var lstMessErr = [];
            if (!req.body.name && req.body.name != '')
            {
                lstErr.push(0);
                lstMessErr.push('Chap truyện cần phải có tên');
            }
            if (!req.body.part)
            {
                lstErr.push(1);
                lstMessErr.push('Chưa có thông tin chap của truyện');
            }
            if (!req.body.cat)
            {
                lstErr.push(2);
                lstMessErr.push('Chưa có thông tin truyện');
            }
            if (!req.body.img_pre){
                req.body.img_pre = 'no-image-chapter.jpg';
            }
            req.body.img_main = req.body.img_main.filter(value => value.url != '');
            if (!req.body.img_main || req.body.img_main.length <= 0)
            {
                lstErr.push(3);
                lstMessErr.push('Chưa có link ảnh nội dung cho truyện');
            }
            var user = req.auth.username;
            var newstory = new Story({
                name: req.body.name,
                part: req.body.part,
                cat: req.body.cat,
                date: new Date(),
                img_pre: req.body.img_pre,
                text_pre: req.body.text_pre,
                img_main: req.body.img_main
            });
            if (lstErr.length > 0)
            {
                 res.status(404).json({lstErr: lstErr, lstMessErr});
            }
            else
            {
                 newstory.save(function(err){
                if (err){
                     lstErr.push(-1);
                     lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                     res.status(404).json({lstErr: lstErr, lstMessErr});
                }
                else
                {
                    Category.findById(newstory.cat, function(err, cat){
                        if (err){
                            lstErr.push(-1);
                            lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                            res.status(404).json({lstErr: lstErr, lstMessErr});
                        }
                        else
                        {
                            cat.stories.push(newstory._id);
                            cat.totalchap++;
                            cat.save(function(err){
                                if (err)
                                {
                                     lstErr.push(-1);
                                     lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                                     res.status(404).json({lstErr: lstErr, lstMessErr});
                                }
                                else
                                {
                                    res.json({story: newstory, cat: cat});
                                }
                                    });
                                }
                            });
                        }
                
                })
            }
        }
    }

    return {
        post: post,
        get: get,
        put: put
    }
}
module.exports = storyController;