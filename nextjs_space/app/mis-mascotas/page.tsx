'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  PawPrint, 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  Dog, 
  Cat, 
  Bird, 
  Rabbit,
  Fish,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

const petTypeIcons: Record<string, React.ReactNode> = {
  perro: <Dog className="w-6 h-6" />,
  gato: <Cat className="w-6 h-6" />,
  ave: <Bird className="w-6 h-6" />,
  roedor: <Rabbit className="w-6 h-6" />,
  pez: <Fish className="w-6 h-6" />,
};

const petTypeColors: Record<string, string> = {
  perro: 'bg-blue-100 text-blue-600',
  gato: 'bg-orange-100 text-orange-600',
  ave: 'bg-green-100 text-green-600',
  roedor: 'bg-purple-100 text-purple-600',
  pez: 'bg-cyan-100 text-cyan-600',
};

export default function MisMascotasPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'perro',
    breed: '',
    age: '',
    weight: '',
    photoUrl: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/mis-mascotas');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPets();
    }
  }, [session]);

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      if (res.ok) {
        const data = await res.json();
        setPets(data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingPet ? `/api/pets/${editingPet.id}` : '/api/pets';
      const method = editingPet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPets();
        setShowForm(false);
        setEditingPet(null);
        setFormData({ name: '', type: 'perro', breed: '', age: '', weight: '', photoUrl: '' });
      }
    } catch (error) {
      console.error('Error saving pet:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      weight: pet.weight?.toString() || '',
      photoUrl: pet.photoUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('¿Eliminar esta mascota?')) return;

    try {
      const res = await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPets();
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const handleActivate = async (petId: string) => {
    try {
      const res = await fetch(`/api/pets/${petId}/activate`, { method: 'POST' });
      if (res.ok) {
        fetchPets();
      }
    } catch (error) {
      console.error('Error activating pet:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7baaf7]"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PawPrint className="w-7 h-7 text-[#e67c73]" />
                Mis Mascotas
              </h1>
              <p className="text-gray-600">Registra a tus mascotas para recomendaciones personalizadas</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPet(null);
              setFormData({ name: '', type: 'perro', breed: '', age: '', weight: '', photoUrl: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Mascota
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#7baaf7]/10 to-[#e67c73]/10 rounded-xl p-6 mb-8 border border-[#7baaf7]/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full">
              <Sparkles className="w-6 h-6 text-[#7baaf7]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Recomendaciones Personalizadas con IA</h3>
              <p className="text-gray-600 text-sm">
                Al registrar a tu mascota, nuestra inteligencia artificial te mostrará productos 
                especialmente seleccionados según su tipo, raza, edad y peso. ¡La mascota activa 
                (marcada con estrella) determina tus recomendaciones!
              </p>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingPet ? 'Editar Mascota' : 'Nueva Mascota'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="ave">Ave</option>
                    <option value="roedor">Roedor / Pequeña mascota</option>
                    <option value="pez">Pez</option>
                    <option value="reptil">Reptil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                    placeholder="Ej: Labrador, Siames, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de Foto</label>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                    placeholder="https://lh6.googleusercontent.com/DWA4WpR39cD5jsI_djyTeWRtzH_q5jgiQXMb5QZTb0Pl_XpD523WpzTODlGuJTAJS3F9ZVG5bJSxsZo78rchDDkloRdos_pWSX7SVkDNujaVyzkiJinifleRPDiUYApz9y0IenKu"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPet(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : editingPet ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pets Grid */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes mascotas registradas</h3>
            <p className="text-gray-600 mb-6">
              Agrega a tu mascota para recibir recomendaciones personalizadas de productos
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar mi primera mascota
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                  pet.isActive
                    ? 'border-[#7baaf7] shadow-lg shadow-[#7baaf7]/20'
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Pet Photo/Icon */}
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${petTypeColors[pet.type] || 'bg-gray-100 text-gray-600'}`}>
                    {pet.photoUrl ? (
                      <Image
                        src={pet.photoUrl}
                        alt={pet.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      petTypeIcons[pet.type] || <PawPrint className="w-8 h-8" />
                    )}
                  </div>

                  {/* Pet Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                      {pet.isActive && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#7baaf7] text-white text-xs rounded-full">
                          <Star className="w-3 h-3" /> Activo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 capitalize">
                      {pet.type}
                      {pet.breed && ` • ${pet.breed}`}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {pet.age && <span>{pet.age} años</span>}
                      {pet.weight && <span>{pet.weight} kg</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  {!pet.isActive && (
                    <button
                      onClick={() => handleActivate(pet.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[#7baaf7] hover:bg-[#7baaf7]/10 rounded-lg transition-colors text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(pet)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to Catalog */}
        {pets.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e67c73] text-white rounded-lg hover:bg-[#d56b62] transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Ver productos recomendados para {pets.find(p => p.isActive)?.name || 'tu mascota'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
