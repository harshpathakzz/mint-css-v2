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

// Generates CSS for utility classes. It creates a CSS class that sets the property
// (e.g., background-color) to use the corresponding CSS variable.
function generateUtilityClassesCSS(prefix, tokensInput) {
  // If tokensInput is a string reference, resolve it from the config.
  let tokensObj = tokensInput;
  if (typeof tokensObj === 'string') {
    const refMatch = tokensObj.match(/^\{([^}]+)\}$/);
    if (refMatch) {
      const refParts = refMatch[1].split('.');
      // Support both semanticTokens and primitives references.
      if (refParts[0] === 'semanticTokens') {
        const groupName = refParts[1];
        const tokenCategory = refParts[2];
        tokensObj = config.semanticTokens[groupName][tokenCategory];
      } else if (refParts[0] === 'primitives') {
        const groupName = refParts[1];
        const tokenCategory = refParts[2];
        tokensObj = config.primitives[groupName][tokenCategory];
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

// ---------- Generate Files ----------

// Process primitives (CSS, TS, and names)
for (const group in config.primitives) {
  const groupData = config.primitives[group];
  const cssContent = generatePrimitiveCSS(groupData.colors);
  const groupFolder = toKebabCase(group);
  
  // Write CSS file under dist/css/variables/[groupFolder]
  const cssDir = path.join(distDir, 'css', categoryFolderMap.primitives, groupFolder);
  ensureDir(cssDir);
  fs.writeFileSync(path.join(cssDir, 'primitives.css'), cssContent);
  console.log(`Generated CSS for primitives group: ${group}`);
  
  // Generate TS types file (exporting token names)
  const tokenNames = Object.keys(groupData.colors).map(toKebabCase).sort();
  const tsContent = `// Auto-generated types for ${group} primitives\nexport const ${group.replace(/\W/g, '')}PrimitiveTokens = ${JSON.stringify(tokenNames, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}PrimitiveToken = typeof ${group.replace(/\W/g, '')}PrimitiveTokens[number];\n`;
  const tsDir = path.join(distDir, 'ts', categoryFolderMap.primitives, groupFolder);
  ensureDir(tsDir);
  fs.writeFileSync(path.join(tsDir, 'primitives-types.d.ts'), tsContent);
  console.log(`Generated TS types for primitives group: ${group}`);
  
  // Generate names file
  const namesContent = `// Auto-generated names for ${group} primitives\nexport const ${group.replace(/\W/g, '')}PrimitiveTokenNames = ${JSON.stringify(tokenNames, null, 2)};\n`;
  const namesDir = path.join(distDir, 'names', categoryFolderMap.primitives, groupFolder);
  ensureDir(namesDir);
  fs.writeFileSync(path.join(namesDir, 'primitives-names.js'), namesContent);
  console.log(`Generated names file for primitives group: ${group}`);
}

// Process semantic tokens
for (const group in config.semanticTokens) {
  const groupData = config.semanticTokens[group];
  let aggregateCSS = '';
  // Process each token category (e.g. background, border)
  for (const tokenCategory in groupData) {
    aggregateCSS += generateTokenCSS(tokenCategory, groupData[tokenCategory]) + "\n";
  }
  const groupFolder = toKebabCase(group);
  const cssDir = path.join(distDir, 'css', categoryFolderMap.semanticTokens, groupFolder);
  ensureDir(cssDir);
  fs.writeFileSync(path.join(cssDir, 'tokens.css'), aggregateCSS);
  console.log(`Generated CSS for semantic tokens group: ${group}`);
  
  // Generate TS types file (aggregate token names)
  let allTokenNames = [];
  for (const tokenCategory in groupData) {
    for (const token in groupData[tokenCategory]) {
      allTokenNames.push(`${toKebabCase(tokenCategory)}-${toKebabCase(token)}`);
    }
  }
  allTokenNames.sort();
  const tsContent = `// Auto-generated types for ${group} semantic tokens\nexport const ${group.replace(/\W/g, '')}SemanticTokens = ${JSON.stringify(allTokenNames, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}SemanticToken = typeof ${group.replace(/\W/g, '')}SemanticTokens[number];\n`;
  const tsDir = path.join(distDir, 'ts', categoryFolderMap.semanticTokens, groupFolder);
  ensureDir(tsDir);
  fs.writeFileSync(path.join(tsDir, 'tokens-types.d.ts'), tsContent);
  console.log(`Generated TS types for semantic tokens group: ${group}`);
  
  // Generate names file
  const namesContent = `// Auto-generated names for ${group} semantic tokens\nexport const ${group.replace(/\W/g, '')}SemanticTokenNames = ${JSON.stringify(allTokenNames, null, 2)};\n`;
  const namesDir = path.join(distDir, 'names', categoryFolderMap.semanticTokens, groupFolder);
  ensureDir(namesDir);
  fs.writeFileSync(path.join(namesDir, 'tokens-names.js'), namesContent);
  console.log(`Generated names file for semantic tokens group: ${group}`);
}

// Process utility classes
for (const group in config.utilityClasses) {
  const groupData = config.utilityClasses[group];
  let aggregateCSS = '';
  let utilClassNames = [];
  // Process each utility category (e.g. background, border) within the group.
  for (const utilKey in groupData) {
    const utilConfig = groupData[utilKey];
    // Resolve tokens from the reference string if needed.
    let tokensObj = utilConfig.tokens;
    if (typeof tokensObj === 'string') {
      const refMatch = tokensObj.match(/^\{([^}]+)\}$/);
      if (refMatch) {
        const refParts = refMatch[1].split('.');
        if (refParts[0] === 'semanticTokens') {
          const groupName = refParts[1];
          const tokenCategory = refParts[2];
          tokensObj = config.semanticTokens[groupName][tokenCategory];
        } else if (refParts[0] === 'primitives') {
          const groupName = refParts[1];
          const tokenCategory = refParts[2];
          tokensObj = config.primitives[groupName][tokenCategory];
        }
      }
    }
    // Generate utility classes CSS for the current category.
    const cssForUtil = generateUtilityClassesCSS(utilConfig.prefix, tokensObj);
    aggregateCSS += cssForUtil;
    // Generate class names for TS and names files.
    for (const tokenKey in tokensObj) {
      const className = utilConfig.prefix + toPascalCase(toKebabCase(tokenKey));
      utilClassNames.push(className);
    }
  }
  utilClassNames.sort();
  const groupFolder = toKebabCase(group);
  const cssDir = path.join(distDir, 'css', categoryFolderMap.utilityClasses, groupFolder);
  ensureDir(cssDir);
  fs.writeFileSync(path.join(cssDir, 'utils.css'), aggregateCSS);
  console.log(`Generated CSS for utility classes group: ${group}`);
  
  // Generate TS types file for utility classes.
  const tsContent = `// Auto-generated types for ${group} utility classes\nexport const ${group.replace(/\W/g, '')}UtilityClasses = ${JSON.stringify(utilClassNames, null, 2)} as const;\nexport type ${group.replace(/\W/g, '')}UtilityClass = typeof ${group.replace(/\W/g, '')}UtilityClasses[number];\n`;
  const tsDir = path.join(distDir, 'ts', categoryFolderMap.utilityClasses, groupFolder);
  ensureDir(tsDir);
  fs.writeFileSync(path.join(tsDir, 'utils-types.d.ts'), tsContent);
  console.log(`Generated TS types for utility classes group: ${group}`);
  
  // Generate names file for utility classes.
  const namesContent = `// Auto-generated names for ${group} utility classes\nexport const ${group.replace(/\W/g, '')}UtilityClassNames = ${JSON.stringify(utilClassNames, null, 2)};\n`;
  const namesDir = path.join(distDir, 'names', categoryFolderMap.utilityClasses, groupFolder);
  ensureDir(namesDir);
  fs.writeFileSync(path.join(namesDir, 'utils-names.js'), namesContent);
  console.log(`Generated names file for utility classes group: ${group}`);
}

console.log("Design system package generated successfully in the 'dist' folder.");
