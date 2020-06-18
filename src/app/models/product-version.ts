export class ProductVersion {
  public brand: string;
  public image: string;
  public isApproved: boolean;
  public createdBy: string;

  constructor(brand: string, createdBy: string, isApproved: boolean, image?: string) {
    this.brand = brand;
    this.createdBy = createdBy;
    this.isApproved = isApproved;
    this.image = image;
  }
}
