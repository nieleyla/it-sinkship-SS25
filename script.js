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
  isMobile: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  playerTurn: true,
  shipIdCounter: 0,

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

    // Create a Message Area
    const messageArea = this.makeDiv();
    messageArea.classList.add("message-area");
    messageArea.textContent =
      "Welcome to Sink Ship! Build your fleet and start the game.";

    // Create fields container
    const fields = this.makeDiv();
    fields.classList.add("fields");

    /// Create and store field objects
    this.playerField = this.makeField("playerfield");

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
    limiter.appendChild(messageArea);
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

    this.buildButton = buildButton;
    this.autoPlaceButton = autoPlaceButton;
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
        this.selectedShip = {
          type: ship.type,
          size: ship.size,
          orientation: "horizontal",
        };
        if (this.isMobile) {
          this.markInvalidCells();
        }
        console.log("Selected:", this.selectedShip);
      });

      vCell.addEventListener("click", () => {
        this.selectedShip = {
          type: ship.type,
          size: ship.size,
          orientation: "vertical",
        };
        if (this.isMobile) {
          this.markInvalidCells();
        }
        console.log("Selected:", this.selectedShip);
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
      cell.classList.remove("preview");
      if (!this.isMobile) {
        cell.classList.remove("blocked"); // only remove blocked on desktop
      }
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

      const shipId = `ship-${this.shipIdCounter++}`;
      cell.dataset.shipId = shipId;

      cell.classList.add(className);
      cell.classList.add("occupied");
    }

    inventory.count--;
    inventory.countCell.textContent = inventory.count;
    this.checkIfAllShipsPlaced();

    if (inventory.count === 0) {
      this.selectedShip = null;
    }

    if (this.isMobile) {
      this.markInvalidCells(); // update blocked cells after placing
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

    if (this.isMobile) {
      this.markInvalidCells(); // update blocked cells after removal
      console.log("Invalid cells marked after removal");
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

      this.playerField.cells.flat().forEach((cell) => {
        if (!cell.classList.contains("occupied")) {
          cell.classList.add("water");
        }
      });
    }
  },

  // Start Game and swap fields
  startGame: function () {
    console.log("Game started!");

    // Clear the message area
    const messageArea = document.querySelector(".message-area");
    messageArea.textContent =
      "Game started! Click on the computer field to attack.";

    // Disable the control buttons
    this.buildButton.disabled = true;
    this.autoPlaceButton.disabled = true;
    this.startButton.disabled = true;

    this.buildButton.classList.add("disabled");
    this.autoPlaceButton.classList.add("disabled");
    this.startButton.classList.add("disabled");

    // Create computer field
    this.computerField = this.makeField("computerfield");

    // Add autoplaced ships to computer field
    this.autoPlaceComputerShips();

    // Add event listeners to computer field cells
    this.computerField.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        cell.addEventListener("click", () => {
          if (!cell.classList.contains("disabled")) {
            this.handlePlayerAttack(x, y);
            cell.classList.add("disabled");
            cell.classList.remove("clickable");
          }
        });

        cell.addEventListener("mouseover", () => {
          if (!cell.classList.contains("disabled")) {
            cell.classList.add("clickable");
          }
        });

        cell.addEventListener("mouseout", () => {
          cell.classList.remove("clickable");
        });
      });
    });

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

  markInvalidCells: function () {
    const ship = this.selectedShip;
    if (!ship) return;

    const cells = this.playerField.cells;

    // Clear previous blocked cells
    this.playerField.cells
      .flat()
      .forEach((cell) => cell.classList.remove("blocked"));

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const fits =
          ship.orientation === "horizontal"
            ? x + ship.size <= 10
            : y + ship.size <= 10;

        const canPlace =
          fits && this.canPlaceShip(y, x, ship.orientation, ship.size);

        if (!canPlace) {
          // Only mark the starting cell as blocked
          cells[y][x].classList.add("blocked");
        }
      }
    }
  },

  // Auto place ships on computer field
  autoPlaceComputerShips: function () {
    const orientations = ["horizontal", "vertical"];
    const cells = this.computerField.cells;
    const ships = [
      { count: 2, type: "Corvette", size: 2 },
      { count: 1, type: "Battleship", size: 3 },
      { count: 1, type: "Destroyer", size: 4 },
      { count: 1, type: "Submarine", size: 5 },
    ];

    const canPlace = (row, col, orientation, length) => {
      for (let i = 0; i < length; i++) {
        let x = col;
        let y = row;

        if (orientation === "horizontal") x += i;
        else y += i;

        if (x < 0 || x >= 10 || y < 0 || y >= 10) return false;

        // Check surroundings
        const neighbors = [
          [y, x],
          [y - 1, x],
          [y + 1, x],
          [y, x - 1],
          [y, x + 1],
        ];

        for (const [ny, nx] of neighbors) {
          if (
            nx >= 0 &&
            nx < 10 &&
            ny >= 0 &&
            ny < 10 &&
            cells[ny][nx].classList.contains("occupied")
          ) {
            return false;
          }
        }
      }

      return true;
    };

    const place = (row, col, orientation, size, type) => {
      const shipId = `computer-ship-${this.shipIdCounter++}`; // Generate ship ID
      for (let i = 0; i < size; i++) {
        let x = col;
        let y = row;
        if (orientation === "horizontal") x += i;
        else y += i;

        const cell = cells[y][x];
        cell.classList.add("occupied");
        cell.dataset.shipId = shipId;
      }

      // Console log for debugging
      console.log(`Placed ${type} at (${row}, ${col}) ${orientation}`);
    };

    for (const ship of ships) {
      for (let i = 0; i < ship.count; i++) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
          const orientation =
            orientations[Math.floor(Math.random() * orientations.length)];
          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);

          if (canPlace(row, col, orientation, ship.size)) {
            place(row, col, orientation, ship.size, ship.type);
            placed = true;
          }

          attempts++;
        }

        if (!placed) {
          alert(`Failed to place ${ship.type} on computer field.`);
          return;
        }
      }
    }
  },

  handlePlayerAttack: function (x, y) {
    if (!this.playerTurn) return;

    const cell = this.computerField.cells[y][x];
    const messageArea = document.querySelector(".message-area");

    cell.classList.add("disabled");

    if (cell.classList.contains("occupied")) {
      cell.classList.add("hit");
      const shipId = cell.dataset.shipId;

      if (this.isShipSunk(shipId, this.computerField.cells)) {
        this.updateMessage("Hit and sunk ship! You can shoot again.");
      } else {
        this.updateMessage("Hit! You can shoot again.");
      }
      if (this.checkGameOver()) return;
    } else {
      cell.classList.add("miss");
      this.updateMessage("Miss! Now it's computer's turn.");
      this.playerTurn = false;
    }
    // Check if game is over
    if (this.checkGameOver()) return;

    // Proceed to computer's turn
    setTimeout(() => {
      this.computerTurn();
    }, 1000); // Delay to show hit/miss effect
  },

  computerTurn: function () {
    if (this.playerTurn) return; // Only proceed if it's computer's turn

    const available = this.getAvailablePlayerCells();
    if (available.length === 0) return;

    let cell;
    const cells = this.playerField.cells;
    const state = this.aiState;

    if (state.mode === "target" && state.targets.length > 0) {
      // Try next target from queue
      const { x, y } = state.targets.shift();
      cell = cells[y][x];
      if (cell.classList.contains("disabled")) {
        // Try next target
        setTimeout(() => this.computerTurn(), 300);
        return;
      }
    } else {
      // Hunt mode: pick random cell
      const { x, y } = available[Math.floor(Math.random() * available.length)];
      cell = cells[y][x];
    }

    cell.classList.add("disabled");

    if (cell.classList.contains("occupied")) {
      cell.classList.add("hit");
      const shipId = cell.dataset.shipId;
      if (this.isShipSunk(shipId, this.playerField.cells)) {
        this.updateMessage("Computer hit and sunk your ship!");
      
        if (this.checkGameOver()) return;

      } else {
        this.updateMessage("Computer hit your ship!");

        if (this.checkGameOver()) return;
      }

      // Remain in target mode and queue new directions
      const x = +cell.dataset.x;
      const y = +cell.dataset.y;
      state.mode = "target";
      state.lastHit = { x, y };
      state.targets.push(...this.getAdjacentCells(x, y, cells));

      setTimeout(() => this.computerTurn(), 600); // Continue after hit
    } else {
      cell.classList.add("miss");
      this.updateMessage("Computer missed. It's your turn.");
      this.playerTurn = true; // Hand control back to player
      state.mode = "hunt";
      state.targets = [];
      state.lastHit = null;
    }
  },

  aiState: {
    mode: "hunt",
    targets: [],
    lastHit: null,
    direction: null,
  },

  getAvailablePlayerCells: function () {
    return this.playerField.cells
      .flat()
      .filter((cell) => !cell.classList.contains("disabled"))
      .map((cell) => ({
        x: +cell.dataset.x,
        y: +cell.dataset.y,
      }));
  },

  getAdjacentCells: function (x, y, cells) {
    const directions = [
      { x: 0, y: -1 }, // N
      { x: 1, y: 0 }, // E
      { x: 0, y: 1 }, // S
      { x: -1, y: 0 }, // W
    ];

    const targets = [];

    directions.forEach((dir) => {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
        const cell = cells[newY][newX];
        if (!cell.classList.contains("disabled")) {
          targets.push({ x: newX, y: newY });
        }
      }
    });

    return targets;
  },

  // Update message area
  updateMessage: function (message) {
    const messageArea = document.querySelector(".message-area");
    messageArea.textContent = message;
  },

  isShipSunk: function (shipId, cells) {
    for (const row of cells) {
      for (const cell of row) {
        if (cell.dataset.shipId === shipId && !cell.classList.contains("hit")) {
          return false; // There's still a part not hit
        }
      }
    }
    return true; // All parts are hit
  },

  checkGameOver: function () {
    const playerShips = this.getRemainingShips(this.playerField.cells);
    const computerShips = this.getRemainingShips(this.computerField.cells);
  
    if (computerShips === 0) {
      this.endGame("🎉 You win! All enemy ships have been sunk.");
      return true;
    }
  
    if (playerShips === 0) {
      this.endGame("💥 You lost! All your ships have been sunk.");
      return true;
    }
  
    return false;
  },  

  getRemainingShips: function (cells) {
    const remainingShips = new Set();
    for (const row of cells) {
      for (const cell of row) {
        if (
          cell.classList.contains("occupied") &&
          !cell.classList.contains("hit")
        ) {
          remainingShips.add(cell.dataset.shipId);
        }
      }
    }
    return remainingShips.size;
  },

  endGame: function (message) {
    this.playerTurn = false;
  
    // Disable interaction
    this.computerField.cells.flat().forEach((cell) => {
      cell.classList.add("disabled");
      cell.classList.remove("clickable");
    });
  
    // Create overlay
    const overlay = document.createElement("div");
    overlay.classList.add("popup-overlay");
  
    const popup = document.createElement("div");
    popup.classList.add("popup");
  
    const resultText = document.createElement("h2");
    resultText.textContent = message;
  
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Game";
    restartButton.className = "button restart-button";
  
    restartButton.addEventListener("click", () => {
      document.body.innerHTML = "";
      this.resetGame();
    });
  
    popup.appendChild(resultText);
    popup.appendChild(restartButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  },  

  resetGame: function () {
    this.playerField = [];
    this.computerField = [];
    this.shipInventory = {};
    this.removalMode = false;
    this.playerTurn = true;
    this.shipIdCounter = 0;
    this.aiState = {
      mode: "hunt",
      targets: [],
      lastHit: null,
      direction: null,
    };
  
    this.init(); // Rebuild the entire game interface
  },  
};
