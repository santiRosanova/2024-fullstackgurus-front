import { getAuth, sendPasswordResetEmail, Auth } from "firebase/auth";
import { PAGE_URL } from "../constants";

export const refreshAuthToken = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken(true);
      localStorage.setItem('token', token);
      return token;
    } else {
      throw new Error('Usuario no autenticado');
    }
  } catch (error) {
    console.error('Error al renovar el token:', error);
  }
};

export async function sendCustomResetPasswordEmail(auth: Auth, email: string) {
  const actionCodeSettings = {
    url: `${PAGE_URL}/authAction`,
    handleCodeInApp: true,
  };
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}