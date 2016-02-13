var path = require("path");
var fs = require("fs");

var INTERNALS = ["assert", "buffer", "child_process", "cluster", "crypto",
    "dns", "domain", "events", "fs", "http", "https", "net", "os", "path",
    "punycode", "querystring", "readline", "stream", "string_decoder",
    "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib"];

module.exports = function(babel) {
  var folderPath;
  var pkgPath;
  var pkg;
  var externals;
  var map = {};

  return {
    visitor: {
      Program: function(_path, state) {
        folderPath = path.resolve(state.opts.folder);
        pkgPath = path.join(folderPath, state.opts.package || "package.json");
        pkg = require(pkgPath);
        externals = Object.keys(pkg.dependencies);
      },

      ImportDeclaration: function(_path, parent) {
        var sourceNode = _path.get("source").node;
        var source = sourceNode.value.trim();

        if (source.indexOf(folderPath) === 0 ||
            INTERNALS.indexOf(source) !== -1 || source.startsWith("/")) {
          return;
        }

        if (source === pkgPath || source === "package.json") {
          sourceNode.value = pkgPath;
          return;
        }

        if (source.startsWith("../")) {
          sourceNode.value = path.join(folderPath, source);
        }

        for (var i = 0, external; i < externals.length; ++i) {
          external = externals[i];
          if (external.startsWith(source)) {
            return;
          }
        }

        var newPath = path.join(folderPath, source);
        var found = false;
        try {
          fs.statSync(newPath);
          sourceNode.value = newPath;
          found = true;
        } catch(e) { }

        if (!found) {
          newPath += ".js";
          try {
            fs.statSync(newPath);
            sourceNode.value = newPath;
            found = true;
          } catch(e) {
            return;
          }
        }

        if(found) {
          map[source] = newPath;
        }
      },

      CallExpression(_path, state) {
        var callee = _path.get("callee");

        if (babel.types.isIdentifier(callee.node, { name: "require" })) {
          var args = _path.get("arguments");
          if (args.length > 0) {
            var file = args[0].node.value;

            if (!map[file] || INTERNALS.indexOf(file) !== -1 ||
                file.startsWith("/")) {
              return;
            }

            _path.replaceWith(
              babel.types.callExpression(callee.node, [
                babel.types.stringLiteral(map[file])
              ])
            );
          }
        }
      }
    }
  }
};
