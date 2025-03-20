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
        gray900: { light: "#44475b", dark: "#f8f8f8" },
        gray800: { light: "#696c7c", dark: "#d1d1d1" },
        gray700: { light: "#7c7e8c", dark: "#b8b8b8" },
        gray600: { light: "#8f919d", dark: "#a0a0a0" },
        gray500: { light: "#a1a3ad", dark: "#888888" },
        gray400: { light: "#b0b2ba", dark: "#717171" },
        gray300: { light: "#c7c8ce", dark: "#595959" },
        gray200: { light: "#dddee1", dark: "#414141" },
        gray150: { light: "#e9e9eb", dark: "#2e2e2e" },
        gray100: { light: "#f0f0f2", dark: "#252525" },
        gray50: { light: "#f8f8f8", dark: "#1b1b1b" },
        green500: { light: "#04B488", dark: "#04B488" },
        green300: { light: "#66e3c4", dark: "#0b5e49" },
        green100: { light: "#E9FAF3", dark: "#0F251D" },
        purple500: { light: "#5367ff", dark: "#98a4ff" },
        purple300: { light: "#84a4ff", dark: "#323c89" },
        purple100: { light: "#eef0ff", dark: "#181a2a" },
        yellow500: { light: "#ffb61b", dark: "#e7a61a" },
        yellow100: { light: "#fff5e0", dark: "#46391d" },
        red500: { light: "#ED5533", dark: "#FF5E3B" },
        red100: { light: "#fae9e5", dark: "#411d16" },
        overlay00: { light: "rgba(18, 18, 18, 0)", dark: "rgba(18, 18, 18, 0)" },
        overlay30: { light: "rgba(18, 18, 18, 0.3)", dark: "rgba(18, 18, 18, 0.3)" },
        overlay70: { light: "rgba(18, 18, 18, 0.7)", dark: "rgba(18, 18, 18, 0.7)" },
        yellow11: { light: "#A16B00", dark: "#F5BC56" },
        dangerouslySetPrimaryBg: { light: "#ffffff", dark: "#121212" },
      
      }
    },
    'data-viz': {
      colors: {
        dataVizLilac: { light: "#7A7AC6", dark: "#7A7AC6" },
        dataVizLilacSubtle: { light: "#DFE0EF", dark: "#1D1E2F" },
        dataVizBlue: { light: "#5669FF", dark: "#5669FF" },
        dataVizBlueSubtle: { light: "#CAD1FE", dark: "#1E2553" },
        dataVizSkyBlue: { light: "#4DA4DD", dark: "#4DA4DD" },
        dataVizSkyBlueSubtle: { light: "#C7E2F3", dark: "#1B3749" },
        dataVizMintGreen: { light: "#04B488", dark: "#04B488" },
        dataVizMintGreenSubtle: { light: "#B2E7DA", dark: "#053C2F" },
        dataVizOliveGreen: { light: "#A1B55C", dark: "#A1B55C" },
        dataVizOliveGreenSubtle: { light: "#E1E7CD", dark: "#353C22" },
        dataVizYellow: { light: "#FCCE00", dark: "#FCCE00" },
        dataVizYellowSubtle: { light: "#FCEFB1", dark: "#504306" },
        dataVizOrange: { light: "#F59817", dark: "#F59817" },
        dataVizOrangeSubtle: { light: "#FADFB8", dark: "#4E330D" },
        dataVizRed: { light: "#FF5E3B", dark: "#FF5E3B" },
        dataVizRedSubtle: { light: "#F8CBC0", dark: "#512218" },
        dataVizMagenta: { light: "#C73A75", dark: "#C73A75" },
        dataVizMagentaSubtle: { light: "#ECC2D4", dark: "#401729" },
        dataVizBrown: { light: "#9D615C", dark: "#9D615C" },
        dataVizBrownSubtle: { light: "#DFCECD", dark: "#332322" },
        dataVizGrey: { light: "#808FA3", dark: "#808FA3" },
        dataVizGreySubtle: { light: "#BEC6D0", dark: "#434C56" },
      }
    },
    temporary: {
      colors: {
        tempNbtPink: { light: "#f1e3f3", dark: "#9b63a3" },
        tempNbtYellow: { light: "#fff3c8", dark: "#b27a00" },
        tempNbtBlue: { light: "#d6eeff", dark: "#3e79a4" },
        tempNbtGray: { light: "#f0f0f2", dark: "#5c5c6f" },
        tempNbtRed: { light: "#ffc7bb", dark: "#c85d0f" },
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
