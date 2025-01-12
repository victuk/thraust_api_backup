import Joi from "joi";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { productCollection } from "../../../models/Products";
import QRCode from "qrcode";
import { AddOrEditProductInterface } from "./dtos/addOrEditProduct";
import { textToSlug } from "../../../utils/textSlugUtil";
import mongoose from "mongoose";
import { uploadBase64Image } from "../../../utils/cloudinaryUtils";
import { orderCollection } from "../../../models/Orders";
import { markOrderAsDelivered } from "../../customers/ordersController/orders";


export const adminHome = async () => {
  try {
    
    const totalProducts = await productCollection.countDocuments();

    const inStock = await productCollection.countDocuments({stockStatus: "in-stock"});
    const outOfStock = await productCollection.countDocuments({stockStatus: "out-of-stock"});

    const pendingOrders = await orderCollection.countDocuments({orderStatus: "paid"});

    return {
      result: {
        totalProducts, inStock, outOfStock, pendingOrders
      },
      status: 200
    };

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}

export const addAProduct = async ({
  productName,
  description,
  pictures,
  cost,
  forType,
  stockStatus,
  sizeAndColor,
  categories,
}: AddOrEditProductInterface): Promise<ControllerResponseInterface> => {
  try {
    const phoneRegex =
      /(?:\+?\d{1,3})?\s?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;

    const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

    const { error } = Joi.object({
      productName: Joi.string().min(4).required(),
      description: Joi.string()
        .custom((value, helpers) => {
          if (phoneRegex.test(value)) {
            return helpers.error("any.invalid"); // Customize error message if needed
          }

          if (urlRegex.test(value)) {
            return helpers.error("any.invalid"); // Customize error message if needed
          }

          return value; // Return the value if it passes all checks
        })
        .messages({
          "any.invalid": "Desciption can not contain links or phone numbers.",
        }),
      pictures: Joi.array()
        .items(Joi.string().uri().min(2).required())
        .required(),
      forType: Joi.array().items(Joi.string().min(1).required()).required(),
      sizeAndColor: Joi.array().items(
        Joi.object({
          color: Joi.string().required(),
          size: Joi.string().required(),
        })
      ),
      cost: Joi.number().min(100).required(),
      stockStatus: Joi.string().required(),
      categories: Joi.array()
        .items(Joi.string().length(24).required())
        .required(),
    }).validate({
      productName,
      description,
      pictures,
      stockStatus,
      forType,
      cost,
      categories,
      sizeAndColor,
    });

    if (error) {
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }

    await productCollection.create({
      pictures,
      cost: cost * 100,
      productName,
      sizeAndColor,
      forType,
      description,
      categories,
    });

    return {
      result: "Product created successfully",
      status: 201,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const updateProduct = async (
  productId,
  {
    productName,
    description,
    pictures,
    cost,
    forType,
    stockStatus,
    sizeAndColor,
    categories,
  }: AddOrEditProductInterface
): Promise<ControllerResponseInterface> => {
  try {
    const productDetails = await productCollection.findById(productId);

    if (!productDetails) {
      return {
        result: "Product not found",
        status: 404,
      };
    }

    const phoneRegex =
      /(?:\+?\d{1,3})?\s?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;

    const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

    const { error } = Joi.object({
      productName: Joi.string().min(4).required(),
      description: Joi.string()
        .custom((value, helpers) => {
          if (phoneRegex.test(value)) {
            return helpers.error("any.invalid"); // Customize error message if needed
          }

          if (urlRegex.test(value)) {
            return helpers.error("any.invalid"); // Customize error message if needed
          }

          return value; // Return the value if it passes all checks
        })
        .messages({
          "any.invalid": "Desciption can not contain links or phone numbers.",
        }),
      pictures: Joi.array()
        .items(Joi.string().uri().min(2).required())
        .required(),
      forType: Joi.array().items(Joi.string().min(1).required()).required(),
      sizeAndColor: Joi.array().items(
        Joi.object({
          color: Joi.string().required(),
          size: Joi.string().required(),
        })
      ),
      cost: Joi.number().min(100).required(),
      stockStatus: Joi.string().required(),
      categories: Joi.array()
        .items(Joi.string().length(24).required())
        .required(),
    }).validate({
      productName,
      description,
      pictures,
      stockStatus,
      forType,
      cost,
      categories,
      sizeAndColor,
    });

    if (error) {
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }

    await productCollection.findByIdAndUpdate(productId, {
      productName,
      description,
      pictures,
      cost: cost * 100,
      forType,
      stockStatus,
      sizeAndColor,
      categories,
    });

    return {
      result: "Product updated successfully",
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

export const updateProductStockStatus = async (
  productId,
  { stockStatus }: AddOrEditProductInterface
): Promise<ControllerResponseInterface> => {
  try {
    const productDetails = await productCollection.findById(productId);

    if (!productDetails) {
      return {
        result: "Product not found",
        status: 404,
      };
    }

    await productCollection.findByIdAndUpdate(productId, {
      stockStatus,
    });

    return {
      result: "Stock status updated successfully",
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

export const deleteProduct = async (
  productId: string
): Promise<ControllerResponseInterface> => {
  try {
    const productDetails = await productCollection.findById(productId);

    if (!productDetails) {
      return {
        result: "Product not found",
        status: 404,
      };
    }

    await productCollection.findByIdAndDelete(productId);

    return {
      result: "Stock status deleted successfully",
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

export const adminMarkOrderAsDelivered = async (orderId: string) => {
  try {
    
    const productDetails = await orderCollection.findById(orderId);

    if(!productDetails) {
      return {
        result: "Order not found",
        status: 404,
      };
    }

    if(productDetails.orderStatus != "paid") {
      return {
        result: "You can only mark orders that has been paid for",
        status: 401,
      };
    }

    await orderCollection.findByIdAndUpdate(orderId, {
      orderStatus: "completed"
    });

    return {
      result: "Order marked as delivered successfully",
      status: 200
    };

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}
