/*
 * gh-edit.js
 * ---------------------------------------------------------------
 * Pure, framework-free helpers for programmatically inserting new
 * entries into data.js's hand-authored JS source text. No DOM, no
 * fetch — safe to run in Node (for testing) or in the browser.
 *
 * data.js isn't JSON, so this does string-aware bracket matching
 * (skipping over string/template literals and comments) rather than
 * a full JS parse. That's enough for the one operation this file
 * supports: appending a new element to a known array, either at the
 * top level or nested inside one specific object found by its `id`.
 * ---------------------------------------------------------------
 */

(function (root) {
  "use strict";

  function isEscaped(src, i) {
    let count = 0;
    let j = i - 1;
    while (j >= 0 && src[j] === "\\") {
      count++;
      j--;
    }
    return count % 2 === 1;
  }

  // Given `startIdx` pointing at '[' or '{', returns the index of the
  // matching closing bracket, skipping over string/template literals
  // and comments so brackets inside strings don't throw off the count.
  function findMatchingBracket(src, startIdx) {
    const open = src[startIdx];
    const close = open === "[" ? "]" : open === "{" ? "}" : null;
    if (!close) throw new Error("findMatchingBracket: startIdx must point at [ or {");

    let depth = 0;
    let state = "code"; // code | sq | dq | bt | linecomment | blockcomment

    for (let i = startIdx; i < src.length; i++) {
      const c = src[i];
      if (state === "code") {
        if (c === "'") state = "sq";
        else if (c === '"') state = "dq";
        else if (c === "`") state = "bt";
        else if (c === "/" && src[i + 1] === "/") state = "linecomment";
        else if (c === "/" && src[i + 1] === "*") state = "blockcomment";
        else if (c === open) depth++;
        else if (c === close) {
          depth--;
          if (depth === 0) return i;
        }
      } else if (state === "sq") {
        if (c === "'" && !isEscaped(src, i)) state = "code";
      } else if (state === "dq") {
        if (c === '"' && !isEscaped(src, i)) state = "code";
      } else if (state === "bt") {
        if (c === "`" && !isEscaped(src, i)) state = "code";
      } else if (state === "linecomment") {
        if (c === "\n") state = "code";
      } else if (state === "blockcomment") {
        if (c === "/" && src[i - 1] === "*") state = "code";
      }
    }
    throw new Error("findMatchingBracket: no matching bracket found");
  }

  function findTopLevelArrayStart(src, arrayName) {
    const re = new RegExp("const\\s+" + arrayName + "\\s*=\\s*\\[");
    const m = re.exec(src);
    if (!m) throw new Error("array " + arrayName + " not found in source");
    return m.index + m[0].length - 1; // index of the '['
  }

  // Appends `elementText` (a fully-formatted object literal, no trailing
  // comma) as the new last element of the top-level array `arrayName`.
  // `indent` is the number of spaces the new element should be indented.
  function appendTopLevelArrayItem(src, arrayName, elementText, indent) {
    const startIdx = findTopLevelArrayStart(src, arrayName);
    const endIdx = findMatchingBracket(src, startIdx); // index of ']'
    const before = src.slice(0, endIdx);
    const after = src.slice(endIdx);
    const trimmed = before.replace(/\s+$/, "");
    const needsComma = !trimmed.endsWith("[") && !trimmed.endsWith(",");
    const insertion = (needsComma ? "," : "") + "\n" + " ".repeat(indent) + elementText + ",";
    return trimmed + insertion + "\n" + after;
  }

  // Locates the object literal within top-level array `containerArrayName`
  // whose `id: "itemId"` field matches. Returns { objStart, objEnd }
  // (indices of the object's '{' and matching '}').
  function findObjectById(src, containerArrayName, itemId) {
    const containerStart = findTopLevelArrayStart(src, containerArrayName);
    const containerEnd = findMatchingBracket(src, containerStart);
    const containerBody = src.slice(containerStart, containerEnd);

    const idRe = new RegExp('id:\\s*"' + itemId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"');
    const idMatch = idRe.exec(containerBody);
    if (!idMatch) {
      throw new Error('id "' + itemId + '" not found in ' + containerArrayName);
    }

    const idAbsIdx = containerStart + idMatch.index;
    let i = idAbsIdx;
    while (i > containerStart && src[i] !== "{") i--;
    if (src[i] !== "{") throw new Error("could not locate enclosing object for id " + itemId);

    const objStart = i;
    const objEnd = findMatchingBracket(src, objStart);
    return { objStart, objEnd };
  }

  // Appends `elementText` into the array-valued field `fieldName` inside
  // the object spanning objStart..objEnd. If the field doesn't exist yet,
  // creates it as a new array field, inserted right after the field named
  // `anchorFieldName` (which must exist and end in `",` on its line).
  function appendToObjectField(src, objStart, objEnd, fieldName, elementText, itemIndent, anchorFieldName) {
    const objBody = src.slice(objStart, objEnd);
    const fieldRe = new RegExp(fieldName + ":\\s*\\[");
    const fieldMatch = fieldRe.exec(objBody);

    if (fieldMatch) {
      const fieldArrStart = objStart + fieldMatch.index + fieldMatch[0].length - 1; // index of '['
      const fieldArrEnd = findMatchingBracket(src, fieldArrStart); // index of ']'
      const before = src.slice(0, fieldArrEnd);
      const after = src.slice(fieldArrEnd);
      const trimmed = before.replace(/\s+$/, "");
      const needsComma = !trimmed.endsWith("[") && !trimmed.endsWith(",");
      const insertion = (needsComma ? "," : "") + "\n" + " ".repeat(itemIndent) + elementText + ",";
      return trimmed + insertion + "\n" + " ".repeat(itemIndent - 2) + after;
    }

    // Field doesn't exist yet — create it right after anchorFieldName's line.
    const anchorRe = new RegExp('(' + anchorFieldName + ':\\s*"[^"]*",)');
    const anchorMatch = anchorRe.exec(objBody);
    if (!anchorMatch) {
      throw new Error("anchor field " + anchorFieldName + " not found while adding " + fieldName);
    }
    const insertAt = objStart + anchorMatch.index + anchorMatch[0].length;
    const fieldIndent = itemIndent - 2;
    const newFieldText =
      "\n" + " ".repeat(fieldIndent) + fieldName + ": [\n" +
      " ".repeat(itemIndent) + elementText + ",\n" +
      " ".repeat(fieldIndent) + "],";
    return src.slice(0, insertAt) + newFieldText + src.slice(insertAt);
  }

  // --- String building helpers -------------------------------------------

  function jsStringEscape(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, " ")
      .trim();
  }

  function jsTemplateEscape(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$\{/g, "\\${");
  }

  function slugify(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  const api = {
    findMatchingBracket,
    findTopLevelArrayStart,
    appendTopLevelArrayItem,
    findObjectById,
    appendToObjectField,
    jsStringEscape,
    jsTemplateEscape,
    slugify,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.GhEdit = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
