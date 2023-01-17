const http = require('http')
const express = require('express');
const socketio = require("socket.io")
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const UserRoutes = require('./routes/api/users')
const morgan = require('morgan')
const cors = require('cors') 
const RoomRouter = require('./routes/api/Room');
const Chat = require('./models/Chat');
const ChatRouter = require('./routes/api/Chat');
const TopicRouter = require('./routes/api/TopicRouter');
const RoundRouter = require('./routes/api/RoundRouter');
var fs = require("fs");
const User = require('./models/User');
const path = require('path');

const app = express();

const UserSocket = require('./routes/socket/UserSocket');




app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
	res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
	next();
})
// app.use(morgan('dev'))
app.use(cors())

const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

require('./config/passport')(passport);

//DB config
const db = require('./config/keys').mongoURI;

//MongoDB connect
mongoose
	.connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.log(err));
//use routes
app.use('/api/user', UserRoutes);
app.use('/api/room', RoomRouter);
app.use('/api/chat', ChatRouter);
app.use('/api/topic', TopicRouter);
app.use('/api/round', RoundRouter);
app.use('/socket', UserSocket);

app.get("/files", (req, res) => {
	fs.readdir("./uploads", (err, files) => {
		return res.json(files)
	})
}) 

app.use(express.static("uploads"));
// app.get('/', (req, res) => {
// 	res.send("<h3 style=' text-align: center;font-weight: 700;font-family: cursive;color: #ff62ad;margin-top: 300px;text-transform: capitalize;font-size:36px'> Welcome to MemeChallange-Backend  </h3> ")
// })
app.use(express.static('frontend/build'))
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
})
server.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
})
