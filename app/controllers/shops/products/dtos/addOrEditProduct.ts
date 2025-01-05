export interface AddOrEditProductInterface {
    productName: string;
    description: string;
    stockStatus?: string;
    pictures: string[];
    cost: number;
    categories: string;
  }