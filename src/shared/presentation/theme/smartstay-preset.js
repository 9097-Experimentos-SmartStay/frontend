import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

/**
 * SmartStay theme: Aura with the brand colors, flat and solid (no gradients).
 *
 * - Primary is the brand orange. Its text is the brand navy, not white: navy on orange reads at ~5:1,
 *   white on orange does not reach 3:1. Hover goes lighter for the same reason.
 * - Surfaces use the warm `stone` grays instead of Aura's cool slate.
 * - The navy (#0d2a4f) is the dark surface of the header, the account pages and the dashboard banners.
 */
const SmartStayPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{orange.50}',
            100: '{orange.100}',
            200: '{orange.200}',
            300: '{orange.300}',
            400: '{orange.400}',
            500: '{orange.500}',
            600: '{orange.600}',
            700: '{orange.700}',
            800: '{orange.800}',
            900: '{orange.900}',
            950: '{orange.950}',
        },
        borderRadius: {
            none: '0',
            xs: '2px',
            sm: '4px',
            md: '6px',
            lg: '8px',
            xl: '12px',
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#0d2a4f',
                    hoverColor: '{primary.400}',
                    activeColor: '{primary.600}',
                },
                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.100}',
                    color: '{primary.800}',
                    focusColor: '{primary.900}',
                },
                surface: {
                    0: '#ffffff',
                    50: '{stone.50}',
                    100: '{stone.100}',
                    200: '{stone.200}',
                    300: '{stone.300}',
                    400: '{stone.400}',
                    500: '{stone.500}',
                    600: '{stone.600}',
                    700: '{stone.700}',
                    800: '{stone.800}',
                    900: '{stone.900}',
                    950: '{stone.950}',
                },
            },
        },
    },
    components: {
        button: {
            root: {
                label: { fontWeight: '600' },
            },
        },
        card: {
            root: {
                borderRadius: '{border.radius.xl}',
                // A hairline instead of a floating shadow: the card sits on the page.
                shadow: '0 0 0 1px {stone.200}',
            },
        },
        tag: {
            root: {
                fontWeight: '600',
            },
        },
    },
});

export default SmartStayPreset;
