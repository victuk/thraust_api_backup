import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../middleware/authenticatedUsersOnly";
import { uploadToCloudinary } from "../../utils/cloudinaryUtils";
import { ControllerResponseInterface } from "../../interfaces/responseInterface";

export async function uploadFile (file: any): Promise<ControllerResponseInterface> {
    try {
      const resp = await uploadToCloudinary(file!!.path);

      console.log("res", resp);

      return {
        result: resp,
        details: "Upload Successful",
        status: 200,
        error: null
      };

    } catch (error) {
        console.log(error);
        return {
            result: null,
            status: 500,
            error
          };
    }
  }