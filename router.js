//引包
const express = require('express')
const md5 = require('blueimp-md5')
const RandomCode = require('./tools/RandomCode')
const sendEmail = require('./tools/nodemailer')
const router = express.Router()

//导入数据模型user
const user = require('./models/user')
const topic = require('./models/topics')

//首页 √
router.get('/', (req, res) => {
    //获取topic数据，渲染到首页
    let topics = null
    topic.find((err, data) => {
        if(err) {
            topics = [{title: '服务器繁忙，请刷新'}]
        }
        else {
            topics = data
        }
        //渲染主页
        res.render('index.html', {
            //根据用户信息session，渲染导航栏
            user: req.session.user,
            //根据返回的topics渲染首页
            topics: topics
        })
    })


} )

//进入登陆界面 √
router.get('/login', (req, res) => {
    res.render('login.html')
})

//发送登陆请求 √
router.post('/login', (req, res) => {
    /*
    1. 获取登陆post请求数据
    2. 根据post请求数据去数据库里读取该用户的信息
    3. 将读取到用户信息以session形式发送给客户端
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
    res.render('register.html')
})

//发送注册请求 √
router.post('/register', (req, res) => {
    /*
    1. 获取post请求数据对象
    2. 判断 邮箱是否已存在 用户名是否已存在
    3. 判断验证码是否正确
    4. 注册成功
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
    req.session.user = null
    res.redirect('/')
})

//发送邮箱验证码 √
router.get('/sendemail', (req, res) => {
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
    res.render('forget.html')
})

//找回密码账号验证 √
router.post('/account', (req, res) => {
    //测试
    let body = req.body
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
    const body = req.body
    body.psd = md5(md5(body.psd))
    user.findOneAndUpdate({
        email: body.email
    }, {
        $set: {
            psd: body.psd,
            last_modifyTime: new Date
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

//进入发表话题页面
router.get('/topic', (req, res) => {
    res.render('topic.html', {
        user: req.session.user
    })
})

//发表话题
router.post('/topic', (req, res) => {
    let body = req.body
    new topic({
        title:  body.title,
        content: body.content,
        type: body.type,
        author_name: req.session.user.name,
        author_email: req.session.user.email
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

module.exports = router