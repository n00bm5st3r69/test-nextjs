import { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@/components/Toolbar";
import { Box } from "@mui/material";
import "@/styles/globals.css";

export default function RecipeApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Toolbar />
        <Box
          component="main"
          flexGrow={1}
          overflow="auto"
          display="flex"
          flexDirection="column"
        >
          <Component {...pageProps} />
        </Box>
      </Box>
    </Provider>
  );
}
