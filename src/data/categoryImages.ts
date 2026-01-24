// Category Images Mapping
import categorySpeed from '@/assets/category-speed.jpg';
import categoryPower from '@/assets/category-power.jpg';
import categoryAgility from '@/assets/category-agility.jpg';
import categoryStrength from '@/assets/category-strength.jpg';
import categoryEndurance from '@/assets/category-endurance.jpg';
import categoryFlexibility from '@/assets/category-flexibility.jpg';
import categoryCoordination from '@/assets/category-coordination.jpg';
import categoryBalance from '@/assets/category-balance.jpg';

export interface CategoryImageInfo {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  description: string;
}

export const categoryImages: Record<string, string> = {
  'endurance': categoryEndurance,
  'strength': categoryStrength,
  'speed': categorySpeed,
  'power': categoryPower,
  'flexibility': categoryFlexibility,
  'agility': categoryAgility,
  'coordination': categoryCoordination,
  'balance': categoryBalance,
};

export const categoryImageList: CategoryImageInfo[] = [
  {
    id: 'speed',
    name: 'Kecepatan',
    nameEn: 'Speed',
    image: categorySpeed,
    description: 'Kemampuan bergerak cepat dalam waktu singkat',
  },
  {
    id: 'power',
    name: 'Daya Ledak',
    nameEn: 'Power',
    image: categoryPower,
    description: 'Kemampuan menghasilkan tenaga eksplosif',
  },
  {
    id: 'agility',
    name: 'Kelincahan',
    nameEn: 'Agility',
    image: categoryAgility,
    description: 'Kemampuan mengubah arah dengan cepat',
  },
  {
    id: 'strength',
    name: 'Kekuatan',
    nameEn: 'Strength',
    image: categoryStrength,
    description: 'Kemampuan menghasilkan gaya otot maksimal',
  },
  {
    id: 'endurance',
    name: 'Daya Tahan',
    nameEn: 'Endurance',
    image: categoryEndurance,
    description: 'Kemampuan bertahan dalam aktivitas lama',
  },
  {
    id: 'flexibility',
    name: 'Kelenturan',
    nameEn: 'Flexibility',
    image: categoryFlexibility,
    description: 'Kemampuan rentang gerak sendi',
  },
  {
    id: 'coordination',
    name: 'Koordinasi',
    nameEn: 'Coordination',
    image: categoryCoordination,
    description: 'Kemampuan mengintegrasikan gerakan tubuh',
  },
  {
    id: 'balance',
    name: 'Keseimbangan',
    nameEn: 'Balance',
    image: categoryBalance,
    description: 'Kemampuan mempertahankan posisi tubuh',
  },
];
