export class GenericToast {
  public header: string;
  public body: string;
  public delay: number;
  public classname: string;
  constructor(body: string, header?: string, delay?: number, classname?: string) {
    this.body = body;
    if (header) { this.header = header; }
    if (classname) { this.classname = classname; }
    this.delay = 1000;
    if (delay) { this.delay = delay; }


  }
}
