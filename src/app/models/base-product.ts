export class BaseProduct {
  public id: string;
  public name: string;
  public category: string;
  constructor(id: string, name: string, category: string) {
    this.id = id;
    this.name = name;
    this.category = category;
  }
}
