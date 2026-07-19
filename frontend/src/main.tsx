import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext.tsx'
import { ThemeProvider } from './features/theme/ThemeContext.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// starts React & renders app
// entry point of React app -> AuthProvider wraps the App here
const app = (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
)

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

createRoot(document.getElementById('root')!).render(
  googleClientId
    ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    : app,
)
