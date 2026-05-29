import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white/90 backdrop-blur-md border-t border-[#D4B896]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg text-[#3A2917] font-semibold italic">
              CollegeDiscover
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/colleges"
              className="text-sm text-[#8B653B] hover:text-[#3A2917] font-semibold italic transition-colors"
            >
              Colleges
            </Link>
            <Link
              href="/predictor"
              className="text-sm text-[#8B653B] hover:text-[#3A2917] font-semibold italic transition-colors"
            >
              Predictor
            </Link>
            <Link
              href="/discuss"
              className="text-sm text-[#8B653B] hover:text-[#3A2917] font-semibold italic transition-colors"
            >
              Discuss
            </Link>
            <Link
              href="/saved"
              className="text-sm text-[#8B653B] hover:text-[#3A2917] font-semibold italic transition-colors"
            >
              Saved
            </Link>
          </div>
          <p className="text-xs text-[#B8A080]">
            &copy; {new Date().getFullYear()} CollegeDiscover. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}