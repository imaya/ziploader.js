/**
 * unit test settings for BusterJS.
 */
var config = module.exports;
var fs = require('fs');

config["minified"] = {
  rootPath: "../",
  sources: [
    "bin/ziploader.min.js"
  ],
  resources: [
    {
      path: "svg32.zip",
      content: fs.readFileSync('test/svg32.zip')
    }
  ],
  tests: [
    "test/browser-test.js"
  ],
  extensions: [require("buster-html-doc")]
};

