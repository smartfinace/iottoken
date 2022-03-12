import express, {Request, Response, NextFunction } from 'express';
import modules from '../modules/Shop';
const page = {title : "Shop", description : ""};
const router = express.Router();

router.get("/",async (req: Request, res: Response, next: NextFunction) => {
	let data = await modules.listItems();
	res.render("shop",{page : page, data : data});
});

router.get("/info-(:id).html",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("shop/info",{page : page, item : data});
});

router.get("/create",async (req: Request, res: Response, next: NextFunction) => {
	
	res.render("shop/create",{page : page, item : []});
});

router.post("/create",async (req: Request, res: Response, next: NextFunction) => {
	await modules.createItem(req.body);
	res.redirect('/shop');
});

router.get("/edit-(:id).html",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	let data = await modules.getItem(id);
	res.render("shop/create",{page : page,item : data});
});

router.post("/edit-(:id).html",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	await modules.updateItem(id,req.body);
	res.redirect('/shop');
});

router.post("/delete-(:id).html",async (req: Request, res: Response, next: NextFunction) => {
	var id = Number(req.params.id);
	await modules.updateItem(id,req.body);
	res.redirect('/shop');
});

//Export Default Router
export = router;