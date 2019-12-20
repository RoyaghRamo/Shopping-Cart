import { Product } from "./product.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { log } from "util";
import { Router } from "@angular/router";
import { Cart } from "../carts/cart-list/cart.model";

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
              imagePath: product.imagePath,
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
        const product: Product = {
          id: responseData.product.id,
          title: title,
          imagePath: responseData.product.imagePath,
          descriptive: descriptive,
          price: price,
          seller: seller
        };
        this.products.push(product);
        this.productsUpdated.next([...this.products]);
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
        const updatedProducts = [...this.products];
        const oldProductIndex = updatedProducts.findIndex(
          prod => prod.id === id
        );
        const product: Product = {
          id: id,
          title: title,
          imagePath: "",
          descriptive: descriptive,
          price: price,
          seller: seller
        };
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
