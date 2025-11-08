'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AppNav } from '@/components/layout/AppNav';

// Lazy load VideoPlayer component for better performance
const VideoPlayer = dynamic(
  () => import('@/components/video/VideoPlayer').then((mod) => ({ default: mod.VideoPlayer })),
  {
    loading: () => (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video player...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for react-player (browser-only)
  }
);

interface LearnPageProps {
  params: {
    clipId: string;
  };
}

export default function LearnPage({ params }: LearnPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle unauthenticated access
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
          <p className="mt-4 text-gray-600">Loading learning interface...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state (will redirect via useEffect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <VideoPlayer clipId={params.clipId} />
        </div>

        {/* Navigation Actions */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
