import express, {Request, Response, NextFunction } from 'express';
import modules from '../modules/Crypto';
const page = {title : "Crypto", description : ""};
const router = express.Router();

router.get("/",async (req: Request, res: Response, next: NextFunction) => {
	let data = await modules.listItems();
	res.render("crypto/list",{page : page, data : data});
});


router.get("/presell",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});

router.get("/ido",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/ido",{page : page, item : data});
});


router.get("/farm",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});


router.get("/staking",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});


router.get("/bank",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});


router.get("/pool",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});

router.get("/swap",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});

router.get("/airdrop",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("crypto/info",{page : page, item : data});
});


//Export Default Router
export = router;