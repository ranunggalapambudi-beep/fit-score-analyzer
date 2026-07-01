import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { biomotorCategories, TestItem, TestNorm, BiomotorCategory } from '@/data/biomotorTests';
import { toast } from 'sonner';

export interface CustomTestRow {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  procedure: string | null;
  equipment: string[] | null;
  reference: string | null;
  unit: string;
  higher_is_better: boolean;
  use_age_groups: boolean;
  norms: TestNorm[];
  created_at: string;
  updated_at: string;
}

export interface CustomTestItem extends TestItem {
  isCustom: true;
  ownerId: string;
  categoryId: string;
  useAgeGroups: boolean;
  higherIsBetter: boolean;
  unit: string;
}

function rowToTestItem(row: CustomTestRow): CustomTestItem {
  const norms: TestNorm[] = (row.norms || []).map((n) => ({
    gender: n.gender,
    ageRange: n.ageRange,
    scale1: n.scale1,
    scale2: n.scale2,
    scale3: n.scale3,
    scale4: n.scale4,
    scale5: n.scale5,
    unit: n.unit ?? row.unit,
    higherIsBetter: n.higherIsBetter ?? row.higher_is_better,
  }));
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    procedure: row.procedure ?? '',
    equipment: row.equipment ?? [],
    reference: row.reference ?? '',
    norms,
    isCustom: true,
    ownerId: row.user_id,
    categoryId: row.category_id,
    useAgeGroups: row.use_age_groups,
    higherIsBetter: row.higher_is_better,
    unit: row.unit,
  };
}

export interface CustomTestPayload {
  categoryId: string;
  name: string;
  description?: string;
  procedure?: string;
  equipment?: string[];
  reference?: string;
  unit: string;
  higherIsBetter: boolean;
  useAgeGroups: boolean;
  norms: TestNorm[];
}

export function useCustomTests() {
  const { user } = useAuth();
  const [customTests, setCustomTests] = useState<CustomTestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    if (!user) {
      setCustomTests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('custom_tests fetch error', error);
      setCustomTests([]);
    } else {
      setCustomTests((data as unknown as CustomTestRow[]).map(rowToTestItem));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const createCustomTest = async (payload: CustomTestPayload) => {
    if (!user) {
      toast.error('Anda harus masuk terlebih dahulu');
      return null;
    }
    const { data, error } = await supabase
      .from('custom_tests')
      .insert({
        user_id: user.id,
        category_id: payload.categoryId,
        name: payload.name,
        description: payload.description ?? '',
        procedure: payload.procedure ?? '',
        equipment: payload.equipment ?? [],
        reference: payload.reference ?? '',
        unit: payload.unit,
        higher_is_better: payload.higherIsBetter,
        use_age_groups: payload.useAgeGroups,
        norms: payload.norms as unknown as never,
      })
      .select('*')
      .single();
    if (error) {
      toast.error('Gagal menyimpan tes kustom: ' + error.message);
      return null;
    }
    toast.success('Tes kustom berhasil dibuat');
    await fetchTests();
    return rowToTestItem(data as unknown as CustomTestRow);
  };

  const updateCustomTest = async (id: string, payload: CustomTestPayload) => {
    const { error } = await supabase
      .from('custom_tests')
      .update({
        category_id: payload.categoryId,
        name: payload.name,
        description: payload.description ?? '',
        procedure: payload.procedure ?? '',
        equipment: payload.equipment ?? [],
        reference: payload.reference ?? '',
        unit: payload.unit,
        higher_is_better: payload.higherIsBetter,
        use_age_groups: payload.useAgeGroups,
        norms: payload.norms as unknown as never,
      })
      .eq('id', id);
    if (error) {
      toast.error('Gagal memperbarui tes: ' + error.message);
      return false;
    }
    toast.success('Tes kustom diperbarui');
    await fetchTests();
    return true;
  };

  const deleteCustomTest = async (id: string) => {
    const { error } = await supabase.from('custom_tests').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus tes: ' + error.message);
      return false;
    }
    toast.success('Tes kustom dihapus');
    await fetchTests();
    return true;
  };

  const mergedCategories: BiomotorCategory[] = useMemo(() => {
    return biomotorCategories.map((cat) => {
      const extras = customTests.filter((t) => t.categoryId === cat.id);
      if (!extras.length) return cat;
      return { ...cat, tests: [...cat.tests, ...extras] };
    });
  }, [customTests]);

  return {
    customTests,
    mergedCategories,
    loading,
    createCustomTest,
    updateCustomTest,
    deleteCustomTest,
    refresh: fetchTests,
  };
}

export function isCustomTestItem(test: TestItem): test is CustomTestItem {
  return (test as CustomTestItem).isCustom === true;
}