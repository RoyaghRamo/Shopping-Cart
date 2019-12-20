import { Product } from "src/app/products/product.model";

export interface Cart {
  id: string;
  products: Product[];
  user: string;
}
