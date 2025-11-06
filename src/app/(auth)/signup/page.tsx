import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Sign Up | Friends Dictation',
  description: 'Create an account to start learning English with Friends',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start learning English with Friends TV clips
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <SignupForm />

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
