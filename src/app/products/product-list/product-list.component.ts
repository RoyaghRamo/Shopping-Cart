import { Component, OnInit, OnDestroy } from "@angular/core";
import { Product } from "../product.model";
import { ProductsService } from "../products.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"]
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productsSub: Subscription;
  products: Product[] = [];
  isLoading = false;

  constructor(public productsService: ProductsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.productsService.getProducts();
    this.productsSub = this.productsService
      .getProductUpdateListener()
      .subscribe((products: Product[]) => {
        this.isLoading = false;
        this.products = products;
      });
  }

  ngOnDestroy(): void {
    this.productsSub.unsubscribe();
  }

  // addToCart(productId: string) {
  //   this.productsService.addToCart(productId);
  // }

  onDelete(productId: string) {
    this.productsService.deleteProduct(productId);
  }
}
