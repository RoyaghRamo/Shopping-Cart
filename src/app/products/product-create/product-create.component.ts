import { Component, OnInit } from "@angular/core";
import { Product } from "../product.model";
import { NgForm } from "@angular/forms";
import { ProductsService } from "../products.service";
import { ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-product-create",
  templateUrl: "./product-create.component.html",
  styleUrls: ["./product-create.component.css"]
})
export class ProductCreateComponent implements OnInit {
  private mode = "create";
  private productId: string;
  product: Product;
  isLoading = false;

  constructor(
    public productsService: ProductsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("productId")) {
        this.mode = "edit";
        this.productId = paramMap.get("productId");
        this.isLoading = true;
        this.productsService
          .getProduct(this.productId)
          .subscribe(productData => {
            this.isLoading = false;
            this.product = {
              id: productData._id,
              title: productData.title,
              descriptive: productData.descriptive,
              price: productData.price,
              seller: productData.seller
            };
          });
      } else {
        this.mode = "create";
        this.productId = null;
      }
    });
  }

  onSaveProduct(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.productsService.addProduct(
        form.value.title,
        form.value.descriptive,
        form.value.price,
        form.value.seller
      );
    } else {
      this.productsService.updateProduct(
        this.productId,
        form.value.title,
        form.value.descriptive,
        form.value.price,
        form.value.seller
      );
    }

    form.resetForm();
  }
}
