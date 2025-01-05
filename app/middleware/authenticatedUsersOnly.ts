import { RequestHandler, Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/authUtilities";
import { Socket } from "socket.io";

/**
 * Middleware for restricing API access to logged in users only
 */

type Role = "customer" | "shop";

interface DecodedObject {
    email: string;
    userId: string;
    fullName: string;
    role: Role;
}

interface PopulatePathAndSelect {
    path: string;
    select?: string;
}

interface PaginationPageAndLimit {
    page?: string;
    limit?: string;
    select?: string;
    populate?: string | Array<PopulatePathAndSelect>;
    sort?: any
}

interface CustomRequest extends Request {
    userDetails?: DecodedObject;
    paginatePageAndLimit?: PaginationPageAndLimit;
}

interface CustomResponse extends Response {
    io?: Socket;
}

const header = {
    authorization: "Bearer ihiugiufcuiuyfcifcutydtrstxysryersxuytfoug"
}

const authenticatedUsersOnly: RequestHandler = (req:CustomRequest, res:Response, next:NextFunction) => {
    try {
        const token = req.headers.authorization;

        if(!token) {
            return res.status(401).send({
                message: "no-token-present"
            });
        }

        const [tokenType, tokenValue] = token.split(" ");

        if(tokenType.toLocaleLowerCase() == "bearer") {
            
            const userDetails = verifyJWT(tokenValue);

            console.log(userDetails);

            if(userDetails.anyError) {
                res.status(403).send({
                    message: "Invalid/expired token"
                });
                return;
            } 

            req.userDetails  = userDetails.userDetails as DecodedObject;
            next();
        }

    } catch (error) {
        next(error);
    }
}


export {
    authenticatedUsersOnly,
    DecodedObject,
    CustomRequest,
    CustomResponse
};