var express = require('express');


var routes = function(User){
   var authRouter = express.Router();
   authRouter.route('/register')
    .post(function(req, res){
        var lstErr = [];
        var lstMessErr = [];

        var model = req.body;
        console.log(model);
        if (!model.username || model.username.length < 6)
        {
            lstErr.push(1);
            lstMessErr.push('Tên đăng nhập không được trống và độ dài >= 6');
            
        }
        if (!model.name || model.name == '')
        {
            lstErr.push(3);
            lstMessErr.push('Tên không được để trống >= 6');
        }
        if (!model.password || model.password.length < 6)
        {
            lstErr.push(4);
            lstMessErr.push('Mật khẩu không được để trống và độ dài >= 6');
        }
        if (model.repassword != model.password)
        {
            lstErr.push(5);
            lstMessErr.push('Nhập lại mật khẩu không khớp');
        }
        
        User.findOne({username: model.username}, function(err, user){
            if (err){
                lstErr.push(-1);
                lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                res.status(404).json({lstErr: lstErr, lstMessErr});
            }
            else
            {
                if (user){
                     lstMessErr.push('Đã có thành viên sử dụng username này');
                     lstErr.push(6);
                     res.status(404).json({lstErr: lstErr, lstMessErr});
                }
                else
                {
                    if (lstErr.length > 0)
                    {
                        res.status(404).json({lstErr: lstErr, lstMessErr});
                    }
                    else
                    {
                         var newuser = new User({username: model.username, password: model.password, name: model.name});
                        newuser.save(function(err, _user){
                            if (err){
                                lstErr.push(-1);
                                lstMessErr.push('Có lỗi xảy ra trong quá trình xử lý');
                                
                                res.status(404).json({lstErr: lstErr, lstMessErr});
                            }
                            else
                            {
                                res.status(200).end();
                            }
                        });
                    }
                   
                }
            }
        });
        
    });
    return authRouter;
};
module.exports = routes;