// Start program only when the DOM is fully loaded
window.addEventListener("load", function () {
  sinkship.init();
});

// Define the sinkship object
const sinkship = {
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
    const controls = this.makeDiv();
    controls.classList.add("controls");

    // Create fields container
    const fields = this.makeDiv();
    fields.classList.add("fields");

    // Create fields
    const playerField = this.makeField("playerfield");
    const computerField = this.makeField("computerfield");

    fields.appendChild(playerField);
    fields.appendChild(computerField);

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

    // Create 10×10 grid (y: rows, x: columns)
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");



        field.appendChild(cell);
      }
    }

    return field;
  },
};
