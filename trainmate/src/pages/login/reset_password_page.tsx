import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../FirebaseConfig';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

// MUI imports
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';

// Optional: import your custom alert if you want popups
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { Dumbbell } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [oobCode, setOobCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alertPasswordsOpen, setAlertPasswordsOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // For optional alerts
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    // Get the "oobCode" from the URL (Firebase appends ?oobCode=XXX)
    const queryParams = new URLSearchParams(window.location.search);
    const codeFromUrl = queryParams.get('oobCode');

    if (!codeFromUrl) {
      setErrorMessage('Error: Invalid or missing password reset code in URL.');
    } else {
      setOobCode(codeFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      setErrorMessage('Error: No reset code found.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertPasswordsOpen(true);
      return;
    }

    try {
      // 1) Verify that the code is valid
      await verifyPasswordResetCode(auth, oobCode);

      // 2) Confirm password reset
      await confirmPasswordReset(auth, oobCode, newPassword);

      // Reset successful
      setSuccess(true);
      setErrorMessage(null);
      setAlertOpen(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        setErrorMessage('Error: Expired password reset code. Please request a new one.');
      } else {
      setErrorMessage(error.message);
      }
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <TopMiddleAlert alertText="Password reset successful!" open={alertOpen} onClose={() => setAlertOpen(false)} severity="success"/>
      <TopMiddleAlert alertText="Passwords do not match." open={alertPasswordsOpen} onClose={() => setAlertPasswordsOpen(false)} severity="error"/>

      <div className="w-full max-w-md">
        <div className="bg-[#161616] border border-gray-600 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-[#161616] p-4 flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">TrainMate</h1>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">Reset Password</h2>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#161616] text-gray-500"></span>
              </div>
            </div>
            
            {!success ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2 border border-gray-600 rounded h-14">
                  <Input
                    id="newPassword"
                    type="password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-md p-2 text-white placeholder-white text-sm"
                    sx={{ height: '100%' }}
                    style={{ borderRadius: '8px', color: 'white' }}
                    placeholder='New Password'
                  />
                </div>
                <div className="space-y-2 border border-gray-600 rounded h-14">
                  <Input
                    id="confirmPassword"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-md p-2 text-white placeholder-white text-sm"
                    sx={{ height: '100%' }}
                    style={{ borderRadius: '8px', color: 'white' }}
                    placeholder='Confirm Password'
                  />
                </div>

                {errorMessage && (
                  <div className="text-red-500 text-center">
                    {errorMessage}
                  </div>
                )}

                <Button className="w-full" variant="contained" color="primary" type="submit">
                  Reset Password
                </Button>
              </form>
            ) : (
              <div className="text-white text-center">
                <p className="text-xl mb-4">Your password has been reset successfully!</p>
                <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                  Back to Log In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-white text-sm">
        <p>© 2024 TrainMate. All rights reserved.</p>
      </div>
    </div>
  );
}