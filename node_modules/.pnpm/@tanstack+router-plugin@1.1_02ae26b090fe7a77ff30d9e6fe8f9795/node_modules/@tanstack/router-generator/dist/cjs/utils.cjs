"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fsp = require("node:fs/promises");
const path = require("node:path");
const prettier = require("prettier");
const rootPathId = require("./filesystem/physical/rootPathId.cjs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fsp__namespace = /* @__PURE__ */ _interopNamespaceDefault(fsp);
const prettier__namespace = /* @__PURE__ */ _interopNamespaceDefault(prettier);
function multiSortBy(arr, accessors = [(d) => d]) {
  return arr.map((d, i) => [d, i]).sort(([a, ai], [b, bi]) => {
    for (const accessor of accessors) {
      const ao = accessor(a);
      const bo = accessor(b);
      if (typeof ao === "undefined") {
        if (typeof bo === "undefined") {
          continue;
        }
        return 1;
      }
      if (ao === bo) {
        continue;
      }
      return ao > bo ? 1 : -1;
    }
    return ai - bi;
  }).map(([d]) => d);
}
function cleanPath(path2) {
  return path2.replace(/\/{2,}/g, "/");
}
function trimPathLeft(path2) {
  return path2 === "/" ? path2 : path2.replace(/^\/{1,}/, "");
}
function removeLeadingSlash(path2) {
  return path2.replace(/^\//, "");
}
function removeTrailingSlash(s) {
  return s.replace(/\/$/, "");
}
const BRACKET_CONTENT_RE = /\[(.*?)\]/g;
function determineInitialRoutePath(routePath) {
  const DISALLOWED_ESCAPE_CHARS = /* @__PURE__ */ new Set([
    "/",
    "\\",
    "?",
    "#",
    ":",
    "*",
    "<",
    ">",
    "|",
    "!",
    "$",
    "%"
  ]);
  const parts = routePath.split(new RegExp("(?<!\\[)\\.(?!\\])", "g"));
  const escapedParts = parts.map((part) => {
    let match;
    while ((match = BRACKET_CONTENT_RE.exec(part)) !== null) {
      const character = match[1];
      if (character === void 0) continue;
      if (DISALLOWED_ESCAPE_CHARS.has(character)) {
        console.error(
          `Error: Disallowed character "${character}" found in square brackets in route path "${routePath}".
You cannot use any of the following characters in square brackets: ${Array.from(
            DISALLOWED_ESCAPE_CHARS
          ).join(", ")}
Please remove and/or replace them.`
        );
        process.exit(1);
      }
    }
    return part.replace(BRACKET_CONTENT_RE, "$1");
  });
  const final = cleanPath(`/${escapedParts.join("/")}`) || "";
  return final;
}
function replaceBackslash(s) {
  return s.replaceAll(/\\/gi, "/");
}
function routePathToVariable(routePath) {
  const toVariableSafeChar = (char) => {
    if (/[a-zA-Z0-9_]/.test(char)) {
      return char;
    }
    switch (char) {
      case ".":
        return "Dot";
      case "-":
        return "Dash";
      case "@":
        return "At";
      case "(":
        return "";
      // Removed since route groups use parentheses
      case ")":
        return "";
      // Removed since route groups use parentheses
      case " ":
        return "";
      // Remove spaces
      default:
        return `Char${char.charCodeAt(0)}`;
    }
  };
  return removeUnderscores(routePath)?.replace(/\/\$\//g, "/splat/").replace(/\$$/g, "splat").replace(/\$\{\$\}/g, "splat").replace(/\$/g, "").split(/[/-]/g).map((d, i) => i > 0 ? capitalize(d) : d).join("").split("").map(toVariableSafeChar).join("").replace(/^(\d)/g, "R$1") ?? "";
}
function removeUnderscores(s) {
  return s?.replaceAll(/(^_|_$)/gi, "").replaceAll(/(\/_|_\/)/gi, "/");
}
function capitalize(s) {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function removeExt(d, keepExtension = false) {
  return keepExtension ? d : d.substring(0, d.lastIndexOf(".")) || d;
}
async function writeIfDifferent(filepath, content, incomingContent, callbacks) {
  if (content !== incomingContent) {
    callbacks?.beforeWrite?.();
    await fsp__namespace.writeFile(filepath, incomingContent);
    callbacks?.afterWrite?.();
    return true;
  }
  return false;
}
async function format(source, config) {
  const prettierOptions = {
    semi: config.semicolons,
    singleQuote: config.quoteStyle === "single",
    parser: "typescript"
  };
  return prettier__namespace.format(source, prettierOptions);
}
function resetRegex(regex) {
  regex.lastIndex = 0;
  return;
}
async function checkFileExists(file) {
  try {
    await fsp__namespace.access(file, fsp__namespace.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
const possiblyNestedRouteGroupPatternRegex = /\([^/]+\)\/?/g;
function removeGroups(s) {
  return s.replace(possiblyNestedRouteGroupPatternRegex, "");
}
function removeLayoutSegments(routePath = "/") {
  const segments = routePath.split("/");
  const newSegments = segments.filter((segment) => !segment.startsWith("_"));
  return newSegments.join("/");
}
function determineNodePath(node) {
  return node.path = node.parent ? node.routePath?.replace(node.parent.routePath ?? "", "") || "/" : node.routePath;
}
function removeLastSegmentFromPath(routePath = "/") {
  const segments = routePath.split("/");
  segments.pop();
  return segments.join("/");
}
function hasParentRoute(routes, node, routePathToCheck) {
  if (!routePathToCheck || routePathToCheck === "/") {
    return null;
  }
  const sortedNodes = multiSortBy(routes, [
    (d) => d.routePath.length * -1,
    (d) => d.variableName
  ]).filter((d) => d.routePath !== `/${rootPathId.rootPathId}`);
  for (const route of sortedNodes) {
    if (route.routePath === "/") continue;
    if (routePathToCheck.startsWith(`${route.routePath}/`) && route.routePath !== routePathToCheck) {
      return route;
    }
  }
  const segments = routePathToCheck.split("/");
  segments.pop();
  const parentRoutePath = segments.join("/");
  return hasParentRoute(routes, node, parentRoutePath);
}
const getResolvedRouteNodeVariableName = (routeNode) => {
  return routeNode.children?.length ? `${routeNode.variableName}RouteWithChildren` : `${routeNode.variableName}Route`;
};
function isRouteNodeValidForAugmentation(routeNode) {
  if (!routeNode || routeNode.isVirtual) {
    return false;
  }
  return true;
}
const inferPath = (routeNode) => {
  return routeNode.cleanedPath === "/" ? routeNode.cleanedPath : routeNode.cleanedPath?.replace(/\/$/, "") ?? "";
};
const inferFullPath = (routeNode) => {
  const fullPath = removeGroups(
    removeUnderscores(removeLayoutSegments(routeNode.routePath)) ?? ""
  );
  return routeNode.cleanedPath === "/" ? fullPath : fullPath.replace(/\/$/, "");
};
const createRouteNodesByFullPath = (routeNodes) => {
  return new Map(
    routeNodes.map((routeNode) => [inferFullPath(routeNode), routeNode])
  );
};
const createRouteNodesByTo = (routeNodes) => {
  return new Map(
    dedupeBranchesAndIndexRoutes(routeNodes).map((routeNode) => [
      inferTo(routeNode),
      routeNode
    ])
  );
};
const createRouteNodesById = (routeNodes) => {
  return new Map(
    routeNodes.map((routeNode) => {
      const id = routeNode.routePath ?? "";
      return [id, routeNode];
    })
  );
};
const inferTo = (routeNode) => {
  const fullPath = inferFullPath(routeNode);
  if (fullPath === "/") return fullPath;
  return fullPath.replace(/\/$/, "");
};
const dedupeBranchesAndIndexRoutes = (routes) => {
  return routes.filter((route) => {
    if (route.children?.find((child) => child.cleanedPath === "/")) return false;
    return true;
  });
};
function checkUnique(routes, key) {
  const keys = routes.map((d) => d[key]);
  const uniqueKeys = new Set(keys);
  if (keys.length !== uniqueKeys.size) {
    const duplicateKeys = keys.filter((d, i) => keys.indexOf(d) !== i);
    const conflictingFiles = routes.filter(
      (d) => duplicateKeys.includes(d[key])
    );
    return conflictingFiles;
  }
  return void 0;
}
function checkRouteFullPathUniqueness(_routes, config) {
  const routes = _routes.map((d) => {
    const inferredFullPath = inferFullPath(d);
    return { ...d, inferredFullPath };
  });
  const conflictingFiles = checkUnique(routes, "inferredFullPath");
  if (conflictingFiles !== void 0) {
    const errorMessage = `Conflicting configuration paths were found for the following route${conflictingFiles.length > 1 ? "s" : ""}: ${conflictingFiles.map((p) => `"${p.inferredFullPath}"`).join(", ")}.
Please ensure each Route has a unique full path.
Conflicting files: 
 ${conflictingFiles.map((d) => path.resolve(config.routesDirectory, d.filePath)).join("\n ")}
`;
    throw new Error(errorMessage);
  }
}
function buildRouteTreeConfig(nodes, disableTypes, depth = 1) {
  const children = nodes.map((node) => {
    if (node._fsRouteType === "__root") {
      return;
    }
    if (node._fsRouteType === "pathless_layout" && !node.children?.length) {
      return;
    }
    const route = `${node.variableName}`;
    if (node.children?.length) {
      const childConfigs = buildRouteTreeConfig(
        node.children,
        disableTypes,
        depth + 1
      );
      const childrenDeclaration = disableTypes ? "" : `interface ${route}RouteChildren {
  ${node.children.map(
        (child) => `${child.variableName}Route: typeof ${getResolvedRouteNodeVariableName(child)}`
      ).join(",")}
}`;
      const children2 = `const ${route}RouteChildren${disableTypes ? "" : `: ${route}RouteChildren`} = {
  ${node.children.map(
        (child) => `${child.variableName}Route: ${getResolvedRouteNodeVariableName(child)}`
      ).join(",")}
}`;
      const routeWithChildren = `const ${route}RouteWithChildren = ${route}Route._addFileChildren(${route}RouteChildren)`;
      return [
        childConfigs.join("\n"),
        childrenDeclaration,
        children2,
        routeWithChildren
      ].join("\n\n");
    }
    return void 0;
  });
  return children.filter((x) => x !== void 0);
}
function buildImportString(importDeclaration) {
  const { source, specifiers, importKind } = importDeclaration;
  return specifiers.length ? `import ${importKind === "type" ? "type " : ""}{ ${specifiers.map((s) => s.local ? `${s.imported} as ${s.local}` : s.imported).join(", ")} } from '${source}'` : "";
}
function mergeImportDeclarations(imports) {
  const merged = {};
  for (const imp of imports) {
    const key = `${imp.source}-${imp.importKind}`;
    if (!merged[key]) {
      merged[key] = { ...imp, specifiers: [] };
    }
    for (const specifier of imp.specifiers) {
      if (!merged[key].specifiers.some(
        (existing) => existing.imported === specifier.imported && existing.local === specifier.local
      )) {
        merged[key].specifiers.push(specifier);
      }
    }
  }
  return Object.values(merged);
}
const findParent = (node) => {
  if (!node) {
    return `rootRouteImport`;
  }
  if (node.parent) {
    if (node.isVirtualParentRequired) {
      return `${node.parent.variableName}Route`;
    } else {
      return `${node.parent.variableName}Route`;
    }
  }
  return findParent(node.parent);
};
function buildFileRoutesByPathInterface(opts) {
  return `declare module '${opts.module}' {
  interface ${opts.interfaceName} {
    ${opts.routeNodes.map((routeNode) => {
    const filePathId = routeNode.routePath;
    const preloaderRoute = `typeof ${routeNode.variableName}RouteImport`;
    const parent = findParent(routeNode);
    return `'${filePathId}': {
          id: '${filePathId}'
          path: '${inferPath(routeNode)}'
          fullPath: '${inferFullPath(routeNode)}'
          preLoaderRoute: ${preloaderRoute}
          parentRoute: typeof ${parent}
        }`;
  }).join("\n")}
  }
}`;
}
function getImportPath(node, config, generatedRouteTreePath) {
  return replaceBackslash(
    removeExt(
      path.relative(
        path.dirname(generatedRouteTreePath),
        path.resolve(config.routesDirectory, node.filePath)
      ),
      config.addExtensions
    )
  );
}
function getImportForRouteNode(node, config, generatedRouteTreePath, root) {
  let source = "";
  if (config.importRoutesUsingAbsolutePaths) {
    source = replaceBackslash(
      removeExt(
        path.resolve(root, config.routesDirectory, node.filePath),
        config.addExtensions
      )
    );
  } else {
    source = `./${getImportPath(node, config, generatedRouteTreePath)}`;
  }
  return {
    source,
    specifiers: [
      {
        imported: "Route",
        local: `${node.variableName}RouteImport`
      }
    ]
  };
}
exports.buildFileRoutesByPathInterface = buildFileRoutesByPathInterface;
exports.buildImportString = buildImportString;
exports.buildRouteTreeConfig = buildRouteTreeConfig;
exports.capitalize = capitalize;
exports.checkFileExists = checkFileExists;
exports.checkRouteFullPathUniqueness = checkRouteFullPathUniqueness;
exports.cleanPath = cleanPath;
exports.createRouteNodesByFullPath = createRouteNodesByFullPath;
exports.createRouteNodesById = createRouteNodesById;
exports.createRouteNodesByTo = createRouteNodesByTo;
exports.dedupeBranchesAndIndexRoutes = dedupeBranchesAndIndexRoutes;
exports.determineInitialRoutePath = determineInitialRoutePath;
exports.determineNodePath = determineNodePath;
exports.findParent = findParent;
exports.format = format;
exports.getImportForRouteNode = getImportForRouteNode;
exports.getImportPath = getImportPath;
exports.getResolvedRouteNodeVariableName = getResolvedRouteNodeVariableName;
exports.hasParentRoute = hasParentRoute;
exports.inferFullPath = inferFullPath;
exports.inferPath = inferPath;
exports.inferTo = inferTo;
exports.isRouteNodeValidForAugmentation = isRouteNodeValidForAugmentation;
exports.mergeImportDeclarations = mergeImportDeclarations;
exports.multiSortBy = multiSortBy;
exports.removeExt = removeExt;
exports.removeGroups = removeGroups;
exports.removeLastSegmentFromPath = removeLastSegmentFromPath;
exports.removeLayoutSegments = removeLayoutSegments;
exports.removeLeadingSlash = removeLeadingSlash;
exports.removeTrailingSlash = removeTrailingSlash;
exports.removeUnderscores = removeUnderscores;
exports.replaceBackslash = replaceBackslash;
exports.resetRegex = resetRegex;
exports.routePathToVariable = routePathToVariable;
exports.trimPathLeft = trimPathLeft;
exports.writeIfDifferent = writeIfDifferent;
//# sourceMappingURL=utils.cjs.map
