// src/components/ToastProvider.jsx
import { Toaster } from 'react-hot-toast';

export default function ToastProvider({ children }) {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: 'hsl(var(--b1))',
            color: 'hsl(var(--bc))',
            border: '1px solid hsl(var(--b3))',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '16px',
            fontSize: '14px',
          },
          // Success toast
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'hsl(var(--su))',
              secondary: '#fff',
            },
            style: {
              border: '1px solid hsl(var(--su))',
            },
          },
          // Error toast
          error: {
            duration: 4000,
            iconTheme: {
              primary: 'hsl(var(--er))',
              secondary: '#fff',
            },
            style: {
              border: '1px solid hsl(var(--er))',
            },
          },
          // Loading toast
          loading: {
            iconTheme: {
              primary: 'hsl(var(--p))',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </>
  );
}