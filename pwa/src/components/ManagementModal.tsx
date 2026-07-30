import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Pencil, Building2, Users, Save } from 'lucide-react';
import { api } from '../lib/api';
import type { AuthUser, UserInput } from '../lib/api';
import type { Filial } from '../types/database';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  onFiliallarChanged?: (filiallar: Filial[]) => void;
}

type Tab = 'filiallar' | 'users';

const emptyUserForm: UserInput = {
  name: '',
  email: '',
  password: '',
  role: 'filial',
  filial_id: null,
};

export function ManagementModal({ isOpen, onClose, currentUserId, onFiliallarChanged }: ManagementModalProps) {
  const [tab, setTab] = useState<Tab>('filiallar');
  const [filiallar, setFiliallar] = useState<Filial[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState('');

  // Filial forms
  const [newFilialNomi, setNewFilialNomi] = useState('');
  const [editingFilialId, setEditingFilialId] = useState<number | null>(null);
  const [editingFilialNomi, setEditingFilialNomi] = useState('');

  // User form
  const [userForm, setUserForm] = useState<UserInput>(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [f, u] = await Promise.all([api.getFiliallar(), api.getUsers()]);
      setFiliallar(f);
      setUsers(u);
      onFiliallarChanged?.(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ma\'lumotlarni yuklashda xatolik');
    }
  }, [onFiliallarChanged]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setTab('filiallar');
      setUserForm(emptyUserForm);
      setEditingUserId(null);
      setNewFilialNomi('');
      setEditingFilialId(null);
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  // --- Filiallar ---
  const handleAddFilial = async () => {
    if (!newFilialNomi.trim()) return;
    setError('');
    try {
      await api.createFilial(newFilialNomi.trim());
      setNewFilialNomi('');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Filial qo\'shishda xatolik');
    }
  };

  const handleSaveFilial = async (id: number) => {
    if (!editingFilialNomi.trim()) return;
    setError('');
    try {
      await api.updateFilial(id, editingFilialNomi.trim());
      setEditingFilialId(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Filialni saqlashda xatolik');
    }
  };

  const handleDeleteFilial = async (id: number) => {
    if (!confirm('Filial o\'chirilsinmi? Unga bog\'langan foydalanuvchilar filialsiz qoladi.')) return;
    setError('');
    try {
      await api.deleteFilial(id);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Filialni o\'chirishda xatolik');
    }
  };

  // --- Users ---
  const startEditUser = (u: AuthUser) => {
    setEditingUserId(u.id);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role, filial_id: u.filial_id });
    setTab('users');
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload: UserInput = { ...userForm };
      if (payload.role === 'admin') payload.filial_id = null;
      if (editingUserId) {
        const patch: Partial<UserInput> = { ...payload };
        if (!patch.password) delete patch.password;
        await api.updateUser(editingUserId, patch);
      } else {
        await api.createUser(payload);
      }
      resetUserForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Foydalanuvchini saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Foydalanuvchi o\'chirilsinmi?')) return;
    setError('');
    try {
      await api.deleteUser(id);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Foydalanuvchini o\'chirishda xatolik');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Boshqaruv</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setTab('filiallar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${tab === 'filiallar' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
              <Building2 className="w-4 h-4" /> Filiallar
            </button>
            <button
              onClick={() => setTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${tab === 'users' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
              <Users className="w-4 h-4" /> Foydalanuvchilar
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <div className="p-6">
          {tab === 'filiallar' ? (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newFilialNomi}
                  onChange={(e) => setNewFilialNomi(e.target.value)}
                  placeholder="Yangi filial nomi"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddFilial}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Qo'shish
                </button>
              </div>
              <div className="border rounded-lg divide-y">
                {filiallar.map((f) => (
                  <div key={f.id} className="flex items-center justify-between px-4 py-3">
                    {editingFilialId === f.id ? (
                      <input
                        type="text"
                        value={editingFilialNomi}
                        onChange={(e) => setEditingFilialNomi(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md mr-2"
                      />
                    ) : (
                      <div>
                        <span className="font-medium text-gray-800">{f.nomi}</span>
                        {typeof f.substations_count === 'number' && (
                          <span className="ml-2 text-sm text-gray-500">({f.substations_count} ta podstansiya)</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {editingFilialId === f.id ? (
                        <button onClick={() => handleSaveFilial(f.id)} className="text-green-600 hover:text-green-800">
                          <Save className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setEditingFilialId(f.id); setEditingFilialNomi(f.nomi); }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteFilial(f.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filiallar.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-500">Filiallar yo'q</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <form onSubmit={handleSubmitUser} className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 font-semibold text-gray-800">
                  {editingUserId ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
                </div>
                <input
                  type="text" required placeholder="Ism"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email" required placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder={editingUserId ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
                  required={!editingUserId}
                  value={userForm.password || ''}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'admin' | 'filial' })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="filial">Filial foydalanuvchisi</option>
                  <option value="admin">Admin</option>
                </select>
                {userForm.role === 'filial' && (
                  <select
                    required
                    value={userForm.filial_id ?? ''}
                    onChange={(e) => setUserForm({ ...userForm, filial_id: e.target.value ? Number(e.target.value) : null })}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Filialni tanlang</option>
                    {filiallar.map((f) => (
                      <option key={f.id} value={f.id}>{f.nomi}</option>
                    ))}
                  </select>
                )}
                <div className="md:col-span-2 flex gap-2 justify-end">
                  {editingUserId && (
                    <button type="button" onClick={resetUserForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium">
                      Bekor qilish
                    </button>
                  )}
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium">
                    {saving ? 'Saqlanmoqda...' : editingUserId ? 'Saqlash' : 'Qo\'shish'}
                  </button>
                </div>
              </form>

              <div className="border rounded-lg divide-y">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                      <span className="ml-2 text-sm text-gray-500">{u.email}</span>
                      <div className="text-sm text-gray-500">
                        {u.role === 'admin' ? (
                          <span className="text-purple-600 font-medium">Admin</span>
                        ) : (
                          <>Filial: {u.filial?.nomi || '—'}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEditUser(u)} className="text-blue-600 hover:text-blue-800">
                        <Pencil className="w-5 h-5" />
                      </button>
                      {u.id !== currentUserId && (
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-500">Foydalanuvchilar yo'q</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
