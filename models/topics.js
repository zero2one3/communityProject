const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Topics =  mongoose.createConnection('mongodb://localhost/topics')

const topicSchema = new Schema({
    //话题标题
    title: {
      type: String,
      required: true
    },
    //话题内容
    content: {
        type: String,
        required: true
    },
    //作者昵称
    author_name: {
        type: String,
        required: true
    },
    //作者邮箱账号
    author_email: {
        type: String,
        required: true
    },
    //发表时间
    publish_time: {
        type: String,
        required: true
    },
    //最后一次修改时间
    lastModify_time: {
        type: String,
        required: true
    },
    //话题类型
    type: {
        type: String,
        required: true
    },
    //点赞数
    like: {
        type: Number,
        default: 0
    }
})

module.exports = Topics.model('Topic', topicSchema)
// a = Topics.model('Topic', topicSchema)
// a.find((err, data) => {
//     console.log(data)
// })