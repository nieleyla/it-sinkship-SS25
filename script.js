// Start program only when the DOM is fully loaded
window.addEventListener("load", function () {
  sinkship.init();
});

// Define the sinkship object
const sinkship = {
  playerField: [],
  computerField: [],

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
    this.computerField = this.makeField("computerfield");

    this.launchShip();

    fields.appendChild(this.playerField.field);
    fields.appendChild(this.computerField.field);

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
    for (let x = 0; x < 10; x++) {
      const row = [];
      for (let y = 0; y < 10; y++) {
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

  launchShip: function () {
    // Hardcoded ship in playerField at row 2, columns 4-6
    const cells = this.playerField.cells;

    cells[2][4].classList.add("left");
    cells[2][5].classList.add("horizontal");
    cells[2][6].classList.add("right");
  },
};
