
$(function () {
    /* -------------------------  个人中心的导航栏js  -----------------------  */
    const $each_bar = $('.top-bar span')
    const $content = $('.content').children()
    $content.eq(0).show().siblings().hide()
    //监听个人中心导航栏的点击
    $each_bar.click(function () {
        $(this).addClass('active').siblings().removeClass('active')
        $content.eq($(this).index()).show().siblings().hide()
    })

    /* --------------------------------------------------------------------  */

    /* ---------------------------  个人信息页面js ----------------------------*/
    //将个人信息进行一定的转化
    function info_transform() {
        const $gender = $('.gender-span')
        const $intro = $('.intro-span')
        //判断性别
        switch (parseInt($gender.html())) {
            case -1:
                $gender.html('保密')
                break
            case 0:
                $gender.html('男')
                break
            case 1:
                $gender.html('女')
        }
        //判断简介内容是否为空
        if(!$intro.html()) {
            $intro.html('无')
        }
    }

    info_transform()

    //监听编辑信息的点击
    const $no_edit = $('.no-edit')
    const $in_edit = $('.in-edit')
    const $edit_btn = $('.info-content .edit-btn')
    $in_edit.hide()
    const $edit_personal_info = $('.edit-personal-info')
    //监听编辑信息的点击
    $edit_personal_info.click(function (e) {
        e.preventDefault()
        if($(this).html() === '编辑信息') {
            $no_edit.hide()
            $in_edit.show()
            $(this).html('退出编辑').removeClass('btn-info').addClass('btn-danger')
            const $name = $('#name')
            const $gender = $('#gender')
            const $introduce = $('#introduce')
            $name.prop({'value': $name.prev().html()})
            switch ($gender.prev().html()) {
                case '保密':
                    $gender.prop({'value': -1})
                    break
                case '男':
                    $gender.prop({'value': 0})
                    break
                case '女':
                    $gender.prop({'value': 1})
                    break
            }
            if($introduce.prev().html() !== '无') {
                $introduce.prop({'value': $introduce.prev().html()})
            }
        }
        else if($(this).html() === '退出编辑') {
            $in_edit.hide()
            $no_edit.show()
            $(this).html('编辑信息').removeClass('btn-danger').addClass('btn-info')
        }

    })

    //监听提交修改个人信息按钮的点击
    $edit_btn.click(function () {
        const $name = $('.info-content #name')
        const $gender = $('.info-content #gender')
        const $introduce = $('.info-content #introduce')
        const $formdata = 'name=' + $name.prop('value') + '&gender=' + $gender.prop('value') + '&introduce=' + $introduce.prop('value')

        $.ajax({
            url: '/editUserInfo',
            type: 'get',
            dataType: 'json',
            data: $formdata
        })
        .done(function (data) {
            if(data.status === 500) {
                return window.alert('服务器繁忙，请稍后重试')
            }
            else if(data.status === -1) {
                window.alert('请先登录账号')
                return window.location.href = '/login'
            }
            else if(data.status === 0) {
                return window.alert('用户名已存在，请重新修改')
            }
            else if(data.status === 1) {
                window.alert('个人信息修改成功')
                //修改成功，退出编辑模式
                $in_edit.hide()
                $no_edit.show()
                $edit_personal_info.html('编辑信息').removeClass('btn-danger').addClass('btn-info')
                //更新新修改好的个人信息
                const $new_name = $('.info-content .name-span')
                const $new_gender = $('.info-content .gender-span')
                const $new_intro = $('.info-content .intro-span')
                const $new_modify_time = $('.info-content .modify-time-span')
                const $box_l_user_name = $('.box-l .user-name')
                const $nav_user_name = $('.navbar .nav .navbar-user-name')
                $new_name.html(data.data.name)
                $new_gender.html(data.data.gender)
                $new_intro.html(data.data.introduce)
                $new_modify_time.html(data.last_modifyTime)
                info_transform()
                $box_l_user_name.children().html(data.data.name)
                $nav_user_name.html(data.data.name)
            }
        })
    })

    /* --------------------------------------------------------------------  */

    /* ---------------------------  我的收藏页面js ----------------------------*/

    let $dir_name = $('.dir-name')
    let $in_dir = $('.in-dir')
    const $dir_list =$('.dir-list')
    const $dir = $('.dir')
    const $detail_dir = $('.detail-dir')
    $detail_dir.hide()

    //监听收藏的文件夹的点击和进入收藏文件夹中的右箭头点击
    function dir_click() {
        $dir_name.each(function (index) {
            $(this).unbind('click')
            $(this).click(function () {
                $dir.hide()
                $dir_list.hide()
                $detail_dir.children().filter('input').prop({'value': $(this).children().html()})
                const $formdata = 'dir_name=' + $(this).children().html()
                $.ajax({
                    url: '/getThisDir',
                    type: 'get',
                    dataType: 'json',
                    data: $formdata,
                    success: function (data) {
                        if(data.status === 500) {
                            window.alert('服务器繁忙，请稍后重试')
                        }
                        else if(data.status === 1) {

                            $detail_dir.fadeIn(900, 'swing')
                            const $info_name = $('.info-name')
                            $info_name.children().html($(this).children().html())
                            const $items_count = $('.items-count')
                            let $items_count_num = data.TopicsInfo.length
                            $items_count.html( $items_count_num + '条内容')
                            let $li = $('.dir-items-each-li')
                            const $no_any_topic = $('.no-any-topic')
                            $no_any_topic.hide()
                            $li.show()
                            if(data.TopicsInfo.length === 0) {
                                $no_any_topic.show()
                                $li.hide()
                            }
                            else {
                                if($li.length > 1) {
                                    for(let i=0; i<$li.length - 1; i++) {
                                        $li.eq(i).remove()
                                    }
                                }
                                $li = $('.dir-items-each-li')
                                for(let i=1; i < data.TopicsInfo.length; i++) {
                                    $li.after($li.clone())
                                }
                                $li = $('.dir-items-each-li')
                                $li.each(function (i) {
                                    $(this).children().eq(3).prop({'value': data.TopicsInfo[i]._id})
                                    $(this).children().eq(0).children().eq(0).html(data.TopicsInfo[i].type)
                                    $(this).children().eq(2).children().eq(0).html(data.TopicsInfo[i].author_name).next().next().html(data.TopicsInfo[i].publish_time)
                                    //对简介内容进行切割处理
                                    const $topic_intro_width = $('.topic-intro').outerWidth()

                                    let content_string = ''
                                    for(let s of data.TopicsInfo[i].content) {
                                        if(14 * content_string.length <= 3 * $topic_intro_width - 200) {
                                            content_string += s
                                        }
                                        else {
                                            content_string += '...'

                                            return $(this).children().eq(1).children().eq(1).html(content_string)
                                        }
                                    }
                                    $(this).children().eq(1).children().eq(1).html(content_string)
                                    //对标题进行切割
                                    let title_string = ''
                                    for(let t of data.TopicsInfo[i].title) {
                                        if(16 * title_string.length <=  $topic_intro_width - 180) {
                                            title_string += t
                                        }
                                        else {
                                            title_string += '...'

                                            return $(this).children().eq(0).children().eq(1).children().html(title_string).prop({'href': '/topicdetail?id=' + data.TopicsInfo[i]._id, target: "_blank"})
                                        }
                                    }
                                    $(this).children().eq(0).children().eq(1).children().html(title_string).prop({'href': '/topicdetail?id=' + data.TopicsInfo[i]._id, target: "_blank"})

                                })

                                //初始化一下一下每个文章的取消收藏按钮
                                let $remove_my_collect_topic = $('.no-collect')
                                //处理每一个文章的取消收藏点击按钮
                                $remove_my_collect_topic.each(function (i) {
                                    $(this).unbind('click')
                                    $(this).click(function () {

                                        const $this_id = $(this).parent().next().next().next().prop('value')
                                        let $formdata = 'id=' + $this_id
                                        $.ajax({
                                            url: '/removeCollection',
                                            type: 'get',
                                            dataType: 'json',
                                            data: $formdata,
                                            success: function (data) {
                                                if(data.status === 500) {
                                                    window.alert('服务器繁忙，请稍后重试')
                                                }
                                                else if(data.status === -1) {
                                                    window.alert('请先登录账户')
                                                }
                                                else if(data.status === 0) {
                                                    window.alert('取消收藏失败,未查询到相关文章信息')
                                                }
                                                else if(data.status === 1) {
                                                    window.alert('取消收藏成功')

                                                    //移除被取消收藏的话题
                                                    $li = $('.dir-items-each-li')
                                                    $li.each(function (i) {
                                                        if($(this).children().eq(3).prop('value') === $this_id && $li.length !== 1) {
                                                            $(this).remove()
                                                        }
                                                        else if($(this).children().eq(3).prop('value') === $this_id && $li.length === 1) {
                                                            $(this).hide()
                                                            $no_any_topic.show()
                                                        }
                                                    })

                                                    //更新文件夹中收藏的话题文章数量
                                                    $items_count_num --
                                                    $items_count.html( $items_count_num + '条内容')
                                                    const $content_count = $('.content-count')
                                                    $content_count.eq(index).children().html($items_count_num + '条内容')
                                                }
                                            }
                                        })
                                    })
                                })
                            }


                        }
                    }
                })
            })
        })
        $in_dir.each(function (index) {
            $(this).unbind('click')
            $(this).click(function () {
                $dir.hide()
                $dir_list.hide()
                $detail_dir.children().filter('input').prop({'value': $(this).prev().prev().children().html()})
                const $formdata = 'dir_name=' + $(this).prev().prev().children().html()
                $.ajax({
                    url: '/getThisDir',
                    type: 'get',
                    dataType: 'json',
                    data: $formdata,
                    success: function (data) {
                        if(data.status === 500) {
                            window.alert('服务器繁忙，请稍后重试')
                        }
                        else if(data.status === 1) {

                            $detail_dir.fadeIn(900, 'swing')
                            const $info_name = $('.info-name')
                            $info_name.children().html($(this).prev().prev().children().html())
                            const $items_count = $('.items-count')
                            let $items_count_num = data.TopicsInfo.length
                            $items_count.html( $items_count_num + '条内容')
                            let $li = $('.dir-items-each-li')
                            const $no_any_topic = $('.no-any-topic')
                            $no_any_topic.hide()
                            $li.show()
                            if(data.TopicsInfo.length === 0) {
                                $no_any_topic.show()
                                $li.hide()
                            }
                            else {
                                if($li.length > 1) {
                                    for(let i=0; i<$li.length - 1; i++) {
                                        $li.eq(i).remove()
                                    }
                                }
                                $li = $('.dir-items-each-li')
                                for(let i=1; i < data.TopicsInfo.length; i++) {
                                    $li.after($li.clone())
                                }
                                $li = $('.dir-items-each-li')
                                $li.each(function (i) {
                                    $(this).children().eq(3).prop({'value': data.TopicsInfo[i]._id})
                                    $(this).children().eq(0).children().eq(0).html(data.TopicsInfo[i].type)
                                    $(this).children().eq(2).children().eq(0).html(data.TopicsInfo[i].author_name).next().next().html(data.TopicsInfo[i].publish_time)
                                    //对简介内容进行切割处理
                                    const $topic_intro_width = $('.topic-intro').outerWidth()

                                    let content_string = ''
                                    for(let s of data.TopicsInfo[i].content) {
                                        if(14 * content_string.length <= 3 * $topic_intro_width - 200) {
                                            content_string += s
                                        }
                                        else {
                                            content_string += '...'

                                            return $(this).children().eq(1).children().eq(1).html(content_string)
                                        }
                                    }
                                    $(this).children().eq(1).children().eq(1).html(content_string)
                                    //对标题进行切割
                                    let title_string = ''
                                    for(let t of data.TopicsInfo[i].title) {
                                        if(16 * title_string.length <=  $topic_intro_width - 180) {
                                            title_string += t
                                        }
                                        else {
                                            title_string += '...'

                                            return $(this).children().eq(0).children().eq(1).children().html(title_string).prop({'href': '/topicdetail?id=' + data.TopicsInfo[i]._id, target: "_blank"})
                                        }
                                    }
                                    $(this).children().eq(0).children().eq(1).children().html(title_string).prop({'href': '/topicdetail?id=' + data.TopicsInfo[i]._id, target: "_blank"})

                                })

                                //初始化一下一下每个文章的取消收藏按钮
                                let $remove_my_collect_topic = $('.no-collect')
                                //处理每一个文章的取消收藏点击按钮
                                $remove_my_collect_topic.each(function (i) {
                                    $(this).unbind('click')
                                    $(this).click(function () {
                                        const $this_id = $(this).parent().next().next().next().prop('value')
                                        let $formdata = 'id=' + $this_id
                                        $.ajax({
                                            url: '/removeCollection',
                                            type: 'get',
                                            dataType: 'json',
                                            data: $formdata,
                                            success: function (data) {
                                                if(data.status === 500) {
                                                    window.alert('服务器繁忙，请稍后重试')
                                                }
                                                else if(data.status === -1) {
                                                    window.alert('请先登录账户')
                                                }
                                                else if(data.status === 0) {
                                                    window.alert('取消收藏失败,未查询到相关文章信息')
                                                }
                                                else if(data.status === 1) {
                                                    window.alert('取消收藏成功')
                                                    //移除被取消收藏的话题
                                                    $li = $('.dir-items-each-li')
                                                    $li.each(function (i) {
                                                        if($(this).children().eq(3).prop('value') === $this_id && $li.length !== 1) {
                                                            $(this).remove()
                                                        }
                                                        else if($(this).children().eq(3).prop('value') === $this_id && $li.length === 1) {
                                                            $(this).hide()
                                                            $no_any_topic.show()
                                                        }
                                                    })
                                                    //更新文件夹中收藏的话题文章数量
                                                    $items_count_num --
                                                    $items_count.html( $items_count_num + '条内容')
                                                    const $content_count = $('.content-count')
                                                    $content_count.eq(index).children().html($items_count_num + '条内容')
                                                }
                                            }
                                        })
                                    })
                                })
                            }


                        }
                    }
                })
            })
        })
    }

    dir_click()


    //监听返回收藏话题文件夹目录按钮的点击
    const $back_to_dir_list = $('.back-to-dirlist div')
    $back_to_dir_list.click(function () {
        $detail_dir.hide()
        $dir.fadeIn(900, 'swing')
        $dir_list.fadeIn(900, 'swing')
    })


    const $new_dir = $('.new-dir')
    const $new_dir_alert = $('.new-dir-alert')
    //监听新建文件夹按钮的点击
    $new_dir.click(function () {
        $new_dir_alert.show()
    })
    //监听新建文件夹弹窗的关闭
    const $new_dir_alert_bg = $('.new-dir-alert .bg')
    $new_dir_alert_bg.click(function () {
        $new_dir_alert.hide()
    })
    const $new_dir_alert_no = $('.new-dir-alert .no')
    $new_dir_alert_no.click(function () {
        $new_dir_alert.hide()
    })

    const $new_dir_alert_content_value = $('.new-dir-alert .form-group input')
    const $new_dir_alert_content_sure = $('.new-dir-alert .sure')
    //确认创建文件夹的点击
    $new_dir_alert_content_sure.click(function () {
        let value = $new_dir_alert_content_value.prop('value')
        const $formdada = 'dir_name=' + value
        $.ajax({
            url: '/creatNewDir',
            type: 'get',
            dataType: 'json',
            data: $formdada
        }).done(function (data) {
            if(data.status === 500) {
                window.alert('服务器繁忙，请稍后重试')
            }
            else if(data.status === -1) {
                window.alert('账户已退出登录，请先登录账户')
                window.location.href = '/login'
            }
            else if(data.status === 0) {
                window.alert('新建文件夹失败，请重新尝试')
            }
            else if(data.status === 2) {
                window.alert('文件夹名字已存在，请重新命名')
            }
            else if(data.status === 1) {
                window.alert('创建文件夹成功')
                let $dir_li_list = $('.dir-li-list')
                //克隆一个li
                $dir_li_list.eq($dir_li_list.length-1).after($dir_li_list.eq(0).clone())
                //将新建文件夹信息传入刚克隆的li里面
                $dir_li_list = $('.dir-li-list')
                $dir_li_list.eq($dir_li_list.length-1).children().eq(0).children().html(data.data.dir_name)
                $dir_li_list.eq($dir_li_list.length-1).children().eq(1).children().html(data.data.topics_list.length + '条内容')

                //关闭新建文件夹弹窗
                $new_dir_alert.hide()

                //解决新建文件夹无法点击进入的问题
                $dir_name = $('.dir-name')
                $in_dir = $('.in-dir')
                dir_click()

            }
        })

    })

    //监听删除收藏文件夹的提醒框的关闭点击
    const $has_del_dir = $('.has-del-dir')
    const $has_del_dir_bg = $('.has-del-dir .bg')
    $has_del_dir_bg.click(function () {
        $has_del_dir.hide()
    })
    const $has_del_dir_no = $('.has-del-dir .no')
    $has_del_dir_no.click(function () {
        $has_del_dir.hide()
    })
    const $dir_del = $('.info-items .del')
    const $has_del_dir_sure = $('.has-del-dir .sure')
    //监听文件夹的删除按钮点击
    $dir_del.click(function () {
        $has_del_dir.show()
        $has_del_dir_sure.click(function () {
            const $formdata = 'dir_name=' + $detail_dir.children().filter('input').prop('value')
            $.ajax({
                url: '/delMyDir',
                type: 'get',
                dataType: 'json',
                data: $formdata
            }).done(function (data) {
                if(data.status === 500) {
                    window.alert('服务器繁忙，请稍后重试')
                }
                else if(data.status === -1) {
                    window.alert('请先登录账号')
                }
                else if(data.status === 1 ) {
                    window.alert('文件夹删除成功')
                    $has_del_dir.hide()
                    $detail_dir.hide()
                    $dir_name = $('.dir-name')
                    //更新删除后文件夹的文件夹列表页
                    for(let i=0; i<$dir_name.length; i++) {
                        if($dir_name.eq(i).children().html() === $detail_dir.children().filter('input').prop('value')) {
                            $dir_name.eq(i).parent().remove()
                        }
                    }
                    $dir.show()
                    $dir_list.show()

                }
            })
        })


    })


    /* --------------------------------------------------------------------  */

    /* ---------------------------  我的话题页面js ----------------------------*/

    //监听删除话题文章按钮的点击后提醒框的点击取消
    const $del_my_topic_alert = $('.del-my-topic-alert')
    const $del_my_topic_alert_no = $('.del-my-topic-alert .no')
    const $del_my_topic_alert_bg = $('.del-my-topic-alert .bg')
    const $del_my_topic_alert_sure = $('.del-my-topic-alert .sure')
    $del_my_topic_alert_no.click(function () {
        $del_my_topic_alert.hide()
    })
    $del_my_topic_alert_bg.click(function () {
        $del_my_topic_alert.hide()
    })

    const $top_bar_topic = $('.top-bar .topic')
    //我的话题点击 展示我的话题list
    $top_bar_topic.click(function () {
        $.ajax({
            url: '/getMytopics',
            type: 'get',
            dataType: 'json'
        })
        .done(function (data) {
            if(data.status === -1) {
                window.alert('请先登录账号')
                window.location.href = '/login'
            }
            else if(data.status === 500) {
                window.alert('服务器繁忙，请稍后重试')
            }
            else if(data.status === 1) {
                const $no_more = $('.topic-content .no-any-my-topic')
                let $li = $('.topic-content li')
                console.log($li)
                //没有发表过任何话题
                if(data.data.length === 0) {
                    $no_more.show()
                }
                //发表过话题
                else {
                    $li.show()
                    //对li标签进行增加或减少到我的话题的数量
                    if($li.length < data.data.length) {
                        for(let i=$li.length; i<data.data.length; i++) {
                            $li.eq(0).after($li.eq(0).clone())
                        }
                    }
                    else if($li.length > data.data.length) {
                        for(let i=$li.length; i>data.data.length; i--) {
                            $li.eq(i-1).remove()
                        }
                    }

                    $li = $('.topic-content li')
                    //将话题信息传入到对应的每个li标签内相应的位置
                    for(let i=0; i<$li.length; i++) {
                        $li.eq(i).children().eq(0).prop({'value': data.data[i]._id})
                        //对标题进行切割
                        let title_string = ''
                        const $topic_content_title_width = $('.topic-content-title').outerWidth()
                        for(let t of data.data[i].title) {
                            if(18 * title_string.length <=  $topic_content_title_width - 90) {
                                title_string += t
                            }
                            else {
                                return title_string += '...'

                            }
                        }
                        $li.eq(i).children().eq(1).children().eq(0).html(data.data[i].type).next().html(title_string)
                        //对文章内容进行切割
                        let content_string = ''
                        for(let s of data.data[i].content) {
                            if(14 * content_string.length <= 2 * $topic_content_title_width -60) {
                                content_string += s
                            }
                            else {
                                return content_string += '...'
                            }
                        }
                        $li.eq(i).children().eq(2).html(content_string)
                        $li.eq(i).children().eq(3).children().eq(0).html(data.data[i].publish_time).next().children().eq(1).html(data.data[i].comments_count)

                        //监听话题的跳转点击
                        $li.eq(i).children().eq(1).unbind('click')
                        $li.eq(i).children().eq(2).unbind('click')
                        $li.eq(i).children().eq(1).click(function () {
                            window.open('/topicdetail?id=' + $(this).prev().prop('value'))
                        })
                        $li.eq(i).children().eq(2).click(function () {
                            window.open('/topicdetail?id=' + $(this).prev().prev().prop('value'))
                        })

                        //监听话题文章删除按钮的点击
                        const $del = $li.eq(i).children().eq(3).children().eq(2)

                        $del.unbind('click')
                        $del.click(function () {
                            $del_my_topic_alert.show()
                            $del_my_topic_alert_sure.unbind('click')
                            $del_my_topic_alert_sure.click(function () {
                                const $formdata = 'id=' + $li.eq(i).children().eq(0).prop('value')
                                $.ajax({
                                    url: '/delMytopics',
                                    type: 'get',
                                    dataType: 'json',
                                    data: $formdata
                                })
                                .done(function (data) {
                                    if(data.status === -1) {
                                        window.alert('未登录账号，请先进行登录')
                                        window.location.href = '/login'
                                    }
                                    else if(data.status === 500) {
                                        window.alert('服务器繁忙，请稍后重试')
                                    }
                                    else if(data.status === 1) {
                                        window.alert('话题删除成功')
                                        $del_my_topic_alert.hide()
                                        $li.eq(i).remove()
                                    }
                                })
                            })
                        })
                    }
                }
            }
        })
    })

    /* --------------------------------------------------------------------  */




})
