import { Response, Router, NextFunction, response, Request } from "express";
import { authenticatedUsersOnly, CustomRequest, CustomResponse } from '../../middleware/authenticatedUsersOnly';

import { addNewCategory, deleteCategory, updateCategory } from "../../controllers/admin/categoryController/categoryController";
import { adminAddAdvert, adminDeleteAdvert, adminGetAllAdverts, adminUpdateAdvert, adminViewAdvert } from "../../controllers/admin/advertController/advert";
import { updateProduct } from "../../controllers/shops/products/productsController";

const adminRoutes = Router();

// adminRoutes.use(authenticatedUsersOnly);

// Category routes routes
adminRoutes.post("/category", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await addNewCategory(req.body.name);
    res.status(response.status).send(response);
});

adminRoutes.put("/category/:categoryId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await updateCategory(req.params.categoryId, req.body.name);
    res.status(response.status).send(response);
});

adminRoutes.delete("/category/:categoryId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await deleteCategory(req.params.categoryId);
    res.status(response.status).send(response);
});

/// Adverts
adminRoutes.get("/adverts", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminGetAllAdverts();
    res.status(response.status).send(response);
});

adminRoutes.get("/adverts/:id", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminViewAdvert
    (req.params.id);
    res.status(response.status).send(response);
});

adminRoutes.post("/advert", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminAddAdvert(req.body);
    res.status(response.status).send(response);
});

adminRoutes.put("/advert/:advertId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    
    req.body.advertId = req.params.advertId
    
    const response = await adminUpdateAdvert(req.body);
    res.status(response.status).send(response);
});

// adminRoutes.put("/product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//     const response = await updateProduct(req.params.productId, req.body);
//     res.status(response.status).send(response);
// });

adminRoutes.delete("/advert/:advertId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    
    const response = await adminDeleteAdvert(req.params.advertId);
    res.status(response.status).send(response);
});


export default adminRoutes;
