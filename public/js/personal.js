
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

    const $dir_name = $('.dir-name')
    const $in_dir = $('.in-dir')
    const $dir_list =$('.dir-list')
    const $dir = $('.dir')
    const $detail_dir = $('.detail-dir')
    $detail_dir.hide()
    /* --------------------------------------------------------------------  */

    /* ---------------------------  我的收藏页面js ----------------------------*/
    //监听收藏的文件夹的点击
    $dir_name.click(function () {
        $dir.hide()
        $dir_list.hide()
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
                                                if($(this).children().eq(3).prop('value') === $this_id) {
                                                    $(this).remove()
                                                }
                                            })
                                            //更新文件夹中收藏的话题文章数量
                                            $items_count_num --
                                            $items_count.html( $items_count_num + '条内容')
                                            const $content_count = $('.content-count')
                                            $content_count.children().html($items_count_num + '条内容')
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


    //监听进入收藏文件夹中的右箭头点击
    $in_dir.click(function () {
        $dir.hide()
        $dir_list.hide()
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
                                                if($(this).children().eq(3).prop('value') === $this_id) {
                                                    $(this).remove()
                                                }
                                            })
                                            //更新文件夹中收藏的话题文章数量
                                            $items_count_num --
                                            $items_count.html( $items_count_num + '条内容')
                                            const $content_count = $('.content-count')
                                            $content_count.children().html($items_count_num + '条内容')
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


    //监听返回收藏话题文件夹目录按钮的点击
    const $back_to_dir_list = $('.back-to-dirlist div')
    $back_to_dir_list.click(function () {
        $detail_dir.hide()
        $dir.fadeIn(900, 'swing')
        $dir_list.fadeIn(900, 'swing')
    })

    /* --------------------------------------------------------------------  */





})
