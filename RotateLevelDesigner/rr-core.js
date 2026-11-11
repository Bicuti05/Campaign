// Node entry point of the designer core: `const RR = require("./rr-core.js")`.
// The browser loads the same files with <script> tags (see index.html), in this order.
require("./core/rr-math.js");
require("./core/rr-world.js");
require("./core/rr-sim.js");
require("./core/rr-level.js");
require("./core/rr-solver.js");
require("./core/rr-render.js");
module.exports = require("./core/rr-ns.js");
