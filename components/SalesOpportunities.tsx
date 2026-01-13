
import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  X,
  FileText,
  CheckCircle,
  Circle,
  Loader2,
  CalendarDays,
  ListTodo,
  Filter
} from 'lucide-react';
import { Opportunity, Customer, OpportunityStatus, OpportunityTask, TaskStatus } from '../types';
import { STATUS_STEPS } from '../constants';

interface SalesOpportunitiesProps {
  opportunities: Opportunity[];
  customers: Customer[];
  trainingTypes: string[];
  onAddOpportunity: (opp: Opportunity) => void;
  onUpdateStatus: (id: string, status: OpportunityStatus) => void;
  onAddTask: (opportunityId: string, task: OpportunityTask) => void;
  onUpdateTaskStatus: (opportunityId: string, taskId: string, status: TaskStatus) => void;
}

const StatusBar: React.FC<{ currentStatus: OpportunityStatus, onStatusClick: (s: OpportunityStatus) => void }> = ({ currentStatus, onStatusClick }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  
  return (
    <div className="flex items-center w-full gap-2 py-4">
      {STATUS_STEPS.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === STATUS_STEPS.length - 1;

        return (
          <React.Fragment key={status}>
            <button 
              onClick={() => onStatusClick(status)}
              className="flex flex-col items-center gap-2 group flex-1 focus:outline-none"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isCompleted ? 'bg-emerald-100 text-emerald-600' : 
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-50' : 
                'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold font-heading">{index + 1}</span>}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-tight whitespace-nowrap font-heading ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {status}
              </span>
            </button>
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const SalesOpportunities: React.FC<SalesOpportunitiesProps> = ({ 
  opportunities, 
  customers, 
  trainingTypes, 
  onAddOpportunity, 
  onUpdateStatus,
  onAddTask,
  onUpdateTaskStatus
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'requests'>('list');
  const [newTaskInput, setNewTaskInput] = useState<{ [key: string]: { text: string, date: string } }>({});
  
  // State for filtering tasks per opportunity
  const [taskFilters, setTaskFilters] = useState<{ [key: string]: TaskStatus | 'Hepsi' }>({});

  const [formData, setFormData] = useState({
    customerId: '',
    trainingType: trainingTypes[0] || '',
    description: '',
    dateRequest: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    const newOpp: Opportunity = {
      id: `FRS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: formData.customerId,
      customerName: customer?.name || 'Bilinmiyor',
      status: OpportunityStatus.NEW,
      trainingType: formData.trainingType,
      description: formData.description,
      requestedDates: formData.dateRequest ? [formData.dateRequest] : [],
      tasks: [],
      createdAt: new Date().toISOString()
    };
    onAddOpportunity(newOpp);
    setIsModalOpen(false);
    setFormData({ customerId: '', trainingType: trainingTypes[0] || '', description: '', dateRequest: '' });
  };

  const handleTaskAdd = (opportunityId: string) => {
    const input = newTaskInput[opportunityId];
    if (!input || !input.text.trim()) return;

    const newTask: OpportunityTask = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      text: input.text,
      dueDate: input.date || new Date().toISOString().split('T')[0],
      status: TaskStatus.TODO
    };

    onAddTask(opportunityId, newTask);
    setNewTaskInput({ ...newTaskInput, [opportunityId]: { text: '', date: '' } });
  };

  const getTaskIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return <CheckCircle className="text-emerald-500" size={16} />;
      case TaskStatus.IN_PROGRESS: return <Loader2 className="text-blue-500 animate-spin" size={16} />;
      default: return <Circle className="text-slate-300" size={16} />;
    }
  };

  const toggleTaskStatus = (oppId: string, task: OpportunityTask) => {
    let nextStatus: TaskStatus;
    if (task.status === TaskStatus.TODO) nextStatus = TaskStatus.IN_PROGRESS;
    else if (task.status === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.DONE;
    else nextStatus = TaskStatus.TODO;
    onUpdateTaskStatus(oppId, task.id, nextStatus);
  };

  const setOpportunityTaskFilter = (oppId: string, status: TaskStatus | 'Hepsi') => {
    setTaskFilters(prev => ({ ...prev, [oppId]: status }));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Satış Hattı</h1>
          <p className="text-slate-500 text-sm mt-1">Anlaşmaları, aşama geçişlerini ve eğitim taleplerini izleyin.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tüm Fırsatlar
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'requests' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tarih Talepleri
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} />
            Yeni Fırsat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'list' ? (
          opportunities.map((opp) => {
            const currentFilter = taskFilters[opp.id] || 'Hepsi';
            const displayedTasks = opp.tasks.filter(t => currentFilter === 'Hepsi' || t.status === currentFilter);

            return (
              <div key={opp.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Left Info Section */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-widest font-heading">{opp.id}</span>
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100 font-heading">
                          {opp.trainingType}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight font-heading">{opp.customerName}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{opp.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter font-heading">
                          <CalendarIcon size={14} className="text-blue-500" />
                          Talep: {opp.requestedDates.length > 0 ? opp.requestedDates.join(', ') : 'Belirlenmedi'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter font-heading">
                          <Clock size={14} className="text-blue-500" />
                          Oluşturma: {new Date(opp.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      {/* Task Sub-section */}
                      <div className="mt-8 pt-6 border-t border-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-heading">
                            <ListTodo size={14} className="text-blue-600" />
                            Gereken Görevler ({opp.tasks.filter(t => t.status === TaskStatus.DONE).length}/{opp.tasks.length})
                          </h4>
                          
                          {/* Task Status Filter Bar */}
                          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            {['Hepsi', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((filter) => (
                              <button
                                key={filter}
                                onClick={() => setOpportunityTaskFilter(opp.id, filter as any)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                  currentFilter === filter 
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                {filter}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 min-h-[40px]">
                          {displayedTasks.length > 0 ? displayedTasks.map(task => (
                            <div 
                              key={task.id} 
                              onClick={() => toggleTaskStatus(opp.id, task)}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                {getTaskIcon(task.status)}
                                <span className={`text-sm font-medium transition-all ${task.status === TaskStatus.DONE ? 'text-slate-300 line-through' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                  {task.text}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-300 uppercase font-heading">{task.dueDate}</span>
                            </div>
                          )) : (
                            <div className="col-span-2 py-4 text-center">
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Seçilen filtrede görev bulunamadı</p>
                            </div>
                          )}
                        </div>

                        {/* Inline Task Add */}
                        <div className="mt-4 flex items-center gap-2 bg-slate-50/50 p-2 rounded-2xl border border-dashed border-slate-200">
                          <input 
                            type="text" 
                            placeholder="Yeni görev yazın..." 
                            className="flex-1 bg-transparent border-none text-sm font-medium outline-none px-2 py-1 placeholder:text-slate-300"
                            value={newTaskInput[opp.id]?.text || ''}
                            onChange={(e) => setNewTaskInput({ ...newTaskInput, [opp.id]: { text: e.target.value, date: newTaskInput[opp.id]?.date || '' } })}
                            onKeyDown={(e) => e.key === 'Enter' && handleTaskAdd(opp.id)}
                          />
                          <input 
                            type="date" 
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] outline-none text-slate-400 font-heading"
                            value={newTaskInput[opp.id]?.date || ''}
                            onChange={(e) => setNewTaskInput({ ...newTaskInput, [opp.id]: { text: newTaskInput[opp.id]?.text || '', date: e.target.value } })}
                          />
                          <button 
                            onClick={() => handleTaskAdd(opp.id)}
                            className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Bar & Actions Section */}
                    <div className="w-full lg:w-96 flex flex-col gap-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-heading">Mevcut Durum</p>
                        <StatusBar 
                          currentStatus={opp.status} 
                          onStatusClick={(newStatus) => onUpdateStatus(opp.id, newStatus)} 
                        />
                      </div>
                      
                      <div className="flex gap-2">
                         <button className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-heading">
                           <FileText size={16} />
                           Dosyalar
                         </button>
                         <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                           <MoreVertical size={20} />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
             <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest font-heading">
                  <th className="px-8 py-5">Müşteri</th>
                  <th className="px-8 py-5">Talep Edilen Tarihler</th>
                  <th className="px-8 py-5">Eğitim Tipi</th>
                  <th className="px-8 py-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.filter(o => o.requestedDates.length > 0).map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900 font-heading">{opp.customerName}</p>
                      <p className="text-[10px] font-bold text-slate-400 font-heading">{opp.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      {opp.requestedDates.map((date, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-black border border-amber-100 mr-2 shadow-sm font-heading">
                          <CalendarDays size={12} />
                          {date}
                        </span>
                      ))}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-semibold text-slate-600">{opp.trainingType}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all font-heading active:scale-95">
                        Şimdi Planla
                      </button>
                    </td>
                  </tr>
                ))}
                {opportunities.filter(o => o.requestedDates.length > 0).length === 0 && (
                   <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-medium">Bekleyen tarih talebi bulunmamaktadır.</p>
                    </td>
                  </tr>
                )}
              </tbody>
             </table>
          </div>
        )}
      </div>

      {/* New Opportunity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none font-heading">Yeni Satış Fırsatı</h2>
                <p className="text-slate-500 text-sm mt-2">Müşteri ihtiyaçlarını ve süreci başlatın.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest font-heading">Müşteri Seçin</label>
                <select 
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-medium"
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                >
                  <option value="">Bir müşteri seçin...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest font-heading">Eğitim Tipi</label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                    value={formData.trainingType}
                    onChange={(e) => setFormData({...formData, trainingType: e.target.value})}
                  >
                    {trainingTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest font-heading">Tercih Edilen Tarih</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-heading"
                    value={formData.dateRequest}
                    onChange={(e) => setFormData({...formData, dateRequest: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest font-heading">Açıklama</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Kapsamı ve müşteri ihtiyaçlarını özetleyin..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest font-heading hover:bg-slate-50 transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest font-heading hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98]"
                >
                  Fırsatı Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOpportunities;
