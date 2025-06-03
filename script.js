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
    // alert("It works");

    document.body.appendChild(this.makeHeader());
    document.body.appendChild(this.makeMain());
    document.body.appendChild(this.makeFooter());
  },

  // Create and return the header element
  makeHeader: function () {
    const header = document.createElement("header");

    const limiter = this.makeLimiter();

    const headline = document.createElement("h1");
    headline.textContent = "Sink Ship";
    limiter.appendChild(headline);

    const copyright = document.createElement("p");
    copyright.innerHTML = "by Leyla Niederberger";
    limiter.appendChild(copyright);

    header.appendChild(limiter);

    return header;
  },

  // Create and return the main element
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
    fields.appendChild(this.menu.field);

    limiter.appendChild(controls);
    limiter.appendChild(messageArea);
    limiter.appendChild(fields);

    return main;
  },

  // Create and return the footer element
  makeFooter: function () {
    const footer = document.createElement("footer");

    const limiter = this.makeLimiter();

    const footerLine = document.createElement("p");
    footerLine.innerHTML = "&copy; Leyla Niederberger 2025";

    limiter.appendChild(footerLine);

    footer.appendChild(limiter);

    return footer;
  },

  // Create a div with the class "limiter"
  makeLimiter: function () {
    const limiter = document.createElement("div");
    limiter.className = "limiter";
    return limiter;
  },

  // Create a generic div with a specific class
  makeDiv: function () {
    const div = document.createElement("div");
    div.classList.add("create-div");
    return div;
  },

  // Create a 10x10 grid field with cells to hold ships
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

  // Create the control panel with buttons
  makeControls: function () {
    const controls = this.makeDiv();
    controls.classList.add("controls");

    // Create Restart button
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.classList.add("button");
    restartButton.addEventListener("click", () => {
      this.showRestartConfirmation();
    });

    // Create Auto Place button
    const autoPlaceButton = document.createElement("button");
    autoPlaceButton.textContent = "Auto Place Ships";
    autoPlaceButton.classList.add("button");

    // Create Start Game button
    const startButton = document.createElement("button");
    startButton.textContent = "Start Game";
    startButton.classList.add("button");
    startButton.disabled = true; // Initially disabled
    startButton.classList.add("disabled");

    this.restartButton = restartButton;
    this.autoPlaceButton = autoPlaceButton;
    this.startButton = startButton;

    autoPlaceButton.addEventListener("click", () => {
      this.autoPlaceShips();
    });

    controls.appendChild(restartButton);
    controls.appendChild(autoPlaceButton);
    controls.appendChild(startButton);

    return controls;
  },

  // Create menu with ship options
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

    // Initialize ship inventory
    ships.forEach((ship) => {
      const row = document.createElement("tr");

      // Count
      const countCell = document.createElement("td");
      countCell.textContent = ship.count;
      row.appendChild(countCell);

      // Store inventory count
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
          this.markInvalidCells(); // mark invalid cells on mobile
        }
        // console.log("Selected:", this.selectedShip);
      });

      vCell.addEventListener("click", () => {
        this.selectedShip = {
          type: ship.type,
          size: ship.size,
          orientation: "vertical",
        };
        if (this.isMobile) {
          this.markInvalidCells(); // mark invalid cells on mobile
        }
        // console.log("Selected:", this.selectedShip);
      });
    });

    table.appendChild(tbody);
    field.appendChild(table);
    field.appendChild(removeButton);

    return { field };
  },

  // Preview ship placement to show potential position
  previewShip: function (startRow, startCol) {
    const ship = this.selectedShip;
    if (!ship) return;

    const cells = this.playerField.cells;
    const length = ship.size;

    // Check bounds
    const fits =
      ship.orientation === "horizontal"
        ? startCol + length <= 10
        : startRow + length <= 10;

    // If it doesn't fit, show blocked cells
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
      return;
    }

    // Check if placement area is too close to another ship
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

  // Clear all preview classes from the field
  clearPreview: function () {
    this.playerField.cells.flat().forEach((cell) => {
      cell.classList.remove("preview");
      if (!this.isMobile) {
        cell.classList.remove("blocked"); // mobile keeps blocked cells to guide touch users
      }
    });
  },

  // Place the selected ship at the specified coordinates
  placeShip: function (startRow, startCol) {
    const ship = this.selectedShip;
    if (!ship) return;

    // Check if ship is available in inventory
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

    // Generate unique ship ID
    const shipId = `ship-${this.shipIdCounter++}`;

    // Place the ship on the grid
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

      cell.dataset.shipId = shipId;

      cell.classList.add(className);
      cell.classList.add("occupied");
      applyShipSprite(cell, type, ship.orientation, i, false);
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

  // Check if a ship can be placed at the specified coordinates
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

      // Check this cell and side-neighbors
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
            return false; // Cell is occupied or too close to another ship
          }
        }
      }
    }

    return true;
  },

  // Remove a ship from the field
  removeShip: function (row, col) {
    const cell = this.playerField.cells[row][col];
    const classes = Array.from(cell.classList);
    const shipClass = classes.find((c) => c.startsWith("ship-"));
    if (!shipClass) return;

    // Extract ship type and orientation from class
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

    // Sort for cleanup
    shipCells.sort((a, b) => {
      const ax = parseInt(a.dataset.x),
        ay = parseInt(a.dataset.y);
      const bx = parseInt(b.dataset.x),
        by = parseInt(b.dataset.y);
      return ay === by ? ax - bx : ay - by;
    });

    // Remove all water classes from the whole grid
    this.playerField.cells.flat().forEach((cell) => {
      cell.classList.remove("water");
    });

    // Collect all parts of the ship
    shipCells.forEach((c) => resetShipCell(c));

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
    this.autoPlaceButton.disabled = true;
    this.startButton.disabled = true;

    this.autoPlaceButton.classList.add("disabled");
    this.startButton.classList.add("disabled");

    // Create computer field
    this.computerField = this.makeField("computerfield");

    // Add autoplaced ships to computer field
    this.autoPlaceComputerShips();

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
      resetShipCell(cell);
      cell.classList.remove("water", "preview", "blocked", "miss"); // clear other game artifacts
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

    this.checkIfAllShipsPlaced();
  },

  // Mark invalid cells for ship placement
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
      // console.log(`Placed ${type} at (${row}, ${col}) ${orientation}`);
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

  // Handle player attack on computer field
  handlePlayerAttack: function (x, y) {
    if (!this.playerTurn) return;

    const cell = this.computerField.cells[y][x];

    cell.classList.add("disabled");

    if (cell.classList.contains("occupied")) {
      cell.classList.add("hit");
      const shipId = cell.dataset.shipId;

      if (this.isShipSunk(shipId, this.computerField.cells)) {
        this.updateMessage("Hit and sunk ship! You can shoot again.");
        this.markSunkShip(shipId, this.computerField.cells);
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

  // Computer's turn logic
  computerTurn: function () {
    if (this.playerTurn) return;

    const cells = this.playerField.cells;
    const state = this.aiState;

    let target;

    // If in target mode, follow up based on previous hit direction
    if (state.mode === "target" && state.lastHits.length > 0) {
      const [firstHit, ...rest] = state.lastHits;

      if (!state.direction && rest.length > 0) {
        // Determine direction from the first two hits
        const dx = rest[0].x - firstHit.x;
        const dy = rest[0].y - firstHit.y;
        state.direction = { dx, dy };
      }

      if (state.direction) {
        // Continue in same direction
        const last = state.lastHits[state.lastHits.length - 1];
        const x = last.x + state.direction.dx;
        const y = last.y + state.direction.dy;

        if (this.isValidAttackCell(x, y)) {
          target = { x, y };
        } else {
          // Try opposite direction
          const xOpp = firstHit.x - state.direction.dx;
          const yOpp = firstHit.y - state.direction.dy;
          if (this.isValidAttackCell(xOpp, yOpp)) {
            state.lastHits = [firstHit]; // Reset to first
            state.direction = {
              dx: -state.direction.dx,
              dy: -state.direction.dy,
            };
            target = { x: xOpp, y: yOpp };
          } else {
            // Reset AI
            this.resetAI();
            return this.computerTurn();
          }
        }
      } else {
        // No direction yet, try adjacent targets
        while (state.targets.length) {
          const next = state.targets.shift();
          if (this.isValidAttackCell(next.x, next.y)) {
            target = next;
            break;
          }
        }

        if (!target) {
          this.resetAI();
          return this.computerTurn();
        }
      }
    } else {
      // Hunt mode: pick random cell
      const available = this.getAvailablePlayerCells();
      if (available.length === 0) return;
      target = available[Math.floor(Math.random() * available.length)];
    }

    // Execute attack
    const cell = cells[target.y][target.x];
    cell.classList.add("disabled");

    if (cell.classList.contains("occupied")) {
      cell.classList.add("hit");
      const classList = Array.from(cell.classList);
      const shipClass = classList.find((c) => c.startsWith("ship-"));

      if (shipClass) {
        const match = shipClass.match(/^ship-(\w+)(-v)?-(\d+)/);
        if (match) {
          const type = match[1];
          const orientation = match[2] === "-v" ? "vertical" : "horizontal";
          const index = parseInt(match[3], 10);
          applyShipSprite(cell, type, orientation, index, false);
        }
      }

      const shipId = cell.dataset.shipId;
      this.updateMessage("Computer hit your ship!");

      state.mode = "target";
      state.lastHits.push({ x: target.x, y: target.y });

      const newTargets = this.getAdjacentCells(target.x, target.y, cells);

      // Add only new, non-duplicate cells
      newTargets.forEach((nt) => {
        if (!state.targets.some((t) => t.x === nt.x && t.y === nt.y)) {
          state.targets.push(nt);
        }
      });

      // Sort targets by distance from last hit
      if (this.isShipSunk(cell.dataset.shipId, cells)) {
        this.updateMessage("Computer sunk your ship!");
        this.markSunkShip(shipId, cells);
        if (this.checkGameOver()) return;
        this.resetAI();
        setTimeout(() => this.computerTurn(), 600);
      } else {
        setTimeout(() => this.computerTurn(), 600);
      }
    } else {
      cell.classList.add("miss");
      this.updateMessage("Computer missed. It's your turn.");
      this.playerTurn = true;

      // Remove invalid target from the queue
      state.lastTried = target; // Track last miss
      // Filter out the missed cell from adjacent targets
      state.targets = state.targets.filter(
        (t) => !(t.x === target.x && t.y === target.y)
      );

      if (state.mode === "target" && state.targets.length > 0) {
        setTimeout(() => this.computerTurn(), 600); // Continue targeting
      } else {
        this.playerTurn = true;
        this.resetAI(); // Only reset if no targets left
        this.updateMessage("Computer missed. It's your turn.");
      }
    }
  },

  // AI state management
  aiState: {
    mode: "hunt",
    lastHits: [],
    direction: null,
    targets: [],
  },

  isValidAttackCell: function (x, y) {
    return (
      x >= 0 &&
      x < 10 &&
      y >= 0 &&
      y < 10 &&
      !this.playerField.cells[y][x].classList.contains("disabled")
    );
  },

  resetAI: function () {
    this.aiState = {
      mode: "hunt",
      lastHits: [],
      direction: null,
      targets: [],
    };
  },

  // Check if there is enough space for a ship
  getAvailablePlayerCells: function () {
    const smallestShipSize = this.getSmallestRemainingShipSize(
      this.playerField.cells
    );

    return this.playerField.cells
      .flat()
      .filter((cell) => {
        if (
          cell.classList.contains("disabled") ||
          cell.classList.contains("sunk")
        ) {
          return false;
        }

        const x = +cell.dataset.x;
        const y = +cell.dataset.y;

        // Check if at least smallest ship fits in either direction
        const canFitHorizontally = this.checkSpace(
          x,
          y,
          smallestShipSize,
          "horizontal"
        );
        const canFitVertically = this.checkSpace(
          x,
          y,
          smallestShipSize,
          "vertical"
        );

        return canFitHorizontally || canFitVertically;
      })
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

  // Check if a ship is sunk
  isShipSunk: function (shipId, cells) {
    let found = 0;
    let hit = 0;

    for (const row of cells) {
      for (const cell of row) {
        if (cell.dataset.shipId === shipId) {
          found++;
          if (cell.classList.contains("hit")) hit++;
        }
      }
    }

    console.log(`Ship ID: ${shipId}, Found: ${found}, Hit: ${hit}`);
    return found > 0 && found === hit;
  },

  // Mark a sunk ship visually
  markSunkShip: function (shipId, cells) {
    let shipCells = [];

    // Collect all ship parts
    for (const row of cells) {
      for (const cell of row) {
        if (cell.dataset.shipId === shipId) {
          shipCells.push(cell);
        }
      }
    }

    // Determine orientation
    const isVertical =
      shipCells.length > 1 && shipCells[0].dataset.x === shipCells[1].dataset.x;

    // Get ship type from an already assigned class or infer from size
    const shipSize = shipCells.length;
    let shipType = "";

    if (shipSize === 2) shipType = "corvette";
    else if (shipSize === 3) shipType = "battleship";
    else if (shipSize === 4) shipType = "destroyer";
    else if (shipSize === 5) shipType = "submarine";

    // Apply styling classes
    shipCells.forEach((cell, index) => {
      const className = isVertical
        ? `ship-${shipType}-v-${index}`
        : `ship-${shipType}-${index}`;
      cell.classList.add("hit", "disabled", "sunk", className);
      applyShipSprite(
        cell,
        shipType,
        isVertical ? "vertical" : "horizontal",
        index,
        true
      );
    });
  },

  // Detect if the game is over
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

  // Get the number of remaining ships on the field
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

  // End the game with a message and restart option
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
      document.querySelector(".popup-overlay").remove();
      this.restartGame();
    });

    popup.appendChild(resultText);
    popup.appendChild(restartButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  },

  // Restart the game
  restartGame: function () {
    // Reset key variables
    this.selectedShip = null;
    this.removalMode = false;
    this.playerTurn = true;
    this.shipIdCounter = 0;
    this.shipInventory = {};
    this.aiState = {
      mode: "hunt",
      lastHits: [],
      direction: null,
      targets: [],
    };

    // Clear main content
    const main = document.querySelector("main");
    main.innerHTML = "";

    // Recreate main game layout
    const newMain = this.makeMain();
    document.body.replaceChild(newMain, main);

    // Reset button text
    this.restartButton.textContent = "Restart";

    // Reinitialize ship counts
    for (const type in this.shipInventory) {
      const info = this.shipInventory[type];
      info.count = info.originalCount;
      info.countCell.textContent = info.originalCount;
    }

    this.updateMessage(
      "Welcome to Sink Ship! Build your fleet and start the game."
    );
  },

  // Double-check if the user wants to restart
  showRestartConfirmation: function () {
    // Create container
    const container = document.createElement("div");
    container.classList.add("popup-overlay");

    // Create popup content
    const content = document.createElement("div");
    content.classList.add("popup");

    const message = document.createElement("p");
    message.textContent = "Are you sure you want to restart the game?";
    content.appendChild(message);

    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("popup-buttons");

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Yes, restart";
    confirmBtn.classList.add("button");
    confirmBtn.addEventListener("click", () => {
      container.remove();
      this.restartGame();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("button");
    cancelBtn.addEventListener("click", () => {
      container.remove();
    });

    buttonWrapper.appendChild(confirmBtn);
    buttonWrapper.appendChild(cancelBtn);
    content.appendChild(buttonWrapper);
    container.appendChild(content);
    document.body.appendChild(container);
  },

  // Get the smallest remaining ship size from the player's field
  getSmallestRemainingShipSize: function (cells) {
    const sizes = new Set();

    for (const row of cells) {
      for (const cell of row) {
        if (
          cell.classList.contains("occupied") &&
          !cell.classList.contains("hit")
        ) {
          const id = cell.dataset.shipId;
          sizes.add(id); // unique ships
        }
      }
    }

    // Assume standard sizes
    const shipSizes = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
    };

    for (const row of cells) {
      for (const cell of row) {
        if (
          cell.classList.contains("occupied") &&
          !cell.classList.contains("hit")
        ) {
          const id = cell.dataset.shipId;
          if (!shipSizes[id]) {
            shipSizes[id] = 0;
          }
          shipSizes[id]++;
        }
      }
    }

    const uniqueSizes = Object.values(shipSizes).filter((s) => s > 0);
    return Math.min(...uniqueSizes, 2); // fallback to 2
  },

  // Check if there is enough space for a ship at the given coordinates
  checkSpace: function (x, y, size, orientation) {
    const cells = this.playerField.cells;

    for (let i = 0; i < size; i++) {
      let nx = x;
      let ny = y;

      if (orientation === "horizontal") nx += i;
      else ny += i;

      if (nx >= 10 || ny >= 10) return false;

      const cell = cells[ny][nx];
      if (
        cell.classList.contains("hit") ||
        cell.classList.contains("miss") ||
        cell.classList.contains("sunk")
      ) {
        return false;
      }
    }
    return true;
  },
};

// Function to apply ship sprite based on type, orientation, and index to avoid long styling code
function applyShipSprite(cell, type, orientation, index, isSunk = false) {
  const waterPos = "0 0";
  const bgSize = "600% 500%, 600% 500%";

  let shipPos = getShipSpritePosition(type, orientation, index);

  // If it's a hit (but not sunk), use hit layer
  if (cell.classList.contains("hit") && !isSunk) {
    shipPos = "-100% 0"; // Position of the hit icon in ships.webp
  }

  const bgImage = isSunk
    ? "url('images/sunken_ships.svg'), url('images/ships.webp')"
    : "url('images/ships.webp'), url('images/ships.webp')";

  cell.classList.add("ship");

  if (isSunk) {
    cell.classList.add("sunk", "hit");
  }

  cell.style.backgroundImage = bgImage;
  cell.style.backgroundSize = bgSize;
  cell.style.backgroundPosition = `${shipPos}, ${waterPos}`;
  cell.style.backgroundColor = "";
}

function getShipSpritePosition(type, orientation, index) {
  const yOffset = {
    corvette: -100,
    battleship: -200,
    destroyer: -300,
    submarine: -400,
  };

  const xOffset = {
    corvette: 0,
    battleship: 0,
    destroyer: 0,
    submarine: 0,
  };

  const xShift = 100 * index;
  const yShift = yOffset[type];

  if (orientation === "horizontal") {
    return `${-xShift}% ${yShift}%`;
  } else {
    const xColumn = {
      corvette: -200,
      battleship: -300,
      destroyer: -400,
      submarine: -500,
    };
    return `${xColumn[type]}% ${-index * 100}%`;
  }
}

function resetShipCell(cell) {
  cell.className = "cell"; // Reset classes
  cell.style.backgroundImage = "";
  cell.style.backgroundSize = "";
  cell.style.backgroundPosition = "";
}
