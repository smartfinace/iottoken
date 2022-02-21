import express, { Application, Request, Response } from "express";
import path from "path";
import http from "http";
import fs from "fs";
import debug from "./config/debug";
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';

import bodyParser from "body-parser";
import { connect } from './database';
import net from 'net';
const client = new net.Socket();
import * as zmq from "zeromq"
import * as jsonfile from "./data.json"
//const reqSock = new Request()
//const repSock = new zmq.Reply()

import axios, {AxiosResponse} from 'axios';
const ServiceAPI = "http://127.0.0.1:8083";



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

app.get("/crypto/ido.html", (req: Request, res: Response) => {
	res.render("crypto/ido",{page : jsonfile.ido})
});

app.get("/trader/signals.html", async (req: Request, res: Response) => {
	let find = req.query.s;
	let group = req.query.g;
	
	
	let signal: AxiosResponse = await axios.get(`${ServiceAPI}/trader/signal?l=8`);
	let signalFinish: AxiosResponse = await axios.get(`${ServiceAPI}/trader/complete`);
	let symbol: AxiosResponse = await axios.get(`${ServiceAPI}/trader/symbol`);
	let report: AxiosResponse = await axios.get(`${ServiceAPI}/trader/report`);
	res.render("trader/signals",{page : jsonfile.trader, signal : signal.data, signalFinish:signalFinish.data, symbol : symbol.data, report : report.data});
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


/** Error handling */
app.use((req, res, next) => {
   
    return res.status(404).render("404",{page : jsonfile.games});
});


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

