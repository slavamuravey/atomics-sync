'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./atomics-sync.cjs.min.js");
} else {
  module.exports = require("./atomics-sync.cjs.js");
}
