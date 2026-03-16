import React, { useState, createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { darkTheme, lightTheme } from './theme/theme'
import { AuthProvider } from './context/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const ThemeContext = createContext<{
  mode: 'light' | 'dark'
  toggleTheme: () => void
}>({
  mode: 'dark',
  toggleTheme: () => {},
})

export const useThemeMode = () => useContext(ThemeContext)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)

function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme_mode')
    return (saved as 'light' | 'dark') || 'dark'
  })

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
    localStorage.setItem('theme_mode', newMode)
  }

  const theme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
