import Joi, { custom } from "joi";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { DecodedObject } from "../../../middleware/authenticatedUsersOnly";
import { customerCollection } from "../../../models/Customers";
import {
  comparePassword,
  hashPassword,
  signJWT,
} from "../../../utils/authUtilities";

export const registerCustomer = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
}): Promise<ControllerResponseInterface> => {
  try {
    const { error } = Joi.object({
      firstName: Joi.string().min(3).required(),
      lastName: Joi.string().min(3).required(),
      phoneNumber: Joi.string().min(11).required(),
      email: Joi.string()
        .email({ tlds: { allow: ["com", "net"] } })
        .required(),
      // profilePic: Joi.string().uri().required(),
      password: Joi.string().alphanum().min(8).required(),
    }).validate({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
    });

    if (error) {
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }

    const customerExists = await customerCollection.findOne({ email });

    if (customerExists) {
      return {
        result: null,
        status: 400,
        error: "Email taken already",
      };
    }

    const hashedPassword = hashPassword(password);

    await customerCollection.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    return {
      result: "User created successfully",
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

export const loginCustomer = async ({
  email,
  password,
}): Promise<ControllerResponseInterface> => {
  try {

    const { error } = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: ["com", "net"] } })
        .required(),
      password: Joi.string().alphanum().min(8).required(),
    }).validate({
      email,
      password,
    });

    if(error) {
      return {
        result: null,
        status: 400,
        error: error.message
      };
    }

    const userDetails = await customerCollection.findOne({ email });

    if (!userDetails) {
      return {
        result: null,
        status: 404,
        error: "No user found",
      };
    }

    const passwordsMatch = comparePassword(
      password,
      userDetails!!.password as string
    );

    if (!passwordsMatch) {
      return {
        result: null,
        status: 401,
        error: "Invalid credentials",
      };
    }

    const jwt = signJWT({
      email: userDetails.email,
      fullName: `${userDetails.firstName} ${userDetails.lastName}`,
      userId: userDetails.id,
      role: "customer",
    });

    return {
      result: jwt,
      details: {
        email: userDetails.email,
        fullName: `${userDetails.firstName} ${userDetails.lastName}`,
        profilePicture: userDetails.profilePic,
        userId: userDetails.id,
        role: "customer",
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
