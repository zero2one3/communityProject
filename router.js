const express = require('express')
const md5 = require('blueimp-md5')
const router = express.Router()
//导入数据模型user
const user = require('./models/user')

//首页 √
router.get('/', (req, res) => {
    //根据用户信息session，渲染页面
    res.render('index.html', {
        user: req.session.user
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
    3. 注册成功
    * */
    const body = req.body
    //密码加密
    body.psd = md5(md5(body.psd))
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
                status: 500,
                message: 'Sever is busy...'
            })
        } else if(data) {
            return res.status(200).json({
                status: 0,
                message: 'Username or email already exits...'
            })
        } else {
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
                        status: 1,
                        message: 'Ok'
                    })
                }
            })
        }
    })



})

//发送退出请求
router.get('/logout', (req, res) => {
    req.session.user = null
    res.redirect('/')
})



module.exports = router