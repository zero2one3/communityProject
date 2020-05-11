const mongoose = require('mongoose')
const Scheme = mongoose.Schema

mongoose.connect('mongodb://localhost/user')

const userScheme = new Scheme({
    email: {
        type: String,
        required: true
    },
    psd: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    head: {
        type: String,
        default: '/public/img/head.png'
    },
    introduce: {
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        //-1为保密   0 为男  1为女
        default: -1
    },
    status: {
        type: Number,
        //0为账号正常    1为不能评论   2为无法登陆，被封号了
        default: 0
    },
    register_time: {
        type: Date,
        default: new Date
    },
    last_modifyTime: {
        type: Date,
        default: new Date
    }
})

module.exports = mongoose.model('User', userScheme)




