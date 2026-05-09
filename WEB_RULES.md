# Aturan Pengembangan Kode Web

## Pendahuluan
Aturan ini berlaku untuk pengembangan frontend menggunakan Next.js dan React. Tujuan utama adalah memisahkan interface, tampilan, dan logic untuk memudahkan pemeliharaan, pengujian, dan skalabilitas. Terapkan prinsip DRY (Don't Repeat Yourself) dan gunakan komponen yang dapat digunakan ulang.

## Pemisahan Interface, Tampilan, dan Logic
- **Interface**: Bagian yang menangani interaksi pengguna (UI/UX), seperti event handler, state management untuk UI, dan props yang diterima komponen. Pisahkan interface dan types ke folder `types/`. Gunakan hooks seperti `useState`, `useEffect` untuk state lokal.
- **Tampilan**: Elemen visual murni, seperti JSX markup, styling dengan Tailwind CSS, dan struktur HTML. Hindari logika bisnis di sini.
- **Logic**: Logika bisnis, API calls, data processing, dan state global. Pisahkan ke folder `hooks/` sebagai custom hooks, utilities, atau context providers.

Contoh struktur folder:
```
web/app/
  components/  # Komponen reusable
  lib/         # Utilities
  hooks/       # Custom hooks untuk logic
  types/       # Interface dan types
  pages/       # Halaman utama
```

## Reusable Components
- Buat komponen yang dapat digunakan ulang untuk elemen umum seperti Button, Input, Modal, dll.
- Gunakan props untuk variasi (misalnya, `variant`, `size`).
- Hindari hardcode nilai; gunakan props atau theme untuk konsistensi.
- Contoh: Komponen `Button` yang menerima `onClick`, `children`, `disabled`, dll.

## Implementasi DRY
- Ekstrak logika berulang ke dalam custom hooks (misalnya, `useFetchData` untuk API calls).
- Gunakan utilities untuk fungsi umum seperti formatting tanggal atau validasi.
- Jangan duplikasi kode; jika ada pola berulang, abstraksikan ke komponen atau hook.
- Gunakan context atau state management (seperti Zustand atau Redux) untuk state global yang dibagikan.

## Best Practices Tambahan
- Aksesibilitas: Gunakan ARIA attributes, keyboard navigation, dan screen reader support.
- Responsivitas: Pastikan komponen bekerja di semua ukuran layar.
- Error Handling: Tampilkan toast atau skeleton untuk loading/error states.
- Testing: Tulis unit tests untuk logic dan integration tests untuk komponen.

## Referensi UI/UX
Untuk panduan styling, komponen, warna, tipografi, dan desain UI/UX, ikuti `DESIGN.md` yang berisi design system MarketNest.

## Contoh Implementasi
```tsx
// types/ButtonProps.ts
export interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

// components/Button.tsx
import { ButtonProps } from '../types/ButtonProps';

export function Button({ onClick, children, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

// hooks/useUserData.ts
export function useUserData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}

// pages/ProfilePage.tsx
import { useUserData } from '../hooks/useUserData';
import { Button } from '../components/Button';

export default function ProfilePage() {
  const { data, loading } = useUserData();

  if (loading) return <Skeleton />;

  return (
    <div>
      <h1>Profil</h1>
      <Button onClick={() => console.log('Edit')}>Edit Profil</Button>
      {/* Tampilan data */}
    </div>
  );
}
```