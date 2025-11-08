import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | Friends Dictation',
  description: 'Sign in to continue learning English with Friends',
};

interface LoginPageProps {
  searchParams: {
    registered?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const showSuccessMessage = searchParams.registered === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Continue your English learning journey
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            Account created successfully! Please sign in to continue.
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>

          {/* Link to Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
