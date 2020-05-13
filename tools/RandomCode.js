const num_list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const letter_list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'm', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']




module.exports = function (len) {
    let Str = ''
    for(let i=0;i<len; i++){
        //偶数位为数字
        if(i % 2 === 0){
            Str += num_list[Math.floor(Math.random()*10)]
        }
        //奇数位为字母
        else {
            Str += letter_list[Math.floor(Math.random()*26)]
        }
    }
    return Str
}