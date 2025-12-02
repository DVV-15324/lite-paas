import { SnackbarProvider } from "notistack"
import { MainRoutes } from "./module/common/MainRoutes"
import { AuthProvider } from "./module/auth/context/authContext"
import { BrowserRouter } from "react-router-dom"
import "./App.css"

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

