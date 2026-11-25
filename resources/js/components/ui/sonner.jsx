import React from 'react';
import { Toaster as Sonner } from 'sonner';

function Toaster(props) {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'font-sans rounded-lg border border-border shadow-lg text-sm',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
