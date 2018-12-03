// Deploy to Heroku steps:
// 1. Make your port dynamic
// 2. Mention start script of your application in package.json
// 3. Create a database in mlab (localhost won't work)
// 4. Push it to git repository:
// git init
// add .gitignore
// git add .
// git commit -m "Message of file change"
// git push -u origin master

// 5. Create app in heroku: heroku create
// 6. Deploy git repository to heroku: git push heroku


const express = require('express');
const app = express();
const ServerIO = require('socket.io');
require('./libs/db-connection');
var port = process.env.PORT || 8080;

// listen
var server = app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});

const io = ServerIO(server);


app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

const Chat = require('./models/Chat');

app.get('/', (req, res) => {
  Chat.find({}).then(messages => {
    res.render('index', {messages});
  }).catch(err => console.error(err));
});

io.on('connection', socket => {
  socket.on('chat', data => {
    Chat.create({name: data.handle, message: data.message}).then(() => {
      io.sockets.emit('chat', data); // return data
    }).catch(err => console.error(err));
  });
  socket.on('typing', data => {
    socket.broadcast.emit('typing', data); // return data
  });
});

