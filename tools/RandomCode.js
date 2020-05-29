const num_list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']



module.exports = function (len) {
    let Str = ''
    for(let i=0;i<len; i++){
        Str += num_list[Math.floor(Math.random()*10)]
    }
    return Str
}