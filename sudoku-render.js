import { Sudoku } from "./sudoku-core.js";

const formInnerHTML = `
  <form id="sudoku-generator">
    <h2>Generate sudoku</h2>
    <label>
        Block size
        <input required name="n" value="3" type="number" min="2" max="4">
    </label>
    <label>
        Difficulty
        <select name="difficulty">
            <option value="easy">easy</option>
            <option selected value="middle">middle</option>
            <option value="hard">hard</option>
        </select>
    </label>
    <button type="submit">Generate</button>
  </form>
`;

class SudokuGame {
  constructor(root) {
    this.root = root;

    this.activeCellPosition = null;
    this.activeCellElement = null;
  }

  startGame() {
    this.root.innerHTML = formInnerHTML;

    const form = document.getElementById("sudoku-generator");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const difficulty = formData.get("difficulty");
      const n = +formData.get("n") || 3;

      this.sudoku = new Sudoku({ n, difficulty });

      this.renderGame();
    });
  }

  createNewGameButton() {
    const newGameButton = document.createElement("button");
    newGameButton.innerHTML = "New game";
    newGameButton.classList.add("new-game-button");

    newGameButton.addEventListener("click", () => this.startGame());

    return newGameButton;
  }

  createFieldElement() {
    const container = document.createElement("div");
    container.id = "sudoku-container";
    container.classList.add(`n-${this.sudoku.n}`);

    container.addEventListener("click", (e) => {
      const cell = e.target;
      const x = +cell.dataset.x;
      const y = +cell.dataset.y;
      const initial = cell.dataset.initial;

      container.querySelectorAll(".cell").forEach((x) => {
        x.classList.remove("active");
      });

      if (initial) {
        this.activeCellPosition = null;
        this.activeCellElement = null;
        return;
      }

      this.activeCellPosition = [y, x];
      this.activeCellElement = cell;
      cell.classList.add("active");
    });

    for (let y = 0; y < this.sudoku.rowCount; y++) {
      const row = document.createElement("div");
      row.classList.add("row");

      if (y && y % this.sudoku.n === 0) {
        row.classList.add("extra-border");
      }

      for (let x = 0; x < this.sudoku.rowCount; x++) {
        const cell = document.createElement("div");

        if (x && x % this.sudoku.n === 0) {
          cell.classList.add("extra-border");
        }

        cell.classList.add("cell");
        cell.dataset.x = x.toString();
        cell.dataset.y = y.toString();
        cell.innerText = this.sudoku.field[y][x] || "";

        if (this.sudoku.field[y][x]) {
          cell.classList.add("initial");
          cell.dataset.initial = "true";
        }

        row.append(cell);
      }

      container.append(row);
    }

    return container;
  }

  createButtonsElement() {
    const container = document.createElement("div");
    container.id = "number-buttons";
    let i = 1;

    for (let y = 0; y < this.sudoku.n; y++) {
      const row = document.createElement("div");
      row.classList.add("buttons-row");

      for (let x = 0; x < this.sudoku.n; x++) {
        const number = i;
        const button = document.createElement("button");

        button.innerText = i.toString();

        button.addEventListener("click", () => {
          if (this.activeCellPosition) {
            const [y, x] = this.activeCellPosition;
            const isValid = this.sudoku.validate(
              number,
              this.activeCellPosition,
              this.sudoku.field
            );

            this.sudoku.field[y][x] = number;
            this.activeCellElement.innerText = number.toString();
            // this.activeCellElement.classList.remove("active");

            this.activeCellElement.classList[isValid ? "remove" : "add"](
              "not-valid"
            );

            if (isValid && !this.sudoku.findEmpty(this.sudoku.field)) {
              const startOver = confirm("Congrats, you won! Start over?");

              if (startOver) this.startGame();
            }
          }
        });

        row.append(button);
        i++;
      }

      container.append(row);
    }

    const row = document.createElement("div");
    row.classList.add("buttons-row");

    const newGameButton = this.createNewGameButton();

    row.append(newGameButton);
    container.append(row);

    return container;
  }

  renderGame() {
    const game = document.createElement("div");
    game.classList.add("game-board");

    const field = this.createFieldElement();
    const buttons = this.createButtonsElement();

    game.append(field);
    game.append(buttons);

    this.root.innerHTML = "";
    this.root.append(game);
  }
}

window.onload = () => {
  const root = document.getElementById("root");

  const sudokuRender = new SudokuGame(root);
  sudokuRender.startGame();
};
