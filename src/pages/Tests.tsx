import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/ui/category-card';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { ArrowLeftRight, Star } from 'lucide-react';
import { useFavoriteTests } from '@/hooks/useFavoriteTests';
import { motion } from 'framer-motion';

export default function Tests() {
  const { favorites } = useFavoriteTests();
  const favoriteCount = favorites.length;

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
          {favoriteCount > 0 && (
            <Button variant="outline" className="gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {favoriteCount}
            </Button>
          )}
        </div>

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
    </Layout>
  );
}
