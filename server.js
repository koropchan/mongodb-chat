require('dotenv').config();
const mongo = require('mongodb').MongoClient;
const app = require('express')();
const server = require('http').Server(app);
const client = require('socket.io')(server);

//Listening to port
server.listen(process.env.PORT || 4000).sockets;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  
//Connecting to Mongo
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
                sendSatus('Please enter name and status');
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



// const mongo = require('mongodb').MongoClient;
// const client = require('socket.io').listen(4000).sockets;
// require('dotenv').config();

// //Importing envirometal var from '.env' file
// var url = {
//     host: process.env.DB_HOST,
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS
//   };

// //Connecting to Mongo
// mongo.connect(url, (err, db) => {
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