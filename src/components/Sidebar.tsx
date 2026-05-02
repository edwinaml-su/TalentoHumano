"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Banknote, 
  Clock,
  Briefcase,
  FileCheck,
  Scaling,
  PieChart,
  ShieldAlert,
  CalendarDays,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  LogIn,
  Edit3,
  Globe,
  Settings,
  Search,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";

const menuStructure = [
  { 
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Tablero Central", href: "/" },
    ]
  },
  {
    label: "Gestión de Personal",
    items: [
      { icon: Users, label: "Maestro de Empleados", href: "/employees" },
      { icon: FileCheck, label: "Contratos y Modalidades", href: "/contracts" },
      { icon: Clock, label: "Horarios y Asistencia", href: "/attendance" },
      { icon: CalendarDays, label: "Gestión de Vacaciones", href: "/admin/vacations" },
    ]
  },
  {
    label: "Operaciones de Nómina",
    items: [
      { icon: Banknote, label: "Procesamiento de Nómina", href: "/payroll" },
      { icon: CreditCard, label: "Gestión de Incidencia de Nomina", href: "/payroll/incidents" },
      { icon: Scaling, label: "Prestaciones y Provisiones", href: "/benefits" },
    ]
  },
  {
    label: "Administración de Accesos",
    items: [
      { icon: UserPlus, label: "Gestión de Usuarios", href: "/admin/users" },
      { icon: ShieldCheck, label: "Roles y Permisos", href: "/admin/roles" },
    ]
  },
  {
    label: "Estructura y Estrategia",
    items: [
      { icon: Building2, label: "Estructura Organizacional", href: "/organizations" },
      { icon: Briefcase, label: "Puestos y Jerarquías", href: "/positions" },
      { icon: PieChart, label: "Centros de Costos", href: "/cost-centers" },
    ]
  },
  {
    label: "Configuración y Catálogos",
    items: [
      { icon: Globe, label: "Localización y Reglas", href: "/localization" },
      { icon: Settings, label: "Catálogos Maestros", href: "/catalogs" },
    ]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    availableUnits, 
    selectedUnitIds,
    selectedCountryIds, 
    toggleUnit,
    toggleCountry, 
    isMultiSelectMode 
  } = useOrganization();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    return menuStructure.reduce((acc, section) => ({ ...acc, [section.label]: true }), {});
  });
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const hierarchy = availableUnits.reduce((acc, unit) => {
    const matchesSearch = 
      unit.name.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
      unit.countryName.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
      unit.organizationName.toLowerCase().includes(unitSearchTerm.toLowerCase());

    if (!matchesSearch) return acc;

    if (!acc[unit.countryId]) {
      acc[unit.countryId] = { id: unit.countryId, name: unit.countryName, units: [] as any };
    }
    acc[unit.countryId].units.push(unit);
    return acc;
  }, {} as any);

  const activeUnitsNames = availableUnits
    .filter(u => selectedUnitIds.includes(u.id))
    .map(u => u.name);

  return (
    <aside className={`sidebar glass border-r shadow-sm transition-all duration-300 ${isCollapsed ? 'width-collapsed' : 'width-expanded'} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header px-4 pt-6 pb-2">
        <div className="logo flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3 animate-in fade-in duration-500">
            <div className="logo-icon shadow-lg shadow-primary/30">
              {isCollapsed ? 'SV' : 'SV'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight leading-none">SV-HR Core</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sistemas de Valor</span>
              </div>
            )}
          </div>
          
          {isMobileOpen && (
            <button 
              onClick={onCloseMobile}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="unit-switcher animate-in fade-in duration-500">
            <div className="mb-3 px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scope de Gestión</span>
              {isMultiSelectMode && <span className="text-[8px] bg-emerald-100/50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-emerald-100">Global</span>}
            </div>
            
            <button 
              className={`unit-btn shadow-sm hover:shadow-md transition-all border-slate-200 ${showUnitMenu ? 'ring-2 ring-primary border-primary' : ''}`} 
              onClick={() => setShowUnitMenu(!showUnitMenu)}
            >
              <div className="unit-info truncate flex-1">
                <span className="unit-name truncate text-slate-700 block text-left">
                  {selectedUnitIds.length === 0 ? "Sin Selección" : 
                   selectedUnitIds.length === 1 ? activeUnitsNames[0] :
                   `${selectedUnitIds.length} Unidades`}
                </span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showUnitMenu ? "rotate-180" : ""}`} />
            </button>
            
            {showUnitMenu && (
              <div className="unit-dropdown animate-in slide-in-from-top-2 fade-in duration-300 custom-scrollbar shadow-2xl border-slate-200">
                <div className="px-2 pb-4 mb-2 flex flex-col gap-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selector Jerárquico</span>
                    <Globe size={12} className="text-slate-300" />
                  </div>
                  
                  <div className="relative group/search">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Buscar país o unidad..." 
                      className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      value={unitSearchTerm}
                      onChange={(e) => setUnitSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {Object.values(hierarchy).map((country: any) => {
                  const allUnitsSelected = country.units.every((u: any) => selectedUnitIds.includes(u.id));
                  const someUnitsSelected = country.units.some((u: any) => selectedUnitIds.includes(u.id)) && !allUnitsSelected;

                  return (
                    <div key={country.id} className="country-item mb-4 last:mb-0">
                      <div 
                        className="group-header flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all group"
                        onClick={() => toggleCountry(country.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`checkbox ${allUnitsSelected ? "checked" : someUnitsSelected ? "partial" : ""}`}>
                            {allUnitsSelected && <div className="indicator shadow-sm" />}
                            {someUnitsSelected && <div className="indicator-partial shadow-sm" />}
                          </div>
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                            {country.name}
                          </span>
                        </div>
                        <ChevronRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>

                      <div className="unit-list ml-6 space-y-1 mt-1 border-l-2 border-slate-100 pl-3">
                        {country.units.map((unit: any) => {
                          const isSelected = selectedUnitIds.includes(unit.id);
                          return (
                            <div 
                              key={unit.id} 
                              className={`p-2 rounded-lg transition-all flex items-center gap-3 cursor-pointer ${isSelected ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUnit(unit.id);
                              }}
                            >
                              <div className={`checkbox ${isSelected ? "checked" : ""}`}>
                                {isSelected && <div className="indicator shadow-sm" />}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[11px] font-bold ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                                  {unit.name}
                                </span>
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">
                                  {unit.roleName}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className={`sidebar-nav custom-scrollbar ${isCollapsed ? 'px-4' : 'px-6'} py-8`}>
        {menuStructure.map((section, idx) => {
          const isOpen = openSections[section.label];
          return (
            <div key={idx} className="menu-section mb-10 last:mb-0">
              {!isCollapsed && (
                <button 
                  className="section-header mb-5 w-full flex items-center justify-between group px-1 text-left" 
                  onClick={() => toggleSection(section.label)}
                >
                  <h4 className="section-label group-hover:text-slate-800 transition-colors uppercase font-bold tracking-[0.2em] text-[10px]">{section.label}</h4>
                  {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                </button>
              )}
              
              {(isOpen || isCollapsed) && (
                <div className="section-items space-y-3">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        className={`nav-item flex items-center gap-5 p-3 rounded-2xl transition-all group ${isActive ? "bg-primary/5 text-primary active" : "hover:bg-slate-50 text-slate-600"}`}
                      >
                        <div className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white border border-slate-100 shadow-sm group-hover:bg-white group-hover:border-primary/20 group-hover:text-primary'}`}>
                          <Icon size={22} />
                        </div>
                        {!isCollapsed && (
                          <span className="truncate text-[15px] font-bold tracking-tight animate-in slide-in-from-left-2 duration-300">
                            {item.label}
                          </span>
                        )}
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] whitespace-nowrap shadow-xl">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={`sidebar-footer p-6 border-t border-slate-100 bg-slate-50/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-2xl shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary-focus ring-2 ring-white flex-shrink-0 flex items-center justify-center text-white font-black text-sm">JD</div>
          {!isCollapsed && (
            <div className="user-details animate-in fade-in duration-500 overflow-hidden">
              <span className="user-name text-slate-800 font-bold block truncate text-[15px]">Juan Delgado</span>
              <span className="user-role flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} className="text-emerald-500" />
                Acceso Global
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 50;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
        }
        
        .width-expanded { width: 300px; }
        .width-collapsed { width: 90px; }

        .sidebar-header { margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .logo-icon { width: 48px; height: 48px; background: var(--primary); color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 900; }

        .unit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          background: white;
          border: 1px solid #eef2f6;
          border-radius: 16px;
        }

        .unit-dropdown {
          position: absolute;
          top: 100%;
          left: 8px;
          right: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          margin-top: 8px;
          z-index: 100;
          max-height: 400px;
          overflow-y: auto;
          padding: 1rem;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          background: white;
        }
        .checkbox.checked { background: var(--primary); border-color: var(--primary); }
        .checkbox.partial { background: white; border-color: var(--primary); }
        
        .indicator { width: 6px; height: 6px; background: white; border-radius: 1px; }
        .indicator-partial { width: 8px; height: 2px; background: var(--primary); border-radius: 1px; }

        .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .section-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; color: #94a3b8; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
        @media (max-width: 1024px) {
          .sidebar {
            width: 280px !important;
            transform: translateX(-100%);
            z-index: 100;
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .width-collapsed, .width-expanded {
            width: 280px !important;
          }
        }
      `}</style>
    </aside>
  );
}
