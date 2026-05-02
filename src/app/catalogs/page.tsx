"use client";

import { Shell } from "@/components/Shell";
import { 
  Briefcase, 
  Settings, 
  ChevronRight, 
  FileText, 
  Globe, 
  Building2,
  ListRestart,
  Building,
  MapPin
} from "lucide-react";
import Link from "next/link";

const configurations = [
  {
    title: "Estructura Global",
    items: [
      { label: "Países y Monedas", icon: Globe, href: "/localization", desc: "Configuración multi-país y tipos de cambio." },
      { label: "Organizaciones y Sedes", icon: Building2, href: "/organizations", desc: "Entidades legales y centros de trabajo." },
    ]
  },
  {
    title: "Catálogos de Organización",
    items: [
      { label: "Puestos (Cargos)", icon: Briefcase, href: "/config/positions", desc: "Definición del catálogo oficial de cargos." },
      { label: "Gerencias y Unidades", icon: Building, href: "/config/gerencias", desc: "Gestión de gerencias por unidad operativa." },
      { label: "Departamentos y Áreas", icon: ListRestart, href: "/config/departments", desc: "Estructura jerárquica de la empresa." },
      { label: "Ubicaciones y Sedes", icon: MapPin, href: "/config/locations", desc: "Administración de centros de trabajo físicos." },
      { label: "Turnos y Horarios", icon: Settings, href: "/config/shifts", desc: "Gestión de jornadas y asignación por unidad." },
    ]
  },
  {
    title: "Catálogos de Nómina y RRHH",
    items: [
      { label: "Tipos de Contrato", icon: FileText, href: "/config/contract-types", desc: "Indefinido, Plazo Fijo, Obra o Servicio, etc." },
      { label: "Bancos", icon: Settings, href: "/config/banks", desc: "Catálogo de bancos con código ACH para transferencias." },
      { label: "AFP — Administradoras", icon: Settings, href: "/config/afp-types", desc: "Fondos de pensiones con tasas de aportación configurables." },
      { label: "Tabla ISR", icon: Globe, href: "/localization", desc: "Brackets del ISR por frecuencia (quincenal/mensual)." },
    ]
  },
  {
    title: "Cuentas y Finanzas",
    items: [
      { label: "Catálogo de Cuentas", icon: Settings, href: "/config/accounting", desc: "Integración contable de planillas." },
      { label: "Centros de Costo", icon: Settings, href: "/cost-centers", desc: "Distribución financiera por unidad." },
    ]
  }
];


export default function ConfigPage() {
  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <h1>Configuración y Catálogos</h1>
          <p className="subtitle">Administración centralizada de los insumos maestros del sistema.</p>
        </div>
      </div>

      <div className="config-grid animate-slide-up">
        {configurations.map((section, idx) => (
          <div key={idx} className="config-section">
            <h3 className="section-title">{section.title}</h3>
            <div className="options-grid">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={i} className="config-card card">
                    <div className="card-top">
                      <div className="icon-wrapper">
                        <Icon size={24} />
                      </div>
                      <ChevronRight size={18} className="arrow" />
                    </div>
                    <div className="card-bottom">
                      <span className="label">{item.label}</span>
                      <p className="description">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; }
        .subtitle { color: var(--muted-foreground); }

        .config-grid {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .section-title {
          font-size: 1.1rem;
          color: var(--muted-foreground);
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .config-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .config-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .icon-wrapper {
          width: 50px;
          height: 50px;
          background: hsla(221, 100%, 31%, 0.1);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow {
          color: var(--muted-foreground);
          transition: transform 0.2s ease;
        }

        .config-card:hover .arrow {
          transform: translateX(4px);
          color: var(--primary);
        }

        .label {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .description {
          font-size: 0.85rem;
          color: var(--muted-foreground);
          line-height: 1.4;
        }
      `}</style>
    </Shell>
  );
}
