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
            container.className = "cell-container";
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

