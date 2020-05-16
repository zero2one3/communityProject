const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comments = mongoose.createConnection('mongodb://localhost/comments')

mongoose.set('useFindAndModify', false)

const commentSchema = new Schema({
    //评论归属
    belong: {
        type: String,
        required: true
    },
    //评论者昵称
    name: {
        type: String,
        required: true
    },
    //评论发表时间
    publish_time: {
        type: String,
        default: new Date
    },
    //评论内容
    content: {
        type: String,
        required: true
    },
    //是否为作者本人
    isAuthor: {
        type: Boolean,
        required: true
    }

})

module.exports = Comments.model('Comment', commentSchema)

// a = Comments.model('Comment', commentSchema)
// a.find((err, data) => {
//     console.log(data)
// })