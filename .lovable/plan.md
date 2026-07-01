## Ringkasan

Pengguna (pelatih atau atlet) bisa membuat item tes miliknya sendiri, memilih kategori biomotor tempat tes itu berada (Kekuatan, Daya Tahan, Kecepatan, Power, Fleksibilitas, Koordinasi, Keseimbangan, Kelincahan), menentukan arah nilai (tinggi/rendah lebih baik), serta mengisi norma 5 tingkat (Kurang Sekali → Baik Sekali) dengan atau tanpa kelompok usia kustom. Tes kustom hanya terlihat oleh akun pembuatnya dan langsung tersedia di form input sesi tes serta laporan PDF/radar.

## Database

Tabel baru `public.custom_tests` (private per user, RLS ketat):

- `user_id` (owner)
- `category_id` — id kategori biomotor bawaan (endurance, strength, speed, power, flexibility, coordination, balance, agility, …)
- `name`, `description`, `procedure`, `equipment` (text[]), `reference`
- `unit` (satuan), `higher_is_better` (bool)
- `use_age_groups` (bool)
- `norms` (jsonb) — array `{ gender, ageRange:[min,max], scale1..scale5:[from,to] }`

Grants + RLS: hanya owner (auth.uid() = user_id) yang boleh SELECT/INSERT/UPDATE/DELETE.

## Kode

**Baru**
- `src/hooks/useCustomTests.ts` — fetch, create, update, delete tes kustom; mengembalikan `mergedCategories` yang menggabungkan `biomotorCategories` bawaan + tes kustom user (ditandai `isCustom: true`).
- `src/components/tests/CustomTestSheet.tsx` — form pembuat/edit tes: pilih kategori, nama, satuan, arah nilai, opsi "pakai kelompok usia?", editor norma dinamis (per gender + per kelompok usia, 5 batas nilai).
- `src/components/tests/CustomTestBadge.tsx` — badge kecil "Kustom" + tombol edit/hapus.

**Diubah**
- `src/types/athlete.ts` — perluas `TestItem` dengan opsional `isCustom`, `ownerId`.
- `src/data/biomotorTests.ts` — ekspor helper `scoreValueWithNorms(value, norms, gender, age)` supaya norma tes kustom bisa memakai logika yang sama.
- `src/pages/Tests.tsx` — tombol "Tambah Tes Kustom" di header + daftar tes kustom milik user.
- `src/pages/TestCategory.tsx` — daftar tes memakai `mergedCategories`; tes kustom mendapat aksi edit/hapus.
- `src/pages/TestSession.tsx` & `src/components/tests/EditSessionSheet.tsx` — memakai `mergedCategories` supaya tes kustom muncul di form input hasil.
- `src/hooks/useSupabaseData.ts` (`upsertTestResult`) — pakai norma tes kustom saat menghitung skor bila `testId` bertipe kustom.
- `src/components/export/AthleteReportTemplate.tsx`, `src/components/export/PDFExport.tsx`, `src/utils/bulkPdfExport.ts`, `src/components/teams/TeamReportPDF.tsx` — resolve nama & kategori tes lewat `mergedCategories` sehingga tes kustom tampil di PDF & radar chart.

## UX

- Di **Tes** (`/tests`): tombol "Tambah Tes Kustom" (icon Plus). Muncul section "Tes Kustom Saya" dengan chip kategori.
- Di **detail kategori**: tes kustom milik user muncul bersama tes bawaan, dilabeli badge "Kustom", tombol edit/hapus hanya untuk milik sendiri.
- Editor norma: toggle "Gunakan kelompok usia". Bila off → 1 baris norma per gender. Bila on → user tambah baris kelompok usia (min-max) per gender. Setiap baris punya 5 kolom rentang (Kurang Sekali → Baik Sekali).
- Validasi: nama wajib, kategori wajib, satuan wajib, minimal 1 norma per gender, rentang skor tidak boleh kosong.

## Keamanan

- RLS `custom_tests`: semua policy pakai `auth.uid() = user_id`, tanpa akses anon.
- Tes kustom tidak pernah dikirim ke edge function publik `get-public-athlete`; laporan publik tetap hanya menampilkan tes bawaan.
- Sesi tes tetap milik user (kolom `user_id` di `test_sessions`), jadi hasil test kustom otomatis privat.

## Batasan

- Tes kustom tidak masuk ke ekspor CSV template import (untuk menjaga kompatibilitas).
- Radar chart tetap dibagi berdasarkan 8 kategori bawaan; nilai tes kustom dirata-ratakan ke kategorinya.
