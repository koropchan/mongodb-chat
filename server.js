const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//Connecting to Mongo
mongo.connect('mongodb://127.0.0.1/mongochat', (err, db) => {
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