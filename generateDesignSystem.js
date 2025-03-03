const fs = require('fs');
const path = require('path');
const config = require('./designSystemConfig');

// ---------- Helper Functions ----------

// Convert camelCase/PascalCase to kebab-case.
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// Convert kebab-case to PascalCase.
function toPascalCase(str) {
  return str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

// Resolve reference strings (e.g. "{colors.gray900}") to a CSS variable call.
function resolveReference(value) {
  const match = value.match(/^\{([^}]+)\}$/);
  if (match) {
    const parts = match[1].split('.');
    const refName = parts[parts.length - 1];
    return `var(--${refName})`;
  }
  return value;
}

// ---------- CSS Generation Functions ----------

function generatePrimitiveCSS(primitives) {
  let lightCSS = '';
  let darkCSS = '';
  for (const [tokenName, tokenValue] of Object.entries(primitives)) {
    const cssVarName = `--${tokenName}`;
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

function generateTokenCSS(category, tokens) {
  let lightCSS = '';
  let darkCSS = '';
  for (const [tokenName, tokenValue] of Object.entries(tokens)) {
    const cssVarName = `--${category}-${toKebabCase(tokenName)}`;
    if (typeof tokenValue === 'object' && tokenValue.light && tokenValue.dark) {
      const lightVal = (typeof tokenValue.light === 'string')
        ? resolveReference(tokenValue.light)
        : tokenValue.light;
      const darkVal = (typeof tokenValue.dark === 'string')
        ? resolveReference(tokenValue.dark)
        : tokenValue.dark;
      lightCSS += `  ${cssVarName}: ${lightVal};\n`;
      darkCSS += `  ${cssVarName}: ${darkVal};\n`;
    } else {
      const value = (typeof tokenValue === 'string')
        ? resolveReference(tokenValue)
        : tokenValue;
      lightCSS += `  ${cssVarName}: ${value};\n`;
      darkCSS += `  ${cssVarName}: ${value};\n`;
    }
  }
  return `html {\n${lightCSS}}\n\nhtml[data-theme="dark"] {\n${darkCSS}}\n`;
}

function generateSimpleTokenCSS(tokens) {
  let css = 'html {\n';
  for (const [tokenName, tokenValue] of Object.entries(tokens)) {
    const cssVarName = `--${toKebabCase(tokenName)}`;
    css += `  ${cssVarName}: ${tokenValue};\n`;
  }
  css += '}\n';
  return css;
}

function generateUtilityClassesCSS(prefix, tokens) {
  let css = '';
  for (const tokenKey in tokens) {
    const tokenKebab = toKebabCase(tokenKey);
    const className = prefix + toPascalCase(tokenKebab);
    let property;
    if (prefix.toLowerCase().includes('background')) {
      property = 'background-color';
    } else if (prefix.toLowerCase().includes('border')) {
      property = 'border';
    } else if (prefix.toLowerCase().includes('content')) {
      property = 'color';
    } else {
      property = 'background-color';
    }
    if (property === 'border') {
      css += `.${className} { border: 1px solid var(--${prefix.toLowerCase()}-${tokenKebab}); }\n\n`;
    } else {
      css += `.${className} { ${property}: var(--${prefix.toLowerCase()}-${tokenKebab}); }\n\n`;
    }
  }
  return css;
}

// ---------- Array & Type File Generation Helpers ----------

function getTokenVarName(group, tokenKey) {
  // For groups other than "interaction", prefix the token name.
  if (group === 'interaction') {
    return toKebabCase(tokenKey);
  } else {
    return `${group}-${toKebabCase(tokenKey)}`;
  }
}

// --- For Semantic Tokens ---

// Generate individual group types with improved naming,
// e.g. ContentMintToken and exported list ContentMintTokens.
function generateTokensGroupTypeContent(group, tokens) {
  const tokenNames = [];
  for (const tokenKey in tokens) {
    tokenNames.push(getTokenVarName(group, tokenKey));
  }
  tokenNames.sort();
  const typeName = toPascalCase(group) + "MintToken"; // e.g. ContentMintToken
  const varName = typeName + "s"; // e.g. ContentMintTokens
  return `// Auto-generated. Do not edit.
export const ${varName} = ${JSON.stringify(tokenNames, null, 2)} as const;
export type ${typeName} = typeof ${varName}[number];
`;
}

function generateTokensGroupNamesContent(group, tokens) {
  const tokenNames = [];
  for (const tokenKey in tokens) {
    tokenNames.push(getTokenVarName(group, tokenKey));
  }
  tokenNames.sort();
  const varName = toPascalCase(group) + "MintTokens";
  return `// Auto-generated. Do not edit.
export const ${varName} = ${JSON.stringify(tokenNames, null, 2)};
`;
}

// --- For Primitive Tokens ---

function generatePrimitiveGroupTypeContent(group, tokens) {
  const tokenNames = [];
  for (const tokenKey in tokens) {
    tokenNames.push(toKebabCase(tokenKey));
  }
  tokenNames.sort();
  const typeName = toPascalCase(group.replace(/s$/, '')) + "PrimitiveToken";
  const varName = typeName + "s";
  return `// Auto-generated. Do not edit.
export const ${varName} = ${JSON.stringify(tokenNames, null, 2)} as const;
export type ${typeName} = typeof ${varName}[number];
`;
}

function generatePrimitiveGroupNamesContent(group, tokens) {
  const tokenNames = [];
  for (const tokenKey in tokens) {
    tokenNames.push(toKebabCase(tokenKey));
  }
  tokenNames.sort();
  const varName = toPascalCase(group.replace(/s$/, '')) + "PrimitiveTokens";
  return `// Auto-generated. Do not edit.
export const ${varName} = ${JSON.stringify(tokenNames, null, 2)};
`;
}

// --- For Utility Classes ---

function generateUtilityGroupTypeContent(group, utilityGroup) {
  const prefix = utilityGroup.prefix;
  let tokensObj = utilityGroup.tokens;
  if (typeof tokensObj === 'string') {
    const match = tokensObj.match(/^\{semanticTokens\.([^}]+)\}$/);
    if (match) {
      const refGroup = match[1];
      tokensObj = config.semanticTokens[refGroup];
    }
  }
  const classNames = [];
  for (const tokenKey in tokensObj) {
    classNames.push(prefix + toPascalCase(toKebabCase(tokenKey)));
  }
  classNames.sort();
  const typeName = toPascalCase(group) + "MintUtilityClass";
  const varName = typeName + "es";
  return `// Auto-generated. Do not edit.
export const ${varName} = ${JSON.stringify(classNames, null, 2)} as const;
export type ${typeName} = typeof ${varName}[number];
`;
}

function generateUtilityGroupNamesContent(group, utilityGroup) {
  const prefix = utilityGroup.prefix;
  let tokensObj = utilityGroup.tokens;
  if (typeof tokensObj === 'string') {
    const match = tokensObj.match(/^\{semanticTokens\.([^}]+)\}$/);
    if (match) {
      const refGroup = match[1];
      tokensObj = config.semanticTokens[refGroup];
    }
  }
  const classNames = [];
  for (const tokenKey in tokensObj) {
    classNames.push(prefix + toPascalCase(toKebabCase(tokenKey)));
  }
  classNames.sort();
  const varName = toPascalCase(group) + "MintUtilityClasses";
  return `// Auto-generated. Do not edit.
export const ${varName} = ${JSON.stringify(classNames, null, 2)};
`;
}

// --- Aggregate Generators ---

// Combines all semantic token names into a single export.
function generateAggregateSemanticTypes(config) {
  let allNames = [];
  for (const group in config.semanticTokens) {
    const tokens = config.semanticTokens[group];
    for (const tokenKey in tokens) {
      allNames.push(getTokenVarName(group, tokenKey));
    }
  }
  allNames.sort();
  return `// Auto-generated aggregate semantic token types. Do not edit.
export const SemanticMintTokenNames = ${JSON.stringify(allNames, null, 2)} as const;
export type SemanticMintToken = typeof SemanticMintTokenNames[number];
`;
}

function generateAggregateSemanticNames(config) {
  let allNames = [];
  for (const group in config.semanticTokens) {
    const tokens = config.semanticTokens[group];
    for (const tokenKey in tokens) {
      allNames.push(getTokenVarName(group, tokenKey));
    }
  }
  allNames.sort();
  return `// Auto-generated aggregate semantic token names. Do not edit.
export const SemanticMintTokens = ${JSON.stringify(allNames, null, 2)};
`;
}

// Combines all utility class names into a single export.
function generateAggregateUtilityTypes(config) {
  let allClassNames = [];
  for (const group in config.utilityClasses) {
    const utilityGroup = config.utilityClasses[group];
    const prefix = utilityGroup.prefix;
    let tokensObj = utilityGroup.tokens;
    if (typeof tokensObj === 'string') {
      const match = tokensObj.match(/^\{semanticTokens\.([^}]+)\}$/);
      if (match) {
        const refGroup = match[1];
        tokensObj = config.semanticTokens[refGroup];
      }
    }
    for (const tokenKey in tokensObj) {
      allClassNames.push(prefix + toPascalCase(toKebabCase(tokenKey)));
    }
  }
  allClassNames.sort();
  return `// Auto-generated aggregate utility class types. Do not edit.
export const UtilityMintClassNames = ${JSON.stringify(allClassNames, null, 2)} as const;
export type UtilityMintClassName = typeof UtilityMintClassNames[number];
`;
}

function generateAggregateUtilityNames(config) {
  let allClassNames = [];
  for (const group in config.utilityClasses) {
    const utilityGroup = config.utilityClasses[group];
    const prefix = utilityGroup.prefix;
    let tokensObj = utilityGroup.tokens;
    if (typeof tokensObj === 'string') {
      const match = tokensObj.match(/^\{semanticTokens\.([^}]+)\}$/);
      if (match) {
        const refGroup = match[1];
        tokensObj = config.semanticTokens[refGroup];
      }
    }
    for (const tokenKey in tokensObj) {
      allClassNames.push(prefix + toPascalCase(toKebabCase(tokenKey)));
    }
  }
  allClassNames.sort();
  return `// Auto-generated aggregate utility class names. Do not edit.
export const UtilityMintClasses = ${JSON.stringify(allClassNames, null, 2)};
`;
}

// ---------- Folder Setup ----------

// Define new folder structure for package distribution.
const distDir = path.join(__dirname, 'dist');
const cssDir = path.join(distDir, 'css');
const typesDir = path.join(distDir, 'types');
const namesDir = path.join(distDir, 'names');

const cssPrimitivesDir = path.join(cssDir, 'primitives');
const cssSemanticDir = path.join(cssDir, 'semantic');
const cssUtilsDir = path.join(cssDir, 'utils');

const typesPrimitivesDir = path.join(typesDir, 'primitives');
const typesSemanticDir = path.join(typesDir, 'semantic');
const typesUtilsDir = path.join(typesDir, 'utils');

const namesPrimitivesDir = path.join(namesDir, 'primitives');
const namesSemanticDir = path.join(namesDir, 'semantic');
const namesUtilsDir = path.join(namesDir, 'utils');

// Create directories if they don't exist.
[distDir, cssDir, typesDir, namesDir, cssPrimitivesDir, cssSemanticDir, cssUtilsDir, typesPrimitivesDir, typesSemanticDir, typesUtilsDir, namesPrimitivesDir, namesSemanticDir, namesUtilsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---------- Generate and Write CSS Files ----------

// Primitives CSS.
const primitivesCSS = generatePrimitiveCSS(config.primitives.colors);
fs.writeFileSync(path.join(cssPrimitivesDir, 'primitives.css'), primitivesCSS);

// Semantic tokens CSS.
const backgroundTokensCSS = generateTokenCSS('background', config.semanticTokens.background);
fs.writeFileSync(path.join(cssSemanticDir, 'background-tokens.css'), backgroundTokensCSS);

const borderTokensCSS = generateTokenCSS('border', config.semanticTokens.border);
fs.writeFileSync(path.join(cssSemanticDir, 'border-tokens.css'), borderTokensCSS);

const contentTokensCSS = generateTokenCSS('content', config.semanticTokens.content);
fs.writeFileSync(path.join(cssSemanticDir, 'content-tokens.css'), contentTokensCSS);

const interactionTokensCSS = generateSimpleTokenCSS(config.semanticTokens.interaction);
fs.writeFileSync(path.join(cssSemanticDir, 'interaction-tokens.css'), interactionTokensCSS);

// Utility CSS.
const bgUtilsCSS = generateUtilityClassesCSS(
  config.utilityClasses.background.prefix,
  config.semanticTokens.background
);
fs.writeFileSync(path.join(cssUtilsDir, 'background-utils.css'), bgUtilsCSS);

const borderUtilsCSS = generateUtilityClassesCSS(
  config.utilityClasses.border.prefix,
  config.semanticTokens.border
);
fs.writeFileSync(path.join(cssUtilsDir, 'border-utils.css'), borderUtilsCSS);

const contentUtilsCSS = generateUtilityClassesCSS(
  config.utilityClasses.content.prefix,
  config.semanticTokens.content
);
fs.writeFileSync(path.join(cssUtilsDir, 'content-utils.css'), contentUtilsCSS);

const interactionUtilsCSS = generateUtilityClassesCSS(
  config.utilityClasses.interaction.prefix,
  config.semanticTokens.interaction
);
fs.writeFileSync(path.join(cssUtilsDir, 'interaction-utils.css'), interactionUtilsCSS);

const tempBgUtilsCSS = generateUtilityClassesCSS(
  config.utilityClasses.tempBackground.prefix,
  config.utilityClasses.tempBackground.tokens
);
fs.writeFileSync(path.join(cssUtilsDir, 'temp-background-utils.css'), tempBgUtilsCSS);

// ---------- Generate and Write Type and Names Files ----------

// For Semantic Tokens: each group.
for (const group in config.semanticTokens) {
  const tokensGroup = config.semanticTokens[group];
  const typeContent = generateTokensGroupTypeContent(group, tokensGroup);
  const namesContent = generateTokensGroupNamesContent(group, tokensGroup);
  fs.writeFileSync(path.join(typesSemanticDir, `${group}-types.d.ts`), typeContent);
  fs.writeFileSync(path.join(namesSemanticDir, `${group}-names.js`), namesContent);
}

// For Primitive Tokens: each group.
for (const group in config.primitives) {
  const primitiveGroup = config.primitives[group];
  const typeContent = generatePrimitiveGroupTypeContent(group, primitiveGroup);
  const namesContent = generatePrimitiveGroupNamesContent(group, primitiveGroup);
  fs.writeFileSync(path.join(typesPrimitivesDir, `${group}-types.d.ts`), typeContent);
  fs.writeFileSync(path.join(namesPrimitivesDir, `${group}-names.js`), namesContent);
}

// For Utility Classes: each group.
for (const group in config.utilityClasses) {
  const utilityGroup = config.utilityClasses[group];
  const typeContent = generateUtilityGroupTypeContent(group, utilityGroup);
  const namesContent = generateUtilityGroupNamesContent(group, utilityGroup);
  fs.writeFileSync(path.join(typesUtilsDir, `${group}-types.d.ts`), typeContent);
  fs.writeFileSync(path.join(namesUtilsDir, `${group}-names.js`), namesContent);
}

// Generate aggregate files for Semantic Tokens.
const aggregateSemanticTypes = generateAggregateSemanticTypes(config);
const aggregateSemanticNames = generateAggregateSemanticNames(config);
fs.writeFileSync(path.join(typesDir, 'semantic-aggregate-types.d.ts'), aggregateSemanticTypes);
fs.writeFileSync(path.join(namesDir, 'semantic-aggregate-names.js'), aggregateSemanticNames);

// Generate aggregate files for Utility Classes.
const aggregateUtilityTypes = generateAggregateUtilityTypes(config);
const aggregateUtilityNames = generateAggregateUtilityNames(config);
fs.writeFileSync(path.join(typesDir, 'utils-aggregate-types.d.ts'), aggregateUtilityTypes);
fs.writeFileSync(path.join(namesDir, 'utils-aggregate-names.js'), aggregateUtilityNames);

console.log("Design system package generated successfully in the 'dist' folder.");
