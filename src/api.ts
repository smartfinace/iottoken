import express, { Application, Request, Response } from "express";
import path from "path";
import http from "http";
import fs from "fs";
import morgan from 'morgan';
import helmet from "helmet";
import cors from "cors";
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';

import bodyParser from "body-parser";
import { connect } from './database';
import trader from './controller/Trader';
import net from 'net';
const client = new net.Socket();
import * as zmq from "zeromq"
import * as jsonfile from "./data.json"
//const reqSock = new Request()
//const repSock = new zmq.Reply()

const ServiceMT4 = "127.0.0.1";



const app: Application = express();

const server: http.Server = http.createServer(app);

app.use(helmet());
app.use(cors());

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting the port
const port = 8083;


// EJS setup
app.use(expressLayouts);

// Setting the root path for views directory
app.set('views', path.join(__dirname, 'views'));

// Setting the view engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

/* Home route */
app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
        message: "Conbo"
    });
});
app.use("/trader",trader);

/** Error handling */
app.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});






async function sendData(data:any={}){
	const sock = new zmq.Request
  await sock.connect("tcp://127.0.0.1:9091")
  await sock.send(JSON.stringify(data));
  return true;
}


server.listen(port, () => {
  console.log(`SERVER RUNNING ON ${port}`);
  
});

ServiceCheckSerial();
ServiceReportSignal();

async function ServiceCheckSerial() {
	console.log("Start Service Serial")
  const sock = new zmq.Reply;

  await sock.bind("tcp://0.0.0.0:9001");

  for await (const [msg] of sock) {
  	console.log("Unlock Connect");
  	let serial = msg.toString();
    if(serial != null && serial != ""){
        try {
            let buff = new Buffer(serial, 'base64');
            let jsonSerial = buff.toString('ascii');
            let jsonUser = JSON.parse(jsonSerial);
            let meta_id = jsonUser.id;
            let endtime = jsonUser.endtime;
            //console.log(jsonUser);
            await sock.send(JSON.stringify({"status":(Date.now() < endtime ? "unlock" : "unlock"),"meta_id" : meta_id}));
        }catch (e) {
        	await sock.send("error")
        }
    }else{
    	await sock.send("error")
    }
    
  }
}

async function ServiceReportSignal() {
	console.log("Start Service Report Order")
  const sock = new zmq.Reply;

  await sock.bind("tcp://0.0.0.0:9002");
  for await (const [result] of sock) {

	  let data = JSON.parse(result.toString());
	  //await closeOrders({message_id : data.message_id, close : data.close, profit : data.profit, pip : data.pips});
	  var type = data.type;
	  var msg = "";
	  if(type == "close"){
	      msg = "Close at "+data.close+"\nProfit : "+data.pips+" PIP(s)";
	  }
	  if(type == "hitsl"){
	      msg = "Hit SL "+data.close+"\nProfit : "+data.pips+" PIP(s)";
	  }
	  if(type == "hittp"){
	      msg = "Hit TP "+data.close+"\n✅ Profit : "+data.pips+" PIP(s)";
	  }

	  if(msg !=""){
	  	//bot.sendMessage(channel,msg,{reply_to_message_id: data.message_id});
	  }
	  
	  sock.send("ok");
	}
  
}
