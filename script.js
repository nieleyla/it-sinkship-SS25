// Start program only when the DOM is fully loaded
window.addEventListener("load", function () {
  sinkship.init();
});

// Define the sinkship object
const sinkship = {
  playerField: [],
  computerField: [],
  shipInventory: {},

  init: function () {
    alert("It works");

    // Append generated elements to the document body
    document.body.appendChild(this.makeHeader());
    document.body.appendChild(this.makeMain());
    document.body.appendChild(this.makeFooter());
  },

  // Create and return the <header> element with a limiter container
  makeHeader: function () {
    const header = document.createElement("header");

    // Create limiter to hold header content
    const limiter = this.makeLimiter();

    // Create headline
    const headline = document.createElement("h1");
    headline.textContent = "Sink Ship";
    limiter.appendChild(headline);

    // Create copyright
    const copyright = document.createElement("p");
    copyright.innerHTML = "by Leyla Niederberger";
    limiter.appendChild(copyright);

    // Add the limiter to the header
    header.appendChild(limiter);

    return header;
  },

  // Create and return the <main> element with a limiter container
  makeMain: function () {
    const main = document.createElement("main");

    const limiter = this.makeLimiter();
    main.appendChild(limiter);

    // Create control panel
    const controls = this.makeControls();

    // Create fields container
    const fields = this.makeDiv();
    fields.classList.add("fields");

    /// Create and store field objects
    this.playerField = this.makeField("playerfield");
    // this.computerField = this.makeField("computerfield");

    this.menu = this.buildMenu();

    //this.launchShip();

    this.playerField.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cell.addEventListener("mouseover", () =>
          this.previewShip(rowIndex, colIndex)
        );
        cell.addEventListener("mouseout", () => this.clearPreview());
        cell.addEventListener("click", () =>
          this.placeShip(rowIndex, colIndex)
        );
      });
    });

    fields.appendChild(this.playerField.field);
    // fields.appendChild(this.computerField.field);
    fields.appendChild(this.menu.field);

    limiter.appendChild(controls);
    limiter.appendChild(fields);

    return main;
  },

  // Create and return the <footer> element
  makeFooter: function () {
    const footer = document.createElement("footer");

    // Create limiter to hold footer content
    const limiter = this.makeLimiter();

    // Footer line
    const footerLine = document.createElement("p");
    footerLine.innerHTML = "&copy; Leyla Niederberger 2025";

    // Add the footer line to the limiter
    limiter.appendChild(footerLine);

    // Append the limiter to the footer
    footer.appendChild(limiter);

    return footer;
  },

  // Create and return a <div> element with a limiter class
  makeLimiter: function () {
    const limiter = document.createElement("div");
    limiter.className = "limiter";
    return limiter;
  },

  // Create and return a <div> element with a class of "create-div"
  makeDiv: function () {
    const div = document.createElement("div");
    div.classList.add("create-div");
    return div;
  },

  // Create class for field
  makeField: function (id) {
    const field = this.makeDiv();
    field.classList.add("field");
    field.id = id;

    const cells = []; // Array to hold cell elements

    // Create 10×10 grid (x: rows, y: columns)
    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        // Store coordinates
        cell.dataset.x = x;
        cell.dataset.y = y;

        field.appendChild(cell);
        row.push(cell); // Add cell to the row
      }
      cells.push(row); // Add row to grid
    }

    return { field, cells };
  },

  makeControls: function () {
    const controls = this.makeDiv();
    controls.classList.add("controls");

    // Create and append the "Start Game" button
    const buildButton = document.createElement("button");
    buildButton.textContent = "Build Ships";
    buildButton.classList.add("button");

    const startButton = document.createElement("button");
    startButton.textContent = "Start Game";
    startButton.classList.add("button");

    controls.appendChild(buildButton);
    controls.appendChild(startButton);

    return controls;
  },

  buildMenu: function () {
    const field = this.makeDiv();
    field.id = "menu";

    field.classList.add("field");

    const table = document.createElement("table");

    // Table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Count", "", "", "Type", "Size"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");

    const ships = [
      { count: 2, type: "Corvette", size: 2 },
      { count: 1, type: "Battleship", size: 3 },
      { count: 1, type: "Destroyer", size: 4 },
      { count: 1, type: "Submarine", size: 5 },
    ];

    ships.forEach((ship) => {
      const row = document.createElement("tr");

      // Count
      const countCell = document.createElement("td");
      countCell.textContent = ship.count;
      row.appendChild(countCell);

      // Store initial inventory count
      this.shipInventory[ship.type] = {
        count: ship.count,
        countCell: countCell,
      };

      // Horizontal ship option
      const hCell = document.createElement("td");
      const hOption = document.createElement("div");
      hOption.classList.add("ship-option");
      hCell.appendChild(hOption);
      row.appendChild(hCell);

      // Vertical ship option
      const vCell = document.createElement("td");
      const vOption = document.createElement("div");
      vOption.classList.add("ship-option", "v");
      vCell.appendChild(vOption);
      row.appendChild(vCell);

      // Type
      const typeCell = document.createElement("td");
      typeCell.textContent = ship.type;
      row.appendChild(typeCell);

      // Size
      const sizeCell = document.createElement("td");
      sizeCell.textContent = ship.size;
      row.appendChild(sizeCell);

      tbody.appendChild(row);

      // Add click event to ship options
      hCell.addEventListener("click", () => {
        sinkship.selectedShip = {
          type: ship.type,
          size: ship.size,
          orientation: "horizontal",
        };
        console.log("Selected:", sinkship.selectedShip);
      });

      vCell.addEventListener("click", () => {
        sinkship.selectedShip = {
          type: ship.type,
          size: ship.size,
          orientation: "vertical",
        };
        console.log("Selected:", sinkship.selectedShip);
      });
    });

    table.appendChild(tbody);
    field.appendChild(table);

    return { field };
  },

  previewShip: function (startRow, StartCol) {
    const ship = this.selectedShip;
    if (!ship) return;

    const cells = this.playerField.cells;
    const length = ship.size;

    // Determine the ship's end position
    let fits =
      ship.orientation === "horizontal"
        ? StartCol + length <= 10
        : startRow + length <= 10;

    if (!fits) return; // Abort preview if ship won't fit

    for (let i = 0; i < length; i++) {
      let x = StartCol;
      let y = startRow;

      if (ship.orientation === "horizontal") {
        x += i;
      } else {
        y += i;
      }

      cells[y][x].classList.add("preview");
    }
  },

  clearPreview: function () {
    this.playerField.cells.flat().forEach((cell) => {
      cell.classList.remove("preview");
    });
  },

  placeShip: function (startRow, startCol) {
    const ship = this.selectedShip;
    if (!ship) return;

    const inventory = this.shipInventory[ship.type];
    if (!inventory || inventory.count <= 0) {
      alert(`No more ${ship.type}s available.`);
      return;
    }

    const cells = this.playerField.cells;
    const length = ship.size;
    const type = ship.type.toLowerCase();

    // Check bounds
    const fits =
      ship.orientation === "horizontal"
        ? startCol + length <= 10
        : startRow + length <= 10;

    if (!fits) return;

    for (let i = 0; i < length; i++) {
      let x = startCol;
      let y = startRow;

      if (ship.orientation === "horizontal") x += i;
      else y += i;

      const cell = cells[y][x];
      cell.classList.remove("preview");

      const className =
        ship.orientation === "horizontal" ? `${type}-${i}` : `${type}-v-${i}`;

      cell.classList.add(className);
    }

    // Decrease ship count in inventory
    inventory.count--;
    inventory.countCell.textContent = inventory.count;

    // Reset selected ship if none left
    if (inventory.count === 0) {
      this.selectedShip = null;
    }
  },

  launchShip: function () {
    // Hardcoded ship in playerField at row 2, columns 4-6
    const cells = this.playerField.cells;

    cells[2][4].classList.add("left");
    cells[2][5].classList.add("horizontal");
    cells[2][6].classList.add("right");
  },
};
