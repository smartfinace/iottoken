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
import { getRunOrders, getFinishOrders, createOrders, closeOrders, deleteOrders, getSymbol, getAllSymbol, updateSymbolTrendParent , updateSymbolTrendChild} from './modules/Orders';
import net from 'net';
const client = new net.Socket();
import * as zmq from "zeromq"
import * as jsonfile from "./data.json"
import axios, {AxiosResponse} from 'axios';
//const reqSock = new Request()
//const repSock = new zmq.Reply()

const ServiceMT4 = "127.0.0.1";
const ServiceAPI = "http://127.0.0.1:8083";

const app: Application = express();

const server: http.Server = http.createServer(app);

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting the port
const port = 8084;


// EJS setup
app.use(expressLayouts);

// Setting the root path for views directory
app.set('views', path.join(__dirname, 'admin'));

// Setting the view engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

/* Home route */
app.get("/", (req: Request, res: Response) => {
	res.render("index",{page : jsonfile.main})
});
app.get("/trader/signals.html", async (req: Request, res: Response) => {
	let signal: AxiosResponse = await axios.get(`${ServiceAPI}/trader/signal?l=100`);
	res.render("trader/signals",{page : jsonfile.main, order : signal.data});
});

app.get("/trader/create.html", async (req: Request, res: Response) => {
	let symbol: AxiosResponse = await axios.get(`${ServiceAPI}/trader/symbol`);
	res.render("trader/create",{page : jsonfile.main, symbol : symbol.data});
});

app.post("/trader/create.html", async (req: Request, res: Response) => {
	let log: AxiosResponse = await axios.post(`${ServiceAPI}/trader/tradingview`,req.body);
	
	res.redirect('/trader/signals.html');
});

app.get("/trader/delete-(:id).html", async (req: Request, res: Response) => {
	let data = req.params.id;
	let log: AxiosResponse = await axios.post(`${ServiceAPI}/trader/delete`,{id : data});
	res.redirect('/trader/signals.html');
});

app.get("/trader/finish-(:id)-(:target).html", async (req: Request, res: Response) => {
	let data = req.params.id;
	let target = req.params.target;
	let log: AxiosResponse = await axios.post(`${ServiceAPI}/trader/finish`,{id : data, target:target});
	res.redirect('/trader/signals.html');
});
app.get("/trader/alert-(:id)-(:target).html", async (req: Request, res: Response) => {
	let data = req.params.id;
	let target = req.params.target;
	let log: AxiosResponse = await axios.post(`${ServiceAPI}/trader/alert`,{id : data, target:target});
	res.redirect('/trader/signals.html');
});


server.listen(port, () => {
  console.log(`SERVER RUNNING ON ${port}`);
  
});