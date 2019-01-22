const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const session = require('express-session');

let Chat = require('./model/chat');
let Message = require('./model/message');
mongoose.connect('mongodb://localhost:27017/chats',{useNewUrlParser:true});

let app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

let sessionMiddleware = session({
    secret: 'blablabla',
    resave: false,
    saveUninitialized: false
});
app.use(sessionMiddleware);

app.get('/',(req,res)=>{
    res.render('index');
});
app.get('/chats',async (req,res)=>{
    let chats = await Chat.find();
    res.render('chats',{
        principal: req.session.principal,
        chats: chats
    });
});
app.get('/conversation/:id',async (req,res)=>{
    let id = req.params.id;
    let chat = await Chat.findById(id);
    req.session.chat = chat;
    res.render('conversation',{chat});
});
app.post('/login',(req,res)=>{
    req.session.principal = req.body;
    res.redirect('/chats');
});
app.post('/create-chat', async (req,res)=>{
    let newChat = await Chat.create(req.body);
    res.redirect('/chats');
});


const server = http.createServer(app);

let io = require('socket.io')(server);

io.use((socket,next)=>{
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connect',async function (socket) {
    console.log(socket.id,'connect');
    let principal = socket.request.session.principal
    ? socket.request.session.principal
    : {name: 'Anonim'};

    let chat = socket.request.session.chat
        ? socket.request.session.chat
        : {_id: '5c45df4622312b07b85efae6'};

    socket.join(chat._id);

    let messages = await Message.find({chat: chat._id});
    io.to(socket.id).emit('init',messages);


    io.to(socket.id).emit('message',{
        text: principal.name + ' welcome',
        author: 'Admin',
        date: new Date()
    });

    socket.broadcast.to(chat._id).emit('message',{
        text: principal.name + ' new connected!)',
        author: 'Admin',
        date: new Date()
    });

    socket.on('message',async function (data) {
        let text = data.text;
        let date = new Date();
        let newMessage = await Message.create({
            text,
            date,
            chat: chat._id,
            author: principal.name
        });
        io.to(chat._id).emit('message',newMessage);
    });

    socket.on('disconnect',function () {
        console.log(socket.id,'disconnect');
        socket.broadcast.to(chat._id).emit('message',{
            text: principal.name + ' disconnected!)',
            author: 'Admin',
            date: new Date()
        });
    });
});

server.listen(3000,()=>{
    console.log('Listening 3000');
});