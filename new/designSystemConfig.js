// designSystemConfig.js
// This configuration defines our design tokens for primitives, semanticTokens, and utilityClasses.
// Interaction tokens (such as hover states) are now nested under each group (groww-primary, data-viz, temporary)
// in the semanticTokens section. All utilityClasses entries MUST define a "property" key.

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
        dataVizLilac: { light: "#7A7AC6", dark: "#7A7AC6" },
        dataVizBlue: { light: "#5669FF", dark: "#5669FF" }
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
      },
      // Interaction tokens for groww-primary
      interaction: {
        backgroundHover: "{groww-primary.colors.gray150}"
      }
    },
    'data-viz': {
      background: {
        dataVizLilac: "{data-viz.colors.dataVizLilac}",
        dataVizBlue: "{data-viz.colors.dataVizBlue}"
      },
      // Interaction tokens for data-viz
      interaction: {
        backgroundHover: "{data-viz.colors.dataVizLilac}"
      }
    },
    temporary: {
      background: {
        tempNbtPink: "{temporary.colors.tempNbtPink}",
        tempNbtBlue: "{temporary.colors.tempNbtBlue}"
      },
      // Interaction tokens for temporary
      interaction: {
        backgroundHover: "{temporary.colors.tempNbtPink}"
      }
    }
  },
  utilityClasses: {
    'groww-primary': {
      background: {
        prefix: "background",
        property: "background-color",
        tokens: "{semanticTokens.groww-primary.background}"
      },
      border: {
        prefix: "border",
        property: "border", // expecting border defined in CSS as border property
        tokens: "{semanticTokens.groww-primary.border}"
      },
      // Utility for interaction tokens (hover state)
      interactionHover: {
        prefix: "background",
        property: "background-color",
        tokens: "{semanticTokens.groww-primary.interaction}",
        pseudo: ":hover"
      }
    },
    'data-viz': {
      background: {
        prefix: "background",
        property: "background-color",
        tokens: "{semanticTokens.data-viz.background}"
      },
      interactionHover: {
        prefix: "background",
        property: "background-color",
        tokens: "{semanticTokens.data-viz.interaction}",
        pseudo: ":hover"
      }
    },
    temporary: {
      background: {
        prefix: "background",
        property: "background-color",
        tokens: "{semanticTokens.temporary.background}"
      },
      interactionHover: {
        prefix: "background",
        property: "background-color",
        tokens: "{semanticTokens.temporary.interaction}",
        pseudo: ":hover"
      }
    }
  }
};
