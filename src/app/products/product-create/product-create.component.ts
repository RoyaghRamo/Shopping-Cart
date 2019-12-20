import { Component, OnInit } from "@angular/core";
import { Product } from "../product.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ProductsService } from "../products.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { mimeTypeValidator } from "./mime-type.validator";

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
  form: FormGroup;
  imagePreview: string;

  constructor(
    public productsService: ProductsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(2)]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeTypeValidator]
      }),
      descriptive: new FormControl(null, { validators: [Validators.required] }),
      price: new FormControl(null, { validators: [Validators.required] }),
      seller: new FormControl(null, { validators: [Validators.required] })
    });

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
              imagePath: productData.imagePath,
              descriptive: productData.descriptive,
              price: productData.price,
              seller: productData.seller
            };

            this.form.setValue({
              title: this.product.title,
              image: this.product.imagePath,
              descriptive: this.product.descriptive,
              price: this.product.price,
              seller: this.product.seller
            });
          });
      } else {
        this.mode = "create";
        this.productId = null;
      }
    });
  }

  onSaveProduct() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.productsService.addProduct(
        this.form.value.title,
        this.form.value.image,
        this.form.value.descriptive,
        this.form.value.price,
        this.form.value.seller
      );
    } else {
      this.productsService.updateProduct(
        this.productId,
        this.form.value.title,
        this.form.value.image,
        this.form.value.descriptive,
        this.form.value.price,
        this.form.value.seller
      );
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();

    // Verify the image
    // console.log(file);
    // console.log(this.form);

    // Convert the image to dataURL
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
