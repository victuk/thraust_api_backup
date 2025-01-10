export interface AddOrEditProductInterface {
    productName: string;
    description: string;
    stockStatus: string;
    pictures: string[];
    forType: string[];
    sizeAndColor: object;
    cost: number;
    categories: string;
  }