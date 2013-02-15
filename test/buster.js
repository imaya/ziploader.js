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
    },
    {
      path: "png32.zip",
      content: fs.readFileSync('test/png32.zip')
    }
  ],
  tests: [
    "test/browser-test.js"
  ],
  extensions: [require("buster-html-doc")]
};

config["develop"] = {
  rootPath: "../",
  sources: [
    "bin/ziploader_dev.min.js"
  ],
  resources: [
    {
      path: "directory.zip/access_bus.svg",
      content: fs.readFileSync('test/directory.zip/access_bus.svg')
},
    {
      path: "directory.zip/access_train.svg",
      content: fs.readFileSync('test/directory.zip/access_train.svg')
},
    {
      path: "directory.zip/access_walk.svg",
      content: fs.readFileSync('test/directory.zip/access_walk.svg')
    }
  ],
  tests: [
    "test/develop-test.js"
  ],
  extensions: [require("buster-html-doc")]
};