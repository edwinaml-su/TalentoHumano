"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Filter, 
  Building2, 
  Calendar,
  Edit2,
  Trash2,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  firstSurname: string;
  fullName: string;
  personalEmail: string;
  hireDate: string;
  status: string;
  location?: {
    organization: {
      commercialName: string;
    };
  };
  position?: {
    department: {
      name: string;
    };
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees-data");
      
      if (!res.ok) {
        const text = await res.text();
        console.error("Server error (HTML?):", text.substring(0, 100));
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro?")) {
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
      fetchEmployees();
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <h1>Colaboradores</h1>
          <p className="subtitle">Gestión centralizada del expediente digital y nómina.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
          <Link href="/employees/new" className="btn btn-primary">
            <UserPlus size={18} />
            <span>Contratar Nuevo</span>
          </Link>
        </div>
      </div>

      <div className="card glass animate-slide-up">
        <div className="table-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-stats">
            Total: <strong>{filteredEmployees.length}</strong>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Estructura / Depto</th>
                <th>Fecha Ingreso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando colaboradores...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No se encontraron registros.</td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="table-row">
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{emp.firstName[0]}{emp.firstSurname[0]}</div>
                      <div className="user-info">
                        <span className="name">{emp.fullName}</span>
                        <span className="email">{emp.personalEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="org-cell">
                      <span className="org-name"><Building2 size={12}/> {emp.location?.organization?.commercialName || 'N/A'}</span>
                      <span className="dept-name">{emp.position?.department?.name || 'Varios'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(emp.hireDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${emp.status.toLowerCase()}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Ver Expediente"><Eye size={18}/></button>
                      <Link href={`/employees/${emp.id}/edit`} className="icon-btn" title="Editar"><Edit2 size={18}/></Link>
                      <button className="icon-btn delete" title="Eliminar" onClick={() => handleDelete(emp.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .subtitle { color: var(--muted-foreground); }
        .flex { display: flex; }
        .gap-3 { gap: 1rem; }

        .table-actions {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }

        .search-bar {
          position: relative;
          width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
        }

        .search-bar input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: var(--secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-bar input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px hsla(221, 100%, 31%, 0.1);
        }

        .table-container { overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
          background: rgba(0,0,0,0.02);
        }

        .table-row { border-bottom: 1px solid var(--border); transition: background 0.2s ease; }
        .table-row:hover { background: rgba(0,0,0,0.01); }

        .table-row td { padding: 1.25rem 1.5rem; }

        .user-cell { display: flex; align-items: center; gap: 1rem; }
        .avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .user-info { display: flex; flex-direction: column; gap: 2px; }
        .name { font-weight: 700; color: var(--foreground); }
        .email { font-size: 0.75rem; color: var(--muted-foreground); }

        .org-cell { display: flex; flex-direction: column; gap: 4px; }
        .org-name { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .dept-name { font-size: 0.75rem; color: var(--muted-foreground); }

        .date-cell { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }

        .status-pill {
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-pill.active { background: #dcfce7; color: #166534; }
        .status-pill.suspended { background: #fee2e2; color: #991b1b; }

        .row-actions { display: flex; gap: 0.5rem; }
        .icon-btn.delete:hover { color: #ef4444; background: #fee2e2; }

        .text-center { text-align: center; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
      `}</style>
    </Shell>
  );
}
