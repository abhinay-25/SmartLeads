import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { router } from '@config/router.config';
import { useAuthHydration } from '@hooks/useAuthHydration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      staleTime:          30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component so hooks can access router context
const AppContent = () => {
  useAuthHydration();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#18181b', // zinc-900
            color: '#fafafa',      // zinc-50
            fontWeight: '500',
            fontSize: '13px',
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid #27272a', // zinc-800
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.2), 0 4px 10px -2px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' }, // emerald-500
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' }, // red-500
          },
        }}
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
