import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07080b] to-[#11141d] flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-white/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
