const net = require('net');
var client = new net.Socket();
let order = {"symbol":"US500","cm":"buy","open":"4379.30","sl":"4288.04","tp":"4532.62","tp2":"4623.88","tp3":"4715.14","dca":"4333.67","dca2":"4310.85","telegram":839}; 
  try{
    client.connect(9090, '127.0.0.1', function() {
      console.log('Connected');
      client.write(JSON.stringify(order)+"\n");
      client.destroy();
    });

    client.on('data', function(data = {}) {
      console.log('Received: ' + data);
      client.destroy(); // kill client after server's response
    });

    client.on('close', function() {
      console.log('Connection closed');
    });
    client.on('error', function(err={}){
        console.log("Error: "+err.message);
    });
  }catch (err) {
        console.log("Connect time out");
  }