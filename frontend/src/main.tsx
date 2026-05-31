import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// starts React & renders app
createRoot(document.getElementById('root')!).render(
  <App />,
)
