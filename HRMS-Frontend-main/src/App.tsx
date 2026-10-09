import { RouterProvider } from 'react-router-dom';
import './App.css'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { AuthProvider } from './features/auth/context/AuthContext';
import router from './router';
import NotificationListener from './features/Employee/TravelandExpense/NotificationListener';
const queryClient = new QueryClient();
(window as any).queryClient = queryClient; 
function App() {
  return (
   <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationListener />
        <RouterProvider router={router}/>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
