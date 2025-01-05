import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const shopSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    shopName: {
        type: String,
        required: true
    },
    shopLogo: {
        type: String,
        required: true
    },
    shopAddress: {
        type: String,
        required: true
    },
    shopUniqueId: {
        type: String,
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    phoneNumberVerified: {
        type: Boolean,
        default: false
    },
    loginType: {
        type: String,
        enum: ["credentials", "google", "facebook"],
        default: "credentials"
    },
    country: {
        type: String,
        default: "Nigeria"
    },
    password: {
        type: String,
    },
    providerId: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    totalCashMade: {
        type: Number,
        default: 0
    },
    shopLocationOnMap: {
        type: Object,
        default: {}
    },
    accountDetails: {
        type: Object,
        default: {}
    },
    shopStatus: {
        type: String,
        enum: ["opened", "closed", "about-to-open", "about-to-close", "suspended"],
        default: "opened"
    }
}, {timestamps: true});

type shopCollectionType = InferSchemaType<typeof shopSchema>;

shopSchema.plugin(paginate);

const shopCollection = model<shopCollectionType, PaginateModel<shopCollectionType>>("shops", shopSchema);

export {shopCollection, shopCollectionType};