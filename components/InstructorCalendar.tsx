
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

  const isDateInRange = (checkDate: Date, startDateStr: string, endDateStr: string) => {
    const check = new Date(checkDate);
    check.setHours(0, 0, 0, 0);
    
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    
    return check >= start && check <= end;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(e => isDateInRange(date, e.startDate, e.endDate));
  };

  const getRequestsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return opportunities.filter(opp => opp.requestedDates.includes(dateStr));
  };

  const getInstructorScheduleForDate = (date: Date) => {
    return instructors.map(instructor => {
      // Find event where instructor matches AND date is within range
      const event = events.find(e => 
        e.instructorName === instructor.name && 
        isDateInRange(date, e.startDate, e.endDate)
      );
      
      const status = instructor.isOnLeave ? 'İzinde' : (event ? 'Eğitimde' : 'Müsait');
      return {
        instructor,
        status,
        eventTitle: event?.title
      };
    });
  };

  const getInstructorAvailabilityForDate = (date: Date) => {
    const trainingInstructors = new Set(
      events
        .filter(e => isDateInRange(date, e.startDate, e.endDate))
        .map(e => e.instructorName)
    );
    const leaveInstructors = instructors.filter(ins => ins.isOnLeave);
    
    return {
      trainingCount: trainingInstructors.size,
      leaveCount: leaveInstructors.length,
      trainingNames: Array.from(trainingInstructors),
      leaveNames: leaveInstructors.map(i => i.name)
    };
  };

  const getStatusConfig = (status: TrainingEvent['status']) => {
    switch (status) {
      case 'Tamamlandı':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-500',
          text: 'text-emerald-700',
          icon: CheckCircle2
        };
      case 'İptal Edildi':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-500',
          text: 'text-rose-700',
          icon: XCircle
        };
      case 'Planlandı':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-700',
          icon: Clock
        };
    }
  };

  const getInstructorStatusForCurrentDate = (instructorName: string, instructorIsOnLeave: boolean) => {
    if (instructorIsOnLeave) return 'İzinde';
    const hasEvent = events.some(e => 
      e.instructorName === instructorName && 
      isDateInRange(currentDate, e.startDate, e.endDate)
    );
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight">Eğitmen Takvimi</h1>
          <p className="text-slate-500 mt-2 font-medium">Görünümler arasında geçiş yaparak planlamanızı optimize edin.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex items-center">
            {[
              { id: 'month', label: 'Ay', icon: <LayoutGrid size={14} /> },
              { id: 'week', label: 'Hafta', icon: <CalendarIcon size={14} /> },
              { id: 'day', label: 'Gün', icon: <List size={14} /> }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                  activeView === v.id 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase text-xs tracking-widest"
          >
            <Plus size={18} />
            Eğitim Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
        <div className="xl:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-black text-slate-900 font-heading">
                {activeView === 'month' && `${monthName} ${year}`}
                {activeView === 'week' && `Haziran 2024 - Hafta ${Math.ceil(currentDate.getDate() / 7)}`}
                {activeView === 'day' && currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handleNavigate('prev')} className="p-2.5 hover:bg-slate-50 rounded-full transition-colors text-slate-500 border border-transparent hover:border-slate-100"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date(2024, 5, 15))} className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all uppercase tracking-widest">Bugün</button>
              <button onClick={() => handleNavigate('next')} className="p-2.5 hover:bg-slate-50 rounded-full transition-colors text-slate-500 border border-transparent hover:border-slate-100"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[600px]">
            {activeView === 'month' && (
              <>
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                  {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1">
                  {blanks.map(i => (<div key={`blank-${i}`} className="border-r border-b border-slate-100 bg-slate-50/10 h-36"></div>))}
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
                        className={`border-r border-b border-slate-100 p-2 min-h-[144px] hover:bg-slate-50/50 transition-all relative flex flex-col ${isExpanded ? 'bg-slate-50/80 ring-2 ring-inset ring-blue-500 z-10' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold ${day === 15 && currentDate.getMonth() === 5 ? 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg' : 'text-slate-400 pl-1'}`}>{day}</span>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                              className={`p-1 rounded-md hover:bg-white transition-all border ${isExpanded ? 'text-blue-600 border-blue-200 bg-white' : 'text-slate-300 border-transparent'}`}
                              title="Detaylı Kırılım"
                            >
                              <Activity size={14} />
                            </button>
                            <div className="flex gap-0.5 mt-1.5 mr-1">
                              {availability.trainingCount > 0 && (
                                <div className="w-2 h-2 rounded-full bg-blue-500" title={`${availability.trainingCount} Eğitmen Eğitimde`} />
                              )}
                              {availability.leaveCount > 0 && (
                                <div className="w-2 h-2 rounded-full bg-rose-500" title={`${availability.leaveCount} Eğitmen İzinde`} />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[160px] pr-1 py-1 animate-in slide-in-from-top-1 duration-200 custom-scrollbar">
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
                          <div className="flex-1 space-y-1.5 overflow-hidden">
                            {dayEvents.map(e => {
                              const conf = getStatusConfig(e.status);
                              const StatusIcon = conf.icon;
                              return (
                                <div key={e.id} title={`${e.title} - ${e.instructorName}`} className={`p-1.5 ${conf.bg} border-l-2 ${conf.border} rounded-lg text-[9px] truncate font-bold ${conf.text} flex items-center gap-1.5 shadow-sm`}>
                                  <StatusIcon size={10} className="shrink-0" />
                                  <span className="truncate">{e.title}</span>
                                </div>
                              );
                            })}
                            {dayRequests.map(opp => (
                              <div 
                                key={opp.id} 
                                onClick={(e) => { e.stopPropagation(); handleOpenDateEdit(opp, dateStr); }}
                                className="group flex items-center justify-between p-1.5 bg-amber-50 border-l-2 border-amber-500 rounded-lg text-[9px] truncate font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors shadow-sm"
                              >
                                <span className="truncate">TALEP: {opp.customerName}</span>
                                <Pencil size={8} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}
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
                            const conf = getStatusConfig(e.status);
                            const StatusIcon = conf.icon;
                            return (
                              <div key={e.id} className={`p-3 ${conf.bg} border-l-4 ${conf.border} rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer group`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[10px] font-bold ${conf.text}`}>{e.title}</span>
                                  <StatusIcon size={14} className={conf.text} />
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
                  </div>
                  
                  <div className="space-y-4">
                  {getEventsForDate(currentDate).map(e => {
                    const conf = getStatusConfig(e.status);
                    const StatusIcon = conf.icon;
                    return (
                      <div key={e.id} className={`flex items-center justify-between p-6 ${conf.bg} border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group`}>
                        <div className="flex items-center gap-6">
                           <div className={`p-4 rounded-2xl ${conf.border} border-2 bg-white text-slate-900 shadow-sm`}>
                             <StatusIcon size={24} className={conf.text} />
                           </div>
                           <div>
                             <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-heading">{e.title}</h4>
                             <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                               <span className="flex items-center gap-1.5"><User size={14} className="text-blue-500"/> {e.instructorName}</span>
                               <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500"/> 09:00 - 17:00</span>
                             </div>
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${conf.border} ${conf.text} bg-white shadow-sm`}>
                          {e.status}
                        </div>
                      </div>
                    );
                  })}
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-lg flex items-center justify-between text-slate-900 font-heading">
              Eğitmenler
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Canlı</span>
            </h3>

            {/* Filter Section */}
            <div className="space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ara..."
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
              {filteredInstructors.length > 0 ? filteredInstructors.map((ins) => {
                const status = getInstructorStatusForCurrentDate(ins.name, ins.isOnLeave);
                let dotColor = 'bg-slate-300';
                
                if (status === 'Müsait') dotColor = 'bg-emerald-500';
                else if (status === 'Eğitimde') dotColor = 'bg-blue-500';
                else if (status === 'İzinde') dotColor = 'bg-rose-500';

                return (
                  <div key={ins.id} onClick={() => setSelectedInstructorForDetail(ins)} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
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
                      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                    </div>
                  </div>
                );
              }) : <p className="text-xs text-slate-400 text-center">Sonuç yok</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {selectedInstructorForDetail && (
         <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex items-end">
                <button onClick={() => setSelectedInstructorForDetail(null)} className="absolute top-6 right-6 p-2 bg-black/20 text-white hover:bg-black/30 rounded-full transition-all">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-6 translate-y-12">
                   <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-3xl font-black text-blue-600 border-4 border-white">
                      {selectedInstructorForDetail.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div className="mb-1">
                      <h2 className="text-2xl font-black text-white drop-shadow-sm font-heading">{selectedInstructorForDetail.name}</h2>
                      <p className="text-blue-100 text-sm font-bold opacity-90 uppercase tracking-widest">{selectedInstructorForDetail.specialty}</p>
                   </div>
                </div>
             </div>
             
             <div className="p-8 pt-16 space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-posta</p>
                    <p className="text-sm font-bold text-slate-900">{selectedInstructorForDetail.email}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                    <p className="text-sm font-bold text-slate-900">{selectedInstructorForDetail.phone}</p>
                  </div>
               </div>
               
               <button 
                  onClick={() => onToggleLeave(selectedInstructorForDetail.id)}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                    selectedInstructorForDetail.isOnLeave 
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
               >
                 {selectedInstructorForDetail.isOnLeave ? <Check size={16} /> : <XCircle size={16} />}
                 {selectedInstructorForDetail.isOnLeave ? 'İzin Durumunu Kaldır (Müsait)' : 'İzinli Olarak İşaretle'}
               </button>

               <button onClick={() => setSelectedInstructorForDetail(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs">Kapat</button>
             </div>
          </div>
         </div>
      )}
      
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 font-heading">Eğitim Planla</h2>
              <button onClick={() => setIsAddModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Başlık</label>
                 <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Eğitim başlığı..." required />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Eğitmen</label>
                 <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} required>
                   <option value="">Seçiniz...</option>
                   {instructors.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                 </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Başlangıç</label>
                   <input type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bitiş</label>
                   <input type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                 </div>
               </div>

               <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/30">Ekle</button>
            </form>
          </div>
        </div>
      )}

      {isDateEditModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
             <h3 className="font-bold text-lg mb-4 text-slate-900">Tarihi Güncelle</h3>
             <form onSubmit={handleUpdateDateSubmit} className="space-y-4">
               <input 
                 type="date" 
                 value={newRequestedDate} 
                 onChange={(e) => setNewRequestedDate(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
               />
               <div className="flex gap-2">
                 <button type="button" onClick={() => setIsDateEditModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500">İptal</button>
                 <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold">Güncelle</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCalendar;
