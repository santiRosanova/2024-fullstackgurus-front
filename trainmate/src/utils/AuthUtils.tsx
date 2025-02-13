import { getAuth, sendPasswordResetEmail, updatePassword, Auth } from "firebase/auth";
import { PAGE_URL } from "../constants";

// Función para renovar el token
export const refreshAuthToken = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Forzar la renovación del token
      const token = await user.getIdToken(true);
      // Actualizar el token en localStorage
      localStorage.setItem('token', token);
      console.log('Token actualizado:', token);
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