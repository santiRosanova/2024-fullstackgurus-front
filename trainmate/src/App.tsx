import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/home_page';
import LogIn from './pages/login/login_page';
import SignUp from './pages/signup/signup_page';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfilePage from './pages/user/ProfilePage';
import CategoriesPage from './pages/categories/categories_page';
import PhysicalProgressPage from './pages/physical_progress/physical_progress_page';
import ResetPassword from './pages/login/reset_password_page';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if token is valid on component mount
  useEffect(() => {
    const auth = getAuth();
    const token = localStorage.getItem("token");

    // Check Firebase authentication state and token
    if (token) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is authenticated
          setIsAuthenticated(true);
        } else {
          // Invalid token, redirect to login
          setIsAuthenticated(false);
        }
      });
    } else {
      // No token, user is not authenticated
      setIsAuthenticated(false);
    }
  }, []);


  

  if (isAuthenticated === null) {
    return (<div className="min-h-screen bg-black from-gray-900 to-gray-800"></div>);
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/resetpassword" element={<ResetPassword/>}/>
        
        {/* If authenticated, show HomePage. If not, redirect to login */}
        <Route 
          path="/homepage" 
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/categories" 
          element={isAuthenticated ? <CategoriesPage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/physicalprogress" 
          element={isAuthenticated ? <PhysicalProgressPage /> : <Navigate to="/login" />} 
        />
        
        {/* Redirect any unknown routes to login if not authenticated */}
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/homepage" /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
