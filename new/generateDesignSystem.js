// generate.js
// A dependency-free Node.js script that reads designSystemConfig.js and generates
// a folder structure with CSS, TypeScript types, and names files.
// The folder structure is driven entirely by the config.
// All folder names and CSS variable names follow kebab-case conventions.

const fs = require('fs');
const path = require('path');
const config = require('./designSystemConfig');

// ---------- Helper Functions ----------
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

// If a value is a reference string like "{group.colors.tokenName}",
// this function returns a CSS variable call pointing to that token.
// For example, "{data-viz.colors.dataVizLilac}" becomes "var(--data-viz-lilac)".
function resolveReference(value) {
  const match = value.match(/^\{([^}]+)\}$/);
  if (match) {
    const parts = match[1].split('.');
    // The referenced token name will be the last part, converted to kebab-case.
    const refName = toKebabCase(parts[parts.length - 1]);
    return `var(--${refName})`;
  }
  return value;
}

// Generates CSS for primitives (colors) with light and dark themes.
function generatePrimitiveCSS(colors) {
  let lightCSS = '';
  let darkCSS = '';
  for (const [tokenName, tokenValue] of Object.entries(colors)) {
    const cssVarName = `--${toKebabCase(tokenName)}`;
    if (typeof tokenValue === 'object' && tokenValue.light && tokenValue.dark) {
      lightCSS += `  ${cssVarName}: ${tokenValue.light};\n`;
      darkCSS += `  ${cssVarName}: ${tokenValue.dark};\n`;
    } else {
      lightCSS += `  ${cssVarName}: ${tokenValue};\n`;
      darkCSS += `  ${cssVarName}: ${tokenValue};\n`;
    }
  }
  return `html {\n${lightCSS}}\n\nhtml[data-theme="dark"] {\n${darkCSS}}\n`;
}

// Generates CSS for semantic tokens.
// For each token, creates a CSS variable named "--[category]-[token-name]".
function generateTokenCSS(category, tokens) {
  let lightCSS = '';
  let darkCSS = '';
  for (const [tokenName, tokenValue] of Object.entries(tokens)) {
    const cssVarName = `--${category}-${toKebabCase(tokenName)}`;
    if (typeof tokenValue === 'object' && tokenValue.light && tokenValue.dark) {
      const lightVal = typeof tokenValue.light === 'string'
        ? resolveReference(tokenValue.light)
        : tokenValue.light;
      const darkVal = typeof tokenValue.dark === 'string'
        ? resolveReference(tokenValue.dark)
        : tokenValue.dark;
      lightCSS += `  ${cssVarName}: ${lightVal};\n`;
      darkCSS += `  ${cssVarName}: ${darkVal};\n`;
    } else {
      const value = typeof tokenValue === 'string'
        ? resolveReference(tokenValue)
        : tokenValue;
      lightCSS += `  ${cssVarName}: ${value};\n`;
      darkCSS += `  ${cssVarName}: ${value};\n`;
    }
  }
  return `html {\n${lightCSS}}\n\nhtml[data-theme="dark"] {\n${darkCSS}}\n`;
}

// Generates CSS for utility classes. It creates CSS classes that set the property
// (e.g., background-color) to use the corresponding CSS variable.
function generateUtilityClassesCSS(prefix, tokensInput) {
  // If tokensInput is a string reference, resolve it from the config.
  let tokensObj = tokensInput;
  if (typeof tokensObj === 'string') {
    const refMatch = tokensObj.match(/^\{([^}]+)\}$/);
    if (refMatch) {
      const refParts = refMatch[1].split('.');
      // Handle explicit "semanticTokens" or "primitives" first.
      if (refParts[0] === 'semanticTokens') {
        const groupName = refParts[1];
        const tokenCategory = refParts[2];
        tokensObj = config.semanticTokens[groupName][tokenCategory];
      } else if (refParts[0] === 'primitives') {
        const groupName = refParts[1];
        const tokenCategory = refParts[2];
        tokensObj = config.primitives[groupName][tokenCategory];
      } else {
        // Otherwise, try to resolve in primitives first
        if (config.primitives[refParts[0]] && config.primitives[refParts[0]][refParts[1]]) {
          tokensObj = config.primitives[refParts[0]][refParts[1]];
        } else if (config.semanticTokens[refParts[0]] && config.semanticTokens[refParts[0]][refParts[1]]) {
          tokensObj = config.semanticTokens[refParts[0]][refParts[1]];
        }
      }
    }
  }

  let css = '';
  for (const tokenKey in tokensObj) {
    const tokenKebab = toKebabCase(tokenKey);
    // Create a class name by combining the prefix with token name in PascalCase.
    const className = prefix + toPascalCase(tokenKebab);
    // Determine the CSS property based on the prefix.
    let property;
    if (prefix.toLowerCase().includes('background')) {
      property = 'background-color';
    } else if (prefix.toLowerCase().includes('border')) {
      property = 'border';
    } else {
      property = 'color';
    }
    // The CSS variable name is composed of the prefix (in lowercase) and the token key.
    const cssVarName = `--${prefix.toLowerCase()}-${tokenKebab}`;
    if (property === 'border') {
      css += `.${className} { border: 1px solid var(${cssVarName}); }\n\n`;
    } else {
      css += `.${className} { ${property}: var(${cssVarName}); }\n\n`;
    }
  }
  return css;
}

// ---------- Folder Setup ----------
const distDir = path.join(__dirname, 'dist');
const outputTypes = [
  { name: 'css', base: path.join(distDir, 'css') },
  { name: 'ts', base: path.join(distDir, 'ts') },
  { name: 'names', base: path.join(distDir, 'names') }
];

// Mapping of config categories to folder names (in kebab-case)
const categoryFolderMap = {
  primitives: 'variables',
  semanticTokens: 'tokens',
  utilityClasses: 'utils'
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created folder: ${dir}`);
  }
}

// Create base folder structure
outputTypes.forEach(({ base }) => {
  ensureDir(base);
  Object.values(categoryFolderMap).forEach(sub => {
    ensureDir(path.join(base, sub));
  });
});

// ---------- Process Primitives ----------
for (const group in config.primitives) {
  const groupData = config.primitives[group]; // e.g., { colors: { ... } }
  let aggregatedTokens = [];
  for (const category in groupData) {
    const tokens = groupData[category];
    const cssContent = generatePrimitiveCSS(tokens);
    const categoryFolder = toKebabCase(category);
    const cssDir = path.join(distDir, 'css', categoryFolderMap.primitives, toKebabCase(group));
    ensureDir(cssDir);
    fs.writeFileSync(path.join(cssDir, `${categoryFolder}.css`), cssContent);
    console.log(`Generated CSS for primitives group: ${group}, category: ${category}`);

    const tokenNames = Object.keys(tokens).map(toKebabCase).sort();
    aggregatedTokens = aggregatedTokens.concat(tokenNames);
    const tsContent = `// Auto-generated types for ${group} primitives (${category})\nexport const ${group.replace(/\W/g, '')}${toPascalCase(category)}PrimitiveTokens = ${JSON.stringify(tokenNames, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}${toPascalCase(category)}PrimitiveToken = typeof ${group.replace(/\W/g, '')}${toPascalCase(category)}PrimitiveTokens[number];\n`;
    const tsDir = path.join(distDir, 'ts', categoryFolderMap.primitives, toKebabCase(group));
    ensureDir(tsDir);
    fs.writeFileSync(path.join(tsDir, `${categoryFolder}-types.d.ts`), tsContent);
    console.log(`Generated TS types for primitives group: ${group}, category: ${category}`);

    const namesContent = `// Auto-generated names for ${group} primitives (${category})\nexport const ${group.replace(/\W/g, '')}${toPascalCase(category)}PrimitiveTokenNames = ${JSON.stringify(tokenNames, null, 2)};\n`;
    const namesDir = path.join(distDir, 'names', categoryFolderMap.primitives, toKebabCase(group));
    ensureDir(namesDir);
    fs.writeFileSync(path.join(namesDir, `${categoryFolder}-names.js`), namesContent);
    console.log(`Generated names file for primitives group: ${group}, category: ${category}`);
  }
  // Aggregated files for primitives in this group
  aggregatedTokens = Array.from(new Set(aggregatedTokens)).sort();
  const aggTsContent = `// Auto-generated aggregated types for ${group} primitives\nexport const ${group.replace(/\W/g, '')}PrimitiveTokens = ${JSON.stringify(aggregatedTokens, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}PrimitiveToken = typeof ${group.replace(/\W/g, '')}PrimitiveTokens[number];\n`;
  fs.writeFileSync(path.join(distDir, 'ts', categoryFolderMap.primitives, toKebabCase(group), 'primitives-types.d.ts'), aggTsContent);
  const aggNamesContent = `// Auto-generated aggregated names for ${group} primitives\nexport const ${group.replace(/\W/g, '')}PrimitiveTokenNames = ${JSON.stringify(aggregatedTokens, null, 2)};\n`;
  fs.writeFileSync(path.join(distDir, 'names', categoryFolderMap.primitives, toKebabCase(group), 'primitives-names.js'), aggNamesContent);
  console.log(`Generated aggregated TS types and names for primitives group: ${group}`);
}

// ---------- Process Semantic Tokens ----------
for (const group in config.semanticTokens) {
  const groupData = config.semanticTokens[group]; // e.g., { background: { ... }, border: { ... } }
  let aggregatedTokens = [];
  for (const tokenCategory in groupData) {
    const tokens = groupData[tokenCategory];
    const cssContent = generateTokenCSS(tokenCategory, tokens);
    const categoryFolder = toKebabCase(tokenCategory);
    const cssDir = path.join(distDir, 'css', categoryFolderMap.semanticTokens, toKebabCase(group));
    ensureDir(cssDir);
    fs.writeFileSync(path.join(cssDir, `${categoryFolder}.css`), cssContent);
    console.log(`Generated CSS for semantic tokens group: ${group}, category: ${tokenCategory}`);

    let tokenNames = [];
    for (const token in tokens) {
      tokenNames.push(`${toKebabCase(tokenCategory)}-${toKebabCase(token)}`);
    }
    tokenNames.sort();
    aggregatedTokens = aggregatedTokens.concat(tokenNames);
    const tsContent = `// Auto-generated types for ${group} semantic tokens (${tokenCategory})\nexport const ${group.replace(/\W/g, '')}${toPascalCase(tokenCategory)}SemanticTokens = ${JSON.stringify(tokenNames, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}${toPascalCase(tokenCategory)}SemanticToken = typeof ${group.replace(/\W/g, '')}${toPascalCase(tokenCategory)}SemanticTokens[number];\n`;
    const tsDir = path.join(distDir, 'ts', categoryFolderMap.semanticTokens, toKebabCase(group));
    ensureDir(tsDir);
    fs.writeFileSync(path.join(tsDir, `${categoryFolder}-types.d.ts`), tsContent);
    console.log(`Generated TS types for semantic tokens group: ${group}, category: ${tokenCategory}`);

    const namesContent = `// Auto-generated names for ${group} semantic tokens (${tokenCategory})\nexport const ${group.replace(/\W/g, '')}${toPascalCase(tokenCategory)}SemanticTokenNames = ${JSON.stringify(tokenNames, null, 2)};\n`;
    const namesDir = path.join(distDir, 'names', categoryFolderMap.semanticTokens, toKebabCase(group));
    ensureDir(namesDir);
    fs.writeFileSync(path.join(namesDir, `${categoryFolder}-names.js`), namesContent);
    console.log(`Generated names file for semantic tokens group: ${group}, category: ${tokenCategory}`);
  }
  // Aggregated files for semantic tokens in this group
  aggregatedTokens = Array.from(new Set(aggregatedTokens)).sort();
  const aggTsContent = `// Auto-generated aggregated types for ${group} semantic tokens\nexport const ${group.replace(/\W/g, '')}SemanticTokens = ${JSON.stringify(aggregatedTokens, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}SemanticToken = typeof ${group.replace(/\W/g, '')}SemanticTokens[number];\n`;
  fs.writeFileSync(path.join(distDir, 'ts', categoryFolderMap.semanticTokens, toKebabCase(group), 'tokens-types.d.ts'), aggTsContent);
  const aggNamesContent = `// Auto-generated aggregated names for ${group} semantic tokens\nexport const ${group.replace(/\W/g, '')}SemanticTokenNames = ${JSON.stringify(aggregatedTokens, null, 2)};\n`;
  fs.writeFileSync(path.join(distDir, 'names', categoryFolderMap.semanticTokens, toKebabCase(group), 'tokens-names.js'), aggNamesContent);
  console.log(`Generated aggregated TS types and names for semantic tokens group: ${group}`);
}

// ---------- Process Utility Classes ----------
for (const group in config.utilityClasses) {
  const groupData = config.utilityClasses[group]; // e.g., { background: { prefix, tokens }, ... }
  let aggregatedUtils = [];
  for (const utilKey in groupData) {
    const utilConfig = groupData[utilKey];
    let tokensObj = utilConfig.tokens;
    if (typeof tokensObj === 'string') {
      const refMatch = tokensObj.match(/^\{([^}]+)\}$/);
      if (refMatch) {
        const refParts = refMatch[1].split('.');
        if (refParts[0] === 'semanticTokens') {
          tokensObj = config.semanticTokens[refParts[1]][refParts[2]];
        } else if (refParts[0] === 'primitives') {
          tokensObj = config.primitives[refParts[1]][refParts[2]];
        } else {
          // Attempt to resolve using the group name if not explicitly specified
          if (config.primitives[refParts[0]] && config.primitives[refParts[0]][refParts[1]]) {
            tokensObj = config.primitives[refParts[0]][refParts[1]];
          } else if (config.semanticTokens[refParts[0]] && config.semanticTokens[refParts[0]][refParts[1]]) {
            tokensObj = config.semanticTokens[refParts[0]][refParts[1]];
          }
        }
      }
    }
    const cssContent = generateUtilityClassesCSS(utilConfig.prefix, tokensObj);
    const categoryFolder = toKebabCase(utilKey);
    const cssDir = path.join(distDir, 'css', categoryFolderMap.utilityClasses, toKebabCase(group));
    ensureDir(cssDir);
    fs.writeFileSync(path.join(cssDir, `${categoryFolder}.css`), cssContent);
    console.log(`Generated CSS for utility classes group: ${group}, category: ${utilKey}`);

    let classNames = [];
    for (const tokenKey in tokensObj) {
      const className = utilConfig.prefix + toPascalCase(toKebabCase(tokenKey));
      classNames.push(className);
    }
    classNames.sort();
    aggregatedUtils = aggregatedUtils.concat(classNames);
    const tsContent = `// Auto-generated types for ${group} utility classes (${utilKey})\nexport const ${group.replace(/\W/g, '')}${toPascalCase(utilKey)}UtilityClasses = ${JSON.stringify(classNames, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}${toPascalCase(utilKey)}UtilityClass = typeof ${group.replace(/\W/g, '')}${toPascalCase(utilKey)}UtilityClasses[number];\n`;
    const tsDir = path.join(distDir, 'ts', categoryFolderMap.utilityClasses, toKebabCase(group));
    ensureDir(tsDir);
    fs.writeFileSync(path.join(tsDir, `${categoryFolder}-types.d.ts`), tsContent);
    console.log(`Generated TS types for utility classes group: ${group}, category: ${utilKey}`);

    const namesContent = `// Auto-generated names for ${group} utility classes (${utilKey})\nexport const ${group.replace(/\W/g, '')}${toPascalCase(utilKey)}UtilityClassNames = ${JSON.stringify(classNames, null, 2)};\n`;
    const namesDir = path.join(distDir, 'names', categoryFolderMap.utilityClasses, toKebabCase(group));
    ensureDir(namesDir);
    fs.writeFileSync(path.join(namesDir, `${categoryFolder}-names.js`), namesContent);
    console.log(`Generated names file for utility classes group: ${group}, category: ${utilKey}`);
  }
  // Aggregated files for utility classes in this group
  aggregatedUtils = Array.from(new Set(aggregatedUtils)).sort();
  const aggTsContent = `// Auto-generated aggregated types for ${group} utility classes\nexport const ${group.replace(/\W/g, '')}UtilityClasses = ${JSON.stringify(aggregatedUtils, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}UtilityClass = typeof ${group.replace(/\W/g, '')}UtilityClasses[number];\n`;
  fs.writeFileSync(path.join(distDir, 'ts', categoryFolderMap.utilityClasses, toKebabCase(group), 'utils-types.d.ts'), aggTsContent);
  const aggNamesContent = `// Auto-generated aggregated names for ${group} utility classes\nexport const ${group.replace(/\W/g, '')}UtilityClassNames = ${JSON.stringify(aggregatedUtils, null, 2)};\n`;
  fs.writeFileSync(path.join(distDir, 'names', categoryFolderMap.utilityClasses, toKebabCase(group), 'utils-names.js'), aggNamesContent);
  console.log(`Generated aggregated TS types and names for utility classes group: ${group}`);
}

console.log("Design system package generated successfully in the 'dist' folder.");
