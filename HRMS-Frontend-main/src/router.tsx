import App from './App.tsx'
import LoginPage from '../src/features/auth/pages/LoginPage'
import RegisterPage from '../src/features/auth/pages/RegisterPage'
import { createBrowserRouter, RouterProvider , Navigate } from 'react-router-dom';
import { Children } from 'react';
import Home from './Home.tsx';
import MainLayout from './MainLayout.tsx' ;
import type { JSX } from 'react/jsx-dev-runtime';
import useAuth from './features/auth/hooks/useAuth.tsx';
import HRHomePage  from './features/HR/HRHomePage.tsx';
import EmpHomePage from './features/Employee/EmpHomePage.tsx';
import ManagerHomePage from './features/Manager/ManagerHomePage.tsx';
import UnauthorizedPage from './UnauthorizedPage.tsx';
import HrRoutes from './features/HR/HrRoutes.tsx';
import EmployeeRoutes from './features/Employee/EmployeeRoutes.tsx';
import ManagerRoutes from './features/Manager/ManagerRoutes.tsx';

const Protected = ({children } : {children:JSX.Element})=>{
    const {accessToken} = useAuth();
   return accessToken ? children : <Navigate to="/login"/>;
}

const RoleProtected = ({children , allowedRoles } : {children:JSX.Element , allowedRoles:string[]})=>{
    const {accessToken , role} = useAuth();
    if(!accessToken){
        return  <Navigate to="/login"/>;
    }
    console.log(role);
    if(!role || !allowedRoles.includes(role)){
        return <Navigate to="/unauthorized" replace></Navigate>;
    }
    return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children : [
        {
            index:true,
            element : (
                <Protected>
                    <Home/>
                </Protected>
            ),
        },
        {path : "login" , element : <LoginPage/>},
        {path : "register" , element:<RegisterPage/>} , 
        {path : "unauthorized" , element: <UnauthorizedPage />},
        {
            path:"hr" , element : (
                <Protected>
                    <RoleProtected  allowedRoles={["HR"]}>
                        <HRHomePage/>
                    </RoleProtected>
                </Protected>
            ) , 
            children: HrRoutes,
        },
         {
            path:"manager" , element :(

                <Protected>
                    <RoleProtected  allowedRoles={["Manager"]}>
                        <ManagerHomePage/>
                    </RoleProtected>
                </Protected>
                ),      
                children : ManagerRoutes,
        },
         {
            path:"employee" , element : 
                (<Protected>
                    <RoleProtected  allowedRoles={["Employee"]}>
                        <EmpHomePage/>
                    </RoleProtected>
                </Protected>) , 
                   children : EmployeeRoutes,
        }
    ]
  },
 
]);
export default router;