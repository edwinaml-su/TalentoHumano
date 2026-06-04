"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { logout } from "@/lib/auth-utils";
import { LogOut } from "lucide-react";

const navItems = [
  { name: "Resumen", href: "/portal/dashboard", icon: "🏠" },
  { name: "Puestos", href: "/positions", icon: "💼" },
  { name: "Organigrama", href: "/positions/hierarchy", icon: "🌳" },
  { name: "Nómina", href: "/reports/payroll", icon: "💵" },
  { name: "Catálogos", href: "/catalogs", icon: "📚" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-indigo-200 shadow-lg">
            A
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">
            Talento Humano
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActive 
                    ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                )}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
          🔔
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">Admin Avante</p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
          <button 
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
            className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-gray-400"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}

