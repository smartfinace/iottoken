import express, {Request, Response, NextFunction } from 'express';
import modules from '../modules/Traders';
const router = express.Router();
import TelegramBot from "node-telegram-bot-api";
import * as jsonfile from "./../data.json"
import * as zmq from "zeromq"
const token = jsonfile.telegram.token;
const channel = jsonfile.telegram.channel;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: false});


router.get('/signal', async (req: Request, res: Response, next: NextFunction) => {

	var l = Number(req.query.l);
	if(l == 0) l = 10;
	let data = await modules.getOrders(l);
	//res.setHeader('Content-Type', 'application/json');

    res.send(data);
});

router.get('/complete', async (req: Request, res: Response, next: NextFunction) => {
	let data = await modules.getOrdersFinish();
	//res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

router.post("/create",async (req: Request, res: Response, next: NextFunction) => {
	var obj = {
		symbol : req.body.symbol, 
		type : req.body.type, 
		open : req.body.open,
		open_2 : req.body.open2, 
		open_3 : req.body.open3, 
		sl : req.body.sl, 
		tp : req.body.tp,
		tp_2 : req.body.tp2, 
		tp_3 : req.body.tp3,  
		message_id : 0, 
		tf : req.body.tf, 
		chart : req.body.chart
	}
	await modules.createOrders(obj);
	res.send({status : "ok"});
});
router.post("/finish",async (req: Request, res: Response, next: NextFunction) => {
	var id = req.body.id;
	var target = req.body.target == undefined ? 0 : req.body.target;
	var pip = req.body.pip == undefined ? 0 : req.body.pip;
	var close = req.body.close == undefined ? 0 : req.body.close;

	var close_type = "TP";
	var is_access = "Free";
	if(target == 0){
		close_type = "SL";
	}else if(target == 4){
		close_type = "Close";
	}
	let getOrderInfo = await modules.getOrdersInfo(id);
	let symbol = await modules.getSymbolsInfo(getOrderInfo.symbol);

	

    var point = 0.0001;
	var pipsfactor = 10;
	
	if(symbol.dig  == 3) {
		pipsfactor=10;
		point = 0.001;
		if(symbol.symbol == "XAUUSD"){
			point = 0.1;
		}
	}else if(symbol.dig  == 5) {
		pipsfactor=10;
		point = 0.00001;
	}else if(symbol.dig == 2){
		pipsfactor=100;
		point = 0.1;
		if(symbol.symbol == "BTCUSD" || symbol.symbol == "ETHUSD" ||){
			pipsfactor=10000;
		}
	}

	

	if(close_type == "TP" && target == 1) {
		close = getOrderInfo.tp;
		pip = Math.abs(getOrderInfo.tp - getOrderInfo.open) /  point / pipsfactor;
	}else if(close_type == "TP" && target == 2) {
		close = getOrderInfo.tp_2;
		is_access = "Vip";
		pip = Math.abs(getOrderInfo.tp_2 - getOrderInfo.open) /  point / pipsfactor;
	}else if(close_type == "TP" && target == 3) {
		close = getOrderInfo.tp_3;
		is_access = "Vip";
		pip = Math.abs(getOrderInfo.tp_3 - getOrderInfo.open) /  point / pipsfactor;
	}

	if(close_type == "SL") {
		close = getOrderInfo.sl;
		pip = -(Math.abs(getOrderInfo.sl - getOrderInfo.open) /  point / pipsfactor);
	}
	pip = parseFloat(pip).toFixed(2);
	await modules.closeOrders({
		signals_id : getOrderInfo.id,
		message_id : getOrderInfo.telegram_id, 
		close : close,  
		pip : pip, 
		open : getOrderInfo.open, 
		sl : getOrderInfo.sl, 
		symbol : getOrderInfo.symbol, 
		opentime : getOrderInfo.opentime,
		close_type : close_type,
		is_access : is_access,
		action : close_type == "SL" || target == 3 ? "remove" : "hold"
	});
	await sendTelegramReport(getOrderInfo, {reply_id : getOrderInfo.telegram_id, target : target, pip : pip});
	res.send({status : "ok"});
});

router.post("/alert",async (req: Request, res: Response, next: NextFunction) => {
	var id = req.body.id;
	var target = req.body.target == undefined ? 0 : req.body.target;
	let getOrderInfo = await modules.getOrdersInfo(id);
	if(target == "channel"){
		var msg = "Smart AI Signals, Forex, Crypto, Stock.Auto Copy all exchange 0%. Share and Follow Channel https://t.me/vsmartfx";
		await bot.sendMessage(channel, msg);
	}else{
		var msg = "🌹Running in profit, Wait TP, or move sl entry or close 1/2";
		await bot.sendMessage(channel, msg,{reply_to_message_id : getOrderInfo.telegram_id});
	}
	res.send({status : "ok"});
});
router.post("/delete",async (req: Request, res: Response, next: NextFunction) => {
	await modules.deleteOrders({id : req.body.id});
	res.send({status : "ok"});
});

router.post("/tradingview",async (req: Request, res: Response, next: NextFunction) => {
	var symbol = req.body.symbol;
	var msg = "";
	var type = req.body.type;
	var tf = req.body.tf;
	
	var chart = req.body.chart;
	let zone: any = 0;
	
	var open 	= req.body.open;
	var open2 	= req.body.open2;
	var open3 	= req.body.open3;

	var tp 	= req.body.tp;
	var tp2 = req.body.tp2;
	var tp3 = req.body.tp3;
	var sl = req.body.sl;

	var dig = 0;
	var groupSymbol = "";
	
	tf = (tf == "" || tf == undefined ? "H1" : tf);

	if(type == "buy"){

		var obj = {
			symbol : symbol,
			type : "buy",
			open : open,
			open_2 : open2,
			open_3 : open3,
			sl : sl,
			tp : tp,
			tp_2 : tp2,
			tp_3:tp3,
			chart : chart,
			message_id : 0,
			tf : tf
		} as any;
		obj.message_id = await sendTelegram(obj);
		await modules.createOrders(obj);
		sendSocketData(obj);

	}

	if(type == "sell"){
		var obj = {
			symbol : symbol,
			type : "sell",
			open : open,
			open_2 : open2,
			open_3 : open3,
			sl : sl,
			tp : tp,
			tp_2 : tp2,
			tp_3:tp3,
			chart : chart,
			message_id : 0,
			tf : tf
		} as any;
		obj.message_id = await sendTelegram(obj);
		await modules.createOrders(obj);
		sendSocketData(obj);
	}
	res.send({status : "ok"});
});
router.post("/serial/:id",async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/symbol', async (req: Request, res: Response, next: NextFunction) => {
	let data = await modules.getSymbols();
	//res.setHeader('Content-Type', 'application/json');

    res.send(data);
});

const sendTelegram = async (obj:any={}) => {
	let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
	var msg = "🌷"+obj.symbol+" ["+obj.type.toUpperCase()+"] "+obj.tf+"\n🔹Open : "+obj.open+"\n🔹Limit 1: "+obj.open_2+"\n🔹Limit 2: "+obj.open_3+"\n🔴Stoploss : "+obj.sl+"\n✅Takeprofit : "+obj.tp+"\n📅Time : "+mysqlDate;
	if(obj.chart != ""){
		let msgTelegram = await bot.sendPhoto(channel,obj.chart,{
			
			caption : msg,
			
		});
		//console.log(msgTelegram);
		return msgTelegram.message_id;
	}else{
		let msgTelegram = await bot.sendMessage(channel, msg);
		//console.log(msgTelegram);
		return msgTelegram.message_id;
	}
	return 0;
}

const sendTelegramReport = async (obj:any={}, objCustoms:any={}) => {
	let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
	var tp = obj.tp;
	if(objCustoms.target == 2) tp = obj.tp_2;
	if(objCustoms.target == 3) tp = obj.tp_3;
	var msg = "✅"+obj.type.toUpperCase()+" "+obj.symbol+"\n💥Hit TP "+objCustoms.target+" : "+tp+"\n💰Profit : "+objCustoms.pip+" Pips\n📅Time : "+mysqlDate;
	if(objCustoms.target == 0){
		msg = "❌"+obj.type.toUpperCase()+" "+obj.symbol+"\n🐥Hit SL : "+obj.sl+"\n💰Profit : "+objCustoms.pip+" Pips\n📅Time : "+mysqlDate;
	}
	if(objCustoms.target == 4){
		msg = "👥"+obj.type.toUpperCase()+" "+obj.symbol+"\n🐹Close\n💰Profit : "+objCustoms.pip+" Pips\n📅Time : "+mysqlDate;
	}

	let msgTelegram = await bot.sendMessage(channel, msg,{reply_to_message_id : objCustoms.reply_id});
	//console.log(msgTelegram);
	return true;
}


async function sendSocketData(data:any={}){
  const sock = new zmq.Request
  await sock.connect("tcp://127.0.0.1:9091")
  await sock.send(JSON.stringify(data));
  return true;
}

//router.post('/update/:id', modules.updateAds);
//router.delete('/delete/:id', modules.deleteAds);
//router.post('/onoff/:id', modules.onOffAds);


export = router;