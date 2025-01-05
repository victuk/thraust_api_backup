import { v4 } from "uuid";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { orderCollection } from "../../../models/Orders";
import { CreateOrderInterface } from "./dtos/createOrder";
import QRCode from "qrcode";
import { shopCollection } from "../../../models/Shops";
import axios from "axios";
import { customerCollection } from "../../../models/Customers";

export const pendingOrders = async (
  userId: string
): Promise<ControllerResponseInterface> => {
  try {
    const orders = await orderCollection.find({
      customerId: userId,
      orderStatus: { $in: ["pending", "shipping-fee-updated", "paid"] },
    }).populate("shopId");

    return {
      result: orders,
      status: 200,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const orderHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<ControllerResponseInterface> => {
  try {
    const orders = await orderCollection.paginate(
      {
        customerId: userId,
        orderStatus: { $in: ["payment-failed", "cancelled", "timed-out", "completed"] },
      },
      { page, limit, populate: "shopId" }
    );

    return {
      result: orders,
      status: 200,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const createAnOrder = async ({
  shopId,
  products,
  customerId,
  totalCost,
  country,
  state,
  city,
  address,
  latitude,
  longitude,
  // paystackRefernce,
}: CreateOrderInterface): Promise<ControllerResponseInterface> => {
  try {

    const uid = v4();

    const newOrder = await orderCollection.create({
        shopId,
        products,
        customerId,
        uid,
        totalCost,
        hungryFee: process.env.HUNGRY_FEE,
        country,
        state,
        city,
        address,
        latitude,
        longitude,
        // paystackRefernce,
      });

      const customerQrCode = await QRCode.toDataURL(
        `hungreecustomerapp://order/${newOrder.id}`
      )

      const shopQrCode = await QRCode.toDataURL(
        `hungreeshopapp://order/${newOrder.id}`
      )

      const riderQrCode = await QRCode.toDataURL(
        `hungreeriderapp://order/${newOrder.id}`
      )

      await orderCollection.findByIdAndUpdate(newOrder._id, {
        customerQrCode, shopQrCode, riderQrCode
      });

      

    return {
      result: newOrder,
      details: "Order created successfully",
      status: 201,
    };
  } catch (error: any) {
    console.log(error);
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const createPaystackPaymentLink = async (customerId: string, shopId: string, orderId: string): Promise<ControllerResponseInterface> => {
  try {

    const customerDetails = await customerCollection.findById(customerId).select("firstName lastName userUniqueId email");

    const orderDetails = await orderCollection.findById(orderId).select("shopId totalCost shippingFee hungryFee");

    const shopDetails = await shopCollection.findById(shopId).select("firstName lastName shopName shopLogo email");
    
    const response = await axios.post("https://api.paystack.co/transaction/initialize", {
      email: customerDetails?.email,
      amount: orderDetails!!.totalCost + orderDetails!!.shippingFee + orderDetails!!.hungryFee,
      metadata: {
        customerDetails, orderDetails, shopDetails
      }
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });


    console.log("response.data.data.reference", response.data.data.reference);

    await orderCollection.findByIdAndUpdate(orderId, {
      paystackReference: response.data.data.reference,
    });

    return {
      result: response.data,
      status: response.status,
      error: null
    }

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}

export const markOrderAsDelivered = async (
  orderId: string
): Promise<ControllerResponseInterface> => {
  try {
    const updatedOrder = await orderCollection.findByIdAndUpdate(
      orderId,
      {
        orderStatus: "completed",
      },
      { new: true }
    );

    return {
      result: updatedOrder,
      details: "Order marked as completed",
      status: 200,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};
