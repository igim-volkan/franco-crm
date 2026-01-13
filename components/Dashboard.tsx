
import React from 'react';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ListTodo,
  CheckCircle,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Customer, Opportunity, TrainingEvent, OpportunityStatus, ViewType, GlobalTask, GlobalTaskStatus } from '../types';

interface DashboardProps {
  customers: Customer[];
  opportunities: Opportunity[];
  events: TrainingEvent[];
  globalTasks: GlobalTask[];
  onViewChange: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ customers, opportunities, events, globalTasks, onViewChange }) => {
  const wonOpportunities = opportunities.filter(o => o.status === OpportunityStatus.WON);
  const totalRevenue = wonOpportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
  
  const stats = [
    { label: 'Toplam Müşteri', value: customers.length, icon: <Users className="text-blue-600" />, change: '+%12', trend: 'up' },
    { label: 'Aktif Fırsatlar', value: opportunities.length, icon: <Briefcase className="text-purple-600" />, change: '+%5', trend: 'up' },
    { label: 'Eğitmen Doluluk', value: '%74', icon: <Activity className="text-emerald-600" />, change: '+%8', trend: 'up' },
    { label: 'Yaklaşan Eğitimler', value: events.length, icon: <CalendarIcon className="text-amber-600" />, change: '-%2', trend: 'down' },
  ];

  const salesData = [
    { name: 'Yeni', value: opportunities.filter(o => o.status === OpportunityStatus.NEW).length },
    { name: 'Keşif', value: opportunities.filter(o => o.status === OpportunityStatus.DISCOVERY).length },
    { name: 'Teklif', value: opportunities.filter(o => o.status === OpportunityStatus.PROPOSAL).length },
    { name: 'Pazarlık', value: opportunities.filter(o => o.status === OpportunityStatus.NEGOTIATION).length },
    { name: 'Kazanıldı', value: opportunities.filter(o => o.status === OpportunityStatus.WON).length },
  ];

  const COLORS_CHART = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const pendingTasks = globalTasks.filter(t => t.status === GlobalTaskStatus.PENDING).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Tekrar hoş geldiniz, Yönetici</h1>
          <p className="text-slate-500 mt-1">FranCo'da bugün neler olup bittiğine bir göz atın.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Rapor İndir
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-500/20">
            Analiz Oluştur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-slate-50 rounded-xl">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider font-bold">{stat.label}</h3>
              <p className="text-2xl font-black mt-1 font-heading">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                   <TrendingUp size={18} />
                 </div>
                 <h3 className="font-bold text-lg font-heading">Satış Hunisi Aşamaları</h3>
              </div>
              
              <div className="relative">
                <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2 pl-3 pr-10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer">
                  <option>Son 30 Gün</option>
                  <option>Son 3 Ay</option>
                  <option>Son 1 Yıl</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 border-l border-slate-200 ml-2">
                  <Filter size={12} />
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <CalendarIcon size={18} />
              </div>
              <h3 className="font-bold text-lg font-heading">Yaklaşan Eğitimler</h3>
            </div>
            <div className="flex-1 space-y-4">
              {events.length > 0 ? events.slice(0, 3).map((event) => (
                <div 
                  key={event.id} 
                  onClick={() => onViewChange('calendar')}
                  className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl font-bold shrink-0">
                    <span className="text-[10px] uppercase">HAZ</span>
                    <span className="text-lg">15</span>
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate text-sm">{event.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Eğitmen: {event.instructorName}</p>
                  </div>
                </div>
              )) : (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                  <CalendarIcon size={32} className="mb-2 opacity-20" />
                  <p className="text-xs">Planlanmış eğitim yok</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => onViewChange('calendar')}
              className="w-full mt-6 py-2.5 text-blue-600 font-bold text-xs uppercase tracking-widest border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Tüm Takvimi Görüntüle
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ListTodo size={18} />
              </div>
              <h3 className="font-bold text-lg font-heading">Bekleyen Görevler</h3>
            </div>
            <div className="flex-1 space-y-3">
              {pendingTasks.length > 0 ? pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onViewChange('tasks')}
                  className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Clock size={14} className="text-amber-500" />
                    </div>
                    <div className="truncate flex-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm truncate">{task.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{task.assignedTo}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle size={32} className="mb-2 opacity-20" />
                  <p className="text-xs">Bekleyen görev bulunmuyor</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => onViewChange('tasks')}
              className="w-full mt-6 py-2.5 text-blue-600 font-bold text-xs uppercase tracking-widest border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Görevlere Git
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
