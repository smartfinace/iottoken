const net = require('net');
const port = 9090;
const host = '0.0.0.0';
const TelegramBot = require('node-telegram-bot-api');
const token = "5026707830:AAEdWXjTXaeHBq7rVftExmsjs2VMV62NswY";
const channel = "@smartmargin";
const bot = new TelegramBot(token, {polling: false});
const server = net.createServer();
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    sock.on('data', function(data) {
        
        let extract;
        try {
		    extract = JSON.parse(data);
		    if(extract.data == "signal"){
		    	sockets.forEach(function(sock, index, array) {
		            sock.write(data + '\r\n');
		        });
		    }
            
            //Close order
            if(extract.data == "connect"){
                let serial = extract.serial;
                
                try {
                    let buff = new Buffer(serial, 'base64');
                    let jsonSerial = buff.toString('ascii');
                    let jsonUser = JSON.parse(jsonSerial);
                    console.log(jsonUser);
                    sock.write('unlock\r\n');
                }catch (e) {
                }
                
            }
            if(extract.data == "close"){
                var message_id = extract.message_id;
                var type = extract.type;
                var msg = "";
                if(type == "close"){
                    msg = "Close at "+extract.close+"\nProfit : "+extract.profit+" USD";
                }
                if(type == "hitsl"){
                    msg = "Hit SL "+extract.close+"\nProfit : "+extract.profit+" USD";
                }
                if(type == "hittp"){
                    msg = "Hit TP "+extract.close+"\nProfit : "+extract.profit+" USD";
                }

                bot.sendMessage(channel,msg,{reply_to_message_id: message_id});
            }

		} catch (e) {
		    //console.log('DATA ' + sock.remoteAddress + ': ' + data);
		}

        // Write the data back to all the connected, the client will receive it as data from the server
        
    });
    

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        let index = sockets.findIndex(function(o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
        })
        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
    sock.on('error',function(){
    	console.log('Error: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
});