const zmq = require("zeromq")

async function run() {
  const sock = new zmq.Request

  sock.connect("tcp://127.0.0.1:9091")
  //sock.subscribe("kitty cats2")
  //console.log("Subscriber connected to port 3000")
  let data = {"symbol":"USDCAD","type":"buy","open":"1.274","sl":"1.272","tp":"1.278","group":113,"child":"up","parent":"up"}; 
  sock.send(JSON.stringify(data))
  
}

run()