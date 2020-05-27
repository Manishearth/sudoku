class CellSet {
    constructor() {
        this.set = [false, false, false, false, false, false, false, false, false];
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < 9; i++) {
            if (this.set[i]) {
                yield i + 1;
            }
        }
    }

    copyFrom(other) {
        this.set = [...other.set]
    }

    get(n) {
        return this.set[n - 1];
    }

    toggle(n) {
        let val = !this.set[n - 1];
        this.set[n - 1] = val;
        return val;
    }
    set(n, value) {
        this.set[n - 1] = value;
    }
}

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.center = new CellSet();
        this.corner = new CellSet();
        this.main = null;
        this.color = 1;
    }

    copyFrom(other) {
        this.center.copyFrom(other.center);
        this.corner.copyFrom(other.corner);
        this.main = other.main;
        this.color = other.color;
    }
}

class State {
    constructor() {
         this.cells = [...Array(9)].map((_, i) => [...Array(9)].map((_, j) => new Cell(i, j)));
    }

    copyFrom(other) {
        for (let i=0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j].copyFrom(other.cells[i][j]);
            }
        }
    }
}

class BoardCell {
    constructor(element, board, i, j) {
        this.corner = [...element.getElementsByClassName('corner')];
        this.center = element.getElementsByClassName('center')[0];
        this.container = element.getElementsByClassName('cell-container')[0];
        this.main = element.getElementsByClassName('main')[0];
        this.cell = element;
        this.selected = false;
        element.cellObject = this;
        this.i = i;
        this.j = j;
        this.board = board;
        this.setupEvents();
    }

    apply(cell) {
        this.applyCorner(cell);
        this.applyCenter(cell);
        this.applyMain(cell);
        this.applyColor(cell);
    }

    applyMain(cell) {
        this.main.innerHTML = cell.main || "";
        if (cell.main) {
            this.cell.classList.add("main-visible");
        } else {
            this.cell.classList.remove("main-visible");
        }
    }

    applyCenter(cell) {
        this.center.innerHTML = [...cell.center].join('');
    }

    applyColor(cell) {
        this.container.setAttribute("data-color", cell.color);
    }

    applyCorner(cell) {
        let corner = [...cell.corner];
        for (let i = 0; i < 8; i++) {
            this.corner[i].innerHTML = corner[i] || "";
        }

        if (corner.length == 9) {
            this.corner[0].innerHTML += corner[8];
        }
    }

    deselect() {
        this.selected = false;
        this.updateSelection();
    }

    updateSelection() {
        if (this.selected) {
            this.cell.classList.add('selected');
        } else {
            this.cell.classList.remove('selected');
        }
    }

    setupEvents() {
        this.cell.onmousedown = (e) => {
            // on Macs, selection is done with the
            // meta key. This key isn't exposed on windows
            // or linux, so we just check for both.
            if (!e.ctrlKey && !e.metaKey) {
                this.board.deselect();
            }
            if (e.shiftKey && this.board.selectionStart) {
                this.board.finishSelect(this);
            } else {
                this.board.selectionStart = this;
                this.selected = !this.selected;
                this.updateSelection();
            }
            e.preventDefault();
        }

        this.cell.onmouseenter = (e) => {
            if (e.buttons != 1) {
                return;
            }
            this.selected = true;
            this.updateSelection();
            e.preventDefault();
        }
    }
}

class Board {
    constructor(element) {
        let cells = [...element.getElementsByClassName('cell')];
        this.cells = [...Array(9)].map(_ => [...Array(9)]);
        this.selectionStart = null;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j] = (new BoardCell(cells.shift(), this, i, j))
            }
        }
    }

    apply(state) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j].apply(state.cells[i][j]);
            }
        }
    }

    deselect() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j].deselect();
            }
        }
    }

    finishSelect(cell) {
        let i_start = this.selectionStart.i;
        let j_start = this.selectionStart.j;
        let i_end = cell.i;
        let j_end = cell.j;
        if (i_start > i_end) {
            let tmp = i_start;
            i_start = i_end;
            i_end = tmp;
        }
        if (j_start > j_end) {
            let tmp = j_start;
            j_start = j_end;
            j_end = tmp;
        }

        for (let i = i_start; i <= i_end; i++) {
            for (let j = j_start; j <= j_end; j++) {
                this.cells[i][j].selected = true;
                this.cells[i][j].updateSelection();
            }
        }

        this.selectionStart = null;
    }
}
