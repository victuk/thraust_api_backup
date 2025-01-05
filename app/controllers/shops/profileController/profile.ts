import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { shopCollection } from "../../../models/Shops";

export const shopProfile = async (
  shopId: string
): Promise<ControllerResponseInterface> => {
  try {
    const profile = await shopCollection.findById(shopId);

    return {
      result: profile,
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
