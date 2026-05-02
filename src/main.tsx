import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import Home from './app/Home.tsx'
import Family from './app/Family.tsx'
import ExpenseHome from './app/expense/Home.tsx'
import ExpenseChild from './app/expense/Child.tsx'
import ExpenseCar from './app/expense/Car.tsx'
import ExpenseLiving from './app/expense/Living.tsx'
import ExpenseOther from './app/expense/Other.tsx'
import Income from './app/Income.tsx'
import Financial from './app/Financial.tsx'
import Retirement from './app/Retirement.tsx'
import Results from './app/Results.tsx'
const theme = createTheme({
  // spacing: 4,
  typography: {
    fontFamily: `"Noto Sans JP", system-ui, "Segoe UI", Roboto, sans-serif`
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {}
      }
    }
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/family',
    element: <Family />
  },
  {
    path: '/expense/home',
    element: <ExpenseHome />
  },
  {
    path: '/expense/child',
    element: <ExpenseChild />
  },
  {
    path: '/expense/car',
    element: <ExpenseCar />
  },
  {
    path: '/expense/living',
    element: <ExpenseLiving />
  },
  {
    path: '/expense/other',
    element: <ExpenseOther />
  },
  {
    path: '/income',
    element: <Income />
  },
  {
    path: '/financial',
    element: <Financial />
  },
  {
    path: '/retirement',
    element: <Retirement />
  },
  {
    path: '/results',
    element: <Results />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
