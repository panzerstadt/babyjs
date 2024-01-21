export class BabyjsClass {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  toString() {
    return `<class ${this.name}>`;
  }
}
