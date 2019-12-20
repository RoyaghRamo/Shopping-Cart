import { Product } from "./product.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class ProductsService {
  private products: Product[] = [];
  private productsUpdated = new Subject<{
    products: Product[];
    productCount: number;
  }>();

  constructor(private http: HttpClient, private router: Router) {}

  getProducts(productsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${productsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; products: any; maxProducts: number }>(
        "http://localhost:3000/api/products" + queryParams
      )
      .pipe(
        map(productData => {
          return {
            products: productData.products.map(product => {
              return {
                id: product._id,
                title: product.title,
                imagePath: product.imagePath,
                descriptive: product.descriptive,
                price: product.price,
                seller: product.seller
              };
            }),
            maxProducts: productData.maxProducts
          };
        })
      )
      .subscribe(transformedProductData => {
        this.products = transformedProductData.products;
        this.productsUpdated.next({
          products: [...this.products],
          productCount: transformedProductData.maxProducts
        });
      });
  }

  getProduct(productId: string) {
    return this.http.get<{
      _id: string;
      title: string;
      imagePath: string;
      descriptive: string;
      price: number;
      seller: string;
    }>("http://localhost:3000/api/products/" + productId);
  }

  getProductUpdateListener() {
    return this.productsUpdated.asObservable();
  }

  addProduct(
    title: string,
    image: File,
    descriptive: string,
    price: number,
    seller: string
  ) {
    const productData = new FormData();
    productData.append("title", title);
    productData.append("descriptive", descriptive);
    // Cast the price to string
    productData.append("price", price.toString());
    productData.append("seller", seller);
    productData.append("image", image, title);
    this.http
      .post<{ message: string; product: Product }>(
        "http://localhost:3000/api/products",
        productData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  updateProduct(
    id: string,
    title: string,
    image: File | string,
    descriptive: string,
    price: number,
    seller: string
  ) {
    let productData: Product | FormData;
    if (typeof image === "object") {
      productData = new FormData();
      productData.append("id", id);
      productData.append("title", title);
      productData.append("descriptive", descriptive);
      // Cast the price to string
      productData.append("price", price.toString());
      productData.append("seller", seller);
      productData.append("image", image, title);
    } else {
      productData = {
        id: id,
        title: title,
        imagePath: image,
        descriptive: descriptive,
        price: price,
        seller: seller
      };
    }
    this.http
      .put("http://localhost:3000/api/products/" + id, productData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }

  deleteProduct(productId: string) {
    return this.http.delete("http://localhost:3000/api/products/" + productId);
  }
}
