// app/reset-password/ResetPasswordForm.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  // ... rest of your form logic using the token
  return (
    <div>
      {/* Your password reset form JSX */}
      <p>Token: {token}</p>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}