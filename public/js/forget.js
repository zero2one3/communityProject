
$(function () {
    let $userEmail = null

    //处理发送验证码按钮事件
    const $codeBtn = $('.code-btn')
    let $code = null
    $codeBtn.click(function () {
        const $email = $('#exampleInputEmail1')[0].value
        if (!$email) {
            return window.alert('请输入电子邮箱')
        }
        $.ajax({
            url: '/sendemail',
            dataType: 'json',
            type: 'get',
            data: {email: $email},
            success: function (data) {
                if (data.status === 0) {
                    window.alert('验证码发送失败，该邮箱不存在')
                } else if (data.status === -1) {
                    window.alert('验证码发送失败，服务器繁忙，请稍后重试')
                } else if (data.status === 1) {
                    window.alert('验证码发送成功，请尽快填写')
                    $code = data.code

                    $codeBtn.attr('disabled', 'disabled')
                    let totalTimer = setTimeout(() => {
                        $codeBtn.removeAttr('disabled')
                        $codeBtn.html('发送验证码')
                    }, 60000)
                    let countDown = 60
                    let eachTimer = setInterval(() => {
                        countDown--
                        if (countDown > 0) {
                            $codeBtn.html(countDown + '秒后可再次发送')
                        } else {
                            clearInterval(eachTimer)
                            clearTimeout(totalTimer)
                        }
                    }, 1000)
                }
            }
        })
    })

    //处理找回密码账号验证
    const $submit1 = $('.form1 .submit')
    const $form1 = $('.form1')
    const $form2 = $('.form2')
    $submit1.click(function (e) {
        e.preventDefault()
        const $email = $('#exampleInputEmail1')[0].value
        const user_code = $('#code')[0].value
        console.log(user_code)
        const $formdata1 = 'email=' + $email + '&severCode=' + $code + '&code=' +user_code
        $.ajax({
            url: '/account',
            type: 'post',
            data: $formdata1,
            dataType: 'json',
            success: function (data) {
                if(data.status === 2) {
                    window.alert('该邮箱尚未注册')
                }
                else if(data.status === 0) {
                    window.alert('验证码填写错误，请重新填写')
                }
                else if(data.status === 500) {
                    window.alert('服务器繁忙，请稍后重试')
                }
                else if(data.status === 1) {
                    window.alert('验证成功')
                    $userEmail = data.userInfo.email
                    $form1.addClass('hide')
                    $form2.removeClass('hide')
                }
            }

        })
    })

    //修改新密码
    const $submit2 = $('.form2 .submit')
    $submit2.click(function (e) {
        e.preventDefault()
        const psd1 = $('#psd1')[0].value
        const psd2 = $('#psd2')[0].value
        //检查用户输入密码是否一致
        if(psd1 !== psd2) {
            window.alert('两次输入密码不一致，请仔细检查')
        }
        else {
            const $formdata2 = 'psd=' + psd1 + '&email=' + $userEmail
            $.ajax({
                url: '/forget',
                type: 'post',
                dataType: 'json',
                data: $formdata2,
                success: function (data) {
                    if(data.status === 500) {
                        return window.alert('服务器繁忙，请稍后重试')
                    }
                    else if(data.status === 0) {
                        return window.alert('无法查询到该账号邮箱')
                    }
                    else if(data.status === 1) {
                        window.alert('密码修改成功')
                        window.location.href = '/login'
                    }
                }
            })
        }
    })
})
