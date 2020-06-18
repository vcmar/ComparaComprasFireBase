import { ProductVersion } from './product-version';
export class Product {

  public id: string;
  public name: string;
  public category: string;
  public lst: ProductVersion[];

  /**
   * brandname e brandImage não são propriedades reais de um produto.
   * Existem no contexto da collection shared
   */
  public brandName: string;
  public image: string;

  constructor(name: string, category: string) {
    this.name = name;
    this.category = category;
    this.id = this.name
      .toLocaleLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, '+');
    this.lst = [];
  }
}
