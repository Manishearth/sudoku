function genTable(el) {

    let table = document.createElement('table');
    table.className = "sudoku";

    for (let i =0; i<9; i++) {
        let tr = document.createElement('tr');
        tr.className = "row";
        for (let j=0; j<9; j++) {
            let td = document.createElement('td');
            td.className = "cell";

            let container = document.createElement("div");
            container.className = "cell-container colored";
            container.setAttribute("data-color", 1);
            // container.setAttribute("data-color", (i + j) % 9 + 1);

            let anno = document.createElement('div');
            anno.className = "annotations";
            let center = document.createElement('div');
            center.className = "center";
            // center.innerHTML="0";
            anno.appendChild(center);
            for (let k=0; k<8; k++) {
                let corner = document.createElement('div');
                corner.className=`corner corner-${k}`;
                // corner.innerHTML="0";
                anno.appendChild(corner);
            }
            container.appendChild(anno);
            let main = document.createElement('div');
            main.className = "main";
            // main.innerHTML = "0";
            container.appendChild(main);
            td.appendChild(container);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    el.appendChild(table);
    return new Board(table);
}


function genKeyPad(el) {
    for(let i=1; i<=9; i++) {
        let div = document.createElement("div");
        div.className = "button dark";
        div.id = `button-${i}`;

        let container = document.createElement("div");
        container.className = "cell-container";

        let anno = document.createElement('div');
        anno.className = "annotations";
        let center = document.createElement('div');
        center.className = "center";
        center.innerHTML = i;
        let corner = document.createElement('div');
        corner.className = `corner corner-1`;
        corner.innerHTML = i;
        let main = document.createElement('div');
        main.className = "main";
        main.innerHTML = i;
        let color = document.createElement("div");
        color.className = "colored";
        color.setAttribute("data-color", i);
        anno.appendChild(center);
        anno.appendChild(corner);
        container.appendChild(anno);
        container.appendChild(main);
        container.appendChild(color);
        div.appendChild(container);
        el.appendChild(div);
    }
    let clear = document.createElement("div");
    clear.className = "button button-clear";
    clear.innerHTML = "Clear";
    el.appendChild(clear);
    el.setAttribute("data-selected", "main");
}

class Buttons {
    constructor(container, board) {
        this.board = board
        this.mode = "main";
        this.container = container;
        this.keypad = container.getElementsByClassName("keypad")[0];
        this.setupModes();
    }

    setupModes() {
        this.$("button-main").onclick = () => this.changeMode("main");
        this.$("button-center").onclick = () => this.changeMode("center");
        this.$("button-corner").onclick = () => this.changeMode("corner");
        this.$("button-color").onclick = () => this.changeMode("color");
    }

    $(cl) {
        return this.container.getElementsByClassName(cl)[0];
    }

    changeMode(mode) {
        this.keypad.setAttribute("data-selected", mode);
        this.mode = mode;
        for (let m of ["main", "center", "corner", "color"]) {
            if (m == mode) {
                this.$(`button-${m}`).classList.add("dark");
            } else {
                this.$(`button-${m}`).classList.remove("dark");
            }
        }
    }
}
