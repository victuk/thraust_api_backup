import Joi from "joi";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { productCollection } from "../../../models/Products";
import QRCode from "qrcode";
import { AddOrEditProductInterface } from "./dtos/addOrEditProduct";
import { textToSlug } from "../../../utils/textSlugUtil";
import mongoose from "mongoose";
import { uploadBase64Image } from "../../../utils/cloudinaryUtils";



export const addAProduct = async ({
  productName,
  description,
  pictures,
  cost,
  categories,
}: AddOrEditProductInterface): Promise<ControllerResponseInterface> => {
  try {
    const phoneRegex =
      /(?:\+?\d{1,3})?\s?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;

    const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

    const { error } = Joi.object({
      productName: Joi.string().min(4).required(),
      description: Joi.string().custom((value, helpers) => {
        if (phoneRegex.test(value)) {
          return helpers.error("any.invalid"); // Customize error message if needed
        }

        if (urlRegex.test(value)) {
          return helpers.error("any.invalid"); // Customize error message if needed
        }

        return value; // Return the value if it passes all checks
      }),
      pictures: Joi.array()
        .items(Joi.string().uri().min(2).required())
        .required(),
      cost: Joi.number().min(100).required(),
      categories: Joi.array()
        .items(Joi.string().length(24).required())
        .required(),
    }).validate({
      productName,
      description,
      pictures,
      cost,
      categories,
    });

    if (error) {
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }


    const newProduct = await productCollection.create({
      pictures,
      cost: cost * 100,
      productName,
      description,
      categories,
    });

    const riderQrCode = (
      await uploadBase64Image(
        await QRCode.toDataURL(`hungreeriderapp://meal/${newProduct.id}`)
      )
    ).secure_url;
    
    const customerQrCode = (
      await uploadBase64Image(
        await QRCode.toDataURL(`hungreecustomerapp://meal/${newProduct.id}`)
      )
    ).secure_url;

    await productCollection.findByIdAndUpdate(newProduct._id, {
      customerQrCode,
      riderQrCode,
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
    stockStatus,
    cost,
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


    await productCollection.findByIdAndUpdate(productId, {
      productName,
      description,
      pictures,
      stockStatus,
      cost: cost * 100,
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
