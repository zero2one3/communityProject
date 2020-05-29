
$(function () {
    let $code = ''
    const $form = $('#register')
    //处理表单提交事件
    $form.on('submit', function(event) {
        //阻止表单提交默认行为
        event.preventDefault()
        //判断表单是否为空
        if(!$('#exampleInputEmail1').val()) {
            return alert('邮箱不能为空')
        }
        else if(!$('#NickName').val()) {
            return alert('昵称不能为空')
        }
        else if(!$('#exampleInputPassword1').val()) {
            return alert('密码不能为空')
        }
        else if(!$('#code').val()) {
            return alert('验证码不能为空')
        }
        //获取post表单数据
        const $formdata = $(this).serialize()
        //判断昵称格式
        let judgeName = decodeURI($formdata.match(/name=(\S+)&psd/)[1]).match(/(([\u4e00-\u9fa5])*|\w*)+/)
        if(judgeName[0] !== judgeName.input) {
            return alert('昵称格式错误，请重新输入')
        }
        else if(judgeName[0].length > 11) {
            return alert('昵称长度最大为11位，请重新输入')
        }

        //发送ajax请求
        $.ajax({
            url: '/register',
            type: 'post',
            dataType: 'json',
            data: $formdata+'&serverCode='+$code,
            success: function (data) {
                if(data.status === 0) {
                    window.alert('用户名或邮箱已存在')
                }
                else if(data.status === 500) {
                    window.alert('服务器繁忙，请稍后重试')
                }
                else if(data.status === -1){
                    window.alert('验证码输入错误')
                }
                else if(data.status === 1) {
                    window.alert('注册成功！')
                    window.location.href = '/'
                }

            }
        })

    })


    //处理发送验证码事件
    const $codeBtn = $('.code-btn')
    $codeBtn.click(function () {
        const $email = $('#exampleInputEmail1')[0].value
        if(!$email) { return window.alert('请输入电子邮箱') }
        $.ajax({
            url: '/sendemail',
            dataType: 'json',
            type: 'get',
            data: {email: $email},
            success: function (data) {
                if(data.status === 0) {
                    window.alert('验证码发送失败，该邮箱不存在')
                }
                else if(data.status === -1){
                    window.alert('验证码发送失败，服务器繁忙，请稍后重试')
                }
                else if(data.status === 1) {
                    window.alert('验证码发送成功，请尽快填写')
                    $code = data.code

                    $codeBtn.attr('disabled','disabled')
                    let totalTimer = setTimeout(() => {
                        $codeBtn.removeAttr('disabled')
                        $codeBtn.html('发送验证码')
                    },60000)
                    let countDown = 60
                    let eachTimer = setInterval(() => {
                        countDown --
                        if(countDown > 0) {
                            $codeBtn.html(countDown + '秒后可再次发送')
                        }
                        else {
                            clearInterval(eachTimer)
                            clearTimeout(totalTimer)
                        }
                    }, 1000)
                }
            }
        })
    })
})
