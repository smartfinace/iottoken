import express, {Request, Response, NextFunction } from 'express';
import modules from '../modules/Traders';
const router = express.Router();
import TelegramBot from "node-telegram-bot-api";
import * as jsonfile from "./../data.json"
const token = jsonfile.telegram.token;
const channel = jsonfile.telegram.channel;
const bot = new TelegramBot(token, {polling: false});

router.get('/tradingview', async (req: Request, res: Response, next: NextFunction) => {

	var symbol = req.body.symbol;
	var msg = "";
	var type = req.body.type;
	var tf = req.body.tf;
	var settp = req.body.tp;
	var chart = req.body.chart;
	let zone: any = 0;
	let tp: any = 0;
	let open_2: any = 0;
	let open_3: any = 0;
	let dig = 0;
	let groupSymbol = "";
});



export = router;