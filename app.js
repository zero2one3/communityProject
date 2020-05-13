//引包
const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router')
const session = require('express-session')

//创建服务器实例
const app = express()

//开放静态资源
app.use('/public', express.static('./public/'))
app.use('/node_modules', express.static('./node_modules/'))

//开启模板引擎
app.engine('html', require('express-art-template'))

//配置post表单请求数据第三方插件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//配置session第三方中间件
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

//挂载路由
app.use(router)

app.listen(3000, () => {
    console.log('The Server is running ... You can visit http://localhost:3000/')
})