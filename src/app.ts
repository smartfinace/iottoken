import express, { Application, Request, Response } from "express";
import path from "path";
import http from "http";
import fs from "fs";
import debug from "./config/debug";
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';

import bodyParser from "body-parser";
import api from './controller/Api';
import shop from './controller/Shop';
import crypto from './controller/Crypto';
import posts from './controller/Posts';
import pages from './controller/Pages';
import trader from './controller/Trader';

import * as jsonfile from "./data.json"
//const reqSock = new Request()
//const repSock = new zmq.Reply()

import axios, {AxiosResponse} from 'axios';




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

app.use("/api", api);
app.use("/shop",shop);
app.use("/crypto",crypto);
app.use("/post",posts);
app.use("/page",pages);
app.use("/trader",trader);





/** Error handling */
app.use((req, res, next) => {
   
    return res.status(404).render("404",{page : {title : "Error 404",description : "Page not found"}});
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

