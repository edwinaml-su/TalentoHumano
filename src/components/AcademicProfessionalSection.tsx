"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  GraduationCap, 
  Award,
  Calendar,
  Building,
  ExternalLink,
  BookOpen
} from "lucide-react";

interface Study {
  id?: string;
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "DROPPED" | "PAUSED";
}

interface Certification {
  id?: string;
  name: string;
  issuingEntity: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface Props {
  employeeId: string;
}

export default function AcademicProfessionalSection({ employeeId }: Props) {
  const [activeTab, setActiveTab] = useState<"studies" | "certifications">("studies");
  const [studies, setStudies] = useState<Study[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newStudy, setNewStudy] = useState<Study | null>(null);
  const [newCert, setNewCert] = useState<Certification | null>(null);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studiesRes, certsRes] = await Promise.all([
        fetch(`/api/employees-data/${employeeId}/studies`),
        fetch(`/api/employees-data/${employeeId}/certifications`)
      ]);
      
      if (studiesRes.ok) setStudies(await studiesRes.json());
      if (certsRes.ok) setCertifications(await certsRes.json());
    } catch (err) {
      console.error("Error fetching academic data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudy = async (item: Study) => {
    const method = item.id ? "PUT" : "POST";
    const url = item.id 
      ? `/api/employees-data/${employeeId}/studies/${item.id}` 
      : `/api/employees-data/${employeeId}/studies`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });

      if (res.ok) {
        fetchData();
        setNewStudy(null);
        setIsEditing(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCert = async (item: Certification) => {
    const method = item.id ? "PUT" : "POST";
    const url = item.id 
      ? `/api/employees-data/${employeeId}/certifications/${item.id}` 
      : `/api/employees-data/${employeeId}/certifications`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });

      if (res.ok) {
        fetchData();
        setNewCert(null);
        setIsEditing(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudy = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este estudio académico?")) return;
    try {
      const res = await fetch(`/api/employees-data/${employeeId}/studies/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta certificación?")) return;
    try {
      const res = await fetch(`/api/employees-data/${employeeId}/certifications/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startNewStudy = () => {
    setNewStudy({
      degree: "",
      institution: "",
      status: "COMPLETED",
      startDate: "",
      endDate: ""
    });
  };

  const startNewCert = () => {
    setNewCert({
      name: "",
      issuingEntity: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: ""
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando información académica...</div>;

  return (
    <div className="academic-prof-container">
      <div className="sub-tabs flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 max-w-md">
        <button
          onClick={() => setActiveTab("studies")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
            ${activeTab === "studies" 
              ? "bg-white text-primary shadow-sm border border-slate-100" 
              : "text-slate-400 hover:text-slate-600"}
          `}
        >
          <GraduationCap size={16} />
          Estudios
        </button>
        <button
          onClick={() => setActiveTab("certifications")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
            ${activeTab === "certifications" 
              ? "bg-white text-primary shadow-sm border border-slate-100" 
              : "text-slate-400 hover:text-slate-600"}
          `}
        >
          <Award size={16} />
          Certificaciones
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {activeTab === "studies" ? <GraduationCap size={24} className="text-primary" /> : <Award size={24} className="text-primary" />}
            {activeTab === "studies" ? "Historial Académico" : "Certificaciones y Logros"}
          </h4>
          <p className="text-sm text-slate-500">
            {activeTab === "studies" 
              ? "Títulos universitarios, bachillerato y otros estudios formales." 
              : "Certificaciones profesionales, licencias y cursos especializados."}
          </p>
        </div>
        <button 
          onClick={activeTab === "studies" ? startNewStudy : startNewCert}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-focus transition-all"
        >
          <Plus size={18} />
          {activeTab === "studies" ? "Agregar Estudio" : "Agregar Certificación"}
        </button>
      </div>

      <div className="grid gap-6">
        {activeTab === "studies" && (
          <>
            {newStudy && (
              <StudyForm 
                study={newStudy} 
                onSave={handleSaveStudy} 
                onCancel={() => setNewStudy(null)} 
              />
            )}
            {studies.map(study => (
              isEditing === study.id ? (
                <StudyForm 
                  key={study.id}
                  study={study} 
                  onSave={handleSaveStudy} 
                  onCancel={() => setIsEditing(null)} 
                />
              ) : (
                <div key={study.id} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-lg">{study.degree}</h5>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <Building size={14} />
                        <span>{study.institution}</span>
                        <span className="text-slate-300">•</span>
                        <Calendar size={14} />
                        <span>
                          {study.startDate ? new Date(study.startDate).getFullYear() : '?'} - 
                          {study.status === "IN_PROGRESS" ? "Presente" : (study.endDate ? new Date(study.endDate).getFullYear() : '?')}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          study.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" :
                          study.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-600" :
                          "bg-slate-100 text-slate-400"
                        }`}>
                          {study.status === "COMPLETED" ? "Completado" :
                           study.status === "IN_PROGRESS" ? "En Curso" :
                           study.status === "DROPPED" ? "No Finalizado" : "Pausado"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(study.id!)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteStudy(study.id!)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            ))}
            {studies.length === 0 && !newStudy && (
              <div className="py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-sm">No hay registros académicos para este empleado.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "certifications" && (
          <>
            {newCert && (
              <CertForm 
                cert={newCert} 
                onSave={handleSaveCert} 
                onCancel={() => setNewCert(null)} 
              />
            )}
            {certifications.map(cert => (
              isEditing === cert.id ? (
                <CertForm 
                  key={cert.id}
                  cert={cert} 
                  onSave={handleSaveCert} 
                  onCancel={() => setIsEditing(null)} 
                />
              ) : (
                <div key={cert.id} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <Award size={24} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-lg">{cert.name}</h5>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <Building size={14} />
                        <span>{cert.issuingEntity}</span>
                        <span className="text-slate-300">•</span>
                        <Calendar size={14} />
                        <span>Expedido: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {(cert.credentialId || cert.credentialUrl) && (
                        <div className="flex gap-4 mt-3 text-xs">
                          {cert.credentialId && <span className="text-slate-400">ID: <span className="text-slate-600 font-mono font-bold">{cert.credentialId}</span></span>}
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-bold">
                              Ver Credencial <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(cert.id!)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteCert(cert.id!)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            ))}
            {certifications.length === 0 && !newCert && (
              <div className="py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-sm">No hay certificaciones registradas.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StudyForm({ study, onSave, onCancel }: { study: Study, onSave: (s: Study) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Study>({ ...study });

  return (
    <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Título / Carrera</label>
          <input 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            value={formData.degree}
            onChange={e => setFormData({...formData, degree: e.target.value})}
            placeholder="Ej: Licenciatura en Administración"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Institución</label>
          <input 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            value={formData.institution}
            onChange={e => setFormData({...formData, institution: e.target.value})}
            placeholder="Ej: Universidad Centroamericana"
          />
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <label className="font-bold text-slate-500 uppercase">Fecha Inicio</label>
          <input 
            type="date"
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            value={formData.startDate?.split('T')[0] || ""}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <label className="font-bold text-slate-500 uppercase">Fecha Fin (o planeada)</label>
          <input 
            type="date"
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            value={formData.endDate?.split('T')[0] || ""}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
          <select 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value as any})}
          >
            <option value="COMPLETED">Completado</option>
            <option value="IN_PROGRESS">En Curso</option>
            <option value="PAUSED">Pausado</option>
            <option value="DROPPED">No Finalizado</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onCancel} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all">Cancelar</button>
        <button onClick={() => onSave(formData)} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-focus transition-all flex items-center gap-2">
          <Save size={18} />
          Guardar Estudio
        </button>
      </div>
    </div>
  );
}

function CertForm({ cert, onSave, onCancel }: { cert: Certification, onSave: (c: Certification) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Certification>({ ...cert });

  return (
    <div className="bg-amber-50/50 p-8 rounded-2xl border border-amber-100 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Nombre de Certificación</label>
          <input 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-200 transition-all font-semibold"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ej: AWS Solutions Architect"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Entidad Emisora</label>
          <input 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-200 transition-all font-semibold"
            value={formData.issuingEntity}
            onChange={e => setFormData({...formData, issuingEntity: e.target.value})}
            placeholder="Ej: Amazon Web Services"
          />
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <label className="font-bold text-slate-500 uppercase">Fecha de Expedición</label>
          <input 
            type="date"
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-200 transition-all font-semibold"
            value={formData.issueDate?.split('T')[0] || ""}
            onChange={e => setFormData({...formData, issueDate: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <label className="font-bold text-slate-500 uppercase">Fecha de Caducidad</label>
          <input 
            type="date"
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-200 transition-all font-semibold"
            value={formData.expiryDate?.split('T')[0] || ""}
            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">ID de Credencial</label>
          <input 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-200 transition-all font-mono"
            value={formData.credentialId || ""}
            onChange={e => setFormData({...formData, credentialId: e.target.value})}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">URL de Verificación</label>
          <input 
            className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-200 transition-all"
            value={formData.credentialUrl || ""}
            onChange={e => setFormData({...formData, credentialUrl: e.target.value})}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onCancel} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all">Cancelar</button>
        <button onClick={() => onSave(formData)} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all flex items-center gap-2">
          <Save size={18} />
          Guardar Certificación
        </button>
      </div>
    </div>
  );
}
