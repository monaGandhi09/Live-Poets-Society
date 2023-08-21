import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { brown, amber, teal } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import UserPage from './pages/UserPage';
import ReviewsPage from "./pages/ReviewsPage";
import AuthorsPage from './pages/AuthorsPage'
import BooksPage from './pages/BooksPage';
import SeriesPage from './pages/SeriesPage';
import TrendingPage from "./pages/TrendingPage";

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: brown,
    secondary: amber,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><NavBar/> <UserPage/></>} />
          <Route path="/authors" element={<><NavBar/> <AuthorsPage/> </>} />
          <Route path="/books" element={<><NavBar/> <BooksPage/> </>} />
          <Route path="/series" element={<><NavBar/><SeriesPage/> </>} />
          <Route path="/book_reviews/:book_id" element={<> <NavBar/><ReviewsPage/></>}/>
          <Route path="/top_reviewers" element={<><NavBar/><TrendingPage/></>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}