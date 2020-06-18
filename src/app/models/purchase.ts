import { PurchaseItem } from './purchase-item';
export class Purchase {
  public id: string;
  public createdBy: string;
  public place: string;
  public date: number;
  public lst: PurchaseItem[];
  constructor(place: string, user: string, date: number) {
    this.place = place;
    this.createdBy = user;
    this.date = date;
  }
}
