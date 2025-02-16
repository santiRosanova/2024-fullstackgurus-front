import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Dumbbell } from "lucide-react";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification, signOut } from 'firebase/auth';
import { saveUserInfo } from '../../api/UserAPI';
import { Input } from '@mui/material';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { grey } from '@mui/material/colors';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { Visibility as EyeIcon, VisibilityOff as ClosedEyeIcon } from '@mui/icons-material';
import { handleNumberKeyPress } from '../../functions/numeric_key_press';

dayjs.extend(isSameOrAfter);

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [alertExerciseFillFieldsOpen, setAlertExerciseFillFieldsOpen] = useState(false);
  const [alertEmailAlreadyInUseOpen, setAlertEmailAlreadyInUseOpen] = useState(false);
  const [alertWeakPassword, setAlertWeakPassword] = useState(false);
  const [alertIncorrectEmail, setAlertIncorrectEmail] = useState(false);
  const [alertSomethingWentWrongOpen, setAlertSomethingWentWrongOpen] = useState(false);
  const [alertIncorrectNumbersOpen, setAlertIncorrectNumbersOpen] = useState(false);
  const [alertEmailVerificationSent, setAlertEmailVerificationSent] = useState(false);
  const [incorrectEmail, setIncorrectEmail] = useState(false);
  const [weakPassword, setWeakPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sex: '',
    birthday: null as Dayjs | null,
    weight: '',
    height: ''
  });

  const handleChange = (e: any) => {
    const { id, name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id || name]: value,
    }));
  };

  const verifyEmail = (e: any) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(e.target.value) && e.target.value !== '') {
      setIncorrectEmail(true);
    } else {
      setIncorrectEmail(false);
    }
  };

  const verifyPassword = (e: any) => {
    if (e.target.value.length < 6 && e.target.value !== '') {
      setWeakPassword(true);
    } else {
      setWeakPassword(false);
    }
  }

  const handleNumericChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
    ) => {
      const { name, value } = e.target;
      const twoDecimalRegex = /^\d+(\.\d{1,2})?$/;
      let maxValue = 0;
      let minValue = 0;
      if (name === 'height') {
        maxValue = 240
        minValue = 120
      } else {
        maxValue = 300
        minValue = 25
      }
  
      if (value === "") {
        setFormData((prevState) => ({
          ...prevState,
          [name]: "",
        }));
      } else {
        if (!twoDecimalRegex.test(value)) {
          return;
        }
        const numericValue = parseFloat(value);
        if (numericValue >= 1 && numericValue <= maxValue)  {
          setFormData((prevState) => ({
            ...prevState,
            [name]: value,
          }));
        } else if (numericValue < 1) {
          setFormData((prevState) => ({
            ...prevState,
            [name]: minValue.toString(),
          }));
        } else if (numericValue > maxValue) {
          setFormData((prevState) => ({
            ...prevState,
            [name]: maxValue.toString(),
          }));
        }
      }
    };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { name, email, password, sex, birthday, weight, height } = formData;
    if (!name || !email || !password || !sex || !birthday || !weight || !height) {
      setAlertExerciseFillFieldsOpen(true);
      return;
    }
    if (weakPassword) {
      setAlertWeakPassword(true);
      return;
    }
    if (incorrectEmail) {
      setAlertIncorrectEmail(true);
      return;
    }
    const parsedWeight = parseFloat(weight);
    const parsedHeight = parseFloat(height);
    if (parsedWeight < 25 || parsedWeight > 300 || parsedHeight < 120 || parsedHeight > 240) {
      setAlertIncorrectNumbersOpen(true);
      return;
    }
    setLoading(true)
    const formDataWithIntegers = {
      ...formData,
      weight: parseInt(formData.weight, 10),
      height: parseInt(formData.height, 10),
      birthday: formData.birthday ? formData.birthday.format('YYYY-MM-DD') : '',
    };

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formDataWithIntegers.email.toLowerCase(), formDataWithIntegers.password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      await saveUserInfo(idToken, formDataWithIntegers);
      await sendEmailVerification(user);
      await signOut(auth);
      setFormData({name: '', email: '', password: '', sex: '', birthday: null as Dayjs | null, weight: '', height: ''});
      setAlertEmailVerificationSent(true);
      setSentEmail(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 6000);

    } catch (error: any) {
      console.error('Error signing up:', error.message);
      setLoading(false)
      if (error.code === 'auth/email-already-in-use') {
        setAlertEmailAlreadyInUseOpen(true);
      } 
      else if (error.code === 'auth/weak-password') {
        setAlertWeakPassword(true);
      }
      else {
        setAlertSomethingWentWrongOpen(true);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      localStorage.setItem("token", idToken);
      const isFirstLogin = user.metadata.creationTime === user.metadata.lastSignInTime;

      if (isFirstLogin) {
        window.location.href = '/profile';
      } else {
        window.location.href = '/homepage';
      }


    } catch (error) {
      console.error('Error en el inicio de sesión con Google:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
      <div className="w-full max-w-md ">
        <TopMiddleAlert alertText='Please fill all fields' open={alertExerciseFillFieldsOpen} onClose={() => setAlertExerciseFillFieldsOpen(false)} severity='warning' />
        <TopMiddleAlert alertText='Email is already in use. If you forgot your password, change it from login page' open={alertEmailAlreadyInUseOpen} onClose={() => setAlertEmailAlreadyInUseOpen(false)} severity='warning' />
        <TopMiddleAlert alertText='Something went wrong signing up' open={alertSomethingWentWrongOpen} onClose={() => setAlertSomethingWentWrongOpen(false)} severity='warning' /> 
        <TopMiddleAlert alertText='Password should be at least 6 characters long' open={alertWeakPassword} onClose={() => setAlertWeakPassword(false)} severity='warning' />
        <TopMiddleAlert alertText='Please enter a valid email' open={alertIncorrectEmail} onClose={() => setAlertIncorrectEmail(false)} severity='warning' />
        <TopMiddleAlert alertText='Please enter valid numbers. Weight must be a number between 25 and 300 and Height between 120 and 240' open={alertIncorrectNumbersOpen} onClose={() => setAlertIncorrectNumbersOpen(false)} severity='warning'/>
        <TopMiddleAlert alertText='Email verification sent' open={alertEmailVerificationSent} onClose={() => setAlertEmailVerificationSent(false)} severity='success'/>

          <div className="bg-[#161616] shadow-lg rounded-lg overflow-hidden border border-gray-600">
              <div className="bg-[#161616] p-4 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-white mr-2" />
                <h1 className="text-2xl font-bold text-white">TrainMate</h1>
              </div>
              <div className="p-6">
                {!sentEmail && (
                  <>
                <h2 className="text-2xl font-semibold text-center text-white mb-6">Sign Up</h2>
                <Button variant="outlined" className="w-full mb-4 flex items-center justify-center border-gray-300 text-white" type="button" onClick={handleGoogleSignIn}>
                  <img src={require('../../images/google_logo.png')} alt="Google logo" className="w-5 h-5 mr-2" />
                  Sign up with Google
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
                  {/* Full Name */}
                  <div className="space-y-2 border border-gray-600 rounded h-14">
                    <Input
                      id="name"
                      type="text"
                      fullWidth
                      value={formData.name}
                      onChange={handleChange}
                      className="rounded-md p-2 text-white placeholder-white text-sm" // Rounded borders, smaller size
                      sx={{ height: '100%' }}
                      style={{ borderRadius: '8px', color: 'white' }} // Optional inline styles
                      placeholder="Full Name" // White placeholder
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2 border border-gray-600 rounded h-14">
                    <Input
                      id="email"
                      type="email"
                      fullWidth
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={verifyEmail}
                      className="rounded-md p-2 text-white placeholder-white text-sm" // Rounded borders, smaller size
                      sx={{ height: '100%' }}
                      style={{ borderRadius: '8px', color: 'white' }} // Optional inline styles
                      placeholder="you@example.com" // White placeholder
                    />
                  </div>
                  <div>
                    {incorrectEmail && <p className="text-red-500 text-xs">Please enter a valid email</p>}
                  </div>

                  {/* Password */}
                    <div className="space-y-2 border border-gray-600 rounded h-14 relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={verifyPassword}
                      className="rounded-md p-2 text-white placeholder-white text-sm"
                      sx={{ height: '100%' }}
                      style={{ borderRadius: '8px', color: 'white' }}
                      placeholder="Password"
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
                      <div>
                        {weakPassword && <p className="text-red-500 text-xs">Password should be at least 6 characters long</p>}
                      </div>

                  {/* Sex */}
                  <div className="space-y-2 border border-gray-600 rounded h-14">
                    <Select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      displayEmpty
                      fullWidth
                      sx={{ color: 'white', height: '100%' }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            backgroundColor: '#161616',
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <span style={{ color: 'gray' }}>Select Gender</span>
                      </MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Select>
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2 border border-gray-600 rounded h-14">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Birthday"
                        value={formData.birthday}
                        onChange={(newValue: Dayjs | null) =>
                          setFormData((prevState) => ({
                            ...prevState,
                            birthday: newValue,
                          }))
                        }
                        format="DD/MM/YYYY"
                        maxDate={dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: {
                              backgroundColor: "#161616",
                              color: grey[50],
                              borderRadius: '8px',
                              label: { color: grey[600]},
                              input: { color: '#fff' },
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: grey[700] },
                                "&:hover fieldset": { borderColor: grey[700] },
                                "&.Mui-focused fieldset": { borderColor: grey[100] },
                              },
                            },
                          },
                          popper: {
                            sx: {
                              "& .MuiPaper-root": { backgroundColor: grey[800] },
                              "& .MuiPickersCalendarHeader-root": { color: grey[50] },
                              "& .MuiDayCalendar-weekDayLabel": { color: grey[400] },
                              "& .MuiPickersDay-root": { color: grey[50] },
                              "& .MuiPickersDay-root.Mui-selected": {
                                backgroundColor: '#000000 !important',
                                color: grey[50],
                                fontWeight: 'bold',
                              },
                              "& .MuiPickersDay-root.Mui-selected:hover": {
                                backgroundColor: '#000000 !important',
                              },
                              "& .MuiPickersDay-root.MuiPickersDay-today": {
                                border: `1px solid ${grey[700]}`,
                              },
                              "& .MuiPickersDay-root:hover": {
                                backgroundColor: grey[600],
                              },
                            },
                          },
                          openPickerButton: {
                            sx: {
                              color: grey[600],
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  {/* Weight and Height */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 border border-gray-600 rounded h-14">
                      <Input
                        id="weight"
                        type="number"
                        name='weight'
                        fullWidth
                        value={formData.weight}
                        onChange={handleNumericChange}
                        onKeyDown={handleNumberKeyPress}
                        className="rounded-md p-2 text-white placeholder-white text-sm"
                        sx={{ height: '100%' }}
                        style={{ borderRadius: '8px', color: 'white' }}
                        placeholder="Weight (kg)" />
                    </div>
                    <div className="space-y-2 border border-gray-600 rounded h-14">
                      <Input
                        id="height"
                        type="number"
                        name='height'
                        fullWidth
                        value={formData.height}
                        onChange={handleNumericChange}
                        onKeyDown={handleNumberKeyPress}
                        className="rounded-md p-2 text-white placeholder-white text-sm"
                        sx={{ height: '100%' }}
                        style={{ borderRadius: '8px', color: 'white' }}
                        placeholder="Height (cm)" />
                    </div>
                  </div>
                  {/* Submit Button */}
                  <Button fullWidth variant="contained" type="submit">
                    Sign Up
                  </Button>
                </form>
                <div className="mt-6 border-t pt-4">
                  <p className="text-center text-sm text-white">
                    Already have an account?{" "}
                    <Link to="/login" className="text-white hover:underline">Log In</Link>
                  </p>
                </div>
              </>
              )}
              {sentEmail && (
              <div className="text-white text-center">
                <h2 className="text-xl mb-4">Verification email sent. Please check your email to verify your account before logging in</h2>
                <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
                  Back to Log In
                </Button>
              </div>
              )}
            </div>
            </div><div className="mt-8 text-center text-white text-sm">
                <p>© 2024 TrainMate. All rights reserved.</p>
          </div>
      </div>
      </>)}
    </div>
  );
}