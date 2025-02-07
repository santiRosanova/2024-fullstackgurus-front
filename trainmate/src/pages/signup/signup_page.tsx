import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Dumbbell } from "lucide-react";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../FirebaseConfig';  // Import Firebase auth
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { saveUserInfo } from '../../api/UserAPI';
import { Input } from '@mui/material';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { grey } from '@mui/material/colors';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';

dayjs.extend(isSameOrAfter);

export default function SignUp() {
  const provider = new GoogleAuthProvider();
  const [loading, setLoading] = useState(false);
  const [alertExerciseFillFieldsOpen, setAlertExerciseFillFieldsOpen] = useState(false);
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { name, email, password, sex, birthday, weight, height } = formData;
    if (!name || !email || !password || !sex || !birthday || !weight || !height) {
      setAlertExerciseFillFieldsOpen(true);
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
      await createUserWithEmailAndPassword(auth, formDataWithIntegers.email, formDataWithIntegers.password);
      const data: any = await signInWithEmailAndPassword(auth, formDataWithIntegers.email, formDataWithIntegers.password);
      localStorage.setItem("token", data.user.accessToken);
      await saveUserInfo(formDataWithIntegers)
      setLoading(false)
      navigate('/homepage');
      window.location.reload();
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      setLoading(false)
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      localStorage.setItem("token", idToken);
      // Verificar si es el primer inicio de sesión
      const isFirstLogin = user.metadata.creationTime === user.metadata.lastSignInTime;

      if (isFirstLogin) {
        window.location.href = '/profile';
      } else {
        window.location.href = '/homepage';
      }


    } catch (error) {
      console.error('Error en el inicio de sesión con Google:', error);
    }
  };
  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
      <div className="w-full max-w-md">
        <TopMiddleAlert alertText='Please fill all fields' open={alertExerciseFillFieldsOpen} onClose={() => setAlertExerciseFillFieldsOpen(false)} severity='warning' />
          <div className="bg-black shadow-lg rounded-lg overflow-hidden border border-gray-600">
              <div className="bg-black p-4 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-white mr-2" />
                <h1 className="text-2xl font-bold text-white">TrainMate</h1>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-center text-white mb-6">Sign Up</h2>
                <Button variant="outlined" className="w-full mb-4 flex items-center justify-center border-gray-300 text-white hover:bg-gray-100" type="button" onClick={handleGoogleSignIn}>
                  <img src={require('../../images/google_logo.png')} alt="Google logo" className="w-5 h-5 mr-2" />
                  Sign up with Google
                </Button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black text-gray-500">Or continue with</span>
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
                      className="rounded-md p-2 text-white placeholder-white text-sm" // Rounded borders, smaller size
                      sx={{ height: '100%' }}
                      style={{ borderRadius: '8px', color: 'white' }} // Optional inline styles
                      placeholder="you@example.com" // White placeholder
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2 border border-gray-600 rounded h-14">
                    <Input
                      id="password"
                      type="password"
                      fullWidth
                      value={formData.password}
                      onChange={handleChange}
                      className="rounded-md p-2 text-white placeholder-white text-sm" // Rounded borders, smaller size
                      sx={{ height: '100%' }}
                      style={{ borderRadius: '8px', color: 'white' }} // Optional inline styles
                      placeholder="Password" // White placeholder
                    />
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
                            backgroundColor: 'black',
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
                              backgroundColor: "black",
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
                        fullWidth
                        value={formData.weight}
                        onChange={handleChange}
                        className="rounded-md p-2 text-white placeholder-white text-sm"
                        sx={{ height: '100%' }}
                        style={{ borderRadius: '8px', color: 'white' }}
                        placeholder="Weight (kg)" />
                    </div>
                    <div className="space-y-2 border border-gray-600 rounded h-14">
                      <Input
                        id="height"
                        type="number"
                        fullWidth
                        value={formData.height}
                        onChange={handleChange}
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
              </div>
            </div><div className="mt-8 text-center text-white text-sm">
                <p>© 2024 TrainMate. All rights reserved.</p>
          </div>
      </div>
      </>)}
    </div>
  );
}