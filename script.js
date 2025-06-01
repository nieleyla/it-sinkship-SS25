// Start program only when the DOM is fully loaded
window.addEventListener("load", function () {
  sinkship.init();
});

// Define the sinkship object
const sinkship = {
  playerField: [],
  computerField: [],
  shipInventory: {},
  removalMode: false,

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

    this.playerField.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cell.addEventListener("mouseover", () =>
          this.previewShip(rowIndex, colIndex)
        );
        cell.addEventListener("mouseout", () => this.clearPreview());
        cell.addEventListener("click", () => {
          if (this.removalMode) {
            this.removeShip(rowIndex, colIndex);
          } else {
            this.placeShip(rowIndex, colIndex);
          }
        });
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

    // Create Auto Place button
    const autoPlaceButton = document.createElement("button");
    autoPlaceButton.textContent = "Auto Place Ships";
    autoPlaceButton.classList.add("button");

    const startButton = document.createElement("button");
    startButton.textContent = "Start Game";
    startButton.classList.add("button");
    startButton.disabled = true; // Initially disabled
    startButton.classList.add("disabled");

    this.startButton = startButton;

    autoPlaceButton.addEventListener("click", () => {
      this.autoPlaceShips();
    });

    controls.appendChild(buildButton);
    controls.appendChild(autoPlaceButton);
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

    // Add remove button
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove Ships";
    removeButton.classList.add("button", "remove-button");

    removeButton.addEventListener("click", () => {
      this.selectedShip = null;
      this.removalMode = !this.removalMode;

      removeButton.classList.toggle("active", this.removalMode); // toggle visual style
      console.log("Removal mode:", this.removalMode);
    });

    ships.forEach((ship) => {
      const row = document.createElement("tr");

      // Count
      const countCell = document.createElement("td");
      countCell.textContent = ship.count;
      row.appendChild(countCell);

      // Store initial inventory count
      this.shipInventory[ship.type] = {
        count: ship.count,
        originalCount: ship.count,
        countCell: countCell,
        size: ship.size,
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
    field.appendChild(removeButton);

    return { field };
  },

  previewShip: function (startRow, startCol) {
    const ship = this.selectedShip;
    if (!ship) return;

    const cells = this.playerField.cells;
    const length = ship.size;

    // First: check bounds
    const fits =
      ship.orientation === "horizontal"
        ? startCol + length <= 10
        : startRow + length <= 10;

    // If it doesn't fit, gray out the potential cells and return
    if (!fits) {
      for (let i = 0; i < length; i++) {
        let x = startCol;
        let y = startRow;
        if (ship.orientation === "horizontal") x += i;
        else y += i;

        if (x >= 0 && x < 10 && y >= 0 && y < 10) {
          cells[y][x].classList.add("blocked");
        }
      }
      return; // skip further checks
    }

    // Second: check if placement area is too close to another ship
    if (!this.canPlaceShip(startRow, startCol, ship.orientation, length)) {
      for (let i = 0; i < length; i++) {
        let x = startCol;
        let y = startRow;
        if (ship.orientation === "horizontal") x += i;
        else y += i;

        if (x >= 0 && x < 10 && y >= 0 && y < 10) {
          cells[y][x].classList.add("blocked");
        }
      }
      return;
    }

    // Valid preview
    for (let i = 0; i < length; i++) {
      let x = startCol;
      let y = startRow;
      if (ship.orientation === "horizontal") x += i;
      else y += i;

      cells[y][x].classList.add("preview");
    }
  },

  clearPreview: function () {
    this.playerField.cells.flat().forEach((cell) => {
      cell.classList.remove("preview", "blocked");
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

    if (!this.canPlaceShip(startRow, startCol, ship.orientation, length)) {
      alert("Invalid placement!");
      return;
    }

    for (let i = 0; i < length; i++) {
      let x = startCol;
      let y = startRow;

      if (ship.orientation === "horizontal") x += i;
      else y += i;

      const cell = cells[y][x];
      cell.classList.remove("preview");

      const className =
        ship.orientation === "horizontal"
          ? `ship-${type}-${i}`
          : `ship-${type}-v-${i}`;

      cell.classList.add(className);
      cell.classList.add("occupied"); // ✅ mark cell as occupied
    }

    inventory.count--;
    inventory.countCell.textContent = inventory.count;
    this.checkIfAllShipsPlaced();

    if (inventory.count === 0) {
      this.selectedShip = null;
    }
  },

  canPlaceShip: function (startRow, startCol, orientation, length) {
    const cells = this.playerField.cells;

    for (let i = 0; i < length; i++) {
      let x = startCol;
      let y = startRow;

      if (orientation === "horizontal") x += i;
      else y += i;

      if (x < 0 || x >= 10 || y < 0 || y >= 10) {
        return false; // Out of bounds
      }

      // Check this cell and side-neighbors only
      const neighbors = [
        [y, x], // current
        [y - 1, x], // north
        [y + 1, x], // south
        [y, x - 1], // west
        [y, x + 1], // east
      ];

      for (const [ny, nx] of neighbors) {
        if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
          if (cells[ny][nx].classList.contains("occupied")) {
            return false;
          }
        }
      }
    }

    return true;
  },

  removeShip: function (row, col) {
    const cell = this.playerField.cells[row][col];
    const classes = Array.from(cell.classList);
    const shipClass = classes.find((c) => c.startsWith("ship-"));
    if (!shipClass) return;

    const match = shipClass.match(/^ship-(\w+)(-v)?-(\d+)/);
    if (!match) return;

    const type = match[1];
    const orientation = match[2] === "-v" ? "vertical" : "horizontal";

    const cells = this.playerField.cells;
    const shipCells = [];

    // Scan both directions to collect full ship
    for (let dir = -1; dir <= 1; dir += 2) {
      for (let i = 1; i < 10; i++) {
        let x = col;
        let y = row;

        if (orientation === "horizontal") x += i * dir;
        else y += i * dir;

        if (x < 0 || x >= 10 || y < 0 || y >= 10) break;

        const c = cells[y][x];
        if (!c.classList.contains("occupied")) break;

        const classMatch = Array.from(c.classList).find((cls) =>
          cls.startsWith(`ship-${type}`)
        );
        if (!classMatch) break;

        shipCells.push(c);
      }
    }

    // Add the original cell
    shipCells.push(cell);

    // Sort for consistent cleanup
    shipCells.sort((a, b) => {
      const ax = parseInt(a.dataset.x),
        ay = parseInt(a.dataset.y);
      const bx = parseInt(b.dataset.x),
        by = parseInt(b.dataset.y);
      return ay === by ? ax - bx : ay - by;
    });

    // First, remove all water classes from the whole grid (they’ll be re-added later)
    this.playerField.cells.flat().forEach((cell) => {
      cell.classList.remove("water");
    });

    // Then, collect all parts of the ship
    shipCells.forEach((c) => {
      c.className = "cell"; // resets all classes to default
    });

    // Update inventory
    const inventory =
      this.shipInventory[type.charAt(0).toUpperCase() + type.slice(1)];
    if (inventory) {
      inventory.count++;
      inventory.countCell.textContent = inventory.count;
      this.checkIfAllShipsPlaced();
    }
  },

  // Check if inventory is empty and enable start button
  checkIfAllShipsPlaced: function () {
    const allPlaced = Object.values(this.shipInventory).every(
      (entry) => entry.count === 0
    );

    this.startButton.disabled = !allPlaced;
    this.startButton.classList.toggle("disabled", !allPlaced);

    if (allPlaced) {
      // Add event listener once
      if (!this.startButton.dataset.listenerAdded) {
        this.startButton.addEventListener("click", () => {
          this.startGame();
        });
        this.startButton.dataset.listenerAdded = "true";
      }

      // ✅ Mark all unoccupied cells as water
      this.playerField.cells.flat().forEach((cell) => {
        if (!cell.classList.contains("occupied")) {
          cell.classList.add("water");
        }
      });
    }
  },

  // Start Game and swap fields
  startGame: function () {
    alert("Game has been started!");

    // Disable the button
    this.startButton.disabled = true;
    this.startButton.classList.add("disabled");

    // Create computer field
    this.computerField = this.makeField("computerfield");

    // Replace menu with computer field
    const fieldsContainer = this.playerField.field.parentNode;
    fieldsContainer.removeChild(this.menu.field);
    fieldsContainer.appendChild(this.computerField.field);
  },

  autoPlaceShips: function () {
    // Clear any existing ships
    Object.keys(this.shipInventory).forEach((type) => {
      this.shipInventory[type].count = this.shipInventory[type].originalCount;
      this.shipInventory[type].countCell.textContent =
        this.shipInventory[type].count;
    });

    this.playerField.cells.flat().forEach((cell) => {
      cell.className = "cell";
    });

    const orientations = ["horizontal", "vertical"];
    const cells = this.playerField.cells;

    for (const type in this.shipInventory) {
      const inventory = this.shipInventory[type];

      while (inventory.count > 0) {
        const size = inventory.size;
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
          const orientation =
            orientations[Math.floor(Math.random() * orientations.length)];
          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);

          if (this.canPlaceShip(row, col, orientation, size)) {
            this.selectedShip = { type, size, orientation };
            this.placeShip(row, col);
            placed = true;
          }

          attempts++;
        }

        if (!placed) {
          alert(`Could not auto-place ${type}`);
          break;
        }
      }
    }

    // Check if all ships placed to enable Start Game
    this.checkIfAllShipsPlaced();
  },
};
