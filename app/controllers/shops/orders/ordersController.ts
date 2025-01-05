import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { orderCollection } from "../../../models/Orders";

export const pendingOrders = async (
  shopId: string
): Promise<ControllerResponseInterface> => {
  try {
    const pendingOrders = await orderCollection.find({
      shopId,
      orderStatus: { $in: ["pending", "shipping-fee-updated", "accepted"] },
    }).populate("customerId", "firstName lastName phoneNumber");

    return {
      result: pendingOrders,
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

export const shopPendingOrderById = async (orderId: string) => {
  try {

    const pendingOrders = await orderCollection.findById(orderId).populate("customerId", "firstName lastName phoneNumber");

    return {
      result: pendingOrders,
      status: 200,
    };
    
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}

export const updateShippingFee = async (
  shopId: string,
  orderId: string,
  shippingFee: number
): Promise<ControllerResponseInterface> => {
  try {
    const orderDetails = await orderCollection.findById(orderId);

    if (orderDetails?.shopId?.toString() != shopId) {
      return {
        result: "You are only allowed to update shipping fee for your product.",
        status: 401,
      };
    }

    const updatedProduct = await orderCollection.findByIdAndUpdate(
      orderId,
      {
        shippingFee: shippingFee * 100,
        orderStatus: "shipping-fee-updated",
      },
      { new: true }
    );

    return {
      result: updatedProduct,
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

export const orderHistory = async (shopId: string, page: number = 1, limit: number = 20): Promise<ControllerResponseInterface> => {
    try {
        
        const orders = await orderCollection.paginate({
            shopId, orderStatus: {$in: ["cancelled", "timed-out", "completed"]}
        }, {
            page, limit, populate: [
                {
                    path: "customerId",
                    select: "firstName lastName phoneNumber"
                }
            ],
            sort: {updatedAt: -1}
        });

        return {
            result: orders,
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
