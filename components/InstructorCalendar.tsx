
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User,
  Plus,
  X,
  CalendarDays,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  GraduationCap,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  CalendarRange,
  ArrowRight,
  Plane,
  Mail,
  Phone,
  Info,
  Edit,
  Activity,
  Users2,
  Pencil,
  Zap
} from 'lucide-react';
import { TrainingEvent, Opportunity, Instructor } from '../types';

interface InstructorCalendarProps {
  events: TrainingEvent[];
  opportunities: Opportunity[];
  instructors: Instructor[];
  onUpdateDates: (id: string, dates: string[]) => void;
  onAddEvent: (event: TrainingEvent) => void;
  onToggleLeave: (instructorId: string) => void;
}

type ViewType = 'month' | 'week' | 'day';

const InstructorCalendar: React.FC<InstructorCalendarProps> = ({ 
  events, 
  opportunities, 
  instructors,
  onUpdateDates, 
  onAddEvent,
  onToggleLeave 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 15)); // 15 Haziran 2024
  const [activeView, setActiveView] = useState<ViewType>('month');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [selectedInstructorForDetail, setSelectedInstructorForDetail] = useState<Instructor | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('Hepsi');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('Hepsi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    instructorName: '',
    opportunityId: '',
    startDate: '2024-06-15T09:00',
    endDate: '2024-06-15T17:00'
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleString('tr-TR', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (activeView === 'month') newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    else if (activeView === 'week') newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    else newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    setExpandedDay(null);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.startDate.startsWith(dateStr));
  };

  const getRequestsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return opportunities.filter(opp => opp.requestedDates.includes(dateStr));
  };

  const checkConflicts = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const instructorsWithMultiple = dayEvents.reduce((acc, curr) => {
      acc[curr.instructorName] = (acc[curr.instructorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    // Fix: Explicitly type count as number to avoid 'unknown' comparison error against number type
    return Object.values(instructorsWithMultiple).some((count: number) => count > 1);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.instructorName) return;
    onAddEvent({
      id: `ETK-${Math.floor(Math.random() * 10000)}`,
      title: formData.title,
      instructorName: formData.instructorName,
      opportunityId: formData.opportunityId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'Planlandı'
    });
    setIsAddModalOpen(false);
  };

  const filteredInstructors = useMemo(() => {
    return instructors.filter(ins => {
      const matchesSpecialty = specialtyFilter === 'Hepsi' || ins.specialty === specialtyFilter;
      const matchesSearch = ins.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSpecialty && matchesSearch;
    });
  }, [instructors, specialtyFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Eğitmen Operasyon Takvimi</h1>
          <p className="text-slate-500 text-sm">Tüm eğitim süreçlerini ve eğitmen doluluklarını buradan yönetin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
            {[
              { id: 'month', label: 'Ay', icon: <LayoutGrid size={14} /> },
              { id: 'week', label: 'Hafta', icon: <CalendarIcon size={14} /> },
              { id: 'day', label: 'Gün', icon: <List size={14} /> }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === v.id 
                    ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Yeni Eğitim</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-black text-slate-900 font-heading">
                {activeView === 'month' && `${monthName} ${year}`}
                {activeView === 'week' && `Haftalık Görünüm`}
                {activeView === 'day' && currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
              <button onClick={() => handleNavigate('prev')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentDate(new Date(2024, 5, 15))} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-white rounded-lg transition-all">Bugün</button>
              <button onClick={() => handleNavigate('next')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="flex-1">
            {activeView === 'month' && (
              <>
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                  {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-0">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 h-full">
                  {blanks.map(i => (<div key={`blank-${i}`} className="border-r border-b border-slate-50 bg-slate-50/10 min-h-[120px]"></div>))}
                  {days.map(day => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = getEventsForDate(date);
                    const dayRequests = getRequestsForDate(date);
                    const hasConflict = checkConflicts(date);
                    const isToday = day === 15 && currentDate.getMonth() === 5;
                    
                    return (
                      <div 
                        key={day} 
                        onClick={() => {
                          setFormData({ ...formData, startDate: `${date.toISOString().split('T')[0]}T09:00` });
                          setIsAddModalOpen(true);
                        }}
                        className={`border-r border-b border-slate-100 p-2 min-h-[120px] hover:bg-blue-50/30 transition-all relative flex flex-col group cursor-pointer ${isToday ? 'bg-blue-50/10' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-black ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30' : 'text-slate-400'}`}>{day}</span>
                          {hasConflict && <AlertTriangle size={14} className="text-rose-500 animate-pulse" title="Eğitmen Çakışması!" />}
                        </div>

                        <div className="flex-1 space-y-1">
                          {dayEvents.map(e => (
                            <div key={e.id} className="p-1 bg-blue-600 text-white text-[9px] font-bold rounded shadow-sm truncate">
                              {e.title}
                            </div>
                          ))}
                          {dayRequests.map(r => (
                            <div key={r.id} className="p-1 bg-amber-400 text-amber-900 text-[9px] font-black rounded border border-amber-500/20 truncate">
                              TALEP: {r.customerName}
                            </div>
                          ))}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 right-1">
                          <Plus size={12} className="text-blue-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {(activeView === 'week' || activeView === 'day') && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full text-slate-400">
                <Activity size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Haftalık ve Günlük detay görünümleri yapım aşamasında.</p>
                <button onClick={() => setActiveView('month')} className="mt-4 text-blue-600 font-bold hover:underline">Ay görünümüne dön</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Eğitmen Durumları</h3>
            
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Eğitmen ara..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredInstructors.map(ins => (
                <div 
                  key={ins.id} 
                  onClick={() => setSelectedInstructorForDetail(ins)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {ins.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{ins.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{ins.specialty}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${ins.isOnLeave ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
             <div className="flex items-center gap-3 mb-4">
               <Zap size={20} className="text-amber-400" />
               <h4 className="font-black text-xs uppercase tracking-widest">Akıllı İpucu</h4>
             </div>
             <p className="text-xs leading-relaxed opacity-90">
               Haziran ayında eğitmen doluluk oranınız <b>%78</b>'e ulaştı. 15-20 Haziran arası teknik eğitimler için <b>Mert Aksoy</b> en uygun aday görünüyor.
             </p>
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 font-heading">Eğitim Planla</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full bg-white shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eğitim Başlığı</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eğitmen</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})}>
                    <option value="">Seçin...</option>
                    {instructors.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Başlangıç Tarihi</label>
                  <input type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">İptal</button>
                <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCalendar;
