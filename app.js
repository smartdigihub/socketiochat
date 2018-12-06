// Deploy to git and Heroku:
// 1. Make your port dynamic
// 2. Mention start script of your application in package.json
// 3. Create a database in mlab (localhost won't work)

// 4. Push it to git repository:
// - git init
// - add .gitignore to your project
// - git add .
// - git commit -m "Message of file change"
// - git push -u origin master

// 5. Push your working git repository to Heroku
// - Create app in heroku: heroku create
// - Deploy git repository to heroku: git push heroku

//Include external and internal Libraries

//Include Express and create app
const express = require('express');
const app = express();

//Include Socket.io library
const ServerIO = require('socket.io');

//Include connection to database
const dbConnection = require('./libs/db-connection');

//Include mongoose model
const Chat = require('./models/Chat');

// listen to port and start server
var port = process.env.PORT || 8080;
var server = app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});

//Use SocketIO on server
const io = ServerIO(server);

//Middleware in Express
app.use('/public', express.static('public'));

//Set view engine (hbs, ejs, pug)
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  Chat.find({}).then(messages => {
    res.render('index', {messages});
  }).catch(err => console.error(err));
});


// Chatroom
var numUsers = 0;

// Establish connection with client
io.on('connection', socket => {
  var number = ++numUsers
  console.log(`${number} user(s) connected`);
  
  io.sockets.emit('user joined', {
    user: number
  });
  
// Receive event emitted from client
  socket.on('chat', data => {
    
    //create current time using Date method
    var date = new Date();
    Chat.createdAt = date.toLocaleTimeString();
    //console.log(Chat.createdAt);

    Chat.create({name: data.handle, message: data.message, createdAt: Chat.createdAt}).then((result) => {
      //console.log(result);
      io.sockets.emit('chat', {name: result.name, message: result.message, createdAt: result.createdAt}); // return data
    }).catch(err => console.error(err));
  });

  socket.on('typing', data => {
    socket.broadcast.emit('typing', data); // return data
  });

  socket.on('disconnect', () => {
    var count = --numUsers;
    console.log(`${count} user(s) connected`);
    io.sockets.emit('user left', {
      user: count
    });
  });
});


