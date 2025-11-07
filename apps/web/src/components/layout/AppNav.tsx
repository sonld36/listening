'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn', label: 'Learn', disabled: true, comingSoon: true },
  { href: '/flashcards', label: 'Flashcards', disabled: true, comingSoon: true },
  { href: '/profile', label: 'Profile', disabled: true, comingSoon: true },
];

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand - Left Side */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent"
            >
              Friends Dictation
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isDisabled = link.disabled || link.comingSoon;

              return (
                <div key={link.href} className="relative group">
                  <Link
                    href={isDisabled ? '#' : link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : isDisabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={(e) => {
                      if (isDisabled) e.preventDefault();
                    }}
                  >
                    {link.label}
                    {link.comingSoon && (
                      <span className="ml-1 text-xs text-gray-400">
                        (Soon)
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* User Menu - Right Side */}
          <div className="flex items-center space-x-4">
            {/* User Email - Desktop Only */}
            <div className="hidden sm:block">
              <span className="text-sm text-gray-700">
                {session?.user?.email}
              </span>
            </div>

            {/* Logout Button - Desktop */}
            <div className="hidden md:block">
              <LogoutButton variant="button" className="text-sm" />
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isDisabled = link.disabled || link.comingSoon;

              return (
                <Link
                  key={link.href}
                  href={isDisabled ? '#' : link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                >
                  {link.label}
                  {link.comingSoon && (
                    <span className="ml-1 text-xs text-gray-400">(Soon)</span>
                  )}
                </Link>
              );
            })}

            {/* User Info & Logout - Mobile */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-3 mb-3">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.email}
                </p>
              </div>
              <div className="px-3">
                <LogoutButton variant="button" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
