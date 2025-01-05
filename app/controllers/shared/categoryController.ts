import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { mealCategoryCollection } from "../../models/MealCategories";

export const getCategories = async (): Promise<ControllerResponseInterface> => {
    try {
        
        const categories = await mealCategoryCollection.find({});

        return {
            result: categories,
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