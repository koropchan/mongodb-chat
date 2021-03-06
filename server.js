require('dotenv').config();
const mongo = require('mongodb').MongoClient;
const app = require('express')();
const server = require('http').Server(app);
const client = require('socket.io')(server);

//Listening to port
server.listen(process.env.PORT || 4000).sockets;

app.use(require('express').static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  
//Connecting to Mongo. Passing URI with enviroment var
mongo.connect(process.env.MONGOLAB_URI, (err, db) => {
    if(err){
        console.log(err);
    }

    console.log('Database is connected..');

    //Connecting to socket.io
    client.on('connection', (socket) => {
        let chat = db.collection('chats');

        //Creating function to set status
        sendStatus = (s) => {
            socket.emit('status', s); // Using 'emit' to pass from server to client ('name', parametr)
        }

        //Fetching chats (messages) then taking the result (res) that has been sent back 
        //and then emitted(.emit) to the client to 'index' file
        chat.find().limit(100).sort({_id:1}).toArray((err, res) => {
            if(err){
                err;
            }
            socket.emit('output', res);
        });

        //Handle input events
        socket.on('input', (data) => {
            let name = data.name;
            let message = data.message;

            //Cheking for name and message
            if(name == '' || message == ''){
                //Sending error satus
                sendStatus('Please enter name and message');
            } else {
                //Insert message
                chat.insert({name: name, message: message}, () => {
                    client.emit('output', [data]);

                    //Sending status object 
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        //Handle 'clear'
        socket.on('clear', (data) => {
            //Removing all chats from collection
            chat.remove({}, () => {
                //Emit cleared
                socket.emit('cleared');
            });
        });
    });
});

// require('dotenv').config();
// const mongo = require('mongodb').MongoClient;
// const app = require('express')();
// const server = require('http').Server(app);
// const client = require('socket.io')(server);

// //Listening to port
// server.listen(process.env.PORT || 4000).sockets;

// app.use(require('express').static(__dirname + '/'));

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');
//   });

  
// //Connecting to Mongo. Passing URI with enviroment var
// mongo.connect(process.env.MONGOLAB_URI, (err, db) => {
//     if(err){
//         console.log(err);
//     }

//     console.log('Database is connected..');

//     //Connecting to socket.io
//     client.on('connection', (socket) => {
//         let chat = db.collection('chats');

//         //Creating function to set status
//         sendStatus = (s) => {
//             socket.emit('status', s); // Using 'emit' to pass from server to client ('name', parametr)
//         }

//         //Fetching chats (messages) then taking the result (res) that has been sent back 
//         //and then emitted(.emit) to the client to 'index' file
//         chat.find().limit(100).sort({_id:1}).toArray((err, res) => {
//             if(err){
//                 err;
//             }
//             socket.emit('output', res);
//         });

//         //Handle input events
//         socket.on('input', (data) => {
//             let name = data.name;
//             let message = data.message;

//             //Cheking for name and message
//             if(name == '' || message == ''){
//                 //Sending error satus
//                 sendSatus('Please enter name and status');
//             } else {
//                 //Insert message
//                 chat.insert({name: name, message: message}, () => {
//                     client.emit('output', [data]);

//                     //Sending status object 
//                     sendStatus({
//                         message: 'Message sent',
//                         clear: true
//                     });
//                 });
//             }
//         });

//         //Handle 'clear'
//         socket.on('clear', (data) => {
//             //Removing all chats from collection
//             chat.remove({}, () => {
//                 //Emit cleared
//                 socket.emit('cleared');
//             });
//         });
//     });
// });