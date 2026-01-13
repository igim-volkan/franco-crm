
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X,
  ChevronRight,
  Filter,
  GraduationCap
} from 'lucide-react';
import { NAVIGATION_ITEMS } from './constants';
import { 
  Customer, 
  Opportunity, 
  TrainingEvent, 
  ViewType, 
  OpportunityStatus, 
  TrainingTypeDefaults, 
  OpportunityTask, 
  TaskStatus, 
  Instructor,
  GlobalTask,
  GlobalTaskStatus
} from './types';
import Dashboard from './components/Dashboard';
import CustomerCRM from './components/CustomerCRM';
import SalesOpportunities from './components/SalesOpportunities';
import InstructorCalendar from './components/InstructorCalendar';
import CustomerDetail from './components/CustomerDetail';
import Settings from './components/Settings';
import Tasks from './components/Tasks';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [trainingTypes, setTrainingTypes] = useState<string[]>(Object.values(TrainingTypeDefaults));

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'MST-001',
      name: 'TechFlow Çözümleri',
      contactPerson: 'Arda Yılmaz',
      email: 'arda.yilmaz@techflow.com',
      phone: '+90 532 123 45 67',
      address: 'Levent, İstanbul',
      billingInfo: 'TechFlow Yazılım A.Ş - Vergi No: 1234567890',
      sector: 'Teknoloji',
      employeeCount: 250,
      createdAt: new Date().toISOString()
    },
    {
      id: 'MST-002',
      name: 'Global Finans Corp',
      contactPerson: 'Selin Demir',
      email: 'selin.demir@globalfinance.com',
      phone: '+90 212 987 65 43',
      address: 'Maslak, İstanbul',
      billingInfo: 'Global Finans Hizmetleri - Vergi No: 9876543210',
      sector: 'Finans',
      employeeCount: 1200,
      createdAt: new Date().toISOString()
    }
  ]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: 'FRS-1001',
      customerId: 'MST-001',
      customerName: 'TechFlow Çözümleri',
      status: OpportunityStatus.PROPOSAL,
      trainingType: TrainingTypeDefaults.TECHNICAL,
      description: 'Frontend ekibi için React ve TypeScript İleri Seviye Eğitimi.',
      requestedDates: ['2024-06-15', '2024-06-16'],
      amount: 15000,
      tasks: [
        { id: 'TSK-1', text: 'Teklif dokümanını hazırla', dueDate: '2024-06-10', status: TaskStatus.DONE }
      ],
      createdAt: new Date().toISOString()
    }
  ]);

  const [events, setEvents] = useState<TrainingEvent[]>([
    {
      id: 'ETK-001',
      opportunityId: 'FRS-1001',
      title: 'React Atölyesi - TechFlow',
      instructorName: 'Deniz Can',
      startDate: '2024-06-15T09:00:00',
      endDate: '2024-06-15T17:00:00',
      status: 'Planlandı'
    }
  ]);

  const [instructors, setInstructors] = useState<Instructor[]>([
    { id: 'INS-001', name: 'Sarp Yılmaz', specialty: 'React/TS', isOnLeave: false, email: 'sarp.yilmaz@franco.edu', phone: '+90 533 111 22 33' },
    { id: 'INS-002', name: 'Mert Aksoy', specialty: 'Liderlik', isOnLeave: false, email: 'mert.aksoy@franco.edu', phone: '+90 533 222 33 44' },
    { id: 'INS-003', name: 'Deniz Can', specialty: 'UX/UI', isOnLeave: false, email: 'deniz.can@franco.edu', phone: '+90 533 333 44 55' },
    { id: 'INS-004', name: 'Elif Şahin', specialty: 'Yumuşak Beceriler', isOnLeave: false, email: 'elif.sahin@franco.edu', phone: '+90 533 444 55 66' }
  ]);

  const [globalTasks, setGlobalTasks] = useState<GlobalTask[]>([
    {
      id: 'G-TSK-1',
      title: 'Eğitmen Sözleşmelerini Güncelle',
      description: 'Yeni dönem için tüm eğitmenlerin sözleşme taslaklarını hukuk departmanına gönder.',
      assignedTo: 'Yönetici',
      assignedBy: 'Sistem Sorumlusu',
      dueDate: '2024-06-20',
      status: GlobalTaskStatus.PENDING,
      priority: 'Yüksek',
      createdAt: new Date().toISOString()
    },
    {
      id: 'G-TSK-2',
      title: 'Haziran Ayı Faturaları',
      description: 'Tamamlanan eğitimlerin fatura kesim süreçlerini tamamla.',
      assignedTo: 'Yönetici',
      assignedBy: 'Finans',
      dueDate: '2024-06-30',
      status: GlobalTaskStatus.PENDING,
      priority: 'Orta',
      createdAt: new Date().toISOString()
    }
  ]);

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleAddOpportunity = (newOpp: Opportunity) => {
    setOpportunities(prev => [...prev, newOpp]);
  };

  const handleAddEvent = (newEvent: TrainingEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  const handleAddGlobalTask = (newTask: GlobalTask) => {
    setGlobalTasks(prev => [newTask, ...prev]);
  };

  const updateGlobalTaskStatus = (id: string, status: GlobalTaskStatus) => {
    setGlobalTasks(prev => prev.map(task => task.id === id ? { ...task, status } : task));
  };

  const updateOpportunityStatus = (id: string, status: OpportunityStatus) => {
    setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, status } : opp));
  };

  const updateOpportunityDates = (id: string, dates: string[]) => {
    setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, requestedDates: dates } : opp));
  };

  const handleAddTask = (opportunityId: string, task: OpportunityTask) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunityId ? { ...opp, tasks: [...opp.tasks, task] } : opp
    ));
  };

  const handleUpdateTaskStatus = (opportunityId: string, taskId: string, status: TaskStatus) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunityId ? { 
        ...opp, 
        tasks: opp.tasks.map(t => t.id === taskId ? { ...t, status } : t) 
      } : opp
    ));
  };

  const handleToggleInstructorLeave = (instructorId: string) => {
    setInstructors(prev => prev.map(ins => 
      ins.id === instructorId ? { ...ins, isOnLeave: !ins.isOnLeave } : ins
    ));
  };

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveView('customer_detail');
  };

  const getViewLabel = (view: ViewType) => {
    if (view === 'customer_detail') return 'Müşteri Detayı';
    const item = NAVIGATION_ITEMS.find(n => n.id === view);
    return item ? item.label : view;
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-body">
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight font-heading">FranCo</span>}
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {NAVIGATION_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveView(item.id as ViewType);
                    setSelectedCustomerId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    (activeView === item.id || (activeView === 'customer_detail' && item.id === 'crm'))
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>FranCo</span>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-900 capitalize font-heading">{getViewLabel(activeView)}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Bir şeyler arayın..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold font-heading">Yönetici</p>
                <p className="text-xs text-slate-500">Sistem Sorumlusu</p>
              </div>
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                YN
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'dashboard' && (
            <Dashboard 
              customers={customers} 
              opportunities={opportunities} 
              events={events} 
              globalTasks={globalTasks}
              onViewChange={setActiveView}
            />
          )}
          {activeView === 'crm' && <CustomerCRM customers={customers} onAddCustomer={handleAddCustomer} onViewCustomer={handleViewCustomer} />}
          {activeView === 'customer_detail' && selectedCustomer && (
            <CustomerDetail 
              customer={selectedCustomer}
              opportunities={opportunities.filter(o => o.customerId === selectedCustomer.id)}
              onBack={() => setActiveView('crm')}
            />
          )}
          {activeView === 'sales' && (
            <SalesOpportunities 
              opportunities={opportunities} 
              customers={customers}
              trainingTypes={trainingTypes}
              onAddOpportunity={handleAddOpportunity}
              onUpdateStatus={updateOpportunityStatus}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}
          {activeView === 'tasks' && (
            <Tasks 
              tasks={globalTasks}
              instructors={instructors}
              onAddTask={handleAddGlobalTask}
              onUpdateStatus={updateGlobalTaskStatus}
            />
          )}
          {activeView === 'calendar' && (
            <InstructorCalendar 
              events={events} 
              opportunities={opportunities}
              instructors={instructors}
              onUpdateDates={updateOpportunityDates}
              onAddEvent={handleAddEvent}
              onToggleLeave={handleToggleInstructorLeave}
            />
          )}
          {activeView === 'settings' && <Settings trainingTypes={trainingTypes} setTrainingTypes={setTrainingTypes} />}
        </div>
      </main>
    </div>
  );
};

export default App;
