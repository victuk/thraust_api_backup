import mongoose from "mongoose";
import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { productCollection } from "../../models/Products";

export const getShopProducts = async (
  category: string,
  page: number = 1,
  limit: number = 20
): Promise<ControllerResponseInterface> => {
  try {

    if(category != "all") {
      const products = await productCollection.paginate(
        {categories: new mongoose.Types.ObjectId(category)},
        {
          populate: [
            {
              path: "categories",
              select: "name slug"
            }
          ],
          page,
          limit,
          sort: {updatedAt: -1}
        }
      );
  
      return {
        result: products,
        status: 200,
      };
    }

    const products = await productCollection.paginate(
      {},
      {
        populate: [
          {
            path: "categories",
            select: "name slug"
          }
        ],
        page,
        limit,
        sort: {updatedAt: -1}
      }
    );

    return {
      result: products,
      status: 200,
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


export const shopViewProductById = async (
    productId
  ): Promise<ControllerResponseInterface> => {
    try {
      const productDetails = await productCollection.findById(productId).populate("categories");
  
      if (!productDetails) {
        return {
          result: "Product not found",
          status: 404,
        };
      }
  
      return {
        result: productDetails,
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
