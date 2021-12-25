import express, { Application, Request, Response } from "express";
import path from "path";
import http from "http";
import debug from "./config/debug";
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';
const app: Application = express();
const server: http.Server = http.createServer(app);

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));

// Setting the port
const port = debug.PORT;

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
