import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import FormLabel from '@mui/material/FormLabel';
import { Dumbbell } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../FirebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { sendCustomResetPasswordEmail } from '../../utils/AuthUtils';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { getUserProfile } from '../../api/UserAPI';
import { grey } from '@mui/material/colors';
import { Visibility as EyeIcon, VisibilityOff as ClosedEyeIcon } from '@mui/icons-material';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const [errorLoggingIn, setErrorLoggingIn] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertExerciseFillFieldsOpen, setAlertExerciseFillFieldsOpen] = useState(false);
  const [alertErrorEmailNotVerified, setAlertErrorEmailNotVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAlertExerciseFillFieldsOpen(true);
      return;
    }
    try {
      const data: any = await signInWithEmailAndPassword(auth, email, password);
      const user = data.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setAlertErrorEmailNotVerified(true);
        return;
      }
      localStorage.setItem("token", data.user.accessToken);
      setErrorLoggingIn(false);
      navigate('/homepage');
      window.location.reload();
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      setErrorLoggingIn(true);
    }
  };

  const checkIfAllDataIsCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      const profileData = await getUserProfile();

      const user = auth.currentUser;

      if (!user) {
        throw new Error("No user authenticated");
      }
      const requiredFields = ['fullName', 'gender', 'weight', 'height', 'birthday'];
      const missingField = requiredFields.some(field => !profileData[field]);

      if (missingField) {
        navigate('/profile');
        window.location.reload();
      }
      else {
        navigate('/homepage');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error en el inicio de sesión con Google:', error);
    }
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          const idToken = await user.getIdToken();
          localStorage.setItem("token", idToken);

          await checkIfAllDataIsCompleted();
          console.log('User logged in:', user);
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
      });
  }, []);

  const handleForgotPasswordClick = () => {
    setIsModalOpen(true);
  };

  const handleSendResetPassword = () => {
    if (forgotEmail) {
      sendCustomResetPasswordEmail(auth, forgotEmail)
        .then(() => {
          console.log(`Password reset email sent to ${forgotEmail}`);
          setIsModalOpen(false);
          setForgotEmail('')
          setAlertOpen(true);
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error);
        });
    } else {
      console.error('Please enter an email address.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForgotEmail('')
  };

  return (
    <div className="min-h-screen bg-black  from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <TopMiddleAlert alertText='Please fill all fields' open={alertExerciseFillFieldsOpen} onClose={() => setAlertExerciseFillFieldsOpen(false)} severity='warning' />
        <TopMiddleAlert alertText='Sent email to restore password' open={alertOpen} onClose={() => setAlertOpen(false)} severity='success' />
        <TopMiddleAlert alertText='Email not verified. Please verify it before logging in' open={alertErrorEmailNotVerified} onClose={() => setAlertErrorEmailNotVerified(false)} severity='error' />

        <div className="bg-[#161616] border border-gray-600 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-[#161616] p-4 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">TrainMate</h1>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">Log In</h2>
            <Button
              variant="outlined"
              className="w-full mb-4 flex items-center justify-center"
              type="button"
              onClick={handleGoogleSignIn}
            >
              <img src={require('../../images/google_logo.png')} alt="Google logo" className="w-5 h-5 mr-2" />
              Log In with Google
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#161616] text-gray-500">Or continue with</span>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2 border border-gray-600 rounded h-14">
                <Input
                  id="email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={handleEmailChange}
                  className="rounded-md p-2 text-white placeholder-white text-sm"
                  sx={{ height: '100%' }}
                  style={{ borderRadius: '8px', color: 'white' }}  // Optional inline styles
                  placeholder="Enter your email"  // White placeholder
                />
              </div>

              <div className="space-y-2 border border-gray-600 rounded h-14 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={password}
                  onChange={handlePasswordChange}
                  className="rounded-md p-2 text-white placeholder-white text-sm"
                  sx={{ height: '100%' }}
                  style={{ borderRadius: '8px', color: 'white' }}  // Optional inline styles
                  placeholder="Enter your password"  // White placeholder
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                  <ClosedEyeIcon sx={{color: grey[600], mt: -1}} />
                  ) : (
                  <EyeIcon sx={{color: grey[600], mt: -1}} />
                  )}
                </span>
              </div>

              <Button className="w-full" variant="contained" color="primary" type="submit">
                Log In
              </Button>
            </form>
            {errorLoggingIn && (
              <div className="mt-4 text-center text-red-500 font-medium">
                Email or Password incorrect
              </div>
            )}
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-white hover:underline" onClick={handleForgotPasswordClick}>
                Forgot password?
              </a>
            </div>
            <div className="mt-6 border-t pt-4">
              <p className="text-center text-sm text-white">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-white text-sm">
          <p>© 2024 TrainMate. All rights reserved.</p>
        </div>
      </div>

      <Dialog open={isModalOpen} onClose={handleCloseModal}
      PaperProps={{
        sx: {
          backgroundColor: grey[800],
          color: '#fff',
          borderRadius: '8px',
          width: '100%',
        },
      }}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx= {{color: '#fff', mb: 2}}>
            Please enter your email address to receive a password reset link.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            sx= {{
              color: '#fff',
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: grey[100],
              },
              "& .MuiInputLabel-root": {
                color: grey[100],
              },
              "& .MuiInputBase-input": {
                color: grey[100],
              },
            }}
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{color: '#fff'}}>
            Cancel
          </Button>
          <Button onClick={handleSendResetPassword} sx={{color: '#fff'}}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}