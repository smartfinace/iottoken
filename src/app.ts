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
import net from 'net';
const client = new net.Socket();

const ServiceMT4 = "127.0.0.1";

const token = "5026707830:AAEdWXjTXaeHBq7rVftExmsjs2VMV62NswY";
const channel = "@smartmargin";
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: false});

const app: Application = express();

const server: http.Server = http.createServer(app);

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting the port
const port = 80;

import * as jsonfile from "./data.json"
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


app.post("/api/tradingview", async (req: Request, res: Response) => {

		//console.log(req.body);
		
		console.log(req.body);
		

		
		var symbol = req.body.symbol;
		var msg = "";
		var type = req.body.type;
		let zone: any = 0;
		let tp: any = 0;
		let open_2: any = 0;
		let open_3: any = 0;
		let dig = 0;
		if(symbol == "BTCUSDT" || symbol == "BTCUSD" || symbol == "ETHUSD" || symbol == "ETHUSDT"){
			dig = 2;
		}else if(symbol == "XAUUSD"){
			dig = 3;
		}else if(symbol == "EURUSD" || symbol == "GBPUSD" || symbol == "USDCHF" || symbol == "EURGBP"){
			dig = 5;
		}else if(symbol == "USDCAD" || symbol == "USDJPY" || symbol == "GBPJPY"){
			dig = 3;
		}

		let open: any = parseFloat(req.body.open).toFixed(dig);
		let sl: any = parseFloat(req.body.sl).toFixed(dig);

		if(dig > 0){
			const conn = await connect();
			if(type == "buy"){
					zone = Math.abs(sl - open);
					//sl = (Number)sl.toFixed(dig);
					tp = (Math.fround(open) + (zone * 2)).toFixed(dig);
					open_2 = (Math.fround(open) - (zone / 100)*50).toFixed(dig);
					open_3 = (Math.fround(open) - (zone / 100)*75).toFixed(dig);
					
					
					msg = symbol+" BUY\nOpen : "+open+"\nLimit 1: "+open_2+"\nLimit 2: "+open_3+"\nStoploss : "+sl+"\nTakeprofit : "+tp;
					bot.sendMessage(channel, msg).then((telegram)=>{
							try {
								client.connect(9090, ServiceMT4, function() {
								    console.log('Send TCP');
								    client.write(JSON.stringify({"data" : "signal",symbol : symbol, type : "buy", sl : sl, tp : tp, group : telegram.message_id}, null, 2));
								    client.destroy();
								});
								conn.query('INSERT INTO mt4_orders SET symbol="'+symbol+'", type="buy", open="'+open+'", sl="'+sl+'", tp="'+tp+'", telegram_id="'+telegram.message_id+'"');
							} catch (e) {
							    console.log('Error socket');
							}
					}).catch(error => {

							try {
								client.connect(9090, ServiceMT4, function() {
								    console.log('Send TCP');
								    client.write(JSON.stringify({"data" : "signal",symbol : symbol, type : "buy", sl : sl, tp : tp, group : 0}, null, 2));
								    client.destroy();
								});
								conn.query('INSERT INTO mt4_orders SET symbol="'+symbol+'", type="buy", open="'+open+'", sl="'+sl+'", tp="'+tp+'", telegram_id="0"');
							} catch (e) {
							    console.log('Error socket');
							}
							
					});
					
			}

			if(type == "sell"){
					zone = Math.abs(sl - open);
					//sl = sl.toFixed(dig);
					tp = (Math.fround(open) - (zone * 2)).toFixed(dig);
					open_2 = (Math.fround(open) + (zone / 100)*50).toFixed(dig);
					open_3 = (Math.fround(open) + (zone / 100)*75).toFixed(dig);
					
					msg = 	symbol+" SELL\nOpen : "+open+"\nLimit 1: "+open_2+"\nLimit 2: "+open_3+"\nStoploss : "+sl+"\nTakeprofit : "+tp;
					bot.sendMessage(channel, msg).then((telegram) => {
							try {
								client.connect(9090, ServiceMT4, function() {
								    console.log('Send TCP');
								    client.write(JSON.stringify({"data" : "signal",symbol : symbol, type : "sell", sl : sl, tp : tp, group : telegram.message_id}, null, 2));
								    client.destroy();
								});

								
    						conn.query('INSERT INTO mt4_orders SET symbol="'+symbol+'", type="sell", open="'+open+'", sl="'+sl+'", tp="'+tp+'", telegram_id="'+telegram.message_id+'"');
							} catch (e) {
							    console.log('Error socket');
							}
					}).catch(error => {

							try {
								client.connect(9090, ServiceMT4, function() {
								    console.log('Send TCP');
								    client.write(JSON.stringify({"data" : "signal",symbol : symbol, type : "sell", sl : sl, tp : tp, group : 0}, null, 2));
								    client.destroy();
								});

    						conn.query('INSERT INTO mt4_orders SET symbol="'+symbol+'", type="sell", open="'+open+'", sl="'+sl+'", tp="'+tp+'", telegram_id="0"');
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
		let download = new Buffer(JSON.stringify({"id" : data, "serial" : base64data, "endtime" : Date.now()}, null, 2));
		
		const fileName = data+'.key'
	  const fileType = 'text/plain'

	  res.writeHead(200, {
	    'Content-Disposition': `attachment; filename="${fileName}"`,
	    'Content-Type': fileType,
	  });

    res.end(download.toString('base64'));

});

/*
app.get("/presell", (req: Request, res: Response) => {
	res.render("presell")
});



app.get("/gameplay", (req: Request, res: Response) => {
	res.render("index")
});
*/

server.listen(80, () => {
  console.log(`SERVER RUNNING ON ${port}`);
});
