"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CPUSchedulingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new CPU scheduling platform
    router.push('/cpu-scheduling');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold mb-2">Redirecting to New CPU Scheduling Platform</h1>
        <p className="text-gray-400">Taking you to the enhanced visualization experience...</p>
      </div>
    </div>
  );
}