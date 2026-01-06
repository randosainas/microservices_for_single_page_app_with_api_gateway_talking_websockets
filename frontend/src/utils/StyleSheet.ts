/**
 * Needed for tailwindcss to work with shadow DOM in web components
 */
import styleText from "../style.css?inline";
export const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styleText);
