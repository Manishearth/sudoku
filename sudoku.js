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
        this.set = [...other.set];
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

    serialize() {
        return [...this];
    }

    static deserialize(obj) {
        let set = new CellSet();
        for (let i of obj) {
            set[i] = true;
        }
        return set;
    }
}

class Cell {
    constructor(i, j, presets) {
        this.i = i;
        this.j = j;
        this.center = new CellSet();
        this.corner = new CellSet();
        this.main = null;
        this.color = 1;
        this.frozen = false;
    }

    copyFrom(other) {
        this.center.copyFrom(other.center);
        this.corner.copyFrom(other.corner);
        this.main = other.main;
        this.color = other.color;
        this.frozen = other.frozen;
    }

    setMain(n) {
        if (!this.frozen) {
            this.main = n;
            this.toggleCorner(null);
            this.toggleCenter(null);
        }
    }
    setColor(n) {
        this.color = n || 1;
    }
    toggleCorner(n) {
        if (!this.frozen) {
            if (n) {
                this.corner.toggle(n);
            } else {
                this.corner = new CellSet();
            }
        }
    }
    toggleCenter(n) {
        if (!this.frozen) {
            if (n) {
                this.center.toggle(n);
            } else {
                this.center = new CellSet();
            }
        }
    }

    freeze() {
        this.corner = new CellSet();
        this.center = new CellSet();
        this.color = 1;
        if (this.main) {
            this.frozen = true;
        }
    }

    serialize() {
        let obj = {
            "i": this.i,
            "j": this.j,
        };
        let changed = false;
        if (this.main) {
            changed = true;
            obj.m = this.main;
            if (this.frozen) {
                obj.f = true;
            }
        }

        if (this.color != 1) {
            changed = true;
            obj.color = this.color;
        }
        if (!this.main) {
            let center = this.center.serialize();
            if (center.length > 0) {
                changed = true;
                obj.center = center;
            }
            let corner = this.corner.serialize();
            if (corner.length > 0) {
                changed = true;
                obj.corner = corner;
            }
        }

        if (changed) {
            return obj;
        } else {
            return null;
        }
    }

    static deserialize(obj) {
        let cell = new Cell();
        cell.i = obj.i;
        cell.j = obj.j;
        cell.main = obj.m || null;
        cell.frozen = obj.f || false;
        cell.color = obj.color || null;
        if (obj.center) {
            cell.center = CellSet.deserialize(obj.center);
        }
        if (obj.corner) {
            cell.corner = CellSet.deserialize(obj.corner);
        }
        return cell;
    }
}

class State {
    constructor(presets) {
         this.cells = [...Array(9)].map((_, i) => [...Array(9)].map((_, j) => new Cell(i, j)));
    }

    copyFrom(other) {
        for (let i=0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j].copyFrom(other.cells[i][j]);
            }
        }
    }

    serialize() {
        let obj = [];

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = this.cells[i][j].serialize();
                if (cell) {
                    obj.push(cell);
                }
            }
        }
        return obj;
    }

    freeze() {
        for (let i=0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j].freeze();
            }
        }
    }

    static deserialize(obj) {
        let s = new State();
        for (let cell of obj) {
            let i = cell.i;
            let j = cell.j;
            s.cells[i][j] = Cell.deserialize(cell);
        }
        return s;
    }

    static deserialize_str(str) {
        let obj;
        if (obj = JSON.parse(str)) {
            return State.deserialize(obj)
        }
        return null;
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
        this.mainValue = cell.main;
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

    select(allowConfirmed) {
        console.log(this.cell.main, allowConfirmed);
        if (!this.mainValue || allowConfirmed) {
            this.selected = true;
            this.board.lastSelected = this;
            this.updateSelection();
        }
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
                if (this.selected) {
                    this.selected = false;
                    this.updateSelection();
                } else {
                    this.select(true);
                }
            }
            e.preventDefault();
        }

        this.cell.onmouseenter = (e) => {
            if (e.buttons != 1) {
                return;
            }
            this.select(this.board.selectConfirmed);
            e.preventDefault();
        }
    }
}

class Board {
    constructor(element, state) {
        if (!state) {
            state = new State();
        }
        let cells = [...element.getElementsByClassName('cell')];
        this.cells = [...Array(9)].map(_ => [...Array(9)]);
        this.selectionStart = null;
        this.history = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j] = (new BoardCell(cells.shift(), this, i, j))
            }
        }
        this.stateIndex = -1;
        this.apply(state);
        this.selectConfirmed = true;
        this.lastSelected = null;
    }

    saveState(newState) {
        // truncate history to now
        this.history = this.history.slice(0, this.stateIndex + 1);
        this.history.push(newState);
        this.stateIndex += 1;
    }

    updateLocalStorage() {
        localStorage.lastState = JSON.stringify(this.currentState().serialize());
    }

    undo() {
        if (this.stateIndex > 0) {
            this.stateIndex -= 1;
            this.applyInner(this.currentState());
        }
    }

    redo() {
        if (this.stateIndex < this.history.length - 1) {
            this.stateIndex += 1;
            this.applyInner(this.currentState());
        }
    }

    export() {
        let s = new State();
        s.copyFrom(this.currentState());
        s.freeze();
        window.open("?board=" + btoa(JSON.stringify(s.serialize())), "_blank");
    }

    reset() {
        let s = new State();
        s.copyFrom(this.currentState());
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (!s.cells[i][j].frozen) {
                    s.cells[i][j] = new Cell();
                }
            }
        }
        this.apply(s);
    }

    share() {
        let s = new State();
        s.copyFrom(this.currentState());
        window.open("?board=" + btoa(JSON.stringify(s.serialize())), "_blank");
    }

    currentState() {
        return this.history[this.stateIndex];
    }

    apply(state) {
        this.saveState(state);
        this.applyInner(state);
        this.updateLocalStorage();
    }

    applyInner(state) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cells[i][j].apply(state.cells[i][j]);
            }
        }
    }

    key(mode, n) {
        let newState = new State();
        newState.copyFrom(this.currentState());
        this.saveState(newState);
        for (let cell of this.selected()) {
            let stateCell = newState.cells[cell.i][cell.j];
            switch (mode) {
                case "main":
                    stateCell.setMain(n);
                    cell.applyMain(stateCell);
                    break;
                case "corner":
                    stateCell.toggleCorner(n);
                    cell.applyCorner(stateCell);

                    break;
                case "center":
                    stateCell.toggleCenter(n);
                    cell.applyCenter(stateCell);

                    break;
                case "color":
                    stateCell.setColor(n);
                    cell.applyColor(stateCell);

                    break;
            }
        }
        this.updateLocalStorage();
    }

    moveSelection(i, j) {
        if (!this.lastSelected) {
            return;
        }
        this.deselect();
        let i2 = this.lastSelected.i + i;
        let j2 = this.lastSelected.j + j;
        if (i2 < 0 || j2 < 0 || i2 > 8 || j2 > 8) {
            return;
        }
        this.cells[i2][j2].select(true);
    }

    *selected() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = this.cells[i][j];
                if (cell.selected) {
                   yield cell; 
                }
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
                this.cells[i][j].select(this.selectConfirmed);
            }
        }

        this.selectionStart = null;
    }
}
