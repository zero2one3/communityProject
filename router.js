//引包
const express = require('express')
const md5 = require('blueimp-md5')
const moment = require('moment')
const RandomCode = require('./tools/RandomCode')
const sendEmail = require('./tools/nodemailer')
const router = express.Router()

//导入数据模型user
const user = require('./models/user')
const topic = require('./models/topics')
const comment = require('./models/comments')

//首页 √
router.get('/', (req, res) => {
    /*主要逻辑
    1. 获取数据库中的所有topic信息
    2. 判断req.query.page是否为空    为空  =>  page=1    为一个数字n  =>   page=n
    3. 将topics.slice((page-1)*18, page*18)渲染到页面上并返回给客户端，同时将登录了的用户信息渲染到导航栏上渲染到页面上
    * */
    topic.find((err, data) => {
        if(err) {
            return console.log('请求话题数据失败')
        }
        else {
            let page = null
            if(!req.query.page) {
                page = 1
            }
            else {
                page = req.query.page
            }
            let totalPage = 0
            if(data.length % 18 === 0) {
                totalPage = data.length / 18
            }
            else {
                totalPage = Math.floor(data.length / 18) + 1
            }
            res.render('index.html', {
                user: req.session.user,
                topics: data.reverse().slice( (page-1) * 18, page * 18),
                page: parseInt(page),
                totalPage: totalPage
            })
        }

    })


} )


//进入登陆界面 √
router.get('/login', (req, res) => {
    /*主要逻辑
    1. 直接渲染登录界面
    * */
    res.render('login.html')
})

//发送登陆请求 √
router.post('/login', (req, res) => {
    /*主要逻辑  ajax
    1. 获取登陆post请求数据, 加密用户输入的密码，以便和数据库中的密码核对
    2. 根据post请求数据去数据库里读取该用户的信息
    3. 给制定用户设定特权
    4. 将读取到用户信息以session形式发送给客户端， 返回给客户端交互
    * */
    const body = req.body
    //将密码再次加密，方便与数据库里的密码进行匹配
    body.psd = md5(md5(body.psd))
    //去数据库寻找用户信息
    user.findOne(body, (err, data) => {
        if(err) {
            res.status(500).json({
                status: 500,
                message: 'Sever is busy...'
            })
        } else if(data) {
            //给用户设置管理员
            if(data.email === '710805770@qq.com') {
                data.privilege = 1
            }
            //登陆成功，发送给客户端session存储登陆成功的用户数据
            req.session.user = data
            res.status(200).json({
                status: 1,
                message: 'login successfully'
            })
        } else {
            res.status(200).json({
                status: 0,
                message: 'The email or the psd is not exist'
            })
        }
    })
})

//进入注册页面 √
router.get('/register', (req, res) => {
    /*主要逻辑
    1. 直接渲染注册页面
    * */
    res.render('register.html')
})

//发送注册请求 √
router.post('/register', (req, res) => {
    /*主要逻辑  ajax
    1. 获取post请求数据对象，对密码进行加密， 对用户输入的验证码也进行加密，以便和发送邮件传回的加密验证码核对
    2. 判断 邮箱是否已存在 用户名是否已存在
    3. 判断验证码是否正确
    4. 注册成功，返回给客户端交互
    * */
    const body = req.body
    //密码加密
    body.psd = md5(md5(body.psd))
    //验证码加密
    body.code = md5(md5(body.code))

    //查询邮箱用户名是否尊在
    user.findOne({
        $or: [
            {
                email: body.email
            },
            {
                name: body.name
            }
        ]
    }, (err, data) => {
        if(err) {
            return res.status(500).json({
                //500服务器错误
                status: 500,
                message: 'Sever is busy...'
            })
        }
        else if(data) {
            return res.status(200).json({
                //账号或用户名存在
                status: 0,
                message: 'Username or email already exits...'
            })
        }
        else if(body.code !== body.serverCode){
            return res.status(200).json({
                status: -1,
                message: 'code is false...'
            })
        }
        else {
            //保存注册时间
            body.register_time = moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            body.last_modifyTime = moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            //保存注册信息
            new user(body).save((err, data) => {
                if(err) {
                    return res.status(500).json({
                        status: 500,
                        message: 'Sever is busy...'
                    })
                } else {
                    //注册完后给客户端保存一个用户的session信息
                    req.session.user = data
                    return res.status(200).json({
                        //1是注册成功
                        status: 1,
                        message: 'Ok'
                    })
                }
            })
        }
    })



})

//发送退出登录请求 √
router.get('/logout', (req, res) => {
    /*主要逻辑
    1. 直接清除session中的user信息
    2. 重定向回首页
    * */
    req.session.user = null
    res.redirect('/')
})

//发送邮箱验证码 √
router.get('/sendemail', (req, res) => {
    /*主要逻辑    ajax
    1. 先用自己封装的随机生成验证码工具RandomCode生成一个6位验证码
    2. 再用自己封装的发送邮箱工具sendEmail 对用户的邮箱发送一个携带该生成的验证码的邮件
    3. 判断发送邮箱后返回的data，  为0，则邮件不存在；   为1，则发送成功，并把验证码加密后发给客户端，用于提交修改密码请求、注册时验证
    * */
    const code = RandomCode(6)
    let state = null
    sendEmail(req.query.email, code).then(data => {
        state = data

        if(state === 0){
            res.status(200).json({
                //0表示邮件不存在
                status: 0,
                message: 'The email is not exist...'
            })
        } else if(state === 1) {
            res.status(200).json({
                //1表示邮件发送成功
                status: 1,
                //加密验证码
                code: md5(md5(code)),
                message: 'Ok'
            })
        }

    }).catch(err => {
        res.status(500).json({
            //-1表示服务器错误
            status: -1,
            message: 'The Sever is busy'
        })
    })


})

//进入找回密码界面 √
router.get('/forget', (req, res) => {
    /*主要逻辑   服务器渲染
    1. 直接渲染找回密码界面
    * */
    res.render('forget.html')
})

//找回密码账号验证 √
router.post('/account', (req, res) => {
    /*主要逻辑    ajax
    1. 获取用户提交的账号验证post请求数据
    2. 判断服务器是否错误  =>  判断账号是否存在  =>   加密验证码后，判断验证码是否正确   =>   验证成功返回给客户端交互
    * */
    user.findOne({
        email: body.email
    }, (err, data) => {
        if(err) {
            return res.status(500).json({
                status: 500,
                message: '服务器错误'
            })
        }
        else if(!data) {
            return res.status(200).json({
                status: 2,
                message: '该邮箱不存在'
            })
        }
        //验证验证码
        else {
            body.code = md5(md5(body.code))
            if(body.code !== body.severCode){
                res.status(200).json({
                    status: 0,
                    message: '验证码错误'
                })
            }
            else {
                res.status(200).json({
                    status: 1,
                    message: '验证码正确',
                    userInfo: data
                })
            }

        }
    })


})

//修改新密码 √
router.post('/forget', (req, res) => {
    /*主要逻辑   ajax
    1. 获取post请求携带的参数
    2. 对用户输入的新密码进行加密
    3. 找到数据库中对应该用户的相应信息，进行更新修改 psd  last_modifyTime
    4. 三种情况：  服务器错误   未查询到该用户信息   修改成功       最终返回给客户端交互
    * */
    const body = req.body
    body.psd = md5(md5(body.psd))
    user.findOneAndUpdate({
        email: body.email
    }, {
        $set: {
            psd: body.psd,
            last_modifyTime: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
        }
    }, {}, (err, data) => {
        if(err) {
            return res.status(500).json({
                status: 500,
                message: '服务器繁忙'
            })
        }
        else if(!data) {
            return res.status(200).json({
                status: 0,
                message: '查询不到用户信息'
            })
        }
        else {
            return res.status(200).json({
                status: 1,
                message: '密码修改成功'
            })
        }
    })
})

//进入发表话题页面 √
router.get('/topic', (req, res) => {
    /*主要逻辑   服务器渲染
    1. 直接渲染发表话题页面，同时对导航栏的用户信息进行渲染
    * */
    res.render('topic.html', {
        user: req.session.user
    })
})

//发表话题 √
router.post('/topic', (req, res) => {
    /*主要逻辑    ajax
    1. 获取post请求数据 req.body
    2. 保存数据， 返回给客户端进行接下来的交互信息
    * */
    let body = req.body
    new topic({
        title:  body.title,
        content: body.content,
        type: body.type,
        author_name: req.session.user.name,
        author_email: req.session.user.email,
        publish_time: moment(new Date).format('YYYY-MM-DD HH:mm:ss'),
        lastModify_time: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
    }).save((err, data) => {
        if(err) {
            res.status(500).json({
                status: 500,
                message: '服务器错误'
            })
        }
        else {
            res.status(200).json({
                status: 1,
                message: '话题发表成功'
            })
        }
    })

})

//进入个人中心 √
router.get('/personal', (req, res) => {
    /*主要逻辑   服务器渲染
    1. 判断用户是否已登录  未登录 => 跳转登录界面     已登陆 => 判断是否是特权账户
    2. 判断是特权账户  =>  返回一个带有特权功能的个人中心页面      判断不是特权账户  =>  返回一个普通用户的个人信息页面
    * */
    if(!req.session.user) {
        res.render('login.html')
    }
    //判断特权账户
    else if(req.session.user.privilege === 1) {
        res.render('privilege.html', {
            user: req.session.user
        })
    }
    else {
        res.render('personal.html', {
            user: req.session.user
        })
    }

})

//进入用户信息管理系统  √
router.get('/manageUser', (req, res) => {
    /*主要逻辑   服务器渲染
    1. 判断是否已登录网站     未登录 => 跳转登录界面     已登录 => 判断是否是特权账号
    2. 判断不是特权账号  =>  跳转回个人信息界面      判断是特权账号  =>  则成功进入用户信息管理系统
    * */
    if(!req.session.user) {
        return res.render('login.html')
    }
    else if(req.session.user.privilege !== 1) {
        return res.render('personal.html', {
            user: req.session.user
        })
    }
    res.render('manageU.html')
})

//用户信息管理系统  数据整体查询 √
router.post('/manageuSearchA', (req, res) => {
    /*主要逻辑   客户端渲染
    1. 接收客户端的ajax请求，直接访问数据库中全部的用户信息
    2. 获取成功，返回给客户端进行渲染
    * */

    user.find((err, data) => {
        if(err) {
            res.status(500).json({
                status: 500,
                message: '系统繁忙'
            })
        }
        else{
            res.status(200).json({
                status: 1,
                message: '查找成功',
                data: data
            })
        }

    })


})

//用户信息管理系统  数据根据关键词查询  √
router.post('/manageuSearchP', (req, res) => {
    /*主要逻辑  客户端渲染
    1. 判断是根据email关键词查询还是根据name关键词查询
    2. 查询成功，给客户端返回查询到一组数据
    * */
    if(req.body.type === 'email') {
        user.find({email: {$regex: req.body.email}}, (err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器繁忙'
                })
            }
            else{
                res.status(200).json({
                    status: 1,
                    message: '查找成功',
                    data: data
                })
            }

        })
    }
    else if(req.body.type === 'name') {
        user.find({name: {$regex: req.body.name}}, (err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器繁忙'
                })
            }
            else{
                res.status(200).json({
                    status: 1,
                    message: '查找成功',
                    data: data
                })
            }

        })
    }

})

//进入话题管理系统   ×
router.get('/manageTopic', (req, res) => {
    res.render('manageT.html')
})

//进入话题详情页  √
router.get('/topicdetail', (req, res) => {
    /*主要逻辑
    1. 根据请求携带的文章id信息去数据库找到相关文章数据
    2. 查询该文章的评论信息
    3. 将文章、评论、导航栏用户信息渲染到页面
    * */

    topic.findOne({
        _id: req.query.id
    }, (err, data) => {
        if(err) {
            console.log('查询文章数据失败')
        }
        else {
            //文章数据获取成功后，再进行获取该文章的评论信息
            comment.find({
                belong: req.query.id
            }, (err, ret) => {
                if (err) {
                    console.log('查询文章评论数据失败')
                } else {
                    res.render('topicDetail.html', {
                        user: req.session.user,
                        topics: data,
                        comments: ret
                    })
                }
            })

        }
    })

})

//发表话题评论   √
router.post('/subComments', (req, res) => {
    /*主要逻辑  ajax
    1. 判断是否登录，  未登录   =>  返回登录界面    已登陆  =>  进行下一步
    2. 获取发表评论的post表单数据
    3. 将 评论归属、发表时间、评论发表者、评论内容、判断是否为作者本人评论 存储在comments数据库中
    4. 判断 服务器是否错误    成功后返回给客户端交互
    * */
    if(!req.session.user) {
        res.status(200).json({
            status: 0,
            message: '未登录账户'
        })
    }
    else {
        new comment({
            belong: req.body.id,
            publish_time: moment(new Date).format('YYYY-MM-DD HH:mm:ss'),
            name: req.session.user.name,
            content: req.body.content,
            isAuthor: req.body.name === req.session.user.name
        }).save((err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器错误'
                })
            }
            else {
                res.status(200).json({
                    status: 1,
                    message: '评论存储成功'
                })
            }
        })
    }


})

module.exports = router