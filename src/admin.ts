import express, { Application, Request, Response } from "express";
import path from "path";
import http from "http";
import fs from "fs";
import debug from "./config/debug";
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';
import bodyParser from "body-parser";

import * as jsonfile from "./data.json"
import axios, {AxiosResponse} from 'axios';
import api from './controller/Api';
import template from './controller/Templates';
//const reqSock = new Request()
//const repSock = new zmq.Reply()

const ServiceMT4 = "127.0.0.1";
const ServiceAPI = "http://127.0.0.1:8083";

const app: Application = express();

const server: http.Server = http.createServer(app);

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use(express.static(path.join(__dirname, './upload')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false, parameterLimit:50000}));

import multer from 'multer';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/upload')
  },
  filename: function (req, file, cb) {
  	let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now() + '.'+extension)
  }
})
 
var upload = multer({ storage: storage })


app.use(upload.single('image'));

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
app.use("/template",template);

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

app.post("/trader/tradingview", async (req: Request, res: Response) => {
	var data = {
		symbol : req.body.symbol,
		type : req.body.type,
		open: req.body.open,
	  sl: req.body.sl,
	  tf: req.body.tf,
	  time: req.body.time,
	  chart : ""
	}
	axios.post(`${ServiceAPI}/trader/tradingview`,data).catch(function (error) {
		console.log("Error post API Tradingview");
	});
	
	res.send({status : "ok"});
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

app.get("/trader/telegram-(:id).html", async (req: Request, res: Response) => {
	let data = req.params.id;
	
	let log: AxiosResponse = await axios.post(`${ServiceAPI}/trader/updateg`,{id : data});
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