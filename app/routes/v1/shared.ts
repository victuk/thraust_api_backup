import { Response, Router, NextFunction, response, Request } from "express";
import { authenticatedUsersOnly, CustomRequest, CustomResponse } from '../../middleware/authenticatedUsersOnly';
import roleBasedAccess from '../../middleware/roleBasedAccess';
// import { propertyCollection } from "../../models/Products";
import { pageAndLimit } from "../../utils/paginateOption";
import { comparePassword, hashPassword } from "../../utils/authUtilities";
// import { userCollection } from "../../models/Customers";
import { propertyOrderCollection } from "../../models/PropertyOrders";
import axios from "axios";
import { getCategories } from "../../controllers/shared/categoryController";
import { notifications } from "../../controllers/shared/notificationController";
import { getShopProducts, shopViewProductById } from "../../controllers/shared/productController";

const sharedRoutes = Router();

sharedRoutes.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
    const response = await getCategories();
    res.status(response.status).send(response);
});

sharedRoutes.get("/shop-product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await shopViewProductById(req.params.productId);
    res.status(response.status).send(response);
});

// Product routes
sharedRoutes.get("/shop-products/:page?/:limit?/:category?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await getShopProducts(req.params.category, parseInt(req.params.page), parseInt(req.params.limit));
    res.status(response.status).send(response);
});

sharedRoutes.use(authenticatedUsersOnly);

sharedRoutes.get("/notifications/:userType/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await notifications(req.userDetails!!.userId, req.params.userType as any, parseInt(req.params.page), parseInt(req.params.limit));
    res.status(response.status).send(response);
});

export default sharedRoutes;
