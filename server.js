var express = require ('express');
var app = express();
var bp = require ('body-parser');
var port = 8000;

     
app.set("view engine", "ejs");
app.set("views", __dirname + "/views" );
app.use(express.static(__dirname + "/static"));
app.use(bp.urlencoded({extended: true}));


var server = app.listen(port);

app.get('/', function(req, res) {
    sessionID = req.sessionID;
    res.render("index", {id: sessionID});
})

var io = require('socket.io').listen(server);
users = {};
msg = {};
msgID = 0

io.on('connection', function(socket){
    console.log(socket.id)
    socket.on('new_user_joined', function(data){
        users[socket.id] = data.name;
        console.log("new client joined the chat room: " + data.name + " - " + socket.id);
        socket.emit('existing_users', users);
        socket.emit('existing_messages', msg)
        socket.broadcast.emit('new_user', {name: data.name});
        console.log("sending an event called new user");
    });
    socket.on('messages', function(data){
        msg[msgID]= {name: data.name, message: data.msg, time: data.time};
        io.emit('new_message', msg[msgID]);
        console.log(msgID + "  " + data.name + ": " + data.msg + " @ " + data.time);
        msgID++;
    });

    socket.on('disconnect', function(){
        io.emit('user_disconnected', users[socket.id]);
    })
    
});