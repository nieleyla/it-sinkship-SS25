// Constants
const GAME_CONFIG = {
  GRID_SIZE: 10,
  SHIPS: [
    { count: 2, type: "Corvette", size: 2 },
    { count: 1, type: "Battleship", size: 3 },
    { count: 1, type: "Destroyer", size: 4 },
    { count: 1, type: "Submarine", size: 5 },
  ],
  TIMING: {
    COMPUTER_TURN_DELAY: 1000,      // Time in ms before computer makes its move
    COMPUTER_FIRST_TURN_DELAY: 1500, // Longer delay for first computer turn after player attack
  },
  CELL_CLASSES: {
    CELL: "cell",
    OCCUPIED: "occupied", 
    SHIP: "ship",
    WATER: "water",
    PREVIEW: "preview",
    BLOCKED: "blocked",
    HIT: "hit",
    MISS: "miss",
    SUNK: "sunk",
    DISABLED: "disabled",
    CLICKABLE: "clickable"
  },
  MESSAGES: {
    WELCOME: "Welcome to Sink Ship! Build your fleet and start the game.",
    GAME_START: "Game started! Click on the computer field to attack.",
    HIT: "Hit! You can shoot again.",
    HIT_SUNK: "Hit and sunk ship! You can shoot again.",
    MISS_PLAYER: "Miss! Now it's computer's turn.",
    MISS_COMPUTER: "Computer missed. It's your turn.",
    COMPUTER_HIT: "Computer hit your ship!",
    COMPUTER_SUNK: "Computer sunk your ship!",
    PLAYER_WIN: "🎉 You win! All enemy ships have been sunk.",
    COMPUTER_WIN: "💥 You lost! All your ships have been sunk.",
    INVALID_PLACEMENT: "Invalid placement!",
    NO_SHIPS: "No more ships available.",
    RESTART_CONFIRM: "Are you sure you want to restart the game?"
  },
  COMPUTER_MOODS: {
    READY: "mood-look-down",
    THINKING: "mood-puzzled", 
    HIT_BY_PLAYER: "mood-cry",
    SHIP_SUNK_BY_PLAYER: "mood-wrrr",
    HIT_PLAYER: "mood-smile",
    SUNK_PLAYER_SHIP: "mood-happy",
    LOST: "mood-sad-dizzy",
    WON: "mood-tongue"
  },
  DIRECTIONS: [
    { x: 0, y: -1 }, // North
    { x: 1, y: 0 },  // East
    { x: 0, y: 1 },  // South
    { x: -1, y: 0 }  // West
  ]
};

window.addEventListener("load", function () {
  sinkship.init();
});

// Define the sinkship object
const sinkship = {
  playerField: [],
  computerField: [],
  shipInventory: {},
  selectedShip: null,
  removalMode: false,
  isMobile: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  playerTurn: true,
  shipIdCounter: 0,
  aiState: {
    mode: "hunt",
    lastHits: [],
    direction: null,
    targets: [],
  },
  currentComputerMood: GAME_CONFIG.COMPUTER_MOODS.READY,

  init: function () {
    try {
      document.body.appendChild(this.makeHeader());
      document.body.appendChild(this.makeMain());
      document.body.appendChild(this.makeFooter());
    } catch (error) {
      console.error("Failed to initialize game:", error);
    }
  },

  // Create and return the header element
  makeHeader: function () {
    const header = document.createElement("header");
    const limiter = this.makeLimiter();

    const headline = document.createElement("h1");
    headline.textContent = "Sink Ship";
    headline.classList.add("title");
    limiter.appendChild(headline);

    const copyright = document.createElement("p");
    copyright.innerHTML = "by Leyla Niederberger";
    copyright.classList.add("subtitle");
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
    const messageArea = this.createMessageArea();

    // Create computer mood display
    const moodDisplay = this.createComputerMoodDisplay();

    // Create fields container
    const fields = this.makeDiv();
    fields.classList.add("fields");

    // Create and store field objects
    this.playerField = this.makeField("playerfield");
    this.addPlayerFieldEventListeners();

    this.menu = this.buildMenu();

    fields.appendChild(this.playerField.field);
    fields.appendChild(this.menu.field);

    limiter.appendChild(controls);
    limiter.appendChild(messageArea);
    limiter.appendChild(moodDisplay);
    limiter.appendChild(fields);

    return main;
  },

  // Create and return the footer element
  makeFooter: function () {
    const footer = document.createElement("footer");
    const limiter = this.makeLimiter();

    const footerLine = document.createElement("p");
    footerLine.innerHTML = "&copy; Leyla Niederberger 2025";
    footerLine.classList.add("copyright");

    const attribution = document.createElement("p");
    attribution.innerHTML = "Icons: Tabler Icons";
    attribution.classList.add("attribution");

    limiter.appendChild(footerLine);
    limiter.appendChild(attribution);
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

  // Create message area
  createMessageArea: function () {
    const messageArea = this.makeDiv();
    messageArea.classList.add("message-area");
    messageArea.textContent = GAME_CONFIG.MESSAGES.WELCOME;
    return messageArea;
  },

  // Create a 10x10 grid field with cells to hold ships
  makeField: function (id) {
    const field = this.makeDiv();
    field.classList.add("field");
    field.id = id;

    const cells = []; // Array to hold cell elements

    // Create grid
    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        const cell = this.createCell(x, y);
        field.appendChild(cell);
        row.push(cell);
      }
      cells.push(row);
    }

    return { field, cells };
  },

  // Create a single cell
  createCell: function (x, y) {
    const cell = document.createElement("div");
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.CELL);
    cell.dataset.x = x;
    cell.dataset.y = y;
    return cell;
  },

  // Add event listeners to player field
  addPlayerFieldEventListeners: function () {
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
  },

  // Create the control panel with buttons
  makeControls: function () {
    const controls = this.makeDiv();
    controls.classList.add("controls");

    // Create buttons
    this.restartButton = this.createButton("Restart", () => this.showRestartConfirmation());
    this.autoPlaceButton = this.createButton("Auto Place Ships", () => this.autoPlaceShips());
    this.startButton = this.createButton("Start Game", null, true);

    controls.appendChild(this.restartButton);
    controls.appendChild(this.autoPlaceButton);
    controls.appendChild(this.startButton);

    return controls;
  },

  // Create a button with common properties
  createButton: function (text, clickHandler, disabled = false) {
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add("button");
    
    if (disabled) {
      button.disabled = true;
      button.classList.add("disabled");
    }
    
    if (clickHandler) {
      button.addEventListener("click", clickHandler);
    }
    
    return button;
  },

  // Create menu with ship options
  buildMenu: function () {
    const field = this.makeDiv();
    field.id = "menu";
    field.classList.add("field");

    const table = this.createMenuTable();
    const removeButton = this.createRemoveButton();

    field.appendChild(table);
    field.appendChild(removeButton);

    return { field };
  },

  // Create menu table with ship options
  createMenuTable: function () {
    const table = document.createElement("table");
    
    // Create header
    const thead = this.createTableHeader();
    table.appendChild(thead);

    // Create body with ship rows
    const tbody = this.createTableBody();
    table.appendChild(tbody);

    return table;
  },

  // Create table header
  createTableHeader: function () {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Count", "", "", "Type", "Size"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    return thead;
  },

  // Create table body with ship rows
  createTableBody: function () {
    const tbody = document.createElement("tbody");

    GAME_CONFIG.SHIPS.forEach((ship) => {
      const row = this.createShipRow(ship);
      tbody.appendChild(row);
    });

    return tbody;
  },

  // Create a single ship row
  createShipRow: function (ship) {
    const row = document.createElement("tr");

    // Count cell
    const countCell = document.createElement("td");
    countCell.textContent = ship.count;
    row.appendChild(countCell);

    // Store inventory count
    this.shipInventory[ship.type] = {
      count: ship.count,
      originalCount: ship.count,
      countCell: countCell,
      size: ship.size,
      optionCells: [], // Will store the clickable ship option cells
    };

    // Create ship option cells
    const hCell = this.createShipOptionCell(ship, "horizontal");
    const vCell = this.createShipOptionCell(ship, "vertical");
    
    row.appendChild(hCell);
    row.appendChild(vCell);

    // Type cell
    const typeCell = document.createElement("td");
    typeCell.textContent = ship.type;
    row.appendChild(typeCell);

    // Size cell
    const sizeCell = document.createElement("td");
    sizeCell.textContent = ship.size;
    row.appendChild(sizeCell);

    return row;
  },

  // Create ship option cell with event listeners
  createShipOptionCell: function (ship, orientation) {
    const cell = document.createElement("td");
    const option = document.createElement("div");
    option.classList.add("ship-option");
    
    if (orientation === "vertical") {
      option.classList.add("v");
    }
    
    cell.appendChild(option);

    cell.addEventListener("click", () => {
      this.selectShip(ship, orientation);
    });

    // Store reference to this option cell for later enabling/disabling
    if (!this.shipInventory[ship.type]) {
      this.shipInventory[ship.type] = { optionCells: [] };
    }
    this.shipInventory[ship.type].optionCells.push(cell);

    return cell;
  },

  // Select a ship for placement
  selectShip: function (ship, orientation) {
    // Check if ship is available
    const inventory = this.shipInventory[ship.type];
    if (!inventory || inventory.count <= 0) {
      this.showMessage(GAME_CONFIG.MESSAGES.NO_SHIPS);
      return;
    }

    // Clear previous selection styling and blocked cells
    this.clearShipSelection();
    if (this.isMobile) {
      this.clearBlockedCells();
    }

    this.selectedShip = {
      type: ship.type,
      size: ship.size,
      orientation: orientation,
    };
    
    // Add visual feedback for selected ship
    this.highlightSelectedShip(ship, orientation);
    
    // Show selection message
    const orientationText = orientation === "horizontal" ? "horizontal" : "vertical";
    this.showMessage(`${ship.type} selected for ${orientationText} placement. Click on the grid to place it.`);
    
    // Mark invalid cells for mobile after setting the selected ship
    if (this.isMobile) {
      this.markInvalidCells();
    }
  },

  // Create remove button
  createRemoveButton: function () {
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove Ships";
    removeButton.classList.add("button", "remove-button");

    removeButton.addEventListener("click", () => {
      this.toggleRemovalMode(removeButton);
    });

    return removeButton;
  },

  // Toggle removal mode
  toggleRemovalMode: function (button) {
    this.selectedShip = null;
    this.clearShipSelection();
    this.removalMode = !this.removalMode;
    button.classList.toggle("active", this.removalMode);
    
    // Update button text and show message
    if (this.removalMode) {
      button.textContent = "Exit Remove Mode";
      this.showMessage("Removal mode active. Click on any ship to remove it.");
    } else {
      button.textContent = "Remove Ships";
      this.showMessage(GAME_CONFIG.MESSAGES.WELCOME);
    }
    
    // Clear blocked cells when no ship is selected (mobile)
    if (this.isMobile && !this.selectedShip) {
      this.clearBlockedCells();
    }
  },

  // Preview ship placement to show potential position
  previewShip: function (startRow, startCol) {
    const ship = this.selectedShip;
    if (!ship) return;

    const cells = this.playerField.cells;
    const shipCells = this.getShipCells(startRow, startCol, ship.orientation, ship.size);
    
    // Check if ship fits and can be placed
    const isValid = this.isValidPlacement(startRow, startCol, ship.orientation, ship.size);
    const className = isValid ? GAME_CONFIG.CELL_CLASSES.PREVIEW : GAME_CONFIG.CELL_CLASSES.BLOCKED;

    // Apply preview styling to valid cells
    shipCells.forEach(({ x, y }) => {
      if (this.isInBounds(x, y)) {
        cells[y][x].classList.add(className);
      }
    });
  },

  // Utility function to get ship cell coordinates
  getShipCells: function (startRow, startCol, orientation, size) {
    const cells = [];
    for (let i = 0; i < size; i++) {
      const x = orientation === "horizontal" ? startCol + i : startCol;
      const y = orientation === "horizontal" ? startRow : startRow + i;
      cells.push({ x, y });
    }
    return cells;
  },

  // Check if coordinates are within bounds
  isInBounds: function (x, y) {
    return x >= 0 && x < GAME_CONFIG.GRID_SIZE && y >= 0 && y < GAME_CONFIG.GRID_SIZE;
  },

  // Check if placement is valid (fits in bounds and doesn't conflict with other ships)
  isValidPlacement: function (startRow, startCol, orientation, size) {
    return this.shipFitsInBounds(startRow, startCol, orientation, size) &&
           this.canPlaceShip(startRow, startCol, orientation, size);
  },

  // Check if ship fits within grid bounds
  shipFitsInBounds: function (startRow, startCol, orientation, size) {
    const endCol = orientation === "horizontal" ? startCol + size - 1 : startCol;
    const endRow = orientation === "horizontal" ? startRow : startRow + size - 1;
    return this.isInBounds(startCol, startRow) && this.isInBounds(endCol, endRow);
  },

  // Clear all preview classes from the field
  clearPreview: function () {
    this.playerField.cells.flat().forEach((cell) => {
      cell.classList.remove(GAME_CONFIG.CELL_CLASSES.PREVIEW);

      if (!this.isMobile || !this.selectedShip) {
        cell.classList.remove(GAME_CONFIG.CELL_CLASSES.BLOCKED);
      }
    });
  },

  // Place the selected ship at the specified coordinates
  placeShip: function (startRow, startCol) {
    if (!this.validateShipPlacement(startRow, startCol)) {
      return;
    }

    const ship = this.selectedShip;
    const inventory = this.shipInventory[ship.type];
    const shipId = `ship-${this.shipIdCounter++}`;
    const shipCells = this.getShipCells(startRow, startCol, ship.orientation, ship.size);

    // Place ship on grid
    this.placeShipOnGrid(shipCells, ship, shipId);

    // Update inventory
    this.updateInventory(inventory);

    // Handle post-placement logic
    this.handlePostPlacement(inventory);
  },

  // Validate ship placement
  validateShipPlacement: function (startRow, startCol) {
    const ship = this.selectedShip;
    if (!ship) return false;

    const inventory = this.shipInventory[ship.type];
    if (!inventory || inventory.count <= 0) {
      this.showMessage(GAME_CONFIG.MESSAGES.NO_SHIPS);
      return false;
    }

    if (!this.isValidPlacement(startRow, startCol, ship.orientation, ship.size)) {
      this.showMessage(GAME_CONFIG.MESSAGES.INVALID_PLACEMENT);
      return false;
    }

    return true;
  },

  // Place ship cells on the grid
  placeShipOnGrid: function (shipCells, ship, shipId) {
    const cells = this.playerField.cells;
    const type = ship.type.toLowerCase();

    shipCells.forEach(({ x, y }, index) => {
      const cell = cells[y][x];
      cell.classList.remove(GAME_CONFIG.CELL_CLASSES.PREVIEW);

      const className = ship.orientation === "horizontal"
        ? `ship-${type}-${index}`
        : `ship-${type}-v-${index}`;

      cell.dataset.shipId = shipId;
      cell.classList.add(className, GAME_CONFIG.CELL_CLASSES.OCCUPIED);
      applyShipSprite(cell, type, ship.orientation, index, false);
    });
  },

  // Update ship inventory after placement
  updateInventory: function (inventory) {
    inventory.count--;
    inventory.countCell.textContent = inventory.count;
    this.updateShipOptionsVisibility();
    this.checkIfAllShipsPlaced();
  },

  // Handle logic after ship placement
  handlePostPlacement: function (inventory) {
    const shipType = this.selectedShip.type;
    
    if (inventory.count === 0) {
      this.selectedShip = null;
      this.clearShipSelection();
      
      // Check if ALL ships are placed
      const allShipsPlaced = Object.values(this.shipInventory).every(entry => entry.count === 0);
      
      if (allShipsPlaced) {
        this.showMessage("All ships placed. Press 'Start Game' to begin battle.");
      } else {
        this.showMessage(`${shipType} placed! No more ${shipType}s available.`);
      }
      
      if (this.isMobile) {
        this.clearBlockedCells();
      }
    } else {
      this.showMessage(`${shipType} placed! ${inventory.count} more ${shipType}(s) available.`);
    }

    if (this.isMobile && this.selectedShip) {
      this.markInvalidCells();
    }
  },

  // Update visual state of ship options based on availability
  updateShipOptionsVisibility: function () {
    Object.keys(this.shipInventory).forEach(shipType => {
      const inventory = this.shipInventory[shipType];
      const isAvailable = inventory.count > 0;
      
      // Update all option cells for this ship type
      if (inventory.optionCells) {
        inventory.optionCells.forEach(cell => {
          if (isAvailable) {
            cell.classList.remove("disabled");
            cell.style.pointerEvents = "auto";
            cell.style.opacity = "1";
          } else {
            cell.classList.add("disabled");
            cell.style.pointerEvents = "none";
            cell.style.opacity = "0.5";
          }
        });
      }
    });
  },

  // Highlight the selected ship option
  highlightSelectedShip: function (ship, orientation) {
    const inventory = this.shipInventory[ship.type];
    if (!inventory || !inventory.optionCells) return;

    // Find the correct option cell (horizontal = index 0, vertical = index 1)
    const targetIndex = orientation === "horizontal" ? 0 : 1;
    const targetCell = inventory.optionCells[targetIndex];
    
    if (targetCell) {
      targetCell.classList.add("selected");
      targetCell.style.backgroundColor = "#17a2ff";
      targetCell.style.borderColor = "#ffffff";
      targetCell.style.boxShadow = "0 0 8px rgba(23, 162, 255, 0.6)";
    }
  },

  // Clear all ship selection highlighting
  clearShipSelection: function () {
    Object.keys(this.shipInventory).forEach(shipType => {
      const inventory = this.shipInventory[shipType];
      if (inventory && inventory.optionCells) {
        inventory.optionCells.forEach(cell => {
          cell.classList.remove("selected");
          cell.style.backgroundColor = "";
          cell.style.borderColor = "";
          cell.style.boxShadow = "";
        });
      }
    });
    
    // Clear blocked cells when no ship is selected (mobile)
    if (this.isMobile && !this.selectedShip) {
      this.clearBlockedCells();
    }
  },

  // Show message to user
  showMessage: function (message) {
    const messageArea = document.querySelector(".message-area");
    if (messageArea) {
      messageArea.textContent = message;
    } else {
      alert(message); // Fallback
    }
  },

  // Check if a ship can be placed at the specified coordinates
  canPlaceShip: function (startRow, startCol, orientation, length) {
    const cells = this.playerField.cells;
    const shipCells = this.getShipCells(startRow, startCol, orientation, length);

    // Check each ship cell and its neighbors
    for (const { x, y } of shipCells) {
      if (!this.isInBounds(x, y)) {
        return false;
      }

      // Check current cell and adjacent cells for conflicts
      const neighbors = this.getNeighborCells(x, y);
      for (const { x: nx, y: ny } of neighbors) {
        if (this.isInBounds(nx, ny) && cells[ny][nx].classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED)) {
          return false;
        }
      }
    }

    return true;
  },

  // Get neighbor cells (including the cell itself)
  getNeighborCells: function (x, y) {
    return [
      { x, y }, // current cell
      { x, y: y - 1 }, // north
      { x, y: y + 1 }, // south
      { x: x - 1, y }, // west
      { x: x + 1, y }, // east
    ];
  },

  // Remove a ship from the field
  removeShip: function (row, col) {
    const cell = this.playerField.cells[row][col];
    const classes = Array.from(cell.classList);
    const shipClass = classes.find((c) => c.startsWith("ship-"));
    if (!shipClass) {
      this.showMessage("No ship here. Click on a ship to remove it.");
      return;
    }

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
        if (!c.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED)) break;

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
      cell.classList.remove(GAME_CONFIG.CELL_CLASSES.WATER);
    });

    // Collect all parts of the ship
    shipCells.forEach((c) => resetShipCell(c));

    // Update inventory
    const inventory =
      this.shipInventory[type.charAt(0).toUpperCase() + type.slice(1)];
    if (inventory) {
      inventory.count++;
      inventory.countCell.textContent = inventory.count;
      this.updateShipOptionsVisibility();
      this.checkIfAllShipsPlaced();
      
      // Show success message
      const shipTypeName = type.charAt(0).toUpperCase() + type.slice(1);
      this.showMessage(`${shipTypeName} removed. Click another ship to remove it or exit remove mode.`);
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

    this.toggleStartButton(allPlaced);

    if (allPlaced) {
      this.addWaterCells();
    }
  },

  // Toggle start button state
  toggleStartButton: function (enabled) {
    this.startButton.disabled = !enabled;
    this.startButton.classList.toggle("disabled", !enabled);

    if (enabled && !this.startButton.dataset.listenerAdded) {
      this.startButton.addEventListener("click", () => {
        this.startGame();
      });
      this.startButton.dataset.listenerAdded = "true";
    }
  },

  // Add water cells to empty spaces
  addWaterCells: function () {
    this.playerField.cells.flat().forEach((cell) => {
      if (!cell.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED)) {
        cell.classList.add(GAME_CONFIG.CELL_CLASSES.WATER);
      }
    });
  },

  // Start Game and swap fields
  startGame: function () {
    this.showMessage(GAME_CONFIG.MESSAGES.GAME_START);
    this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.READY);
    this.disableSetupControls();
    this.clearMobileBlockedCells();
    this.setupComputerField();
    this.replaceMenuWithComputerField();
  },

  // Clear blocked cells when starting game (especially for mobile)
  clearMobileBlockedCells: function () {
    if (this.isMobile) {
      this.clearBlockedCells();
    }
    this.selectedShip = null;
  },

  // Disable setup phase controls
  disableSetupControls: function () {
    [this.autoPlaceButton, this.startButton].forEach(button => {
      button.disabled = true;
      button.classList.add("disabled");
    });
  },

  // Setup computer field with ships and event listeners
  setupComputerField: function () {
    this.computerField = this.makeField("computerfield");
    this.autoPlaceComputerShips();
    this.addComputerFieldEventListeners();
  },

  // Add event listeners to computer field
  addComputerFieldEventListeners: function () {
    this.computerField.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        cell.addEventListener("click", () => {
          if (!cell.classList.contains(GAME_CONFIG.CELL_CLASSES.DISABLED) && this.playerTurn) {
            this.handlePlayerAttack(x, y);
          }
        });

        cell.addEventListener("mouseover", () => {
          if (!cell.classList.contains(GAME_CONFIG.CELL_CLASSES.DISABLED)) {
            cell.classList.add(GAME_CONFIG.CELL_CLASSES.CLICKABLE);
          }
        });

        cell.addEventListener("mouseout", () => {
          cell.classList.remove(GAME_CONFIG.CELL_CLASSES.CLICKABLE);
        });
      });
    });
  },

  // Replace menu with computer field
  replaceMenuWithComputerField: function () {
    const fieldsContainer = this.playerField.field.parentNode;
    fieldsContainer.removeChild(this.menu.field);
    fieldsContainer.appendChild(this.computerField.field);
  },

  autoPlaceShips: function () {
    this.selectedShip = null;
    this.clearShipSelection();
    this.resetPlayerField();
    this.placeShipsRandomly(this.playerField.cells, true);
    this.checkIfAllShipsPlaced();
    this.showMessage("Ships automatically placed! Click 'Start Game' to begin battle.");
  },

  // Reset player field to initial state
  resetPlayerField: function () {
    // Reset ship inventory
    Object.keys(this.shipInventory).forEach((type) => {
      const inventory = this.shipInventory[type];
      inventory.count = inventory.originalCount;
      inventory.countCell.textContent = inventory.count;
    });
    
    // Update ship option visibility
    this.updateShipOptionsVisibility();

    // Clear all cells
    this.playerField.cells.flat().forEach((cell) => {
      resetShipCell(cell);
      cell.classList.remove(
        GAME_CONFIG.CELL_CLASSES.WATER, 
        GAME_CONFIG.CELL_CLASSES.PREVIEW, 
        GAME_CONFIG.CELL_CLASSES.BLOCKED, 
        GAME_CONFIG.CELL_CLASSES.MISS
      );
    });
  },

  // Place ships randomly on given field
  placeShipsRandomly: function (cells, isPlayerField = false) {
    const orientations = ["horizontal", "vertical"];
    const ships = isPlayerField ? Object.keys(this.shipInventory) : GAME_CONFIG.SHIPS;

    const getShipData = isPlayerField 
      ? (type) => ({ type, size: this.shipInventory[type].size, count: this.shipInventory[type].count })
      : (ship) => ship;

    const canPlaceFunction = isPlayerField 
      ? (row, col, orientation, size) => this.canPlaceShip(row, col, orientation, size)
      : (row, col, orientation, size) => this.canPlaceComputerShip(row, col, orientation, size, cells);

    const placeFunction = isPlayerField
      ? (row, col, orientation, size, type) => {
          this.selectedShip = { type, size, orientation };
          this.placeShip(row, col);
        }
      : (row, col, orientation, size, type) => this.placeComputerShip(row, col, orientation, size, type, cells);

    for (const shipData of ships) {
      const { type, size, count } = getShipData(shipData);
      
      for (let i = 0; i < count; i++) {
        if (!this.placeShipRandomly(orientations, canPlaceFunction, placeFunction, type, size)) {
          this.showMessage(`Could not auto-place ${type}`);
          return false;
        }
      }
    }
    return true;
  },

  // Attempt to place a single ship randomly
  placeShipRandomly: function (orientations, canPlaceFunction, placeFunction, type, size) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const orientation = orientations[Math.floor(Math.random() * orientations.length)];
      const row = Math.floor(Math.random() * GAME_CONFIG.GRID_SIZE);
      const col = Math.floor(Math.random() * GAME_CONFIG.GRID_SIZE);

      if (canPlaceFunction(row, col, orientation, size)) {
        placeFunction(row, col, orientation, size, type);
        placed = true;
      }
      attempts++;
    }

    return placed;
  },

  // Mark invalid cells for ship placement
  markInvalidCells: function () {
    const ship = this.selectedShip;
    if (!ship || !this.isMobile) return;

    const cells = this.playerField.cells;

    // Clear previous blocked cells
    this.clearBlockedCells();

    // Mark invalid starting positions
    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
      for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        if (!this.isValidPlacement(y, x, ship.orientation, ship.size)) {
          cells[y][x].classList.add(GAME_CONFIG.CELL_CLASSES.BLOCKED);
        }
      }
    }
  },

  // Clear blocked cells
  clearBlockedCells: function () {
    this.playerField.cells
      .flat()
      .forEach((cell) => cell.classList.remove(GAME_CONFIG.CELL_CLASSES.BLOCKED));
  },

  // Auto place ships on computer field
  autoPlaceComputerShips: function () {
    this.placeShipsRandomly(this.computerField.cells, false);
  },

  // Check if computer ship can be placed
  canPlaceComputerShip: function (row, col, orientation, size, cells) {
    const shipCells = this.getShipCells(row, col, orientation, size);

    for (const { x, y } of shipCells) {
      if (!this.isInBounds(x, y)) return false;

      const neighbors = this.getNeighborCells(x, y);
      for (const { x: nx, y: ny } of neighbors) {
        if (this.isInBounds(nx, ny) && cells[ny][nx].classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED)) {
          return false;
        }
      }
    }

    return true;
  },

  // Place computer ship on grid
  placeComputerShip: function (row, col, orientation, size, type, cells) {
    const shipId = `computer-ship-${this.shipIdCounter++}`;
    const shipCells = this.getShipCells(row, col, orientation, size);

    shipCells.forEach(({ x, y }) => {
      const cell = cells[y][x];
      cell.classList.add(GAME_CONFIG.CELL_CLASSES.OCCUPIED);
      cell.dataset.shipId = shipId;
    });
  },

  // Handle player attack on computer field
  handlePlayerAttack: function (x, y) {
    if (!this.playerTurn) return;

    const cell = this.computerField.cells[y][x];
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.DISABLED);
    cell.classList.remove(GAME_CONFIG.CELL_CLASSES.CLICKABLE);

    const isHit = cell.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED);
    
    if (isHit) {
      this.processPlayerHit(cell);
    } else {
      this.processPlayerMiss(cell);
    }

    if (this.checkGameOver()) return;

    // Proceed to computer's turn if it's not player's turn anymore
    if (!this.playerTurn) {
      setTimeout(() => this.computerTurn(), GAME_CONFIG.TIMING.COMPUTER_FIRST_TURN_DELAY);
    }
  },

  // Process player hit
  processPlayerHit: function (cell) {
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.HIT);
    const shipId = cell.dataset.shipId;

    if (this.isShipSunk(shipId, this.computerField.cells)) {
      this.showMessage(GAME_CONFIG.MESSAGES.HIT_SUNK);
      this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.SHIP_SUNK_BY_PLAYER);
      this.markSunkShip(shipId, this.computerField.cells);
    } else {
      this.showMessage(GAME_CONFIG.MESSAGES.HIT);
      this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.HIT_BY_PLAYER);
    }
  },

  // Process player miss
  processPlayerMiss: function (cell) {
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.MISS);
    this.showMessage(GAME_CONFIG.MESSAGES.MISS_PLAYER);
    this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.THINKING);
    this.playerTurn = false;
  },

  // Computer's turn logic
  computerTurn: function () {
    if (this.playerTurn) return;

    this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.THINKING);

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
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.DISABLED);

    if (cell.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED)) {
      cell.classList.add(GAME_CONFIG.CELL_CLASSES.HIT);
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
      this.showMessage(GAME_CONFIG.MESSAGES.COMPUTER_HIT);
      this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.HIT_PLAYER);

      state.mode = "target";
      state.lastHits.push({ x: target.x, y: target.y });

      this.addNewTargets(target, state, cells);

      if (this.isShipSunk(cell.dataset.shipId, cells)) {
        this.showMessage(GAME_CONFIG.MESSAGES.COMPUTER_SUNK);
        this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.SUNK_PLAYER_SHIP);
        this.markSunkShip(shipId, cells);
        if (this.checkGameOver()) return;
        this.resetAI();
        setTimeout(() => this.computerTurn(), GAME_CONFIG.TIMING.COMPUTER_TURN_DELAY);
      } else {
        setTimeout(() => this.computerTurn(), GAME_CONFIG.TIMING.COMPUTER_TURN_DELAY);
      }
    } else {
      this.processComputerMiss(cell, target, state);
    }
  },

  isValidAttackCell: function (x, y) {
    return (
      this.isInBounds(x, y) &&
      !this.playerField.cells[y][x].classList.contains(GAME_CONFIG.CELL_CLASSES.DISABLED)
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
          cell.classList.contains(GAME_CONFIG.CELL_CLASSES.DISABLED) ||
          cell.classList.contains(GAME_CONFIG.CELL_CLASSES.SUNK)
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

  // Add new targets for AI
  addNewTargets: function (target, state, cells) {
    const newTargets = this.getAdjacentCells(target.x, target.y, cells);
    
    // Add only new, non-duplicate cells
    newTargets.forEach((nt) => {
      if (!state.targets.some((t) => t.x === nt.x && t.y === nt.y)) {
        state.targets.push(nt);
      }
    });
  },

  // Process computer miss
  processComputerMiss: function (cell, target, state) {
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.MISS);
    this.showMessage(GAME_CONFIG.MESSAGES.MISS_COMPUTER);
    this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.READY);
    this.playerTurn = true;

    // Filter out the missed cell from adjacent targets
    state.targets = state.targets.filter(
      (t) => !(t.x === target.x && t.y === target.y)
    );

    if (state.mode === "target" && state.targets.length > 0) {
      setTimeout(() => this.computerTurn(), GAME_CONFIG.TIMING.COMPUTER_TURN_DELAY);
    } else {
      this.playerTurn = true;
      this.resetAI();
      this.showMessage(GAME_CONFIG.MESSAGES.MISS_COMPUTER);
    }
  },

  getAdjacentCells: function (x, y, cells) {
    const targets = [];

    GAME_CONFIG.DIRECTIONS.forEach((dir) => {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (this.isInBounds(newX, newY)) {
        const cell = cells[newY][newX];
        if (!cell.classList.contains(GAME_CONFIG.CELL_CLASSES.DISABLED)) {
          targets.push({ x: newX, y: newY });
        }
      }
    });

    return targets;
  },

  // Check if a ship is sunk
  isShipSunk: function (shipId, cells) {
    let found = 0;
    let hit = 0;

    for (const row of cells) {
      for (const cell of row) {
        if (cell.dataset.shipId === shipId) {
          found++;
          if (cell.classList.contains(GAME_CONFIG.CELL_CLASSES.HIT)) hit++;
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
      cell.classList.add(GAME_CONFIG.CELL_CLASSES.HIT, GAME_CONFIG.CELL_CLASSES.DISABLED, GAME_CONFIG.CELL_CLASSES.SUNK, className);
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
      this.endGame(GAME_CONFIG.MESSAGES.PLAYER_WIN);
      return true;
    }

    if (playerShips === 0) {
      this.endGame(GAME_CONFIG.MESSAGES.COMPUTER_WIN);
      return true;
    }

    return false;
  },

  // Get the number of remaining ships on the field
  getRemainingShips: function (cells) {
    const remainingShips = new Set();
    cells.flat().forEach(cell => {
      if (cell.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED) &&
          !cell.classList.contains(GAME_CONFIG.CELL_CLASSES.HIT)) {
        remainingShips.add(cell.dataset.shipId);
      }
    });
    return remainingShips.size;
  },

  // End the game with a message and restart option
  endGame: function (message) {
    this.playerTurn = false;
    
    // Update computer mood based on who won
    if (message === GAME_CONFIG.MESSAGES.PLAYER_WIN) {
      this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.LOST);
    } else if (message === GAME_CONFIG.MESSAGES.COMPUTER_WIN) {
      this.updateComputerMood(GAME_CONFIG.COMPUTER_MOODS.WON);
    }
    
    this.disableComputerField();
    this.showGameEndPopup(message);
  },

  // Disable computer field interaction
  disableComputerField: function () {
    this.computerField.cells.flat().forEach((cell) => {
      cell.classList.add(GAME_CONFIG.CELL_CLASSES.DISABLED);
      cell.classList.remove(GAME_CONFIG.CELL_CLASSES.CLICKABLE);
    });
  },

  // Show game end popup
  showGameEndPopup: function (message) {
    const overlay = this.createPopupOverlay();
    const popup = this.createPopup();

    const resultText = document.createElement("h2");
    resultText.textContent = message;

    // Add computer mood display to the popup
    const popupMoodDisplay = this.createPopupMoodDisplay();

    const restartButton = this.createButton("Restart Game", () => {
      document.querySelector(".popup-overlay").remove();
      this.restartGame();
    });
    restartButton.className = "button restart-button";

    popup.appendChild(resultText);
    popup.appendChild(popupMoodDisplay);
    popup.appendChild(restartButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  },

  // Create popup overlay element
  createPopupOverlay: function () {
    const overlay = document.createElement("div");
    overlay.classList.add("popup-overlay");
    return overlay;
  },

  // Create popup element
  createPopup: function () {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    return popup;
  },

  // Create computer mood display for popup
  createPopupMoodDisplay: function () {
    const moodContainer = this.makeDiv();
    moodContainer.classList.add("popup-mood");
    
    const moodLabel = document.createElement("span");
    moodLabel.textContent = "CPU: ";
    moodLabel.classList.add("popup-mood-label");
    
    const moodIcon = document.createElement("div");
    moodIcon.classList.add("popup-mood-icon");
    moodIcon.innerHTML = this.getMoodSVG(this.currentComputerMood);
    
    moodContainer.appendChild(moodLabel);
    moodContainer.appendChild(moodIcon);
    
    return moodContainer;
  },

  // Restart the game
  restartGame: function () {
    // Reset key variables
    this.selectedShip = null;
    this.removalMode = false;
    this.playerTurn = true;
    this.shipIdCounter = 0;
    this.shipInventory = {};
    this.currentComputerMood = GAME_CONFIG.COMPUTER_MOODS.READY;
    this.aiState = {
      mode: "hunt",
      lastHits: [],
      direction: null,
      targets: [],
    };
    
    // Clear any blocked cells from mobile mode
    if (this.isMobile) {
      this.clearBlockedCells();
    }

    // Clear ship selection highlighting
    this.clearShipSelection();

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

    // Reset remove button text if it was in removal mode
    const removeButton = document.querySelector(".remove-button");
    if (removeButton) {
      removeButton.textContent = "Remove Ships";
      removeButton.classList.remove("active");
    }

    this.showMessage(GAME_CONFIG.MESSAGES.WELCOME);
  },

  // Double-check if the user wants to restart
  showRestartConfirmation: function () {
    const container = this.createPopupOverlay();
    const content = this.createPopup();

    const message = document.createElement("p");
    message.textContent = GAME_CONFIG.MESSAGES.RESTART_CONFIRM;
    content.appendChild(message);

    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("popup-buttons");

    const confirmBtn = this.createButton("Yes, restart", () => {
      container.remove();
      this.restartGame();
    });

    const cancelBtn = this.createButton("Cancel", () => {
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
          cell.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED) &&
          !cell.classList.contains(GAME_CONFIG.CELL_CLASSES.HIT)
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
          cell.classList.contains(GAME_CONFIG.CELL_CLASSES.OCCUPIED) &&
          !cell.classList.contains(GAME_CONFIG.CELL_CLASSES.HIT)
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

              if (!this.isInBounds(nx, ny)) return false;

      const cell = cells[ny][nx];
      if (
        cell.classList.contains(GAME_CONFIG.CELL_CLASSES.HIT) ||
        cell.classList.contains(GAME_CONFIG.CELL_CLASSES.MISS) ||
        cell.classList.contains(GAME_CONFIG.CELL_CLASSES.SUNK)
      ) {
        return false;
      }
    }
    return true;
  },

  // Create computer mood display
  createComputerMoodDisplay: function () {
    const moodContainer = this.makeDiv();
    moodContainer.classList.add("computer-mood");
    
    const moodLabel = document.createElement("span");
    moodLabel.textContent = "CPU: ";
    moodLabel.classList.add("mood-label");
    
    const moodIcon = document.createElement("div");
    moodIcon.classList.add("mood-icon");
    moodIcon.innerHTML = this.getMoodSVG(this.currentComputerMood);
    
    moodContainer.appendChild(moodLabel);
    moodContainer.appendChild(moodIcon);
    
    return moodContainer;
  },

  // Get SVG content for mood icon
  getMoodSVG: function (moodName) {
    const svgMap = {
      [GAME_CONFIG.COMPUTER_MOODS.READY]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M9 13h.01" /><path d="M15 13h.01" /><path d="M11 17h2" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.THINKING]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.986 3.51a9 9 0 1 0 1.514 16.284c2.489 -1.437 4.181 -3.978 4.5 -6.794" /><path d="M10 10h.01" /><path d="M14 8h.01" /><path d="M12 15c1 -1.333 2 -2 3 -2" /><path d="M20 9v.01" /><path d="M20 6a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.HIT_BY_PLAYER]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" /><path d="M17.566 17.606a2 2 0 1 0 2.897 .03l-1.463 -1.636l-1.434 1.606z" /><path d="M20.865 13.517a8.937 8.937 0 0 0 .135 -1.517a9 9 0 1 0 -9 9c.69 0 1.36 -.076 2 -.222" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.SHIP_SUNK_BY_PLAYER]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z" /><path d="M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1" /><path d="M8.5 11.5l1.5 -1.5l-1.5 -1.5" /><path d="M15.5 11.5l-1.5 -1.5l1.5 -1.5" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.HIT_PLAYER]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.SUNK_PLAYER_SHIP]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 9l.01 0" /><path d="M15 9l.01 0" /><path d="M8 13a4 4 0 1 0 8 0h-8" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.LOST]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M14.5 16.05a3.5 3.5 0 0 0 -5 0" /><path d="M8 9l2 2" /><path d="M10 9l-2 2" /><path d="M14 9l2 2" /><path d="M16 9l-2 2" /></svg>`,
      [GAME_CONFIG.COMPUTER_MOODS.WON]: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mood-svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M10 14v2a2 2 0 0 0 4 0v-2m1.5 0h-7" /></svg>`
    };
    
    return svgMap[moodName] || svgMap[GAME_CONFIG.COMPUTER_MOODS.READY];
  },

  // Update computer mood display
  updateComputerMood: function (newMood) {
    this.currentComputerMood = newMood;
    const moodIcon = document.querySelector(".mood-icon");
    if (moodIcon) {
      moodIcon.innerHTML = this.getMoodSVG(newMood);
    }
  },
};

// Function to apply ship sprite based on type, orientation, and index to avoid long styling code
function applyShipSprite(cell, type, orientation, index, isSunk = false) {
  const waterPos = "0 0";
  const bgSize = "600% 500%, 600% 500%";

  let shipPos = getShipSpritePosition(type, orientation, index);

  cell.classList.add(GAME_CONFIG.CELL_CLASSES.OCCUPIED);

  // If it's a hit (but not sunk), use hit layer
  if (cell.classList.contains(GAME_CONFIG.CELL_CLASSES.HIT) && !isSunk) {
    shipPos = "-100% 0"; // Position of the hit icon in ships.webp
  }

  const bgImage = isSunk
    ? "url('images/sunken_ships.webp'), url('images/ships.webp')"
    : "url('images/ships.webp'), url('images/ships.webp')";

  cell.classList.add(GAME_CONFIG.CELL_CLASSES.SHIP);

  if (isSunk) {
    cell.classList.add(GAME_CONFIG.CELL_CLASSES.SUNK, GAME_CONFIG.CELL_CLASSES.HIT);
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
  cell.className = GAME_CONFIG.CELL_CLASSES.CELL; // Reset classes
  cell.classList.remove(GAME_CONFIG.CELL_CLASSES.BLOCKED);
  cell.style.backgroundImage = "";
  cell.style.backgroundSize = "";
  cell.style.backgroundPosition = "";
}
