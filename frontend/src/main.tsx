import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext.tsx'
import { ThemeProvider } from './features/theme/ThemeContext.tsx'

// starts React & renders app
// entry point of React app -> AuthProvider wraps the App here
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>,
)
