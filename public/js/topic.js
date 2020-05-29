
$(function () {
    const $submit = $('.submit')
    $submit.click(function (e) {
        e.preventDefault()
        const $title = $('#title')[0].value
        const $content = $('#content')[0].value
        const $type = $('#type')[0].value
        if(!$type){
            return window.alert('请选择文章类型')
        }
        else if(!$title) {
            return window.alert('请填写标题')
        }
        else if(!$content) {
            return window.alert('请填写正文内容')
        }
        else {
            const $formdata =  'type=' + $type + '&title=' + $title + '&content=' + $content
            $.ajax({
                url: '/topic',
                type: 'post',
                dataType: 'json',
                data: $formdata,
                success: function (data) {
                    if(data.status === 500) {
                        return window.alert('服务器繁忙，请稍后重试')
                    }
                    else if(data.status === 1) {
                        window.alert('话题发表成功')
                        window.location.href = '/'
                    }
                }
            })
        }
    })
})
