const getRandomInt = (max) => Math.floor(Math.random() * max);

const difficultyPercentage = {
  easy: 50,
  middle: 60,
  hard: 75,
};

// For not exceed maximum call stack size(for 4n field)
const MAX_ITERATIONS = 120;

export class Sudoku {
  field;

  constructor({ n = 3, difficulty = "middle" } = {}) {
    this.n = n < 2 || n > 4 ? 3 : n;

    this.rowCount = this.n * this.n;
    this.difficulty = difficulty;

    this.generateStartField();
    this.shuffleField();
    this.hideCells();
  }

  cloneField() {
    return this.field.map((x) => [...x]);
  }

  generateStartField() {
    this.field = new Array(this.rowCount)
      .fill(null)
      .map(() => new Array(this.rowCount).fill(null));

    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.rowCount; x++) {
        this.field[y][x] = Math.floor(
          ((y * this.n + y / this.n + x) % this.rowCount) + 1
        );
      }
    }
  }

  transposing() {
    const fieldClone = this.cloneField();

    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.rowCount; x++) {
        this.field[x][y] = fieldClone[y][x];
      }
    }
  }

  swapRows(row1, row2) {
    const buffer = this.field[row1];
    this.field[row1] = this.field[row2];
    this.field[row2] = buffer;
  }

  randomlySwapRows() {
    // Important to swap from the same area, otherwise sudoku will be unsolvable
    const area = getRandomInt(this.n);

    const rowInArea1 = getRandomInt(this.n);
    let rowInArea2 = getRandomInt(this.n);

    while (rowInArea1 === rowInArea2) {
      rowInArea2 = getRandomInt(this.n);
    }

    this.swapRows(area * this.n + rowInArea1, area * this.n + rowInArea2);
  }

  randomlySwapColumns() {
    this.transposing();
    this.randomlySwapRows();
    this.transposing();
  }

  randomlySwapRowAreas() {
    const area1 = getRandomInt(this.n);
    let area2 = getRandomInt(this.n);

    while (area1 === area2) {
      area2 = getRandomInt(this.n);
    }

    for (let i = 0; i < this.n; i++) {
      this.swapRows(area1 * this.n + i, area2 * this.n + i);
    }
  }

  randomlySwapColumnAreas() {
    this.transposing();
    this.randomlySwapRowAreas();
    this.transposing();
  }

  shuffleField(times = 5 * this.n) {
    const shuffleMethods = [
      "transposing",
      "randomlySwapRows",
      "randomlySwapColumns",
      "randomlySwapRowAreas",
      "randomlySwapColumnAreas",
    ];

    for (let i = 0; i < times; i++) {
      this[shuffleMethods[getRandomInt(shuffleMethods.length)]]();
    }
  }

  hideCells() {
    const cellsCount = this.n ** 4;
    const iterations = Math.floor(
      (difficultyPercentage[this.difficulty] / 100) * cellsCount
    );

    const fieldViewMap = new Array(this.rowCount)
      .fill(null)
      .map(() => new Array(this.rowCount).fill(0));
    let iterator = 0;

    while (iterator < Math.min(iterations, MAX_ITERATIONS)) {
      const x = getRandomInt(this.rowCount);
      const y = getRandomInt(this.rowCount);

      if (fieldViewMap[y][x] === 0) {
        iterator++;
        fieldViewMap[y][x] = 1;

        const temp = this.field[y][x];
        this.field[y][x] = null;

        const solvable = this.solve(this.cloneField(this.field));

        if (!solvable) {
          this.field[y][x] = temp;
        }
      }
    }
  }

  findEmpty(field) {
    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.rowCount; x++) {
        if (!field[y][x]) {
          return [y, x];
        }
      }
    }
    return null;
  }

  validate(num, pos, field) {
    const [y, x] = pos;

    //Check rows
    for (let i = 0; i < this.rowCount; i++) {
      if (field[i][x] === num && i !== y) {
        return false;
      }
    }

    //Check cols
    for (let i = 0; i < this.rowCount; i++) {
      if (field[y][i] === num && i !== x) {
        return false;
      }
    }

    //Check areas
    const boxRow = Math.floor(y / this.n) * this.n;
    const boxCol = Math.floor(x / this.n) * this.n;

    for (let i = boxRow; i < boxRow + this.n; i++) {
      for (let j = boxCol; j < boxCol + this.n; j++) {
        if (field[i][j] === num && i !== y && j !== x) {
          return false;
        }
      }
    }

    return true;
  }

  solve(field) {
    const currPos = this.findEmpty(field);

    if (currPos === null) {
      return true;
    }

    for (let i = 1; i <= this.rowCount; i++) {
      const isValid = this.validate(i, currPos, field);

      if (isValid) {
        const [x, y] = currPos;
        field[x][y] = i;

        if (this.solve(field)) {
          return true;
        }

        field[x][y] = null;
      }
    }

    return false;
  }
}
