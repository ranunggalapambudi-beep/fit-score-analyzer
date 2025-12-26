import { Layout } from '@/components/layout/Layout';
import { Brain } from 'lucide-react';

export default function Analysis() {
  return (
    <Layout title="Analisis AI" subtitle="Analisis cerdas biomotor">
      <div className="px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold font-display">Analisis AI</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Pilih atlet dari halaman Atlet untuk melihat analisis AI lengkap dengan rekomendasi latihan
          </p>
        </div>
      </div>
    </Layout>
  );
}
