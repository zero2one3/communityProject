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
    3. 将读取到用户信息以session形式发送给客户端， 返回给客户端交互
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

    1. 判断用户是否已登录  未登录 => 跳转登录界面
    2. 先查询用户信息获取user数据
    3. 已登陆  =>   返回用户的个人信息页面, 并将导航栏用户信息、收藏话题信息渲染到页面上
    * */
    if(!req.session.user) {
        res.render('login.html')
    }
    else {
        user.findOne({
            name: req.session.user.name
        }, (err, data) => {
            if(err) {
                console.log('查询用户信息失败')
            }
            else {
                res.render('personal.html', {
                    user: req.session.user,
                    collections: data.collections
                })
            }
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
    else if(req.session.user.email !== '710805770@qq.com') {
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

//收藏话题文章  √
router.get('/collect', (req, res) => {
    /*主要逻辑   服务端操作
    1. 接收文章id、收藏目标文件夹
    2. 将该文章id存入当前登录用户的collection中的对应文件夹中
    3. 将该用户昵称更新到该文章的collector数组中
    4. 返回给客户端交互
    * */

    let collection = req.session.user.collections
    let new_collection = []
    for(let i of collection) {
        if(i.dir_name === req.query.whichDir) {
            i.topics_list.push(req.query.id)
            new_collection.push(i)
        }
        else {
            new_collection.push(i)
        }
    }
    user.findOneAndUpdate({
        name: req.session.user.name
    }, {
        $set: {
            collections: new_collection,
            last_modifyTime: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
        }
    }, {}, (err, data) => {
        if(err) {
            res.status(500).json({
                status: 500,
                message: '服务器错误'
            })
        }
        else if(!data) {
            res.status(200).json({
                status: 0,
                message: '未查询到相关用户数据'
            })
        }
        else if(data){

            topic.findOne({
                _id: req.query.id
            }, (err, ret1) => {
                if(err) {
                    res.status(500).json({
                        status:500,
                        message: '服务器错误'
                    })
                }
                else {
                    let collector = ret1.collector
                    collector.push(req.session.user.name)
                    topic.updateOne({
                        _id: req.query.id
                    }, {
                        collector: collector
                    }, {}, (err, ret2) => {
                        if(err) {
                            res.status(500).json({
                                status: 500,
                                message: '服务器错误'
                            })
                        }
                        else {
                            res.status(200).json({
                                status: 1,
                                message: '收藏成功'
                            })
                        }
                    })
                }
            })


        }
    })
})

//取消收藏话题文章  √
router.get('/removeCollection', (req, res) => {
    /*主要逻辑
    1. 判断用户是否登录
    2. 获取文章id, 用户昵称
    3. 找到用户数据中的collections，找到并删除该文章id
    4. 找到该文章数据中的collector,找到并删除该用户昵称
    5. 取消收藏成功返回给客户端进行交互
    * */

    if(!req.session.user) {
        res.status(200).json({
            status: -1,
            message: '用户未登录'
        })
    }
    else  {

        let collection = req.session.user.collections
        //删除用户数据中的collections中的该文章id数据
        for(let i of collection) {
            for(let n of i.topics_list) {
                if(n === req.query.id) {
                    i.topics_list.splice(i.topics_list.indexOf(n), 1)
                }
            }
        }

        user.findOneAndUpdate({
            name: req.session.user.name
        }, {
            $set: {
                collections: collection,
                last_modifyTime: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            }
        }, {}, (err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器错误'
                })
            }
            else if(!data) {
                res.status(200).json({
                    status: 0,
                    message: '未查询到相关用户数据'
                })
            }
            else if(data){

                topic.findOne({
                    _id: req.query.id
                }, (err, ret1) => {
                    if(err) {
                        res.status(500).json({
                            status:500,
                            message: '服务器错误'
                        })
                    }
                    else {

                        let collector = ret1.collector
                        //删除文章数据中的collector中的该用户昵称数据
                        for(let i of collector) {
                            if(i === req.session.user.name) {
                                collector.splice(collector.indexOf(i), 1)
                            }
                        }

                        topic.updateOne({
                            _id: req.query.id
                        }, {
                            collector: collector
                        }, {}, (err, ret2) => {
                            if(err) {
                                res.status(500).json({
                                    status: 500,
                                    message: '服务器错误'
                                })
                            }
                            else {
                                user.findOne({
                                    name: req.session.user.name
                                }, (err, ret3) => {
                                    if(err) {
                                        res.status(500).json({
                                            status: 500,
                                            message: '服务器错误'
                                        })
                                    }
                                    else {
                                        req.session.user = ret3
                                        res.status(200).json({
                                            status: 1,
                                            message: '取消收藏成功'
                                        })
                                    }
                                })

                            }
                        })
                    }
                })


            }
        })


    }

})

//获取个人中心文章收藏 点击的文件夹里对应的话题数据
router.get('/getThisDir', (req, res) => {
    /*主要逻辑
    1. 判断用户是否登陆
    2. 获取到点击的文件夹名字 req.query.dir_name, 并根据该信息查询到req.session.user.collections中对应该文件夹的topics_list
    3. 根据获取到的topics_list 查找到数组中每一个文章的数据，存储到一个数组对象中
    4. 将数组对象返回给客户端进行渲染交互
    * */

    if(!req.session.user) {
        res.status(200).json({
            status: -1,
            message: '用户未登录'
        })
    }
    else {
        let topicsId_list = []
        for(let i of req.session.user.collections) {
            if(i.dir_name === req.query.dir_name) {
                topicsId_list = i.topics_list
            }
        }
        let topicsInfo_list = []

        async function getEachTopicInfo() {
            for(let i of topicsId_list) {
                await new Promise((resolve, reject) => {
                    topic.findOne({
                        _id: i
                    }, (err, data) => {
                        if(err) {
                            console.log('查找话题文章信息出错')
                            resolve()
                        }
                        else {
                            topicsInfo_list.push(data)
                            resolve()
                        }
                    })
                })
            }
            res.status(200).json({
                status: 1,
                message: '查找文章数据成功',
                TopicsInfo: topicsInfo_list
            })
        }
        getEachTopicInfo()
    }
})

//新建个人中心收藏文件夹   √
router.get('/creatNewDir', (req, res) => {
    /*主要逻辑 ajax
    1. 判断用户是否登录
    2. 获取用户名称，去数据中找到该用户信息
    3. 查看文件夹名是否已存在
    4. 获取客户端传过来的dir_name,更新该用户信息中的collections ， push进去一个 {dir_name: 新建的文件名, topics_list: []}
    5. 更新该用户的collections
    6. 返还给客户端页面刷新
    * */
    if(!req.session.user) {
        res.status(200).json({
            status: -1,
            message: '用户未登陆'
        })
    }
    else {
        user.findOne({
            name: req.session.user.name
        }, (err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器错误'
                })
            }
            else {
                let collections = data.collections
                for(let i of collections) {
                    if(i.dir_name === req.query.dir_name) {
                        return res.status(200).json({
                            status: 2,
                            message: '文件夹已存在'
                        })
                    }
                }
                const new_dir = {dir_name: req.query.dir_name, topics_list: []}
                collections.push(new_dir)

                user.findOneAndUpdate({
                    name: req.session.user.name
                }, {
                    $set: {
                        collections: collections,
                        last_modifyTime: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
                    }
                }, {}, (err, ret) => {
                    if(err) {
                        res.status(500).json({
                            status: 500,
                            message: '服务器错误'
                        })
                    }
                    else if(!ret) {
                        res.status(200).json({
                            status: 0,
                            message: '未查找到相关用户'
                        })
                    }
                    else {
                        //解决个人中心新建文件夹后，话题详情页不显示新建文件夹的bug
                        req.session.user.collections = collections
                        res.status(200).json({
                            status: 1,
                            message: '更新成功',
                            data: new_dir
                        })
                    }
                })
            }
        })
    }
})

//个人中心收藏文件夹的删除  √
router.get('/delMyDir', (req, res) => {
    /*主要逻辑
    1. 判断用户是否登录
    2. 获取删除的文件夹名
    3. 获取该用户的user信息，找到collections中的该文件夹名，进行删除,并且将该文件夹中收藏的话题中的文章的collector数组中去除
    4. 返回给客户端交互
    * */
    if(!req.session.user) {
        res.status(200).json({
            status: -1,
            message: '用户未登陆'
        })
    }
    else {

        user.findOne({
            name: req.session.user.name
        }, (err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器错误'
                })
            }
            else {

                let collections = data.collections

                for(let i of collections) {
                    if(i.dir_name === req.query.dir_name) {
                        //删除该用户在各个话题中的收藏名
                        for(let t of i.topics_list) {
                            topic.findOne({
                                _id: t
                            }, (err, ret1) => {
                                let collector = ret1.collector
                                collector.splice(collector.findIndex(s => s === req.session.user.name), 1)

                                topic.findOneAndUpdate({
                                    _id: t
                                },{
                                    $set: {
                                        collector: collector
                                    }
                                }, {}, (err, ret2) => {
                                    if(err) {
                                        return res.status(500).json({
                                            status: 500,
                                            message: '服务器错误'
                                        })
                                    }
                                })
                            })

                        }
                        //删除对应的文件夹
                        collections.splice(collections.indexOf(i), 1)
                        user.findOneAndUpdate({
                            name: req.session.user.name
                        }, {
                            $set: {
                                collections: collections,
                                last_modifyTime: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
                            }
                        }, {}, (err, ret3) => {
                            if(err) {
                                return res.status(500).json({
                                    status: 500,
                                    message: '服务器错误'
                                })
                            }
                            else {
                                req.session.user.collections = collections
                                return res.status(200).json({
                                    status: 1,
                                    message: '删除文件夹成功'
                                })
                            }
                        })

                    }
                }

            }
        })
    }
})

//个人中心提交修改个人信息   √
router.get('/editUserInfo', (req, res) => {
    /*主要逻辑   ajax
    1. 判断用户是否登陆
    2. 获取修改的信息：name gender introduce
    3. 判断用户名是否已存在
    4. 找到该用户数据并更新，同时更新  last_modifyTime
    5. 返回给客户端交互
    * */

    //判断是否登录
    if(!req.session.user) {
        res.status(200).json({
            status: -1,
            message: '用户未登录'
        })
    }
    else {
        //判断用户名是否存在
        user.findOne({
            name: req.query.name
        }, (err, data) => {
            if(err) {
                res.status(500).json({
                    status: 500,
                    message: '服务器错误'
                })
            }
            else if(data && data.name !== req.query.name) {
                res.status(200).json({
                    status: 0,
                    message: '用户名已存在'
                })
            }
            else {
                //更新用户数据
                user.findOneAndUpdate({
                    name: req.session.user.name
                }, {
                    $set: {
                        name: req.query.name,
                        gender: req.query.gender,
                        introduce: req.query.introduce,
                        last_modifyTime: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
                    }
                }, {}, (err, ret) => {
                    if(err) {
                        res.status(500).json({
                            status: 500,
                            message: '服务器错误'
                        })
                    }
                    else {
                        //修改此时的用户登录信息
                        req.session.user.name = req.query.name
                        req.session.user.gender = req.query.gender
                        req.session.user.introduce = req.query.introduce
                        req.session.user.last_modifyTime = moment(new Date).format('YYYY-MM-DD HH:mm:ss')
                        res.status(200).json({
                            status: 1,
                            message: '修改成功',
                            data: req.session.user
                        })
                    }
                })
            }
        })

    }
})

module.exports = router