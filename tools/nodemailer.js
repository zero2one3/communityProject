//1. 引包
const nodemailer = require('nodemailer')

//2. 创建运输对象
let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secure: true,
    auth: {
        user: '1316219891@qq.com',
        pass: 'avylcrelkrbyjcdg' //授权码,非邮箱登录密码
    }
});


//3. 发送邮件
module.exports = async function fn(email, code){
    let status = null
    await new Promise((resolve, reject) => {
        transporter.sendMail({
            from: '1316219891@qq.com',
            to: email, // 接受者,可以同时发送多个,以逗号隔开
            subject: 'Lpyexplore网站账户注册验证码',
            html: `<h1 style="text-align: center;">Lpyexplore's web register : </h1> <h3 style="display: inline-block;">Your verification Code is : </h3>
        <span style="font-size: 18px; color: red">` + code + `</span>`

        }, function (err, info) {
            if (err) {
                status = 0
                reject()
            } else {
                status = 1
                resolve()
            }
        });
    })
    return status


}
