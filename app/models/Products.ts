import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const productSchema = new Schema({
    pictures: {
        type: Array,
        required: true
    },
    stockStatus: {
        type: String,
        enum: ["in-stock", "low-stock", "out-of-stock"],
        default: "in-stock"
    },
    cost: {
        type: Number,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    sizeAndColor: {
        type: [
            {
                color: String,
                size: String
            }
        ],
        default: []
    },
    customerProductType: {
        type: Array,
        default: []
    },
    categories: {
        type: [
            {type: Schema.Types.ObjectId, ref: "categories"}
        ],
        required: true
    },
    reviewsAndRating: {
        type: Array,
        default: []
    }
}, {timestamps: true});

type productCollectionType = InferSchemaType<typeof productSchema>;

productSchema.plugin(paginate);

const   productCollection = model<productCollectionType, PaginateModel<productCollectionType>>("products", productSchema);

export {productCollection, productCollectionType};
