// designSystemConfig.js
// This configuration defines our design tokens. We have three top-level
// categories: primitives, semanticTokens, and utilityClasses.
// Each group (like "groww-primary", "data-viz", "temporary") is defined as a sub-object.
// All keys will be converted to kebab-case for folder and variable names.

module.exports = {
  primitives: {
    'groww-primary': {
      colors: {
        black: { light: "#121212", dark: "#121212" },
        white: { light: "#ffffff", dark: "#ffffff" },
        gray150: { light: "#e9e9eb", dark: "#2e2e2e" }
      }
    },
    'data-viz': {
      colors: {
        // The primitive token for lilac is defined here.
      
        dataVizLilac: { light: "#7A7AC6", dark: "#7A7AC6" },
        dataVizBlue: { light: "#5669FF", dark: "#5669FF" },
    
      }
    },
    temporary: {
      colors: {
        tempNbtPink: { light: "#f1e3f3", dark: "#9b63a3" },
        tempNbtBlue: { light: "#d6eeff", dark: "#3e79a4" }
      }
    }
  },
  semanticTokens: {
    'groww-primary': {
      background: {
        primary: "{groww-primary.colors.white}",
        secondary: "{groww-primary.colors.gray150}"
      },
      border: {
        primary: "{groww-primary.colors.gray150}"
      }
    },
    'data-viz': {
      // Note: The key "data-viz-lilac" will be used to generate:
      // CSS variable: --background-data-viz-lilac
      // Utility class: .backgroundDataVizLilac
      background: {
        dataVizLilac: "{data-viz.colors.dataVizLilac}",
        dataVizBlue: "{data-viz.colors.dataVizBlue}",
      }
    },
    temporary: {
      background: {
        tempNbtPink: "{temporary.colors.tempNbtPink}",
        tempNbtBlue: "{temporary.colors.tempNbtBlue}"
      }
    }
  },
  utilityClasses: {
    'groww-primary': {
      background: {
        prefix: "background",
        tokens: "{semanticTokens.groww-primary.background}"
      },
      border: {
        prefix: "border",
        tokens: "{semanticTokens.groww-primary.border}"
      }
    },
    'data-viz': {
      background: {
        prefix: "background",
        tokens: "{semanticTokens.data-viz.background}"
      }
    },
    temporary: {
      background: {
        prefix: "background",
        // Mapping temporary background tokens via semantic tokens
        tokens: "{semanticTokens.temporary.background}"
      }
    }
  }
};
