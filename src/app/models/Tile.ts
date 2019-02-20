export default class Tile {
  isBomb :boolean = false;
  isFlag :boolean = false;
  isOpen :boolean = false;
  number :number = null;
  colorClass :string = '';

  constructor(public x: number, public y: number) {
    this.colorClass = (x + y) % 2 ? 'light' : 'dark';
  }

  setBomb() {
    this.isBomb = true;
  }

  setNumber(n) {
    this.number = n;
  }

  setOpen() {
    this.isOpen = true;
    this.isFlag = false;
  }

  toggleFlag() {
    this.isFlag = !this.isFlag;
  }
}
