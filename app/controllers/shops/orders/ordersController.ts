import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { orderCollection } from "../../../models/Orders";

export const pendingOrders = async (): Promise<ControllerResponseInterface> => {
  try {
    const pendingOrders = await orderCollection.find({
      orderStatus: { $in: ["paid"] },
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

export const orderHistory = async (page: number = 1, limit: number = 20): Promise<ControllerResponseInterface> => {
    try {
        
        const orders = await orderCollection.paginate({
            orderStatus: {$in: ["cancelled", "timed-out", "completed"]}
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
