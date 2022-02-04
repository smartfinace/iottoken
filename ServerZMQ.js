const zmq = require("zeromq")
console.log("Server Signals")
async function run() {
  const sock = new zmq.Publisher
  const msgData = new zmq.Reply

  await sock.bind("tcp://0.0.0.0:9090")
  await msgData.bind("tcp://127.0.0.1:9091")
  
  for await (const [msg] of msgData) {
    
    if(msg.toString() != ""){
      console.log(msg.toString())
      await sock.send(["signal", msg.toString()]);
      await msgData.send("ok");
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }


  
}

run()