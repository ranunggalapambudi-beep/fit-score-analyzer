import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/ui/category-card';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { ArrowLeftRight, Star, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { useFavoriteTests } from '@/hooks/useFavoriteTests';
import { motion } from 'framer-motion';
import { useCustomTests, CustomTestItem } from '@/hooks/useCustomTests';
import { CustomTestSheet } from '@/components/tests/CustomTestSheet';

export default function Tests() {
  const { favorites } = useFavoriteTests();
  const favoriteCount = favorites.length;
  const { customTests, deleteCustomTest } = useCustomTests();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CustomTestItem | null>(null);

  const openCreate = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (t: CustomTestItem) => { setEditing(t); setSheetOpen(true); };

  return (
    <Layout title="Tes Biomotor" subtitle="8 komponen dengan 30+ item tes">
      <div className="px-4 py-6 space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link to="/tests/compare" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Bandingkan Kategori
            </Button>
          </Link>
          <Button variant="default" className="gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Tes Kustom
          </Button>
          {favoriteCount > 0 && (
            <Button variant="outline" className="gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {favoriteCount}
            </Button>
          )}
        </div>

        {/* Custom tests owned by the current user */}
        {customTests.length > 0 && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold">Tes Kustom Saya</h3>
              <span className="text-xs text-muted-foreground">({customTests.length})</span>
            </div>
            <div className="space-y-2">
              {customTests.map((t) => {
                const cat = biomotorCategories.find((c) => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name || t.categoryId} · {t.unit} · {t.higherIsBetter ? '↑ tinggi' : '↓ rendah'}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Hapus "${t.name}"?`)) deleteCustomTest(t.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {biomotorCategories.map((category, index) => (
          <motion.div 
            key={category.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/tests/${category.id}`}>
              <CategoryCard
                name={category.name}
                description={category.description}
                iconName={category.icon}
                color={category.color}
                testCount={category.tests.length}
                categoryId={category.id}
                showImage={true}
              />
            </Link>
          </motion.div>
        ))}
      </div>

      <CustomTestSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingTest={editing}
      />
    </Layout>
  );
}
