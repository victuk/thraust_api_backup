import { Response, Router, NextFunction, response, Request } from "express";
import { authenticatedUsersOnly, CustomRequest, CustomResponse } from '../../middleware/authenticatedUsersOnly';
import roleBasedAccess from '../../middleware/roleBasedAccess';
// import { propertyCollection } from "../../models/Products";
import { pageAndLimit } from "../../utils/paginateOption";
import { comparePassword, hashPassword } from "../../utils/authUtilities";
// import { userCollection } from "../../models/Customers";
import { propertyOrderCollection } from "../../models/PropertyOrders";
import axios from "axios";
import { addAProduct, adminHome, deleteProduct, updateProduct, updateProductStockStatus } from "../../controllers/shops/products/productsController";
import { orderHistory, pendingOrders, shopPendingOrderById, updateShippingFee } from "../../controllers/shops/orders/ordersController";
import { loginShop, registerShop } from "../../controllers/shops/authController/auth";
import { shopProfile } from "../../controllers/shops/profileController/profile";

const shopRoutes = Router();

// Auth routes
shopRoutes.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    const response = await registerShop(req.body);
    res.status(response.status).send(response);
});

shopRoutes.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    const response = await loginShop(req.body);
    res.status(response.status).send(response);
});

shopRoutes.use(authenticatedUsersOnly);
shopRoutes.use(roleBasedAccess(["shop"]));

shopRoutes.get("/home", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await adminHome();
    res.status(response.status).send(response);
});

shopRoutes.post("/shop-product", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await addAProduct(req.body);
    res.status(response.status).send(response);
});

shopRoutes.put("/shop-product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await updateProduct(req.params.productId, req.body);
    res.status(response.status).send(response);
});

shopRoutes.put("/shop-product-stock-status/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await updateProductStockStatus(req.params.productId, req.body);
    res.status(response.status).send(response);
});

shopRoutes.delete("/shop-product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await deleteProduct(req.params!!.productId);
    res.status(response.status).send(response);
});


// Order routes
shopRoutes.get("/pending-orders", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await pendingOrders();
    res.status(response.status).send(response);
});

shopRoutes.get("/pending-order/:orderId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await shopPendingOrderById(req.params.orderId);
    res.status(response.status).send(response);
});

shopRoutes.get("/order-history/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await orderHistory(parseInt(req.params.page), parseInt(req.params.limit));
    res.status(response.status).send(response);
});

shopRoutes.put("/update-shipping-fee", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await updateShippingFee(req.userDetails!!.userId, req.body.orderId, req.body.shippingFee);
    if(response.status == 200) {
        res.io?.to((response.result.customerId).toString()).emit("shipping-fee-update", response.result);
    }
    res.status(response.status).send(response);
});

// Shop profile route
shopRoutes.get("/profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await shopProfile(req.userDetails!!.userId);
    res.status(response.status).send(response);
});

export default shopRoutes;
