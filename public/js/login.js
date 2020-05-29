
$(function () {
    const $form = $('#form')
    $form.on('submit', function (event) {
        event.preventDefault()
        const $formdata = $(this).serialize()
        $.ajax({
            url: '/login',
            dataType: 'json',
            type: 'post',
            data: $formdata,
            success: function (data) {
                if(data.status === 0) {
                    window.alert('邮箱或密码填写错误，请重新填写')
                    window.location.href = '/login'
                } else if(data.status === 1) {
                    window.location.href = '/'
                } else if(data.status === 500) {
                    window.alert('服务器繁忙，请稍后重试')
                }
            }
        })
    })
})
