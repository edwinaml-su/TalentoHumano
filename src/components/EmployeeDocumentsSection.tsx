"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Calendar,
  AlertTriangle,
  Download,
  Upload,
  Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Document {
  id: string;
  category: "IDENTIFICATION" | "CONTRACTUAL" | "ACADEMIC" | "PAYROLL" | "LEGAL";
  title: string;
  fileUrl: string | null;
  expiryDate: string | null;
  uploadDate: string;
}

interface Props {
  employeeId: string;
}

const CATEGORY_LABELS = {
  IDENTIFICATION: "Identificación (DUI, Pasaporte)",
  CONTRACTUAL: "Contrato / Adenda",
  ACADEMIC: "Título / Certificado",
  PAYROLL: "Boleta de Pago / Nómina",
  LEGAL: "Legal / Otros"
};

export default function EmployeeDocumentsSection({ employeeId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Document["category"]>("IDENTIFICATION");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees-data/${employeeId}/documents`);
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Error al cargar los documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Seleccione un archivo para subir");
      return;
    }
    if (!title.trim()) {
      toast.error("Ingrese un título para el documento");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("title", title);
      if (expiryDate) {
        formData.append("expiryDate", expiryDate);
      }

      const res = await fetch(`/api/employees-data/${employeeId}/documents`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        toast.success("Documento subido exitosamente");
        setFile(null);
        setTitle("");
        setExpiryDate("");
        setIsFormOpen(false);
        fetchDocuments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al subir el documento");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error de red al subir");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("¿Está seguro de eliminar este documento de manera permanente?")) return;

    try {
      const res = await fetch(`/api/employees-data/${employeeId}/documents/${docId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("Documento eliminado");
        fetchDocuments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al eliminar");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error al eliminar documento");
    }
  };

  const getExpiryWarning = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return null;
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Expirado", color: "text-rose-500 bg-rose-50 border-rose-100" };
    } else if (diffDays <= 30) {
      return { text: `Vence en ${diffDays} días`, color: "text-amber-600 bg-amber-50 border-amber-100" };
    }
    return null;
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando documentos del expediente...</div>;

  return (
    <div className="documents-section-container">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            Expediente Digital: Archivo y Documentación
          </h4>
          <p className="text-sm text-slate-500">
            Administra los documentos digitales obligatorios de identidad, contratos y educación del colaborador.
          </p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-focus transition-all"
          >
            <Plus size={18} />
            Subir Documento
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleUpload} className="bg-primary/5 p-8 rounded-2xl border border-primary/10 mb-8 animate-fade-in space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-primary/10">
            <h5 className="font-bold text-primary text-base">Cargar Documento al Expediente</h5>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Título del Documento</label>
              <input 
                className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: DUI Frontal Ampliado, Contrato Temporal 2026"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
              <select 
                className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Fecha de Vencimiento (Opcional)</label>
              <input 
                type="date"
                className="p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Seleccione Archivo (PDF, JPG, PNG)</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm">
                  <Upload size={18} />
                  <span>{file ? file.name : "Subir archivo..."}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)} 
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-focus transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar en Expediente</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {documents.map((doc) => {
          const warning = getExpiryWarning(doc.expiryDate);
          return (
            <div key={doc.id} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-base">{doc.title}</h5>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-1">
                    <span className="font-semibold text-primary">{CATEGORY_LABELS[doc.category]}</span>
                    <span>•</span>
                    <span>Subido: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                    {doc.expiryDate && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar size={12} />
                          Vence: {new Date(doc.expiryDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {warning && (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${warning.color}`}>
                    <AlertTriangle size={12} />
                    {warning.text}
                  </span>
                )}
                
                {doc.fileUrl && (
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                    title="Ver / Descargar"
                  >
                    <Download size={18} />
                  </a>
                )}
                
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar Documento"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {documents.length === 0 && !isFormOpen && (
          <div className="py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FileText size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium">No se han cargado documentos en este expediente aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
