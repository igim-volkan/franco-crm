
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  MoreVertical,
  ChevronRight,
  ClipboardList,
  ArrowUpDown,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { GlobalTask, GlobalTaskStatus, Instructor } from '../types';

interface TasksProps {
  tasks: GlobalTask[];
  instructors: Instructor[];
  onAddTask: (task: GlobalTask) => void;
  onUpdateStatus: (id: string, status: GlobalTaskStatus) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, instructors, onAddTask, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<GlobalTaskStatus | 'Tümü'>('Tümü');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('Hepsi');
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: 'Yönetici',
    dueDate: '',
    priority: 'Orta' as const
  });

  // Unique list of assignees for the filter
  const assignees = useMemo(() => {
    const set = new Set(tasks.map(t => t.assignedTo));
    return Array.from(set).sort();
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const matchesStatus = statusFilter === 'Tümü' || task.status === statusFilter;
      const matchesAssignee = assignedToFilter === 'Hepsi' || task.assignedTo === assignedToFilter;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesAssignee && matchesSearch;
    });

    // Sort by Due Date
    result.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [tasks, statusFilter, assignedToFilter, dateSortOrder, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;

    const newTask: GlobalTask = {
      id: `G-TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedBy: 'Yönetici',
      dueDate: formData.dueDate,
      status: GlobalTaskStatus.PENDING,
      priority: formData.priority,
      createdAt: new Date().toISOString()
    };

    onAddTask(newTask);
    setIsModalOpen(false);
    setFormData({ title: '', description: '', assignedTo: 'Yönetici', dueDate: '', priority: 'Orta' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Orta': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Düşük': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Görev Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Ekip içi atamaları ve operasyonel iş akışını izleyin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          Yeni Görev Ata
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Controls Bar 1 */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Görevlerde ara..." 
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
              {['Tümü', GlobalTaskStatus.PENDING, GlobalTaskStatus.COMPLETED].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar 2 (Assignee & Sorting) */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <UserCheck size={14} className="text-blue-500" />
              Sorumlu Filtresi:
            </label>
            <select 
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Hepsi">Tüm Sorumlular</option>
              <option value="Yönetici">Yönetici</option>
              {assignees.filter(a => a !== 'Yönetici').map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-blue-500" />
              Tarih Sırası:
            </label>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setDateSortOrder('asc')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  dateSortOrder === 'asc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                En Yakın
              </button>
              <button
                onClick={() => setDateSortOrder('desc')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  dateSortOrder === 'desc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                En Uzak
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAndSortedTasks.length > 0 ? filteredAndSortedTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <button 
                    onClick={() => onUpdateStatus(task.id, task.status === GlobalTaskStatus.PENDING ? GlobalTaskStatus.COMPLETED : GlobalTaskStatus.PENDING)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.status === GlobalTaskStatus.COMPLETED 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 text-transparent hover:border-blue-500'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                  </button>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-bold text-slate-900 transition-all ${task.status === GlobalTaskStatus.COMPLETED ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed max-w-2xl ${task.status === GlobalTaskStatus.COMPLETED ? 'text-slate-300' : 'text-slate-500'}`}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                        <User size={12} className="text-blue-500" />
                        Sorumlu: <span className="text-slate-600">{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                        <Calendar size={12} className="text-blue-500" />
                        Vade: <span className="text-slate-600">{task.dueDate}</span>
                      </div>
                      {task.status === GlobalTaskStatus.PENDING && (
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-500 uppercase tracking-widest">
                          <Clock size={12} />
                          Bekliyor
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <button className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                     <MoreVertical size={20} />
                   </button>
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400" title={`Atayan: ${task.assignedBy}`}>
                     {task.assignedBy[0]}
                   </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-500 font-medium">Bu kriterlere uygun görev bulunmuyor.</p>
              <button 
                onClick={() => { setStatusFilter('Tümü'); setAssignedToFilter('Hepsi'); setSearchQuery(''); }}
                className="mt-4 text-blue-600 text-xs font-bold hover:underline"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-heading">Yeni Görev Ata</h2>
                <p className="text-slate-500 text-sm mt-1">Ekip içindeki bir işbirliği için detayları girin.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Görev Başlığı</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                  placeholder="Örn: Müşteri memnuniyet anketini tamamla"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Açıklama</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                  placeholder="Görevin detaylarını buraya yazın..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorumlu Kişi</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  >
                    <option value="Yönetici">Yönetici (Ben)</option>
                    {instructors.map(ins => (
                      <option key={ins.id} value={ins.name}>{ins.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Termin Tarihi</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Öncelik Seviyesi</label>
                <div className="flex gap-2">
                  {['Düşük', 'Orta', 'Yüksek'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p as any})}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                        formData.priority === p 
                          ? (p === 'Yüksek' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 
                             p === 'Orta' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 
                             'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20')
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
                >
                  Görevi Ata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
