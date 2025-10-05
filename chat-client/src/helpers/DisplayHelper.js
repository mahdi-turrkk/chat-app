import tailwindConfig from '../../tailwind.config.js';
import defaultTheme from 'tailwindcss/defaultTheme.js';

const fullConfig = {
    theme: {
        ...defaultTheme,
        ...tailwindConfig.theme,
    },
};
const screens = fullConfig.theme?.screens || {};

let breakpoints = {};
for (const key in screens) {
    const val = Array.isArray(screens[key]) ? screens[key][0] : screens[key];
    breakpoints[key] = parseInt(val.replace('rem', '')*16);
}

let displayHelperObject = {};
export function displayHelper(width) {
    if (width < breakpoints.sm) {
        displayHelperObject['breakPointName'] = 'xs'
        displayHelperObject['xs'] = true
        displayHelperObject['sm'] = false
        displayHelperObject['md'] = false
        displayHelperObject['lg'] = false
        displayHelperObject['xl'] = false
        displayHelperObject['2xl'] = false
        displayHelperObject['smAndUp'] = false
        displayHelperObject['mdAndUp'] = false
        displayHelperObject['lgAndUp'] = false
        displayHelperObject['xlAndUp'] = false
        displayHelperObject['smAndDown'] = true
        displayHelperObject['mdAndDown'] = true
        displayHelperObject['lgAndDown'] = true
        displayHelperObject['xlAndDown'] = true
    } else if (width >= breakpoints.sm && width < breakpoints.md) {
        displayHelperObject['breakPointName'] = 'sm'
        displayHelperObject['xs'] = false
        displayHelperObject['sm'] = true
        displayHelperObject['md'] = false
        displayHelperObject['lg'] = false
        displayHelperObject['xl'] = false
        displayHelperObject['2xl'] = false
        displayHelperObject['smAndUp'] = true
        displayHelperObject['mdAndUp'] = false
        displayHelperObject['lgAndUp'] = false
        displayHelperObject['xlAndUp'] = false
        displayHelperObject['smAndDown'] = true
        displayHelperObject['mdAndDown'] = true
        displayHelperObject['lgAndDown'] = true
        displayHelperObject['xlAndDown'] = true
    } else if (width >= breakpoints.md && width < breakpoints.lg) {
        displayHelperObject['breakPointName'] = 'md'
        displayHelperObject['xs'] = false
        displayHelperObject['sm'] = false
        displayHelperObject['md'] = true
        displayHelperObject['lg'] = false
        displayHelperObject['xl'] = false
        displayHelperObject['2xl'] = false
        displayHelperObject['smAndUp'] = true
        displayHelperObject['mdAndUp'] = true
        displayHelperObject['lgAndUp'] = false
        displayHelperObject['xlAndUp'] = false
        displayHelperObject['smAndDown'] = false
        displayHelperObject['mdAndDown'] = true
        displayHelperObject['lgAndDown'] = true
        displayHelperObject['xlAndDown'] = true
    } else if (width >= breakpoints.lg && width < breakpoints.xl) {
        displayHelperObject['breakPointName'] = 'lg'
        displayHelperObject['xs'] = false
        displayHelperObject['sm'] = false
        displayHelperObject['md'] = false
        displayHelperObject['lg'] = true
        displayHelperObject['xl'] = false
        displayHelperObject['2xl'] = false
        displayHelperObject['smAndUp'] = true
        displayHelperObject['mdAndUp'] = true
        displayHelperObject['lgAndUp'] = true
        displayHelperObject['xlAndUp'] = false
        displayHelperObject['smAndDown'] = false
        displayHelperObject['mdAndDown'] = false
        displayHelperObject['lgAndDown'] = true
        displayHelperObject['xlAndDown'] = true
    } else if (width >= breakpoints.xl && width < breakpoints['2xl']) {
        displayHelperObject['breakPointName'] = 'xl'
        displayHelperObject['xs'] = false
        displayHelperObject['sm'] = false
        displayHelperObject['md'] = false
        displayHelperObject['lg'] = false
        displayHelperObject['xl'] = true
        displayHelperObject['2xl'] = false
        displayHelperObject['smAndUp'] = true
        displayHelperObject['mdAndUp'] = true
        displayHelperObject['lgAndUp'] = true
        displayHelperObject['xlAndUp'] = true
        displayHelperObject['smAndDown'] = false
        displayHelperObject['mdAndDown'] = false
        displayHelperObject['lgAndDown'] = false
        displayHelperObject['xlAndDown'] = true
    } else if (breakpoints['2xl'] <= width) {
        displayHelperObject['breakPointName'] = '2xl'
        displayHelperObject['xs'] = false
        displayHelperObject['sm'] = false
        displayHelperObject['md'] = false
        displayHelperObject['lg'] = false
        displayHelperObject['xl'] = false
        displayHelperObject['2xl'] = true
        displayHelperObject['smAndUp'] = true
        displayHelperObject['mdAndUp'] = true
        displayHelperObject['lgAndUp'] = true
        displayHelperObject['xlAndUp'] = true
        displayHelperObject['smAndDown'] = false
        displayHelperObject['mdAndDown'] = false
        displayHelperObject['lgAndDown'] = false
        displayHelperObject['xlAndDown'] = false
    }
    return displayHelperObject
}