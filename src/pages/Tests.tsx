import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/ui/category-card';
import { biomotorCategories } from '@/data/biomotorTests';

export default function Tests() {
  return (
    <Layout title="Tes Biomotor" subtitle="7 komponen dengan 30+ item tes">
      <div className="px-4 py-6 space-y-4">
        {biomotorCategories.map((category, index) => (
          <div 
            key={category.id} 
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Link to={`/tests/${category.id}`}>
              <CategoryCard
                name={category.name}
                description={category.description}
                iconName={category.icon}
                color={category.color}
                testCount={category.tests.length}
              />
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}
