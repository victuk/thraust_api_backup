import { v4 } from "uuid";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { shopCollection } from "../../../models/Shops";
import { comparePassword, hashPassword, signJWT } from "../../../utils/authUtilities";

export const registerShop = async ({
  firstName,
  lastName,
  shopName,
  shopLogo,
  // shopPictures,
  // ownerPictures,
  shopAddress,
  phoneNumber,
  email,
  // secondaryEmail,
  // country,
  // state,
  // city,
  password,
  address,
}): Promise<ControllerResponseInterface> => {
  try {
    const shopDetails = await shopCollection.findOne({ email });

    if (shopDetails) {
      return {
        result: null,
        status: 400,
        error: "Email taken already",
      };
    }

    const hashedPassword = hashPassword(password);

    await shopCollection.create({
      firstName,
      lastName,
      shopName,
      shopLogo,
      shopAddress,
      shopUniqueId: v4(),
      phoneNumber,
      email,
      password: hashedPassword,
      address,
    });

    return {
        result: "Shop created successfully",
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


export const loginShop = async ({
    email,
    password,
  }): Promise<ControllerResponseInterface> => {
    try {
      const shopDetails = await shopCollection.findOne({ email });
  
      if (!shopDetails) {
        return {
          result: null,
          status: 404,
          error: "No user found",
        };
      }
  
      const passwordsMatch = comparePassword(
        password,
        shopDetails!!.password as string
      );
  
      if (!passwordsMatch) {
        return {
          result: null,
          status: 401,
          error: "Invalid credentials",
        };
      }
  
      const jwt = signJWT({
        email: shopDetails.email,
        fullName: `${shopDetails.firstName} ${shopDetails.lastName}`,
        userId: shopDetails.id,
        role: "shop",
      });
  
      return {
        result: jwt,
        details: {
          email: shopDetails.email,
          fullName: `${shopDetails.firstName} ${shopDetails.lastName}`,
          userId: shopDetails.id,
          role: "shop",
        },
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
