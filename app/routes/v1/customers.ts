import { Response, Router, NextFunction, response } from "express";
import {
  authenticatedUsersOnly,
  CustomRequest,
  CustomResponse,
} from "../../middleware/authenticatedUsersOnly";
import roleBasedAccess from "../../middleware/roleBasedAccess";
import { loginCustomer, registerCustomer } from "../../controllers/customers/authController/auth";
import { customerHome } from "../../controllers/customers/homeController/home";
import { getMealDetails, getMealsNearby, searchMealsNearby } from "../../controllers/customers/ProductController/products";
import { getShopById, getShopsNearby, searchShop } from "../../controllers/customers/shopsController/shops";
import { createAnOrder, createPaystackPaymentLink, markOrderAsDelivered, orderHistory, pendingOrders } from "../../controllers/customers/ordersController/orders";
import { changeCustomerBankAccountDetails, changeCustomerPassword, changeProfileDetails, changeProfilePic, customerFeedback, customerProfile } from "../../controllers/customers/profileController/profile";

const customerRoutes = Router();

customerRoutes.post("/register", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await registerCustomer(req.body);
  res.status(response.status).send(response);
});

customerRoutes.post("/login", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await loginCustomer(req.body);
  res.status(response.status).send(response);
});

customerRoutes.use(authenticatedUsersOnly);
customerRoutes.use(roleBasedAccess(["customer"]));

// Home route
customerRoutes.get("/home", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await customerHome(req.userDetails!!.userId);
  res.status(response.status).send(response);
});



// Meals nearby
customerRoutes.get("/meals-nearby/:page?/:limit?/:categoryValue?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getMealsNearby(req.userDetails!!.userId, parseInt(req.params.page), parseInt(req.params.limit), req.params.categoryValue);
  res.status(response.status).send(response);
});
customerRoutes.get("/meal-details/:mealId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getMealDetails(req.params.mealId);
  res.status(response.status).send(response);
});

customerRoutes.post("/search-meal", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await searchMealsNearby(req.body.searchWord, req.userDetails!!.userId);
  res.status(response.status).send(response);
});


// Shops Nearby
customerRoutes.get("/shops-nearby/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getShopsNearby(req.userDetails!!.userId, parseInt(req.params.page), parseInt(req.params.limit));
  res.status(response.status).send(response);
});

customerRoutes.get("/shop-details/:shopId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getShopById(req.params.shopId);
  res.status(response.status).send(response);
});

customerRoutes.get("/search-shop", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await searchShop(req.body.searchWord, req.userDetails!!.userId);
  res.status(response.status).send(response);
});

// Order Endpoints
customerRoutes.get("/pending-orders", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await pendingOrders(req.userDetails!!.userId);
  res.status(response.status).send(response);
});

customerRoutes.get("/order-history/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await orderHistory(req.userDetails!!.userId, parseInt(req.params.page), parseInt(req.params.limit));
  res.status(response.status).send(response);
});


customerRoutes.post("/create-order", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  req.body.customerId = req.userDetails!!.userId;
  const response = await createAnOrder(req.body);
  res.status(response.status).send(response);
});


customerRoutes.post("/create-payment-link", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  req.body.customerId = req.userDetails!!.userId;
  const response = await createPaystackPaymentLink(req.userDetails!!.userId, req.body.shopId, req.body.orderId);
  res.status(response.status).send(response);
});

customerRoutes.post("/mark-order-as-delivered", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await markOrderAsDelivered(req.body.orderId);
  res.status(response.status).send(response);
});

// Profile
customerRoutes.get("/profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await customerProfile(req.userDetails!!.userId);
  res.status(response.status).send(response);
});

customerRoutes.put("/profile-picture", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {profilePic} = req.body;
  const response = await changeProfilePic(req.userDetails!!.userId, profilePic);
  res.status(response.status).send(response);
});

customerRoutes.put("/profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {profile} = req.body;
  const response = await changeProfileDetails(req.userDetails!!.userId, profile);
  res.status(response.status).send(response);
});

customerRoutes.put("/password", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {oldPassword, newPassword, confirmPassword} = req.body;
  const response = await changeCustomerPassword(req.userDetails!!.userId, oldPassword, newPassword, confirmPassword);
  res.status(response.status).send(response);
});

customerRoutes.put("/password", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {oldPassword, newPassword, confirmPassword} = req.body;
  const response = await changeCustomerPassword(req.userDetails!!.userId, oldPassword, newPassword, confirmPassword);
  res.status(response.status).send(response);
});

customerRoutes.post("/feedback", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {feedback} = req.body;
  const response = await customerFeedback(req.userDetails!!.userId, feedback);
  res.status(response.status).send(response);
});

// Notifications
customerRoutes.put("/bank-account", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {bankCode, accountName, accountNumber} = req.body;
  const response = await changeCustomerBankAccountDetails(req.userDetails!!.userId, bankCode, accountName, accountNumber);
  res.status(response.status).send(response);
});

export default customerRoutes;
