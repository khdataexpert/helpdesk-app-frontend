import { useEffect } from "react";
import { useSelector } from "react-redux";

// Fallback Theme (Your default company colors)
const DEFAULT_THEME = {
    primaryColor: '#235784',        // Deep Blue (Sidebar BG)
    secondaryColor: '#EEF6F7',       // Very Light Blue (Panel BG)
    accentColor: '#F7AA00',         // Default Accent (Yellow/Orange)
    bgDefaultColor: '#40A8C4',      // Default Page BG
    textColor: '#FFFFFF',           // Text on Dark Backgrounds
}
const ThemeInitializer = () => {
    const companyTheme = useSelector(state => state.auth.theme);

    useEffect(() => {
        const themeToApply = 
        {
            ...DEFAULT_THEME,         // Start with fallback/defaults
            ...(companyTheme || {})   // Override with API data if present
        }
        const root = document.documentElement;
        root.style.setProperty('--color-primary', themeToApply.primaryColor);
        root.style.setProperty('--color-secondary', themeToApply.secondaryColor);
        root.style.setProperty('--color-accent', themeToApply.accentColor);
        root.style.setProperty('--color-bg-default', themeToApply.bgDefaultColor);
        root.style.setProperty('--color-text-on-dark', themeToApply.textColor);
    }, [companyTheme]);

    return null; 
};

export default ThemeInitializer;

