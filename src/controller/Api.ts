import express, {Request, Response, NextFunction } from 'express';
//import modules from '../modules/Traders';
const router = express.Router();

router.post("/serial",async (req: Request, res: Response, next: NextFunction) => {
	let data = req.body.meta_id;
	if(data == "" || data == undefined) return res.status(404).render("404",{page : "Error 404"});
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

export = router;