
import React from 'react';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  MapPin, 
  CreditCard, 
  Briefcase, 
  Users2, 
  Calendar,
  ExternalLink,
  Edit,
  History,
  TrendingUp,
  FileText,
  Plus,
  Mail,
  Phone,
  Send
} from 'lucide-react';
import { Customer, Opportunity } from '../types';

interface CustomerDetailProps {
  customer: Customer;
  opportunities: Opportunity[];
  onBack: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, opportunities, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Müşteri Listesine Dön</span>
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
            <Edit size={16} />
            Düzenle
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            Yeni Fırsat Oluştur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
            <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
                <Building2 size={48} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
              <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">{customer.id}</p>
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Aktif Müşteri
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">İlgili Kişi</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{customer.contactPerson}</p>
                </div>
              </div>

              {/* Communication Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-posta</p>
                    <a href={`mailto:${customer.email}`} className="text-sm font-medium text-blue-600 hover:underline mt-0.5 block">
                      {customer.email || 'Girilmedi'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefon</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{customer.phone || 'Girilmedi'}</p>
                  </div>
                </div>
                
                {customer.email && (
                  <a 
                    href={`mailto:${customer.email}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    <Send size={14} />
                    E-posta Gönder
                  </a>
                )}
              </div>

              <div className="flex items-start gap-4 border-t border-slate-50 pt-6">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adres</p>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{customer.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sektör</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{customer.sector}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                  <Users2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ölçek</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{customer.employeeCount.toLocaleString()} Çalışan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-600" />
              Fatura Bilgileri
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed italic">
                {customer.billingInfo}
              </p>
            </div>
            <button className="w-full mt-6 py-2.5 text-blue-600 font-bold text-xs uppercase tracking-wider border border-blue-100 rounded-xl hover:bg-blue-50 transition-all">
              Kayıtları Güncelle
            </button>
          </div>
        </div>

        {/* Right Column: Activity and Opportunities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Toplam Fırsat</p>
              <p className="text-3xl font-black text-slate-900">{opportunities.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Kazanılan Gelir</p>
              <p className="text-3xl font-black text-emerald-600">
                ₺{opportunities.filter(o => o.status === 'Kazanıldı').reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Müşteri Ömrü</p>
              <p className="text-3xl font-black text-blue-600">182 GÜN</p>
            </div>
          </div>

          {/* Sales Opportunities History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Satış Geçmişi</h3>
              <button className="text-blue-600 text-sm font-bold hover:underline">Tümünü Gör</button>
            </div>
            <div className="p-0">
              {opportunities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          opp.status === 'Kazanıldı' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{opp.trainingType}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-slate-500 font-medium">{new Date(opp.createdAt).toLocaleDateString('tr-TR')}</p>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className={`text-[10px] font-bold uppercase ${
                              opp.status === 'Kazanıldı' ? 'text-emerald-600' : 'text-blue-600'
                            }`}>{opp.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₺{(opp.amount || 0).toLocaleString()}</p>
                        <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 hover:underline">
                          Detaylar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Henüz bir satış fırsatı kaydı bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents / Notes Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg">Dosyalar ve Notlar</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">
                <Plus size={14} />
                Dosya Ekle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Eğitim_Sözleşmesi.pdf</p>
                    <p className="text-[10px] text-slate-400">2.4 MB • 12 Haz 2024</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Toplantı_Notları_V1.docx</p>
                    <p className="text-[10px] text-slate-400">120 KB • 10 Haz 2024</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;