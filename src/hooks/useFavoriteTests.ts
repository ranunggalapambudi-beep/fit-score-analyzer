import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FavoriteTest {
  id: string;
  testId: string;
  categoryId: string;
  createdAt: string;
}

export function useFavoriteTests() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorite_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(
        (data || []).map((f) => ({
          id: f.id,
          testId: f.test_id,
          categoryId: f.category_id,
          createdAt: f.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (testId: string) => {
    return favorites.some((f) => f.testId === testId);
  };

  const toggleFavorite = async (testId: string, categoryId: string) => {
    if (!user) {
      toast.error('Silakan login untuk menyimpan favorit');
      return;
    }

    const existing = favorites.find((f) => f.testId === testId);

    try {
      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_tests')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;

        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        toast.success('Dihapus dari favorit');
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorite_tests')
          .insert({
            user_id: user.id,
            test_id: testId,
            category_id: categoryId,
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites((prev) => [
          {
            id: data.id,
            testId: data.test_id,
            categoryId: data.category_id,
            createdAt: data.created_at,
          },
          ...prev,
        ]);
        toast.success('Ditambahkan ke favorit');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Gagal menyimpan favorit');
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
