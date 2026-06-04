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
  Upload, 
  MapPin, 
  Phone,
  ShieldCheck,
  Building,
  UserCheck,
  Plus,
  Clock,
  Globe,
  Building2,
  ListRestart
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import PayrollBenefitsSection from "@/components/PayrollBenefitsSection";
import AcademicProfessionalSection from "@/components/AcademicProfessionalSection";
import EmployeeDocumentsSection from "@/components/EmployeeDocumentsSection";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  
  // Cascading data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [gerencias, setGerencias] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const res = await fetch("/api/config/shifts");
    if (res.ok) setShifts(await res.json());
  };

  const fetchCascadingData = async () => {
    const [orgs, gers, depts, locs, pos, countries] = await Promise.all([
      fetch("/api/organizations").then(r => r.json()),
      fetch("/api/config/gerencias").then(r => r.json()),
      fetch("/api/config/departments").then(r => r.json()),
      fetch("/api/config/locations").then(r => r.json()),
      fetch("/api/config/positions").then(r => r.json()),
      fetch("/api/localization/countries").then(r => r.json())
    ]);
    setOrganizations(orgs);
    setGerencias(gers);
    setDepartments(depts);
    setLocations(locs);
    setPositions(pos);
    setCountries(countries);
  };

  useEffect(() => {
    fetchCascadingData();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/employees-data/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setEmployee(data);
          setLoading(false);
          // Initial filter
          filterShifts(data, shifts);
        });
    }
  }, [params.id, shifts.length]);

  const filterShifts = (emp: any, allShifts: any[]) => {
    if (!emp || !allShifts.length) return;
    const filtered = allShifts.filter(shift => 
      shift.departments.some((d: any) => d.id === emp.position?.departmentId) ||
      shift.locations.some((l: any) => l.id === emp.locationId) ||
      (shift.departments.length === 0 && shift.locations.length === 0)
    );
    setAvailableShifts(filtered);
  };

  const handleSave = async () => {
    // Basic implementation for demo
    const res = await fetch(`/api/employees-data/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (res.ok) {
      router.push("/employees");
      router.refresh();
    }
  };

  if (loading) return <Shell><div className="p-8">Cargando expediente...</div></Shell>;

  const tabs = [
    { id: "personal", label: "ID y Personales", icon: User },
    { id: "contract", label: "Contractual y Legal", icon: ShieldCheck },
    { id: "academic", label: "Académico y Prof.", icon: GraduationCap },
    { id: "payroll", label: "Nómina y Beneficios", icon: CreditCard },
    { id: "documents", label: "Documentos", icon: FileText },
  ];

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <h1>Editar Expediente: {employee.fullName}</h1>
          <p className="subtitle">Actualización de información obligatoria de RRHH.</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => router.push("/employees")}>
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} />
            <span>Guardar Cambios</span>
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
                  <input 
                    type="text" 
                    value={employee.firstName || ""} 
                    onChange={e => setEmployee({...employee, firstName: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Segundo Nombre</label>
                  <input 
                    type="text" 
                    value={employee.middleName || ""} 
                    onChange={e => setEmployee({...employee, middleName: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Primer Apellido</label>
                  <input 
                    type="text" 
                    value={employee.firstSurname || ""} 
                    onChange={e => setEmployee({...employee, firstSurname: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Segundo Apellido</label>
                  <input 
                    type="text" 
                    value={employee.secondSurname || ""} 
                    onChange={e => setEmployee({...employee, secondSurname: e.target.value})}
                  />
                </div>
                <div className="input-group full">
                  <label>Nombre Completo (según DUI)</label>
                  <input 
                    type="text" 
                    value={employee.fullName || ""} 
                    onChange={e => setEmployee({...employee, fullName: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Código de Empleado</label>
                  <input 
                    type="text" 
                    value={employee.employeeCode || ""} 
                    onChange={e => setEmployee({...employee, employeeCode: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>DUI</label>
                  <input 
                    type="text" 
                    value={employee.dui || ""} 
                    onChange={e => setEmployee({...employee, dui: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>NIT</label>
                  <input 
                    type="text" 
                    value={employee.nit || ""} 
                    onChange={e => setEmployee({...employee, nit: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Número de ISSS</label>
                  <input 
                    type="text" 
                    value={employee.isssNumber || ""} 
                    onChange={e => setEmployee({...employee, isssNumber: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Número de AFP (NUP)</label>
                  <input 
                    type="text" 
                    value={employee.nupNumber || ""} 
                    onChange={e => setEmployee({...employee, nupNumber: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label><Phone size={14}/> Teléfono</label>
                  <input 
                    type="text" 
                    value={employee.phone || ""} 
                    onChange={e => setEmployee({...employee, phone: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={employee.personalEmail || ""} 
                    onChange={e => setEmployee({...employee, personalEmail: e.target.value})}
                  />
                </div>
                <div className="input-group full">
                  <label><MapPin size={14}/> Dirección de Residencia</label>
                  <textarea 
                    value={employee.address || ""} 
                    onChange={e => setEmployee({...employee, address: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          {activeTab === "contract" && (
            <div className="form-section">
              <h3 className="section-title">2. Información Contractual y Legal</h3>
              <div className="grid-form">
                <div className="input-group">
                  <label>Fecha de Ingreso</label>
                  <input 
                    type="date" 
                    value={employee.hireDate?.split('T')[0] || ""} 
                    onChange={e => setEmployee({...employee, hireDate: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Estado del Colaborador</label>
                  <select 
                    value={employee.status || "ACTIVE"} 
                    onChange={e => setEmployee({...employee, status: e.target.value})}
                    className="select-input"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="INACTIVE">Baja / Inactivo</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Tipo de Empleado</label>
                  <select 
                    value={employee.employeeType || "ADMINISTRATIVE"} 
                    onChange={e => setEmployee({...employee, employeeType: e.target.value})}
                    className="select-input"
                  >
                    <option value="ADMINISTRATIVE">Administrativo</option>
                    <option value="MEDICAL">Médico</option>
                    <option value="NURSING">Enfermería</option>
                    <option value="PROFESSIONAL_SERVICES">Servicios profesionales</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Tipo de Contrato</label>
                  <select 
                    value={employee.contractType || "PERMANENT"} 
                    onChange={e => setEmployee({...employee, contractType: e.target.value})}
                    className="select-input"
                  >
                    <option value="FIXED_TERM">Plazo Fijo</option>
                    <option value="PERMANENT">Indefinido</option>
                    <option value="TEMPORARY">Temporal</option>
                    <option value="PROFESSIONAL_SERVICES">Servicios Profesionales</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Jornada Laboral</label>
                  <input 
                    type="text" 
                    value={employee.workingDay || ""} 
                    onChange={e => setEmployee({...employee, workingDay: e.target.value})}
                    placeholder="Ej: Diurna, Mixta, 44 horas"
                  />
                </div>
                <div className="input-group">
                  <label>Cálculo de Indemnización</label>
                  <select 
                    value={employee.severanceMethod || "LEGAL"} 
                    onChange={e => setEmployee({...employee, severanceMethod: e.target.value})}
                    className="select-input"
                  >
                    <option value="LEGAL">Según Ley (El Salvador)</option>
                    <option value="CONTRACTUAL">Pactada por Contrato</option>
                    <option value="EXEMPT">No Aplica / Exento</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Período de Prueba</label>
                  <input 
                    type="text" 
                    value={employee.probationPeriod || ""} 
                    onChange={e => setEmployee({...employee, probationPeriod: e.target.value})}
                    placeholder="Ej: 30 días, 3 meses"
                  />
                </div>
                <div className="input-group">
                  <label>Días de Descanso</label>
                  <input 
                    type="text" 
                    value={employee.restDays || ""} 
                    onChange={e => setEmployee({...employee, restDays: e.target.value})}
                    placeholder="Ej: Sábado y Domingo"
                  />
                </div>
                <div className="input-group full">
                  <label>Beneficios Aplicables</label>
                  <textarea 
                    value={employee.applicableBenefits || ""} 
                    onChange={e => setEmployee({...employee, applicableBenefits: e.target.value})}
                    placeholder="Listado de beneficios adicionales..."
                    rows={3}
                  ></textarea>
                </div>
                <div className="input-group">
                  <label><Globe size={14}/> País (Residencia Fiscal)</label>
                  <select 
                    value={employee.countryId || ""} 
                    onChange={e => setEmployee({...employee, countryId: e.target.value})}
                    className="select-input"
                  >
                    <option value="">Seleccione país...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label><Building2 size={14}/> Unidad Operativa (Organización)</label>
                  <select 
                    value={employee.organizationId || ""} 
                    onChange={e => setEmployee({...employee, organizationId: e.target.value, gerenciaId: "", positionId: "", locationId: ""})}
                    className="select-input"
                  >
                    <option value="">Seleccione organización...</option>
                    {organizations.map(o => <option key={o.id} value={o.id}>{o.commercialName}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label><Building size={14}/> Gerencia</label>
                  <select 
                    value={employee.gerenciaId || ""} 
                    onChange={e => setEmployee({...employee, gerenciaId: e.target.value, position: { ...employee.position, departmentId: "" }, positionId: ""})}
                    className="select-input"
                    disabled={!employee.organizationId}
                  >
                    <option value="">Seleccione gerencia...</option>
                    {gerencias.filter(g => g.organizationId === employee.organizationId).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label><ListRestart size={14}/> Departamento</label>
                  <select 
                    value={employee.position?.departmentId || ""} 
                    onChange={e => {
                      const deptId = e.target.value;
                      setEmployee({
                        ...employee, 
                        position: { ...employee.position, departmentId: deptId },
                        positionId: "" // Reset position when dept changes
                      });
                    }}
                    className="select-input"
                    disabled={!employee.gerenciaId}
                  >
                    <option value="">Seleccione departamento...</option>
                    {departments.filter(d => d.gerenciaId === employee.gerenciaId).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label><MapPin size={14}/> Sede / Ubicación</label>
                  <select 
                    value={employee.locationId || ""} 
                    onChange={e => setEmployee({...employee, locationId: e.target.value})}
                    className="select-input"
                    disabled={!employee.organizationId}
                  >
                    <option value="">Seleccione sede...</option>
                    {locations.filter(l => l.organizationId === employee.organizationId).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label><UserCheck size={14}/> Puesto / Cargo</label>
                  <select 
                    value={employee.positionId || ""} 
                    onChange={e => setEmployee({...employee, positionId: e.target.value})}
                    className="select-input"
                    disabled={!employee.position?.departmentId}
                  >
                    <option value="">Seleccione cargo...</option>
                    {positions.filter(p => p.departmentId === employee.position?.departmentId).map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group full">
                  <label>Jefe Inmediato</label>
                  <input 
                    type="text" 
                    value={employee.supervisorName || ""} 
                    onChange={e => setEmployee({...employee, supervisorName: e.target.value})}
                    placeholder="Nombre del jefe directo"
                  />
                </div>
                <div className="input-group full">
                  <label><Clock size={14}/> Asignación de Turno (Horario)</label>
                  <select 
                    value={employee.shiftId || ""} 
                    onChange={e => setEmployee({...employee, shiftId: e.target.value})}
                    className="select-input"
                  >
                    <option value="">Seleccione un turno...</option>
                    {availableShifts.map(shift => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                    {availableShifts.length === 0 && (
                      <option disabled>No hay turnos disponibles para este depto/sede</option>
                    )}
                  </select>
                  {availableShifts.length === 0 && (
                    <p className="text-[10px] text-rose-500 mt-1 italic">
                      Configure turnos para el departamento "{employee.position?.department?.name}" o la sede "{employee.location?.name}" en Catálogos.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "payroll" && (
            <div className="form-section">
              <h3 className="section-title">4. Nómina, Beneficios y Descuentos Recurrentes</h3>
              
              <div className="grid-form mb-12 pb-12 border-b border-slate-100">
                <div className="input-group">
                  <label>Salario Base Mensual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                      type="number" 
                      className="pl-8"
                      value={employee.baseSalary || 0} 
                      onChange={e => setEmployee({...employee, baseSalary: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Forma de Pago</label>
                  <select 
                    value={employee.paymentFrequency || "MONTHLY"} 
                    onChange={e => setEmployee({...employee, paymentFrequency: e.target.value})}
                    className="select-input"
                  >
                    <option value="MONTHLY">Mensual</option>
                    <option value="BIWEEKLY">Quincenal</option>
                    <option value="WEEKLY">Semanal</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Banco (Transferencia)</label>
                  <input 
                    type="text" 
                    value={employee.bankName || ""} 
                    onChange={e => setEmployee({...employee, bankName: e.target.value})}
                    placeholder="Nombre de la entidad"
                  />
                </div>
                <div className="input-group">
                  <label>Número de Cuenta</label>
                  <input 
                    type="text" 
                    value={employee.bankAccountNumber || ""} 
                    onChange={e => setEmployee({...employee, bankAccountNumber: e.target.value})}
                    placeholder="000-000000-0"
                  />
                </div>
              </div>

              <PayrollBenefitsSection employeeId={employee.id} />
            </div>
          )}
          {activeTab === "academic" && (
            <div className="form-section">
              <h3 className="section-title">3. Histórico Académico y Certificaciones Profesionales</h3>
              <AcademicProfessionalSection employeeId={employee.id} />
            </div>
          )}
          {activeTab === "documents" && (
            <div className="form-section">
              <EmployeeDocumentsSection employeeId={employee.id} />
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
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        .input-group input:focus, .input-group textarea:focus, .select-input:focus { 
          border-color: var(--primary); 
          box-shadow: 0 0 0 3px hsla(221, 100%, 31%, 0.1); 
        }
        .select-input { background: white; cursor: pointer; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-3 { left: 0.75rem; }
        .top-1\/2 { top: 50%; }
        .-translate-y-1\/2 { transform: translateY(-50%); }
        .pl-8 { padding-left: 2rem !important; }
        .pb-12 { padding-bottom: 3rem; }
        .mb-12 { margin-bottom: 3rem; }
        .border-b { border-bottom: 1px solid var(--border); }
        .bg-slate-50 { background-color: #f8fafc; }
        .cursor-not-allowed { cursor: not-allowed; }
      `}</style>
    </Shell>
  );
}
