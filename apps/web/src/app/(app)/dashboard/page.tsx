'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { AppNav } from '@/components/layout/AppNav';

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  disabled: boolean;
}

const quickActions: QuickActionCard[] = [
  {
    title: 'Start Learning',
    description: 'Practice English with 10-second Friends clips',
    href: '/learn',
    icon: '🎬',
    disabled: true,
  },
  {
    title: 'Review Flashcards',
    description: 'Study your saved vocabulary words',
    href: '/flashcards',
    icon: '📚',
    disabled: true,
  },
  {
    title: 'View Progress',
    description: 'Track your learning statistics and streaks',
    href: '/progress',
    icon: '📈',
    disabled: true,
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle loading and unauthenticated states
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state (will redirect via useEffect)
  if (!session) {
    return null;
  }

  const userEmail = session.user?.email || 'User';
  const userName = userEmail.split('@')[0]; // Extract username from email

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Ready to continue your English learning journey?
          </p>
        </div>

        {/* Quick Actions Section */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all ${
                  action.disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-md hover:border-green-300 cursor-pointer'
                }`}
              >
                <Link
                  href={action.disabled ? '#' : action.href}
                  onClick={(e) => {
                    if (action.disabled) e.preventDefault();
                  }}
                  className="block"
                >
                  <div className="flex items-start">
                    <span className="text-4xl mr-4" aria-hidden="true">
                      {action.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {action.title}
                        {action.disabled && (
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            (Coming Soon)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Empty State / Getting Started Section */}
        <section>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 p-6 sm:p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-5xl mb-4" aria-hidden="true">
                🚀
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your Learning Hub is Almost Ready
              </h2>
              <p className="text-gray-700 mb-4">
                We're building amazing features to help you master English through Friends TV clips. Stay tuned for:
              </p>
              <ul className="text-left space-y-2 max-w-md mx-auto text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>Interactive dictation exercises with 10-second clips</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>Smart vocabulary flashcard system</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✨</span>
                  <span>Progress tracking and daily streaks</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-600">
                These features will be available in the coming updates. Check back soon!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
