"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  User, 
  FileText, 
  GraduationCap, 
  CreditCard, 
  Save, 
  X, 
  Globe,
  Building2,
  Building,
  ListRestart,
  MapPin, 
  Phone,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  
  // Cascading data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [gerencias, setGerencias] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    thirdName: "",
    firstSurname: "",
    secondSurname: "",
    fullName: "",
    dui: "",
    nit: "",
    isssNumber: "",
    nupNumber: "",
    address: "",
    phone: "",
    email: "",
    emergencyContact: "",
    employeeCode: "",
    hireDate: "",
    contractType: "Indefinido",
    bankName: "",
    bankAccountType: "Ahorros",
    bankAccountNumber: "",
    baseSalary: 0,
    organizationId: "",
    gerenciaId: "",
    departmentId: "",
    locationId: "",
    positionId: "",
    countryId: "",
    shiftId: ""
  });

  useEffect(() => {
    fetchCascadingData();
  }, []);

  const fetchCascadingData = async () => {
    try {
      const [orgs, gers, depts, locs, pos, countries, shiftsData] = await Promise.all([
        fetch("/api/organizations").then(r => r.json()),
        fetch("/api/config/gerencias").then(r => r.json()),
        fetch("/api/config/departments").then(r => r.json()),
        fetch("/api/config/locations").then(r => r.json()),
        fetch("/api/positions").then(r => r.json()),
        fetch("/api/localization/countries").then(r => r.json()),
        fetch("/api/config/shifts").then(r => r.json())
      ]);
      setOrganizations(orgs);
      setGerencias(gers);
      setDepartments(depts);
      setLocations(locs);
      setPositions(pos);
      setCountries(countries);
      setShifts(shiftsData);
    } catch (e) {
      console.error("Error fetching dependencies", e);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.locationId || !formData.positionId || !formData.countryId) {
      alert("Por favor, seleccione Unidad Operativa, Cargo y País de Residencia Fiscal.");
      return;
    }
  
    try {
      const res = await fetch("/api/employees-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/employees");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar el expediente. Verifique los campos obligatorios.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: "personal", label: "ID y Personales", icon: User },
    { id: "contract", label: "Contractual y Legal", icon: ShieldCheck },
    { id: "academic", label: "Académico y Prof.", icon: GraduationCap },
    { id: "payroll", label: "Nómina y Beneficios", icon: CreditCard },
  ];

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <h1>Nuevo Expediente Digital</h1>
          <p className="subtitle">Completar la información obligatoria según requerimientos de RRHH.</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => router.push("/employees")}>
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} />
            <span>Guardar Expediente</span>
          </button>
        </div>
      </div>

      <div className="form-container">
        <div className="tabs-nav card glass">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="form-content card animate-slide-up">
          {activeTab === "personal" && (
            <div className="form-section">
              <h3 className="section-title">1. Datos de Identificación y Personales</h3>
              <div className="grid-form">
                <div className="input-group">
                  <label>Primer Nombre</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Segundo Nombre</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
                </div>
                <div className="input-group">
                   <label>Tercer Nombre</label>
                   <input type="text" name="thirdName" value={formData.thirdName} onChange={handleChange} />
                 </div>
                <div className="input-group">
                  <label>Primer Apellido</label>
                  <input type="text" name="firstSurname" value={formData.firstSurname} onChange={handleChange} required />
                </div>
                <div className="input-group">
                   <label>Segundo Apellido</label>
                   <input type="text" name="secondSurname" value={formData.secondSurname} onChange={handleChange} />
                 </div>
                <div className="input-group full">
                  <label>Nombre Completo (según aparece en DUI)</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>DUI</label>
                  <input type="text" name="dui" value={formData.dui} onChange={handleChange} placeholder="00000000-0" />
                </div>
                <div className="input-group">
                  <label>NIT (Homologado)</label>
                  <input type="text" name="nit" value={formData.nit} onChange={handleChange} placeholder="0000-000000-000-0" />
                </div>
                <div className="input-group">
                  <label>Número de ISSS</label>
                  <input type="text" name="isssNumber" value={formData.isssNumber} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Número de NUP (AFP)</label>
                  <input type="text" name="nupNumber" value={formData.nupNumber} onChange={handleChange} />
                </div>
                <div className="input-group full">
                  <label><MapPin size={14}/> Dirección de Residencia</label>
                  <textarea name="address" value={formData.address} onChange={handleChange}></textarea>
                </div>
                <div className="input-group">
                  <label><Phone size={14}/> Teléfono</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Correo</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "contract" && (
            <div className="form-section">
              <h3 className="section-title">2. Información Contractual y Legal</h3>
              <div className="grid-form">
                <div className="input-group">
                   <label>Cód. Empleado</label>
                   <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Fecha de Ingreso</label>
                  <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} />
                </div>
                
                <div className="input-group">
                  <label><Globe size={14}/> País (Residencia Fiscal)</label>
                  <select 
                    name="countryId"
                    value={formData.countryId} 
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="">Seleccione país...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label><Building2 size={14}/> Unidad Operativa (Organización)</label>
                  <select 
                    value={formData.organizationId} 
                    onChange={e => setFormData({...formData, organizationId: e.target.value, gerenciaId: "", departmentId: "", positionId: "", locationId: ""})}
                    className="select-input"
                  >
                    <option value="">Seleccione organización...</option>
                    {organizations.map(o => <option key={o.id} value={o.id}>{o.commercialName}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label><Building size={14}/> Gerencia</label>
                  <select 
                    value={formData.gerenciaId} 
                    onChange={e => setFormData({...formData, gerenciaId: e.target.value, departmentId: "", positionId: ""})}
                    className="select-input"
                    disabled={!formData.organizationId}
                  >
                    <option value="">Seleccione gerencia...</option>
                    {gerencias.filter(g => g.organizationId === formData.organizationId).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label><ListRestart size={14}/> Departamento</label>
                  <select 
                    value={formData.departmentId} 
                    onChange={e => setFormData({...formData, departmentId: e.target.value, positionId: ""})}
                    className="select-input"
                    disabled={!formData.gerenciaId}
                  >
                    <option value="">Seleccione departamento...</option>
                    {departments.filter(d => d.gerenciaId === formData.gerenciaId).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label><MapPin size={14}/> Sede / Ubicación</label>
                  <select 
                    name="locationId"
                    value={formData.locationId} 
                    onChange={handleChange}
                    className="select-input"
                    disabled={!formData.organizationId}
                  >
                    <option value="">Seleccione sede...</option>
                    {locations.filter(l => l.organizationId === formData.organizationId).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label><UserCheck size={14}/> Puesto / Cargo</label>
                  <select 
                    name="positionId"
                    value={formData.positionId} 
                    onChange={handleChange}
                    className="select-input"
                    disabled={!formData.departmentId}
                  >
                    <option value="">Seleccione cargo...</option>
                    {positions.filter(p => p.departmentId === formData.departmentId).map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Turno / Horario Asignado</label>
                  <select 
                    name="shiftId"
                    value={formData.shiftId} 
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="">Seleccione turno...</option>
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          {/* Default styling placeholder for missing tabs intentionally kept compact */}
          {activeTab === "payroll" && (
             <div className="form-section">
               <h3 className="section-title">4. Nómina y Beneficios</h3>
               <div className="grid-form">
                 <div className="input-group">
                   <label>Salario Base Mensual</label>
                   <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} />
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .actions { display: flex; gap: 1rem; }
        .subtitle { color: var(--muted-foreground); }
        .tabs-nav { display: flex; padding: 0.5rem; gap: 0.5rem; margin-bottom: 1.5rem; border-radius: 12px; }
        .tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.75rem; background: transparent; color: var(--muted-foreground); font-weight: 600; border-radius: 8px; }
        .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 12px hsla(221, 100%, 31%, 0.2); }
        .form-content { padding: 2.5rem; }
        .section-title { margin-bottom: 2rem; color: var(--primary); font-size: 1.25rem; }
        .grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group.full { grid-column: span 2; }
        .input-group label { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; color: var(--muted-foreground); }
        .input-group input, .input-group textarea, .select-input { 
          padding: 0.75rem; 
          border: 1px solid var(--border); 
          border-radius: 8px; 
          outline: none; 
          font-size: 0.9rem;
        }
        .select-input:disabled { background: #f1f5f9; cursor: not-allowed; opacity: 0.6; }
      `}</style>
    </Shell>
  );
}
