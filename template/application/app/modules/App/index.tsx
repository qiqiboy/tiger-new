import { DarkMode, LightMode, TextSnippet } from '@mui/icons-material';
import {
    AppBar,
    Badge,
    Box,
    Chip,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    Toolbar,
    Typography,
    useMediaQuery
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useCallback, useState } from 'react';
import * as React from 'react';
import ReactHelmet from 'react-helmet';
import { BrowserRouter } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import pkg from 'package.json';
import { ModalRoot } from 'app/components/Modal';
import { getTheme } from './theme';

const themeIconSx = {
    p: '2px',
    borderRadius: '50%',
    backgroundColor: theme => (theme.palette.mode === 'dark' ? '#003892' : '#001e3c')
};

const App: React.FC<{}> = () => {
    const matches = useMediaQuery('(prefers-color-scheme: dark)');
    const [theme, setTheme] = useState(() =>
        getTheme((localStorage.getItem('theme') as PaletteMode) ?? (matches ? 'dark' : 'light'))
    );
    const changeTheme = useCallback(
        (mode: PaletteMode) => {
            setTheme(getTheme(mode));
            localStorage.setItem('theme', mode);
        },
        [setTheme]
    );

    return (
        <BrowserRouter basename={process.env.BASE_NAME}>
            <ReactHelmet titleTemplate={`%s - tiger-new`} defaultTitle="tiger-new"></ReactHelmet>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <ModalRoot />
                    <AppBar component="nav" position="sticky">
                        <Toolbar>
                            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                                <Badge color="secondary" badgeContent={`v${pkg.engines['tiger-new']}`}>
                                    tiger-new
                                </Badge>
                            </Typography>
                            <Switch
                                sx={{
                                    width: 60,
                                    '& .MuiSwitch-switchBase': {
                                        padding: '6px'
                                    }
                                }}
                                checkedIcon={<DarkMode sx={themeIconSx} />}
                                icon={<LightMode sx={themeIconSx} />}
                                checked={theme.palette.mode === 'dark'}
                                onChange={ev => changeTheme(ev.target.checked ? 'dark' : 'light')}
                            />
                        </Toolbar>
                    </AppBar>
                    <Box textAlign="center" p={2}>
                        Edit <Chip icon={<TextSnippet />} size="small" label="app/modules/App/index.tsx" /> and save to reload.
                    </Box>
                </LocalizationProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
