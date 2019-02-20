import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import Tile from './models/Tile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  numberOfBombs: number = 0;
  numberOfFlags: number = 0;
  interval = null;
  timeStarted = 0;
  minutesElapsed = '0';
  secondsElapsed = '00';
  board: Array<Array<Tile>> = [];
  gameResult: string = null;

  constructor(protected service: GameService) {}

  ngOnInit() {
    this.service.gameSetup.subscribe((board) => {
      this.board = board;
    });
    this.setupGame();
  }

  setupGame() {
    this.gameResult = null;
    this.numberOfBombs = this.service.setupGame();
  }

  startGameIfNotStated(tile :Tile) {
    const startedNow = this.service.startGameIfNotStated(tile);
    if (startedNow) {
      const timeStarted = Date.now();
      this.interval = setInterval(() => {
        const timeElapsed = Math.round((Date.now() - timeStarted) / 1000);
        const secondsElapsed = timeElapsed % 60;
        this.secondsElapsed = (secondsElapsed < 10 ? '0' : '') + secondsElapsed;
        this.minutesElapsed = '' + Math.floor(timeElapsed / 60);
      }, 1000);
    }
  }

  setGameResult(result) {
    this.gameResult = result;
    clearInterval(this.interval);
  }

  tilePrimaryClick(e, tile: Tile) {
    this.startGameIfNotStated(tile);

    if (this.gameResult) {
      return;
    }

    if (tile.isFlag) {
      return;
    }

    if (tile.isBomb) {
      this.setGameResult('lost');
      return;
    }

    this.service.traverse(tile);
    if (this.service.isGameCompleted()) {
      this.setGameResult('won');
    }
  }

  tileSecondaryClick(e, tile: Tile) {
    e.preventDefault();
    if (this.gameResult) {
      return;
    }
    if (!tile.isOpen) {
      tile.toggleFlag();
      this.updateFlagCount();
    }
  }

  updateFlagCount() {
    this.numberOfFlags = this.service.getNumberOfFlags();
  }

  restart() {
    this.setupGame();
  }
}
