
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User,
  Plus,
  X,
  CalendarDays,
  Check,
  AlertCircle,
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
  ChevronDown,
  ChevronUp,
  Activity,
  Users2,
  Pencil
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
  
  // Expanded Day State for Month View
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Detail Modal State
  const [selectedInstructorForDetail, setSelectedInstructorForDetail] = useState<Instructor | null>(null);

  // Date Update Modal States
  const [isDateEditModalOpen, setIsDateEditModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<{ opp: Opportunity, oldDate: string } | null>(null);
  const [newRequestedDate, setNewRequestedDate] = useState('');

  // Filter States
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleString('tr-TR', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (activeView === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (activeView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
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

  const getInstructorScheduleForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return instructors.map(instructor => {
      const event = events.find(e => e.instructorName === instructor.name && e.startDate.startsWith(dateStr));
      const status = instructor.isOnLeave ? 'İzinde' : (event ? 'Eğitimde' : 'Müsait');
      return {
        instructor,
        status,
        eventTitle: event?.title
      };
    });
  };

  const getInstructorAvailabilityForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const trainingInstructors = new Set(events.filter(e => e.startDate.startsWith(dateStr)).map(e => e.instructorName));
    const leaveInstructors = instructors.filter(ins => ins.isOnLeave);
    
    return {
      trainingCount: trainingInstructors.size,
      leaveCount: leaveInstructors.length,
      trainingNames: Array.from(trainingInstructors),
      leaveNames: leaveInstructors.map(i => i.name)
    };
  };

  const getStatusStyles = (status: TrainingEvent['status']) => {
    switch (status) {
      case 'Tamamlandı':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-500',
          text: 'text-emerald-800',
          icon: <CheckCircle2 size={12} className="text-emerald-500" />
        };
      case 'İptal Edildi':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-500',
          text: 'text-rose-800',
          icon: <XCircle size={12} className="text-rose-500" />
        };
      case 'Planlandı':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-800',
          icon: <Clock size={12} className="text-blue-500" />
        };
    }
  };

  const getInstructorStatusForCurrentDate = (instructorName: string, instructorIsOnLeave: boolean) => {
    if (instructorIsOnLeave) return 'İzinde';
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasEvent = events.some(e => e.instructorName === instructorName && e.startDate.startsWith(dateStr));
    return hasEvent ? 'Eğitimde' : 'Müsait';
  };

  const handleOpenDateEdit = (opp: Opportunity, date: string) => {
    setEditingOpp({ opp, oldDate: date });
    setNewRequestedDate(date);
    setIsDateEditModalOpen(true);
  };

  const handleUpdateDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp || !newRequestedDate) return;

    const updatedDates = editingOpp.opp.requestedDates.map(d => d === editingOpp.oldDate ? newRequestedDate : d);
    onUpdateDates(editingOpp.opp.id, updatedDates);
    setIsDateEditModalOpen(false);
    setEditingOpp(null);
  };

  const filteredInstructors = useMemo(() => {
    return instructors.filter(ins => {
      const status = getInstructorStatusForCurrentDate(ins.name, ins.isOnLeave);
      const matchesStatus = statusFilter === 'Hepsi' || status === statusFilter;
      const matchesSpecialty = specialtyFilter === 'Hepsi' || ins.specialty === specialtyFilter;
      const matchesSearch = ins.name.toLowerCase().includes(searchQuery.toLowerCase()) || ins.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSpecialty && matchesSearch;
    });
  }, [instructors, statusFilter, specialtyFilter, searchQuery, currentDate, events]);

  const specialties = useMemo(() => {
    const set = new Set(instructors.map(ins => ins.specialty));
    return Array.from(set).sort();
  }, [instructors]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.instructorName) return;

    const newEvent: TrainingEvent = {
      id: `ETK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      instructorName: formData.instructorName,
      opportunityId: formData.opportunityId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'Planlandı'
    };

    onAddEvent(newEvent);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      instructorName: '',
      opportunityId: '',
      startDate: '2024-06-15T09:00',
      endDate: '2024-06-15T17:00'
    });
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Eğitmen Takvimi</h1>
          <p className="text-slate-500 text-sm">Görünümler arasında geçiş yaparak planlamanızı optimize edin.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
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
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
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
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} />
            Eğitim Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                {activeView === 'month' && `${monthName} ${year}`}
                {activeView === 'week' && `Haziran 2024 - Hafta ${Math.ceil(currentDate.getDate() / 7)}`}
                {activeView === 'day' && currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handleNavigate('prev')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date(2024, 5, 15))} className="px-4 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100 transition-all">Bugün</button>
              <button onClick={() => handleNavigate('next')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[600px]">
            {activeView === 'month' && (
              <>
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                  {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1">
                  {blanks.map(i => (<div key={`blank-${i}`} className="border-r border-b border-slate-100 bg-slate-50/10 h-32"></div>))}
                  {days.map(day => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayEvents = getEventsForDate(date);
                    const dayRequests = getRequestsForDate(date);
                    const availability = getInstructorAvailabilityForDate(date);
                    const isExpanded = expandedDay === dateStr;
                    const instructorSchedule = getInstructorScheduleForDate(date);
                    
                    return (
                      <div 
                        key={day} 
                        className={`border-r border-b border-slate-100 p-2 min-h-[128px] hover:bg-slate-50/50 transition-all relative flex flex-col ${isExpanded ? 'bg-slate-50/80 ring-2 ring-inset ring-blue-500 z-10' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold ${day === 15 && currentDate.getMonth() === 5 ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg' : 'text-slate-400'}`}>{day}</span>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                              className={`p-1 rounded-md hover:bg-white transition-all border ${isExpanded ? 'text-blue-600 border-blue-200 bg-white' : 'text-slate-300 border-transparent'}`}
                              title="Detaylı Kırılım"
                            >
                              <Activity size={12} />
                            </button>
                            <div className="flex gap-0.5 mt-1">
                              {availability.trainingCount > 0 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`${availability.trainingCount} Eğitmen Eğitimde`} />
                              )}
                              {availability.leaveCount > 0 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" title={`${availability.leaveCount} Eğitmen İzinde`} />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[160px] pr-1 py-1 animate-in slide-in-from-top-1 duration-200">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1 mb-1">Eğitmen Durumları</p>
                             {instructorSchedule.map((item, idx) => (
                               <div key={idx} className="flex items-center justify-between gap-1">
                                  <div className="flex flex-col truncate">
                                    <span className="text-[9px] font-bold text-slate-700 truncate">{item.instructor.name}</span>
                                    {item.eventTitle && <span className="text-[8px] text-blue-500 font-medium truncate italic">{item.eventTitle}</span>}
                                  </div>
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    item.status === 'Eğitimde' ? 'bg-blue-500' : 
                                    item.status === 'İzinde' ? 'bg-rose-500' : 
                                    'bg-emerald-400 opacity-30'
                                  }`} title={item.status} />
                               </div>
                             ))}
                          </div>
                        ) : (
                          <div className="flex-1 space-y-1 overflow-hidden">
                            {dayEvents.map(e => {
                              const st = getStatusStyles(e.status);
                              return (
                                <div key={e.id} title={`${e.title} - ${e.instructorName}`} className={`p-1 ${st.bg} border-l-2 ${st.border} rounded text-[9px] truncate font-semibold ${st.text}`}>
                                  {e.title}
                                </div>
                              );
                            })}
                            {dayRequests.map(opp => (
                              <div 
                                key={opp.id} 
                                onClick={(e) => { e.stopPropagation(); handleOpenDateEdit(opp, dateStr); }}
                                className="group flex items-center justify-between p-1 bg-amber-50 border-l-2 border-amber-500 rounded text-[9px] truncate font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors"
                              >
                                <span className="truncate">TALEP: {opp.customerName}</span>
                                <Pencil size={8} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-1 pt-1 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                             {availability.trainingCount > 0 && `${availability.trainingCount} Eğ`}
                             {availability.trainingCount > 0 && availability.leaveCount > 0 && ' | '}
                             {availability.leaveCount > 0 && `${availability.leaveCount} İz`}
                           </span>
                           {!isExpanded && (availability.trainingCount > 0 || availability.leaveCount > 0) && (
                             <span className="text-[7px] text-slate-300 font-medium italic">Kırılım için tıkla</span>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeView === 'week' && (
              <div className="grid grid-cols-7 h-full min-h-[600px] divide-x divide-slate-100">
                {getWeekDates().map((date, idx) => {
                  const dayEvents = getEventsForDate(date);
                  const dayRequests = getRequestsForDate(date);
                  const availability = getInstructorAvailabilityForDate(date);
                  const isToday = date.getDate() === 15 && date.getMonth() === 5;
                  const instructorSchedule = getInstructorScheduleForDate(date);
                  
                  return (
                    <div key={idx} className={`p-4 flex flex-col gap-4 ${isToday ? 'bg-blue-50/20' : ''}`}>
                      <div className="text-center pb-4 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
                        <p className={`text-xl font-black mt-1 font-heading ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>{date.getDate()}</p>
                        
                        <div className="mt-2 flex items-center justify-center gap-2">
                          {availability.trainingCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded border border-blue-100 flex items-center gap-1">
                              <span className="w-1 h-1 bg-blue-500 rounded-full" /> {availability.trainingCount}
                            </span>
                          )}
                          {availability.leaveCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-bold rounded border border-rose-100 flex items-center gap-1">
                              <span className="w-1 h-1 bg-rose-500 rounded-full" /> {availability.leaveCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Instructor breakdown toggleable in week view too */}
                        <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100 space-y-2">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Eğitmen Planı</p>
                           {instructorSchedule.map((item, sidx) => (
                             <div key={sidx} className="flex items-center justify-between group">
                                <span className="text-[9px] font-bold text-slate-600 truncate max-w-[80px]">{item.instructor.name}</span>
                                <div className="flex items-center gap-1">
                                  {item.status === 'Eğitimde' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" title={item.eventTitle} />}
                                  {item.status === 'İzinde' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm" title="İzinde" />}
                                  {item.status === 'Müsait' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-20" />}
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="space-y-3 pt-2">
                          {dayEvents.map(e => {
                            const st = getStatusStyles(e.status);
                            return (
                              <div key={e.id} className={`p-3 ${st.bg} border-l-4 ${st.border} rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer group`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[10px] font-bold ${st.text}`}>{e.title}</span>
                                  {st.icon}
                                </div>
                                <p className="text-[9px] text-slate-500 flex items-center gap-1"><User size={10}/> {e.instructorName}</p>
                              </div>
                            );
                          })}
                          {dayRequests.map(opp => (
                            <div 
                              key={opp.id} 
                              onClick={(e) => { e.stopPropagation(); handleOpenDateEdit(opp, date.toISOString().split('T')[0]); }}
                              className="group p-3 bg-amber-50 border-l-4 border-dashed border-amber-500 rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden"
                            >
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-amber-700">{opp.customerName}</span>
                                  <AlertCircle size={12} className="text-amber-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter">Eğitim Talebi</p>
                                  <Pencil size={10} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute top-0 right-0 p-1 opacity-10">
                                   <CalendarRange size={40} className="text-amber-900" />
                                </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeView === 'day' && (
              <div className="p-8 max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-blue-500/20">
                      <span className="text-[10px] font-bold uppercase">HAZ</span>
                      <span className="text-2xl font-black font-heading">{currentDate.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading">{currentDate.toLocaleDateString('tr-TR', { weekday: 'long' })}</h3>
                      <p className="text-slate-500 font-medium text-sm">Planlanmış toplam {getEventsForDate(currentDate).length + getRequestsForDate(currentDate).length} girdi bulunuyor.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eğitmen Durumu</p>
                       <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-xs font-bold">{getInstructorAvailabilityForDate(currentDate).trainingCount} Eğitimde</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-rose-500 rounded-full" />
                            <span className="text-xs font-bold">{getInstructorAvailabilityForDate(currentDate).leaveCount} İzinde</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {getEventsForDate(currentDate).map(e => {
                    const st = getStatusStyles(e.status);
                    return (
                      <div key={e.id} className={`flex items-center justify-between p-6 ${st.bg} border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group`}>
                        <div className="flex items-center gap-6">
                           <div className={`p-4 rounded-2xl ${st.border} border-2 bg-white text-slate-900 shadow-sm`}>
                             <Clock size={24} className={st.text} />
                           </div>
                           <div>
                             <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-heading">{e.title}</h4>
                             <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                               <span className="flex items-center gap-1.5"><User size={14} className="text-blue-500"/> {e.instructorName}</span>
                               <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500"/> 09:00 - 17:00</span>
                             </div>
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${st.border} ${st.text} bg-white shadow-sm`}>
                          {e.status}
                        </div>
                      </div>
                    );
                  })}

                  {getRequestsForDate(currentDate).map(opp => (
                    <div key={opp.id} className="flex items-center justify-between p-6 bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-6">
                           <div className="p-4 rounded-2xl border-2 border-amber-500 bg-white text-amber-600 shadow-sm">
                             <CalendarDays size={24} />
                           </div>
                           <div>
                             <h4 className="text-lg font-bold text-slate-900 font-heading">{opp.customerName}</h4>
                             <div className="flex items-center gap-4 mt-1 text-sm text-amber-600 font-bold">
                               <span className="flex items-center gap-1.5 uppercase tracking-tighter">Eğitim Talebi: {opp.trainingType}</span>
                             </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleOpenDateEdit(opp, currentDate.toISOString().split('T')[0])}
                          className="flex items-center gap-2 px-6 py-2 bg-white text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-200 hover:bg-amber-100 transition-all shadow-sm"
                        >
                          <Pencil size={12} />
                          Tarihi Değiştir
                        </button>
                    </div>
                  ))}

                  {/* Comprehensive Day breakdown for day view */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Users2 size={16} className="text-blue-600" />
                        Tüm Eğitmenlerin Günlük Planı
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {instructors.map((ins) => {
                          const status = getInstructorStatusForCurrentDate(ins.name, ins.isOnLeave);
                          const event = events.find(e => e.instructorName === ins.name && e.startDate.startsWith(currentDate.toISOString().split('T')[0]));
                          
                          return (
                            <div key={ins.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:border-blue-200 transition-all">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                     {ins.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-900">{ins.name}</p>
                                     <p className="text-[10px] text-slate-400 font-medium">{ins.specialty}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                     <span className={`w-1.5 h-1.5 rounded-full ${status === 'Müsait' ? 'bg-emerald-500' : status === 'Eğitimde' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                     <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'Müsait' ? 'text-emerald-600' : status === 'Eğitimde' ? 'text-blue-600' : 'text-rose-600'}`}>
                                        {status}
                                     </span>
                                  </div>
                                  {event && <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate max-w-[120px]">{event.title}</p>}
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-lg flex items-center justify-between text-slate-900 font-heading">
              Eğitmenler
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Canlı</span>
            </h3>

            {/* Filter Section */}
            <div className="space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Eğitmen veya alan ara..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Filter size={10} /> Durum
                  </label>
                  <select 
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium outline-none focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="Hepsi">Hepsi</option>
                    <option value="Müsait">Müsait</option>
                    <option value="Eğitimde">Eğitimde</option>
                    <option value="İzinde">İzinde</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <GraduationCap size={10} /> Uzmanlık
                  </label>
                  <select 
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium outline-none focus:border-blue-500"
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                  >
                    <option value="Hepsi">Hepsi</option>
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              {filteredInstructors.length > 0 ? filteredInstructors.map((ins) => {
                const status = getInstructorStatusForCurrentDate(ins.name, ins.isOnLeave);
                let dotColor = 'bg-slate-300';
                let labelColor = 'text-slate-500 bg-slate-50 border-slate-100';
                
                if (status === 'Müsait') {
                  dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                  labelColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                } else if (status === 'Eğitimde') {
                  dotColor = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
                  labelColor = 'text-blue-700 bg-blue-50 border-blue-100';
                } else if (status === 'İzinde') {
                  dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
                  labelColor = 'text-rose-700 bg-rose-50 border-rose-100';
                }

                return (
                  <div key={ins.id} onClick={() => setSelectedInstructorForDetail(ins)} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-xs text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {ins.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 font-heading">{ins.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{ins.specialty}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${labelColor}`}>
                          {status}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLeave(ins.id); }}
                        className={`text-[9px] font-bold uppercase tracking-widest ${ins.isOnLeave ? 'text-blue-600' : 'text-slate-400'} hover:underline flex items-center gap-1`}
                        title={ins.isOnLeave ? 'İzni Kaldır' : 'İzne Çıkar'}
                      >
                        {ins.isOnLeave ? <ToggleRight size={14} className="text-blue-600" /> : <ToggleLeft size={14} />}
                        {ins.isOnLeave ? 'İzinli' : 'İzin Ver'}
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sonuç Bulunamadı</p>
                </div>
              )}
            </div>
            
            {(statusFilter !== 'Hepsi' || specialtyFilter !== 'Hepsi' || searchQuery !== '') && (
              <button 
                onClick={() => { setStatusFilter('Hepsi'); setSpecialtyFilter('Hepsi'); setSearchQuery(''); }}
                className="text-[10px] font-bold text-blue-600 hover:underline text-center"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="relative z-10">
               <h4 className="font-bold text-lg mb-2 font-heading">Hızlı Analiz</h4>
               <p className="text-slate-400 text-xs leading-relaxed mb-4">Günün doluluk oranı: <span className="text-blue-400 font-black font-heading">
                 {Math.round((instructors.filter(i => getInstructorStatusForCurrentDate(i.name, i.isOnLeave) !== 'Müsait').length / instructors.length) * 100)}%
               </span></p>
               <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                 <div 
                   className="bg-blue-500 h-full transition-all duration-1000" 
                   style={{ width: `${(instructors.filter(i => getInstructorStatusForCurrentDate(i.name, i.isOnLeave) !== 'Müsait').length / instructors.length) * 100}%` }}
                 ></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Detail Modal */}
      {selectedInstructorForDetail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800 p-8 flex items-end">
                <button onClick={() => setSelectedInstructorForDetail(null)} className="absolute top-4 right-4 p-2 bg-black/10 text-white hover:bg-black/20 rounded-full transition-all">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-6 translate-y-12">
                   <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl font-black text-blue-600 border-4 border-white">
                      {selectedInstructorForDetail.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div className="mb-2">
                      <h2 className="text-2xl font-black text-white drop-shadow-sm font-heading">{selectedInstructorForDetail.name}</h2>
                      <p className="text-blue-100 text-sm font-bold opacity-90 uppercase tracking-widest">{selectedInstructorForDetail.specialty}</p>
                   </div>
                </div>
             </div>

             <div className="p-8 pt-16 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                         <Mail size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">E-posta</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{selectedInstructorForDetail.email || 'Girilmedi'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                         <Phone size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Telefon</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{selectedInstructorForDetail.phone || 'Girilmedi'}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-heading">
                      <CalendarIcon size={14} className="text-blue-500" />
                      Günün Programı ({currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })})
                   </h4>
                   <div className="space-y-2">
                      {getEventsForDate(currentDate).filter(e => e.instructorName === selectedInstructorForDetail.name).length > 0 ? (
                        getEventsForDate(currentDate).filter(e => e.instructorName === selectedInstructorForDetail.name).map(e => (
                          <div key={e.id} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                             <div>
                                <p className="text-sm font-bold text-blue-800">{e.title}</p>
                                <p className="text-[10px] font-bold text-blue-400 uppercase mt-0.5">09:00 - 17:00</p>
                             </div>
                             <span className="px-3 py-1 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 text-blue-600 shadow-sm">
                                {e.status}
                             </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                           <Info size={24} className="mx-auto text-slate-300 mb-2" />
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Seçilen gün için kayıtlı eğitim yok.</p>
                        </div>
                      )}
                      {selectedInstructorForDetail.isOnLeave && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                           <Plane className="text-rose-500" size={24} />
                           <div>
                              <p className="text-sm font-bold text-rose-800">Şu an İzinli</p>
                              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Eğitmen şu an sistemde izinli olarak işaretli.</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button 
                      onClick={() => setSelectedInstructorForDetail(null)}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                   >
                      Kapat
                   </button>
                   <button className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all">
                      <Edit size={20} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Date Update Modal */}
      {isDateEditModalOpen && editingOpp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                   <CalendarRange size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-heading">Tarih Güncelleme</h2>
                  <p className="text-slate-500 text-xs font-medium">Talep No: {editingOpp.opp.id}</p>
                </div>
              </div>
              <button onClick={() => setIsDateEditModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDateSubmit} className="p-8 space-y-8">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-blue-500" />
                    Müşteri
                 </p>
                 <p className="text-sm font-bold text-slate-900">{editingOpp.opp.customerName}</p>
                 <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eğitim Tipi</p>
                      <p className="text-xs font-bold text-slate-600">{editingOpp.opp.trainingType}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mevcut Tarih</p>
                       <p className="text-xs font-bold text-amber-600">{editingOpp.oldDate}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 font-heading">
                   <ArrowRight size={14} className="text-amber-500" />
                   Yeni Tarih Belirleyin
                </label>
                <div className="relative">
                   <input 
                    required
                    type="date" 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-amber-500 outline-none transition-all font-bold text-slate-900"
                    value={newRequestedDate}
                    onChange={(e) => setNewRequestedDate(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                     <CalendarIcon size={20} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsDateEditModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Değişikliği Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Training Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">Eğitim Planla</h2>
                <p className="text-slate-500 text-sm mt-1">Eğitmen ve tarih detaylarını belirleyin.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <GraduationCap size={14} className="text-blue-500" />
                  Eğitim Başlığı
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Örn: React İleri Seviye Workshop"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <User size={14} className="text-blue-500" />
                  Eğitmen Seçin
                </label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                  value={formData.instructorName}
                  onChange={(e) => setFormData({...formData, instructorName: e.target.value})}
                >
                  <option value="">Eğitmen seçin...</option>
                  {instructors.map((ins) => (
                    <option key={ins.id} value={ins.name}>{ins.name} ({getInstructorStatusForCurrentDate(ins.name, ins.isOnLeave)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Briefcase size={14} className="text-blue-500" />
                  İlgili Fırsat (Opsiyonel)
                </label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                  value={formData.opportunityId}
                  onChange={(e) => setFormData({...formData, opportunityId: e.target.value})}
                >
                  <option value="">Fırsat ataması yok</option>
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>{opp.customerName} - {opp.trainingType}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Başlangıç</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bitiş</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
                >
                  Takvime Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCalendar;
