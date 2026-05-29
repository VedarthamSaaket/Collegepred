'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { BookOpen, LogOut, User } from 'lucide-react';

const navLinks = [
  { href: '/colleges', label: 'Colleges' },
  { href: '/predictor', label: 'Predictor' },
  { href: '/discuss', label: 'Discuss' },
  { href: '/saved', label: 'Saved' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#D4B896] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/colleges" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#543D23]" />
              <span className="text-xl text-[#3A2917] font-semibold italic">
                CollegeDiscover
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 rounded-lg text-sm font-semibold italic transition-colors ${
                      isActive
                        ? 'text-[#543D23] bg-[#F5EDE4]'
                        : 'text-[#8B653B] hover:text-[#3A2917] hover:bg-[#F5EDE4]/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-[#8B653B] font-semibold italic">
                  <User className="w-4 h-4" />
                  <span>{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="px-3 py-1.5 text-sm font-semibold italic text-[#8B653B] hover:text-[#3A2917] hover:bg-[#F5EDE4]/50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 md:mr-1.5 inline-block" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}