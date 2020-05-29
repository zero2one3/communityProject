
$(function () {
    //存储用户信息
    let $UserInfo = null
    //存储当前页码
    let $page = 0

    const $tr_list = $('tbody tr')
    const submit = $('.submit')
    const $type = $('#type')
    const $way = $('#way')
    //初始化元素显示状态
    $type.parent().siblings().hide()
    submit.parent().show()

    //查询类型改变事件
    $type.change(function () {
        if($(this)[0].value === 'all') {
            $way.parent().hide().next().hide().next().hide()
        }
        else if($(this)[0].value === 'partical') {
            $way.parent().show()
            if($way[0].value === 'email') {
                $way.parent().next().show()
            }
            else if($way[0].value === 'name') {
                $way.parent().next().next().show()
            }
        }
    })

    //查询关键词改变事件
    $way.change(function () {
        if($(this)[0].value === 'email') {
            $(this).parent().next().show().next().hide()
        }
        else if($(this)[0].value === 'name') {
            $(this).parent().next().hide().next().show()
        }
    })

    //查询点击
    submit.click(function (e) {
        e.preventDefault()
        const $type = $('#type')[0].value

        if($type === 'all') {
            const $formdata = null
            $.ajax({
                url: '/manageuSearchA',
                type: 'post',
                dataType: 'json',
                data: $formdata,
                success: function (data) {
                    if(data.status === 500) {
                        return window.alert('服务器繁忙，请稍后重试')
                    }
                    else if(data.status === 1) {
                        //清楚原来查询的数据
                        for(let i=0; i<16; i++) {
                            const $td_list = $tr_list.eq(i).children()
                            $td_list.eq(0).html('')
                            $td_list.eq(1).html('')
                            $td_list.eq(2).html('')
                            $td_list.eq(3).html('')
                            $td_list.eq(4).html('')
                            $td_list.eq(5).html('')

                        }

                        $UserInfo = data.data

                        for(let i=0; i<16; i++) {
                            if(i < $UserInfo.length) {
                                const $td_list = $tr_list.eq(i).children()

                                $td_list.eq(0).html($UserInfo.indexOf($UserInfo[i]) + 1)
                                $td_list.eq(1).html($UserInfo[i].email)
                                $td_list.eq(2).html($UserInfo[i].name)
                                $td_list.eq(3).html($UserInfo[i].register_time)
                                $td_list.eq(4).html($UserInfo[i].last_modifyTime)
                                switch ($UserInfo[i].status) {
                                    case 0:
                                        $td_list.eq(5).html('正常')
                                        break
                                    case 1:
                                        $td_list.eq(5).html('无法评论')
                                        break
                                    case 2:
                                        $td_list.eq(6).html('封号')
                                }
                            }
                        }
                        $page = 0
                        submit.parent().show().next().show().next().show()
                    }
                }
            })
        }
        else if($type === 'partical') {
            let $formdata = 'type='
            if($way[0].value === 'email') {
                const $email = $('#email')[0].value
                if(!$email) {
                    window.alert('请输入查询邮箱')
                }
                else {
                    $formdata += 'email' + '&email=' + $email
                }
            }
            else if($way[0].value === 'name') {
                const $name = $('#name')[0].value
                if(!$name) {
                    window.alert('请输入查询昵称')
                }
                else {
                    $formdata += 'name' + '&name=' + $name
                }
            }

            $.ajax({
                url: '/manageuSearchP',
                type: 'post',
                dataType: 'json',
                data: $formdata,
                success: function (data) {
                    if(data.status === 500) {
                        return window.alert('服务器繁忙，请稍后重试')
                    }
                    else if(data.status === 1) {
                        for(let i=0; i<16; i++) {
                            const $td_list = $tr_list.eq(i).children()
                            $td_list.eq(0).html('')
                            $td_list.eq(1).html('')
                            $td_list.eq(2).html('')
                            $td_list.eq(3).html('')
                            $td_list.eq(4).html('')
                            $td_list.eq(5).html('')

                        }
                        if(!data.data) {
                            window.alert('未查询到相关用户数据')
                        }
                        else {
                            $UserInfo = data.data
                            for(let i=0; i<16; i++) {
                                if(i < $UserInfo.length) {
                                    const $td_list = $tr_list.eq(i).children()

                                    $td_list.eq(0).html($UserInfo.indexOf($UserInfo[i]) + 1)
                                    $td_list.eq(1).html($UserInfo[i].email)
                                    $td_list.eq(2).html($UserInfo[i].name)
                                    $td_list.eq(3).html($UserInfo[i].register_time)
                                    $td_list.eq(4).html($UserInfo[i].last_modifyTime)
                                    switch ($UserInfo[i].status) {
                                        case 0:
                                            $td_list.eq(5).html('正常')
                                            break
                                        case 1:
                                            $td_list.eq(5).html('无法评论')
                                            break
                                        case 2:
                                            $td_list.eq(6).html('封号')
                                    }
                                }


                            }
                            $page = 0
                            submit.parent().show().next().show().next().show()

                        }


                    }
                }
            })
        }

    })

    //查询下一页数据
    const $next = $('#next')
    const $prev = $('#prev')
    //点击下一页
    $next.click(function () {
        $page ++
        if( !$UserInfo[$page * 16] ) {
            window.alert('没有更多用户数据')
            $next.attr('disabled', 'disabled')
            $page --
        }
        else {
            $prev.removeAttr('disabled')
            for(let i=$page * 16; i<$page * 16 + 16; i++) {
                if(i < $UserInfo.length) {
                    const $td_list = $tr_list.eq(i).children()

                    $td_list.eq(0).html($UserInfo.indexOf($UserInfo[i]) + 1)
                    $td_list.eq(1).html($UserInfo[i].email)
                    $td_list.eq(2).html($UserInfo[i].name)
                    $td_list.eq(3).html($UserInfo[i].register_time)
                    $td_list.eq(4).html($UserInfo[i].last_modifyTime)
                    switch ($UserInfo[i].status) {
                        case 0:
                            $td_list.eq(5).html('正常')
                            break
                        case 1:
                            $td_list.eq(5).html('无法评论')
                            break
                        case 2:
                            $td_list.eq(6).html('封号')
                    }
                }
            }
        }
    })
    //点击下一页
    $prev.click(function () {
        $page --
        if( !$UserInfo[$page * 16] ) {
            window.alert('已经到首页啦')
            $prev.attr('disabled', 'disabled')
            $page ++
        }
        else {
            $next.removeAttr('disabled')
            for(let i=$page * 16; i<$page * 16 + 16; i--) {
                if(i < $UserInfo.length) {
                    const $td_list = $tr_list.eq(i).children()

                    $td_list.eq(0).html($UserInfo.indexOf($UserInfo[i]) + 1)
                    $td_list.eq(1).html($UserInfo[i].email)
                    $td_list.eq(2).html($UserInfo[i].name)
                    $td_list.eq(3).html($UserInfo[i].register_time)
                    $td_list.eq(4).html($UserInfo[i].last_modifyTime)
                    switch ($UserInfo[i].status) {
                        case 0:
                            $td_list.eq(5).html('正常')
                            break
                        case 1:
                            $td_list.eq(5).html('无法评论')
                            break
                        case 2:
                            $td_list.eq(6).html('封号')
                    }
                }
            }
        }
    })
})

