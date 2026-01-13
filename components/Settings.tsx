
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Plus, 
  Edit2, 
  Check, 
  X,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SettingsProps {
  trainingTypes: string[];
  setTrainingTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const Settings: React.FC<SettingsProps> = ({ trainingTypes, setTrainingTypes }) => {
  const [newTypeName, setNewTypeName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    if (trainingTypes.includes(newTypeName.trim())) {
      alert('Bu eğitim türü zaten mevcut.');
      return;
    }
    setTrainingTypes([...trainingTypes, newTypeName.trim()]);
    setNewTypeName('');
  };

  const handleDeleteType = (index: number) => {
    if (window.confirm('Bu eğitim türünü silmek istediğinize emin misiniz? Mevcut fırsatları etkileyebilir.')) {
      const updated = trainingTypes.filter((_, i) => i !== index);
      setTrainingTypes(updated);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(trainingTypes[index]);
  };

  const saveEdit = () => {
    if (!editingValue.trim() || editingIndex === null) return;
    const updated = [...trainingTypes];
    updated[editingIndex] = editingValue.trim();
    setTrainingTypes(updated);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <SettingsIcon className="text-slate-400" />
          Sistem Ayarları
        </h1>
        <p className="text-slate-500">FranCo altyapısını ve veri sözlüklerini yönetin.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Training Types Management */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Eğitim Türleri</h3>
                <p className="text-xs text-slate-500">Satış fırsatlarında seçilebilen eğitim kategorileri.</p>
              </div>
            </div>
            <div className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              {trainingTypes.length} Aktif Tür
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleAddType} className="flex gap-3 mb-8">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Yeni eğitim türü adı..." 
                  className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <button 
                type="submit"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus size={20} />
                <span>Ekle</span>
              </button>
            </form>

            <div className="space-y-3">
              {trainingTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-all">
                      <Zap size={16} />
                    </div>
                    {editingIndex === index ? (
                      <input 
                        autoFocus
                        type="text"
                        className="flex-1 bg-white px-3 py-1.5 border border-blue-500 rounded-lg outline-none text-sm font-semibold shadow-sm"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') setEditingIndex(null);
                        }}
                      />
                    ) : (
                      <span className="text-sm font-semibold text-slate-700">{type}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {editingIndex === index ? (
                      <>
                        <button 
                          onClick={saveEdit}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingIndex(null)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(index)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteType(index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <ShieldCheck size={32} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Yönetici Yetkileri</h3>
                <p className="text-slate-400 text-sm mt-1">Sözlük değişiklikleri tüm şirket verilerini anlık olarak günceller.</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tüm sistemler aktif</span>
                </div>
              </div>
            </div>
            <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-50 transition-all whitespace-nowrap">
              Veritabanını Yedekle
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
