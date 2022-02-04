import express, { Application, Request, Response } from "express";
import path from "path";
import http from "http";
import fs from "fs";
import debug from "./config/debug";
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';
import TelegramBot from "node-telegram-bot-api";
import bodyParser from "body-parser";
import { connect } from './database';
import { getRunOrders, getFinishOrders, createOrders, closeOrders, getSymbol, updateSymbolTrendParent , updateSymbolTrendChild} from './modules/Orders';
import net from 'net';
const client = new net.Socket();
import * as zmq from "zeromq"
import * as jsonfile from "./data.json"
//const reqSock = new Request()
//const repSock = new zmq.Reply()

const ServiceMT4 = "127.0.0.1";

const token = jsonfile.telegram.token;
const channel = jsonfile.telegram.channel;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: false});

const app: Application = express();

const server: http.Server = http.createServer(app);

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting the port
const port = debug.PORT;


// EJS setup
app.use(expressLayouts);

// Setting the root path for views directory
app.set('views', path.join(__dirname, 'views'));

// Setting the view engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

/* Home route */
app.get("/", (req: Request, res: Response) => {
	res.render("index",{page : jsonfile.main})
});

app.get("/ido", (req: Request, res: Response) => {
	res.render("ido",{page : jsonfile.ido})
});

app.get("/trader/signals.html", async (req: Request, res: Response) => {
	let order = await getRunOrders();
	let orderfinish = await getFinishOrders();
	res.render("trader/signals",{page : jsonfile.trader, order : order, orderfinish : orderfinish});
});

app.get("/trader/copytrade.html", async (req: Request, res: Response) => {
	
	res.render("trader/copytrade",{page : jsonfile.copytrade});
});

app.get("/trader/download.html", async (req: Request, res: Response) => {
	
	res.render("trader/download",{page : jsonfile.download});
});

app.get("/games.html", async (req: Request, res: Response) => {
	
	res.render("games/service",{page : jsonfile.games});
});

app.get("/cdkey", (req: Request, res: Response) => {
	res.render("cdkey",{page : jsonfile.ido})
});



app.post("/api/tradingview", async (req: Request, res: Response) => {

		//console.log(req.body);
		
		//console.log(req.body);
		

		
		var symbol = req.body.symbol;
		var msg = "";
		var type = req.body.type;
		var tf = req.body.tf;
		let zone: any = 0;
		let tp: any = 0;
		let open_2: any = 0;
		let open_3: any = 0;
		let dig = 0;
		let groupSymbol = "";

		

		
		if(symbol == "BTCUSDT"){
			symbol = "BTCUSD";
		}
		if(symbol == "ETHUSDT"){
			symbol = "ETHUSD";
		}
		if(symbol == "BTCUSD" || symbol == "ETHUSD"){
			dig = 2;
		}else if(symbol == "XAUUSD" || symbol == "DXY" || symbol == "USDCAD" || symbol == "USDJPY" || symbol == "GBPJPY"){
			dig = 3;
		}else if(symbol == "EURUSD" || symbol == "GBPUSD" || symbol == "USDCHF" || symbol == "EURGBP"){
			dig = 5;
		}

		let open: any = parseFloat(req.body.open).toFixed(dig);
		let sl: any = parseFloat(req.body.sl).toFixed(dig);
		let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
		
		if(dig > 0){
			
			const parent = await getSymbol(symbol);
			if(type == "buy" && (parent.parentTrend == "up" || tf == parent.parent || parent.classicTrade == 1)){
				  await updateSymbolTrendChild(symbol,  "up" );
				  if(tf == parent.parent){
				  		await updateSymbolTrendParent(symbol, "up");
				  }

					zone = Math.abs(sl - open);
					//sl = (Number)sl.toFixed(dig);
					tp = (Math.fround(open) + (zone * 1.8)).toFixed(dig);

					if(parent.parent != tf && parent.parentTrend == "up"){
						 tp = (Math.fround(open) + (zone * 3)).toFixed(dig);
					}

					open_2 = (Math.fround(open) - (zone / 100)*50).toFixed(dig);
					open_3 = (Math.fround(open) - (zone / 100)*75).toFixed(dig);
					
					
					msg = "🔥 "+symbol+" [BUY] "+tf+"\nOpen : "+open+"\nLimit 1: "+open_2+"\nLimit 2: "+open_3+"\nStoploss : "+sl+"\nTakeprofit : "+tp+"\nTime : "+mysqlDate;
					bot.sendMessage(channel, msg).then(async (telegram)=>{
							try {

								await sendData({symbol : symbol, type : "buy", open : open, sl : sl, tp : tp, group : telegram.message_id,child : "up", tf: tf, parent :  tf == parent.parentTrend ? "up" : parent.parentTrend});

								createOrders({symbol : symbol, type : "buy", open : open, sl : sl, tp : tp, message_id : telegram.message_id, tf: tf});
								
							} catch (e) {
							    console.log('Error socket');
							}
					}).catch(error => {

							try {
								 
								 sendData({symbol : symbol, type : "buy", open : open, sl : sl, tp : tp, group : 0,child : "up", tf: tf,parent :  tf == parent.parentTrend ? "up" : parent.parentTrend});
								
								 createOrders({symbol : symbol, type : "buy", open : open, sl : sl, tp : tp, message_id : 0, tf: tf});

							} catch (e) {
							    console.log('Error socket');
							}
							
					});
					
			}

			if(type == "sell" && (parent.parentTrend == "down" || tf == parent.parent || parent.classicTrade == 1)){
				  await updateSymbolTrendChild(symbol,  "down" );
				  if(tf == parent.parent){
				  		await updateSymbolTrendParent(symbol, "down");
				  }
					zone = Math.abs(sl - open);
					//sl = sl.toFixed(dig);
					tp = (Math.fround(open) - (zone * 1.8)).toFixed(dig);

					if(parent.parent != tf && parent.parentTrend == "down"){
						 tp = (Math.fround(open) - (zone * 3)).toFixed(dig);
					}

					open_2 = (Math.fround(open) + (zone / 100)*50).toFixed(dig);
					open_3 = (Math.fround(open) + (zone / 100)*75).toFixed(dig);
					
					msg = 	"🔥 "+symbol+" [SELL] "+tf+"\nOpen : "+open+"\nLimit 1: "+open_2+"\nLimit 2: "+open_3+"\nStoploss : "+sl+"\nTakeprofit : "+tp+"\nTime : "+mysqlDate;
					bot.sendMessage(channel, msg).then(async (telegram) => {
							try {
								await sendData({symbol : symbol, type : "sell",open : open, sl : sl, tp : tp, group : telegram.message_id, tf: tf,child : "down", parent :  tf == parent.parentTrend ? "down" : parent.parentTrend});

    						createOrders({symbol : symbol, type : "sell", open : open, sl : sl, tp : tp, message_id : telegram.message_id, tf: tf});
							} catch (e) {
							    console.log('Error socket');
							}
					}).catch(error => {

							try {


								sendData({symbol : symbol, type : "sell",open : open, sl : sl, tp : tp, group : 0, child : "down", tf: tf, parent :  tf == parent.parentTrend ? "down" : parent.parentTrend});

								createOrders({symbol : symbol, type : "sell", open : open, sl : sl, tp : tp, message_id : 0, tf: tf});
    						
							} catch (e) {
							    console.log('Error socket');
							}

					});

					
			}
		}

		
		
		res.setHeader('Content-Type', 'application/json');

    res.end(JSON.stringify(req.body, null, 2));

});

app.get("/serial/:id", async (req: Request, res: Response) => {

		let data = req.params.id;
		let buff = new Buffer(data);
		let base64data = buff.toString('base64');
		//res.setHeader('Content-Type', 'application/json');
		let newTime = new Date(new Date().getTime() + ((24*30) * 60 * 60 * 1000));
		let download = new Buffer(JSON.stringify({"id" : data, "serial" : base64data, "endtime" : newTime}, null, 2));
		
		const fileName = data+'.key'
	  const fileType = 'text/plain'

	  res.writeHead(200, {
	    'Content-Disposition': `attachment; filename="${fileName}"`,
	    'Content-Type': fileType,
	  });

    res.end(download.toString('base64'));

});


async function sendData(data:any={}){
	const sock = new zmq.Request
  await sock.connect("tcp://127.0.0.1:9091")
  await sock.send(JSON.stringify(data));
  return true;
}

/*
app.get("/presell", (req: Request, res: Response) => {
	res.render("presell")
});



app.get("/gameplay", (req: Request, res: Response) => {
	res.render("index")
});
*/

server.listen(port, () => {
  console.log(`SERVER RUNNING ON ${port}`);
  
});

ServiceCheckSerial();
ServiceReportSignal();

async function ServiceCheckSerial() {
	console.log("Start Service Serial")
  const sock = new zmq.Reply;

  await sock.bind("tcp://0.0.0.0:3001");

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
            await sock.send(JSON.stringify({"status":(Date.now() < endtime ? "unlock" : "exit"),"meta_id" : meta_id}));
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

  await sock.bind("tcp://0.0.0.0:3002");
  for await (const [result] of sock) {

	  let data = JSON.parse(result.toString());
	  await closeOrders({message_id : data.message_id, close : data.close, profit : data.profit, pip : data.pips});
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
	  	bot.sendMessage(channel,msg,{reply_to_message_id: data.message_id});
	  }
	  
	  sock.send("ok");
	}
  
}
