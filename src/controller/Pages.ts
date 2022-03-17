import express, {Request, Response, NextFunction } from 'express';
import modules from '../modules/Posts';
const page = {title : "Posts", description : ""};
const router = express.Router();

router.get("/",async (req: Request, res: Response, next: NextFunction) => {
	let data = await modules.listItems(8,1,"Page");
	res.render("pages/list",{page : page, data : data});
});

router.get("/(:id)",async (req: Request, res: Response, next: NextFunction) => {
	var pageID = req.params.id;
	let data = await modules.getItemByUrl(pageID);
	res.render("pages/info",{page : page, item : data});
});

//Export Default Router
export = router;