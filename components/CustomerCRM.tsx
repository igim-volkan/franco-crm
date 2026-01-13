
import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  Building2, 
  Users2,
  X,
  User,
  MapPin,
  CreditCard,
  Briefcase,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerCRMProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onViewCustomer: (customerId: string) => void;
}

const CustomerCRM: React.FC<CustomerCRMProps> = ({ customers, onAddCustomer, onViewCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    billingInfo: '',
    sector: '',
    employeeCount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson) return;

    const newCustomer: Customer = {
      id: `MST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      billingInfo: formData.billingInfo,
      sector: formData.sector,
      employeeCount: parseInt(formData.employeeCount) || 0,
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCustomer);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', billingInfo: '', sector: '', employeeCount: '' });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Müşteri Portföyü</h1>
          <p className="text-slate-500 text-sm mt-1">FranCo ekosistemindeki tüm kurumsal müşterileri ve kontakları yönetin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Yeni Müşteri Ekle</span>
        </button>
      </div>

      {/* Table & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="İsim, yetkili veya sektör ile ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
              <Filter size={16} />
              <span>Filtrele</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Müşteri Detayları</th>
                <th className="px-6 py-4">Sektör</th>
                <th className="px-6 py-4">Ölçek</th>
                <th className="px-6 py-4">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => onViewCustomer(customer.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-500 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{customer.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <User size={12} className="text-slate-400" />
                          <p className="text-xs text-slate-500 font-medium">{customer.contactPerson}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold shadow-sm">
                      {customer.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <Users2 size={16} className="text-blue-500" />
                      {customer.employeeCount.toLocaleString()} Çalışan
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewCustomer(customer.id);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Building2 size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">Müşteri bulunamadı.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 text-sm font-bold hover:underline"
                      >
                        Hemen bir tane ekleyin
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Yeni Müşteri Kaydı</h2>
                <p className="text-slate-500 text-sm mt-1">Lütfen müşteri ve faturalandırma detaylarını girin.</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full shadow-sm transition-all border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Şirket Adı */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Building2 size={14} className="text-blue-500" />
                    Şirket / Müşteri Adı
                  </label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Örn: FranCo Eğitim Hizmetleri"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* İlgili Kişi */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <User size={14} className="text-blue-500" />
                    Kontak Kişisi
                  </label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Ad Soyad"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  />
                </div>

                {/* E-posta */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Mail size={14} className="text-blue-500" />
                    E-posta Adresi
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="ornek@sirket.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {/* Telefon */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone size={14} className="text-blue-500" />
                    Telefon Numarası
                  </label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="+90 5XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                {/* Sektör */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Briefcase size={14} className="text-blue-500" />
                    Sektör
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Örn: Bilişim, Finans, Üretim"
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  />
                </div>

                {/* Çalışan Sayısı */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Users2 size={14} className="text-blue-500" />
                    Çalışan Sayısı
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Örn: 250"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                  />
                </div>

                {/* Adres */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    Şirket Adresi
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300"
                    placeholder="İlçe, İl ve Açık Adres..."
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                {/* Fatura Bilgileri */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <CreditCard size={14} className="text-blue-500" />
                    Fatura Bilgileri
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300"
                    placeholder="Vergi Dairesi, Vergi No, Tam Unvan..."
                    value={formData.billingInfo}
                    onChange={(e) => setFormData({...formData, billingInfo: e.target.value})}
                  />
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="mt-10 flex items-center justify-end gap-4 border-t border-slate-100 pt-8">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98]"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCRM;