import { createTheme, PaletteMode } from '@mui/material';

export function getTheme(mode: PaletteMode) {
    return createTheme({
        palette: {
            mode
        }
    });
}
