import { ThemeOptions } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet } from "react-router-dom";
import AppAppBar from "../component/AppAppBar";
import Footer from "../pages/campaign/components/Footer";


export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#ff914d',
    },
    secondary: {
      main: '#f50057',
    },
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  components: {
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 27,
          padding: 0,
          margin: 8,
        },
        switchBase: {
          padding: 1,
          '&$checked, &$colorPrimary$checked, &$colorSecondary$checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + $track': {
              opacity: 1,
              border: 'none',
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          border: '1px solid #bdbdbd',
          backgroundColor: '#fafafa',
          opacity: 1,
          transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
      },
    },
  },
  typography: {
    button: {
      fontWeight: 700,
    },
    h1: {
      fontSize: '4.8rem',
    },
  },
};


export default function Root(){
    // // const [showCustomTheme, setShowCustomTheme] = React.useState(true);
    // const defaultTheme = createTheme({ palette: { mode } });

    const account = localStorage.getItem('account') || null;

    return(
        // <ThemeProvider theme={blogTheme}>
        <ThemeProvider theme={createTheme(themeOptions)}>
            {/* <div> */}
            <AppAppBar />
            <div>

                <Outlet context={{account:account}} />
            </div>
            <Footer />
            {/* </div> */}
         </ThemeProvider>

    )
}