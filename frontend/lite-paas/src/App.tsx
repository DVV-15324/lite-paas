import { SnackbarProvider } from "notistack"
import { AuthProvider } from "./module/auth/context/authContext"
import { BrowserRouter } from "react-router-dom"
import "./App.css"
import { MainRoutes } from "./routes/MainRoutes"

export const App = () => {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <AuthProvider>
          <MainRoutes />
        </AuthProvider>
      </BrowserRouter>
    </SnackbarProvider>
  )
}


