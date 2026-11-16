import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import AnimeDetails from './pages/AnimeDetails';
import Watch from './pages/Watch';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyList from './pages/MyList';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { bootstrapAuth } from './store/slices/authSlice';
import { fetchLibrary } from './store/slices/librarySlice';

const AUTH_PAGES = ['/login', '/register'];

export default function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthPage = AUTH_PAGES.includes(location.pathname);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) void dispatch(fetchLibrary());
  }, [dispatch, user?._id]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <ScrollToTop />
      {!isAuthPage ? <Navbar /> : null}

      <main className="app-main flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAuthPage ? <Footer /> : null}
    </div>
  );
}
