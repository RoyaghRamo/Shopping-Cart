import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

// MIME stands for "Multipurpose Internet Mail Extensions
// It's a way of identifying files on the Internet according to their nature and format

export const mimeTypeValidator = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === "string") {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  // Creating our own observable
  const frObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener("loadend", () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(
          0,
          4
        );

        let header = "";
        let isValid = false;

        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }

        // Switch statment to check for certain patterns that stands for certain file types jpgs, pngs...
        switch (header) {
          case "89504e47":
            isValid = true;
            break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }

        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidImageType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return frObs;
};
