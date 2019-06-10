//id和密码
let userInfo = [
    {
        id: 123,
        password: 123
    },
    {
        id: 456,
        password: 456
    },
    {
        id: 789,
        password: 789
    }
];
//在线的用户
let loginUser = [];

const http = require('http');
const fs = require('fs');
const ws = require('socket.io');

const server = http.createServer((req, res) => {
    let html = fs.readFileSync('./chat.html', 'utf8');
    res.end(html);
});
//把socket服务挂载到http服务中，得到socket实例
let io = ws(server);
//监听connection事件，并在回调函数中产生socket客户端实例
io.on('connection', (socket) => {
    let socketId = '';
    //判断收到登录信息
    socket.on('login', (loginInfo) => {
        userInfo.forEach((value) => {
            //判断密码是否正确
            if (value.id == loginInfo.id && value.password == loginInfo.password) {
                let loginIn = value.id;
                socket.emit('loginRes');
                io.emit('loginIn', loginIn);
                socketId = value.id;
                loginUser.push(value.id);
                //刷新在线用户
                io.emit('refresh', loginUser);
                console.log(value.id + '进入聊天室');
            }
        })
    });
    //收到客户端传过来的聊天信息
    socket.on('sendMsg', (msg) => {
        io.emit('sendMsg', msg);
    });
    //有用户离开
    socket.on('disconnect', (socket) => {
        io.emit('leave', socketId);
        loginUser.forEach((value, index, arr) => {
            if (value == socketId) {
                arr.splice(index, 1);
            }
            return arr
        });
        //刷新在线用户
        io.emit('refresh', loginUser);
        console.log(socketId + '离开聊天室');
    })

});

server.listen(4000, () => {
    console.log('success');
});
