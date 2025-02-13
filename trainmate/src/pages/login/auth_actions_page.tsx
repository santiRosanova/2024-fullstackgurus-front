import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../FirebaseConfig';
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
} from 'firebase/auth';

// MUI
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';

// Custom components
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { Dumbbell } from 'lucide-react';

type Step = 'loading' | 'verifyEmail' | 'resetPassword' | 'success' | 'error';

export default function AuthActionPage() {
  const navigate = useNavigate();

  // URL parameters
  const [mode, setMode] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);

  // For reset password
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Step state
  const [step, setStep] = useState<Step>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Alerts
  const [alertPasswordsOpen, setAlertPasswordsOpen] = useState(false);
  const [alertSuccessVerificationOpen, setAlertSuccessVerificationOpen] = useState(false);
  const [alertSuccessPasswordOpen, setAlertSuccessPasswordOpen] = useState(false);
  const [alertWeakPassword, setAlertWeakPassword] = useState(false);

  useEffect(() => {
    // Read query params: ?mode=xxx & oobCode=xxx
    const queryParams = new URLSearchParams(window.location.search);
    const modeFromUrl = queryParams.get('mode');
    const codeFromUrl = queryParams.get('oobCode');

    if (!modeFromUrl || !codeFromUrl) {
      setStep('error');
      setErrorMessage('Error: Invalid or missing URL parameters.');
      return;
    }

    setMode(modeFromUrl);
    setOobCode(codeFromUrl);

    // Depending on mode, do the corresponding action
    if (modeFromUrl === 'verifyEmail') {
      handleVerifyEmail(codeFromUrl);
    } else if (modeFromUrl === 'resetPassword') {
      setStep('resetPassword');
    } else {
      setStep('error');
      setErrorMessage(`Unrecognized mode: ${modeFromUrl}`);
    }
  }, []);

  /**
   * Verify Email Flow
   */
  const handleVerifyEmail = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStep('success');
      setErrorMessage(null);
      setAlertSuccessVerificationOpen(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setErrorMessage('Error: This verification link is invalid or has expired.');
    }
  };

  /**
   * Reset Password Flow
   */
  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) {
      setStep('error');
      setErrorMessage('Error: No reset code found.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertPasswordsOpen(true);
      return;
    }

    if (newPassword.length < 6) {
      setAlertWeakPassword(true);
      return;
    }

    try {
      // 1) Verify code
      await verifyPasswordResetCode(auth, oobCode);

      // 2) Confirm new password
      await confirmPasswordReset(auth, oobCode, newPassword);

      setStep('success');
      setErrorMessage(null);
      setAlertSuccessPasswordOpen(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setStep('error');
      if (error.code === 'auth/invalid-action-code') {
        setErrorMessage('Error: The reset link has expired. Please request a new one.');
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Alerts */}
      <TopMiddleAlert alertText="Success! Password has been changed" open={alertSuccessPasswordOpen} onClose={() => setAlertSuccessPasswordOpen(false)} severity="success"/>
      <TopMiddleAlert alertText="Success! Email has been verified" open={alertSuccessVerificationOpen} onClose={() => setAlertSuccessVerificationOpen(false)} severity="success"/>
      <TopMiddleAlert alertText="Passwords do not match." open={alertPasswordsOpen} onClose={() => setAlertPasswordsOpen(false)} severity="error"/>
      <TopMiddleAlert alertText='Password should be at least 6 characters long' open={alertWeakPassword} onClose={() => setAlertWeakPassword(false)} severity='warning' />

      <div className="w-full max-w-md">
        <div className="bg-[#161616] border border-gray-600 shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#161616] p-4 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">TrainMate</h1>
          </div>

          <div className="p-6">
            {step === 'resetPassword' && (
              <>
                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                  Reset Password
                </h2>

                {!errorMessage && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#161616] text-gray-500"></span>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmitReset}>
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
                      placeholder="New Password"
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
                      placeholder="Confirm Password"
                    />
                  </div>

                  {errorMessage && (
                    <div className="text-red-500 text-center">
                      {errorMessage}
                    </div>
                  )}

                  <Button className="w-full" fullWidth variant="contained" type="submit">
                    Reset Password
                  </Button>
                </form>
              </>
            )}

            {step === 'verifyEmail' && (
              <div className="text-white text-center">
                <h2 className="text-2xl font-semibold mb-6">Verifying your email...</h2>
                {errorMessage && (
                  <div className="text-red-500 text-center mb-4">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {step === 'success' && (
              <div className="text-white text-center">
                {mode === 'verifyEmail' ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Email Verified!</h2>
                    <p className="mb-4">Thank you for verifying your account.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl mb-4">Your password has been reset successfully!</h2>
                  </>
                )}
                <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
                  Back to Log In
                </Button>
              </div>
            )}

            {/* Generic error if the user lands here in an invalid state */}
            {step === 'error' && (
                <div className="text-white text-center">
                  <h2 className="text-2xl font-semibold mb-4">Oops!</h2>
                  <p className="mb-4">
                    {errorMessage || 'An error occurred while processing this action.'}
                  </p>
                  <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
                    Back to Log In
                  </Button>
                </div>
              )}

              {step === 'error' && (
                <div className="text-white text-center">
                  <h2 className="text-2xl font-semibold mb-4">Oops!</h2>
                  <p className="mb-4">
                    {errorMessage || 'An error occurred while processing this action.'}
                  </p>
                  <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
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