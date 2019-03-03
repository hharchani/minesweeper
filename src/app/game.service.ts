import { Injectable, EventEmitter } from '@angular/core';
import Tile from './models/Tile';

@Injectable()
export class GameService {
  public gameSetup = new EventEmitter();
  private board: Array<Array<Tile>>;
  private rows: number;
  private columns: number;
  private bombs: number;
  private gameStarted = false;

  setupGame(rows = 12, columns = 12, bombs = 20) {
    if (bombs > rows * columns) {
      throw new Error("Bombs can't be greater than cells!");
    }
    this.rows = rows;
    this.columns = columns;
    this.bombs = bombs;
    this.board = [];
    for(let i = 0; i < rows; i++) {
      let arr :Array<Tile> = [];
      for(let j = 0; j < columns; j++) {
        arr.push(new Tile(i, j));
      }
      this.board.push(arr);
    }
    this.gameSetup.emit(this.board);
    this.gameStarted = false;
    return this.bombs;
  }

  private getTile(x, y) {
    const line = this.board[x];
    if (line && line[y]) {
      return line[y];
    }
  }

  private getNeighbours(tile: Tile): Array<Tile> {
    const {x, y} = tile;
    return [
      this.getTile(x - 1, y - 1),
      this.getTile(x - 1, y    ),
      this.getTile(x - 1, y + 1),
      this.getTile(x,     y - 1),
      this.getTile(x,     y + 1),
      this.getTile(x + 1, y - 1),
      this.getTile(x + 1, y    ),
      this.getTile(x + 1, y + 1),
    ].filter(x => x);
  }

  startGameIfNotStated(tileClicked: Tile) {
    if (this.gameStarted) {
      return false;
    }
    let bombsPlaced = 0;
    const noBombs = this.getNeighbours(tileClicked).concat([tileClicked]);
    while (bombsPlaced < this.bombs) {
      let x = Math.floor(Math.random() * this.rows);
      let y = Math.floor(Math.random() * this.columns);
      const tile: Tile = this.board[x][y];
      if (noBombs.includes(tile)) {
        continue;
      }
      if (tile.isBomb) {
        continue;
      }
      tile.setBomb();
      bombsPlaced++;
    }
    this.board.forEach(line => {
      line.forEach(tile => {
        const n = this.getNeighbours(tile).filter(tile => tile.isBomb).length;
        tile.setNumber(n);
      })
    });
    this.gameStarted = true;
    return true;
  }

  private getAllTiles() {
    return this.board.reduce((a, line) => a.concat(line), []);
  }

  private getNumberOfBombs() {
    return this.getAllTiles().filter(tile => tile.isBomb).length;
  }

  getNumberOfFlags() {
    return this.getAllTiles().filter(tile => tile.isFlag).length;
  }

  isGameCompleted() {
    return this.bombs === this.board.reduce((a, line) => a + line.filter(tile => !tile.isOpen).length, 0);
  }

  traverse(source: Tile) {
    const stack :Array<Tile> = [];
    stack.push(source);
    source.setOpen();
    while (stack.length) {
      const tile = stack.pop();
      this.getNeighbours(tile).filter(tile => !tile.isOpen && !tile.isBomb).forEach((tile) => {
        tile.setOpen();
        if (tile.number === 0) {
          stack.push(...this.getNeighbours(tile).filter(tile => !tile.isOpen && !tile.isBomb));
        }
      });
    }
  }
}
