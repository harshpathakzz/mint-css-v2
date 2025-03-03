const designSystemConfig = {
  // PRIMITIVES: Base tokens (e.g. colors) with light/dark values.
  primitives: {
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
      gray50:  { light: "#f8f8f8", dark: "#1b1b1b" },
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
      // Temporary (pod-specific) tokens:
      tempNbtPink: { light: "#f1e3f3", dark: "#9b63a3" },
      tempNbtYellow: { light: "#fff3c8", dark: "#b27a00" },
      tempNbtBlue: { light: "#d6eeff", dark: "#3e79a4" },
      tempNbtGray: { light: "#f0f0f2", dark: "#5c5c6f" },
      tempNbtRed: { light: "#ffc7bb", dark: "#c85d0f" }
    }
    // (Add other primitive groups like spacing, borderRadius if needed.)
  },

  // SEMANTIC TOKENS: Map design roles to primitives.
  semanticTokens: {
    // Background tokens (from background-tokens.css)
    background: {
      primary: { light: "{colors.white}", dark: "{colors.black}" },
      secondary: "{colors.gray50}",
      tertiary: "{colors.gray100}",
      transparent: "{colors.overlay00}",
      surfacePrimary: "{colors.white}",
      surfaceSecondary: "{colors.gray50}",
      inversePrimary: { light: "{colors.gray900}", dark: "{colors.white}" },
      overlayPrimary: "{colors.overlay70}",
      overlaySecondary: "{colors.overlay30}",
      alwaysDark: "{colors.black}",
      alwaysLight: "{colors.white}",
      // Extended tokens:
      accent: "{colors.green500}",
      positive: "{colors.green500}",
      negative: "{colors.red500}",
      warning: "{colors.yellow500}",
      accentSubtle: "{colors.green100}",
      positiveSubtle: "{colors.green100}",
      negativeSubtle: "{colors.red100}",
      warningSubtle: "{colors.yellow100}",
      accentSecondary: "{colors.purple500}",
      accentSecondarySubtle: "{colors.purple100}"
    },

    // Border tokens (from border-tokens.css)
    border: {
      primary: "{colors.gray150}",
      disabled: "{colors.gray100}",
      accent: "{colors.green500}",
      positive: "{colors.green500}",
      negative: "{colors.red500}",
      neutral: { light: "{colors.gray900}", dark: "{colors.white}" }
    },

    // Content tokens (from content-tokens.css)
    content: {
      primary: { light: "{colors.gray900}", dark: "{colors.white}" },
      secondary: "{colors.gray700}",
      tertiary: "{colors.gray500}",
      inversePrimary: { light: "{colors.white}", dark: "{colors.black}" },
      inverseSecondary: { light: "{colors.gray300}", dark: "{colors.gray400}" },
      disabled: "{colors.gray400}",
      onColour: "{colors.white}",
      onColourInverse: { light: "{colors.gray900}", dark: "{colors.black}" },
      // Extended tokens:
      accent: "{colors.green500}",
      negative: "{colors.red500}",
      warning: "{colors.yellow500}",
      positive: "{colors.green500}",
      accentSecondary: "{colors.purple500}",
      accentSecondarySubtle: "{colors.purple300}",
      onWarningSubtle: "{colors.yellow11}"
    },

    // Interaction state tokens (from interaction-state-tokens.css)
    interaction: {
      bgTransparentHover: "#44475B0F",
      bgAccentHover: "#04AD83",
      bgAccentSubtleHover: "#DDF5EE",
      bgTransparentAccentHover: "#00B3860F",
      bgPositiveHover: "#04AD83",
      bgPositiveSubtleHover: "#DDF5EE",
      bgTransparentPositiveHover: "#00B3860F",
      bgNegativeHover: "#E15A3E",
      bgNegativeSubtleHover: "#F9E0DB",
      bgTransparentNegativeHover: "#EB5B3C0F",
      bgTransparentSelected: "#44475B0F",
      bgAccentSelected: "#04AD83",
      bgAccentSubtleSelected: "#DDF5EE",
      bgTransparentAccentSelected: "#00B3860F",
      bgPositiveSelected: "#04AD83",
      bgPositiveSubtleSelected: "#DDF5EE",
      bgTransparentPositiveSelected: "#00B3860F",
      bgNegativeSelected: "#E15A3E",
      bgNegativeSubtleSelected: "#F9E0DB",
      bgTransparentNegativeSelected: "#EB5B3C0F"
    }
  },

  // UTILITY CLASSES: Configuration for generating CSS utility classes.
  utilityClasses: {
    // Background utility classes (from background-utils.css)
    background: {
      prefix: "background",
      tokens: "{semanticTokens.background}"
    },
    // Border utility classes (from border-utils.css)
    border: {
      prefix: "border",
      tokens: "{semanticTokens.border}"
    },
    // Content utility classes (from content-utils.css)
    content: {
      prefix: "content",
      tokens: "{semanticTokens.content}"
    },
    // Interaction state utility classes (from interaction-state-utils.css)
    interaction: {
      prefix: "background",
      tokens: "{semanticTokens.interaction}"
    },
    // Temporary background utility classes (from temp-background-utils.css)
    tempBackground: {
      prefix: "tempNbtBackground",
      tokens: {
        pink: "{primitives.colors.tempNbtPink}",
        yellow: "{primitives.colors.tempNbtYellow}",
        blue: "{primitives.colors.tempNbtBlue}",
        gray: "{primitives.colors.tempNbtGray}",
        red: "{primitives.colors.tempNbtRed}"
      }
    }
  }
};

module.exports = designSystemConfig;
