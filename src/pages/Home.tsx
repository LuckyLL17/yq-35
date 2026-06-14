import Header from '@/components/Header';
import TestCard from '@/components/TestCard';
import { TESTS } from '@/types';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTS.map((test, index) => (
            <TestCard key={test.id} test={test} index={index} />
          ))}
        </div>

        <footer className="mt-16 pb-8 text-center text-white/30 text-sm">
          <p>挑战自己的极限 · Human Benchmark</p>
        </footer>
      </main>
    </div>
  );
}
