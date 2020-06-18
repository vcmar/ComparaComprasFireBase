export class FavoritePlace {
  public id: string;
  public placeId: string[];
  constructor(uid: string) {
    this.id = uid;
    this.placeId = [];
  }
}
