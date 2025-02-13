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
import AuthActionPage from './pages/login/auth_actions_page';
import { getUserProfile } from './api/UserAPI';
import { auth } from './FirebaseConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [completedProfile, setCompletedProfile] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const token = localStorage.getItem("token");

    if (token) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
          checkIfAllDataIsCompleted();
        } else {
          setIsAuthenticated(false);
        }
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const checkIfAllDataIsCompleted = async () => {
    try {
      const profileData = await getUserProfile();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No user authenticated");
      }
      const requiredFields = ['fullName', 'gender', 'weight', 'height', 'birthday'];
      const missingField = requiredFields.some(field => !profileData[field]);

      if (missingField) {
        setCompletedProfile(false);
      }
      else {
        setCompletedProfile(true);
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
    }
  };
  

  if (isAuthenticated === null) {
    return (<div className="min-h-screen bg-black from-gray-900 to-gray-800"></div>);
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/authAction" element={<AuthActionPage/>}/>
        
        <Route 
          path="/homepage" 
          element={isAuthenticated ? (completedProfile ? <HomePage /> : <Navigate to="/profile" />) : <Navigate to="/login" />} 
        />

        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/categories" 
          element={isAuthenticated ? (completedProfile ? <CategoriesPage /> : <Navigate to="/profile" />) : <Navigate to="/login" />} 
        />

        <Route 
          path="/physicalprogress" 
          element={isAuthenticated ? (completedProfile ? <PhysicalProgressPage /> : <Navigate to="/profile" />) : <Navigate to="/login" />} 
        />
        
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/homepage" /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
