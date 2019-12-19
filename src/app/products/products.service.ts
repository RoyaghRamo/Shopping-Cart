import { Product } from "./product.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { log } from "util";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class ProductsService {
  private products: Product[] = [];
  private productsUpdated = new Subject<Product[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getProducts() {
    this.http
      .get<{ message: string; products: any }>(
        "http://localhost:3000/api/products"
      )
      .pipe(
        map(productData => {
          return productData.products.map(product => {
            return {
              id: product._id,
              title: product.title,
              descriptive: product.descriptive,
              price: product.price,
              seller: product.seller
            };
          });
        })
      )
      .subscribe(transformedProducts => {
        this.products = transformedProducts;
        this.productsUpdated.next([...this.products]);
      });
  }

  getProduct(productId: string) {
    return this.http.get<{
      _id: string;
      title: string;
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
    descriptive: string,
    price: number,
    seller: string
  ) {
    const product: Product = {
      id: null,
      title: title,
      descriptive: descriptive,
      price: price,
      seller: seller
    };
    this.http
      .post<{ message: string; productId: string }>(
        "http://localhost:3000/api/products",
        product
      )
      .subscribe(responseData => {
        const productId = responseData.productId;
        product.id = productId;
        this.products.push(product);
        this.productsUpdated.next([...this.products]);
        this.router.navigate(["/"]);
      });
  }

  updateProduct(
    id: string,
    title: string,
    descriptive: string,
    price: number,
    seller: string
  ) {
    const product: Product = {
      id: id,
      title: title,
      descriptive: descriptive,
      price: price,
      seller: seller
    };
    this.http
      .put("http://localhost:3000/api/products/" + id, product)
      .subscribe(response => {
        const updatedProducts = [...this.products];
        const oldProductIndex = updatedProducts.findIndex(
          prod => prod.id === product.id
        );
        updatedProducts[oldProductIndex] = product;
        this.products = updatedProducts;
        this.productsUpdated.next([...this.products]);
        this.router.navigate(["/"]);
      });
  }

  deleteProduct(productId: string) {
    this.http
      .delete("http://localhost:3000/api/products/" + productId)
      .subscribe(() => {
        const updatedProducts = this.products.filter(
          product => product.id !== productId
        );
        this.products = updatedProducts;
        this.productsUpdated.next([...this.products]);
      });
  }
}
