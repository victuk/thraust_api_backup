import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { productCollection } from "../../models/Products";

export const getShopProducts = async (
  shopId: string,
  page: number = 1,
  limit: number = 20
): Promise<ControllerResponseInterface> => {
  try {
    const products = await productCollection.paginate(
      { shopId },
      {
        page,
        limit,
      }
    );

    return {
      result: products,
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


export const shopViewProductById = async (
    productId
  ): Promise<ControllerResponseInterface> => {
    try {
      const productDetails = await productCollection.findById(productId);
  
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
