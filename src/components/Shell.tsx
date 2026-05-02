"use client";

import { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useOrganization } from "@/contexts/OrganizationContext";

export function Shell({ children }: { children: React.ReactNode }) {
  const { availableUnits, selectedUnitIds, activeCurrency } = useOrganization();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const activeUnitNames = availableUnits
    .filter((u: any) => selectedUnitIds.includes(u.id))
    .map((u: any) => u.name);

  return (
    <div className="shell">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className={`main-content transition-all duration-300`}>
        <header className="top-navbar glass shadow-sm">
          <div className="header-left">
            <button 
              className="menu-toggle-btn"
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
            >
              <MenuIcon size={22} />
            </button>
            <div className="search-bar">
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>
          <div className="user-profile">
            <div className="org-context">
              <div className="org-badge">
                <span className="unit-text">{activeUnitNames.length > 2 
                  ? `${activeUnitNames.length} Uds` 
                  : activeUnitNames.join(" | ") || "Sin Selección"}</span>
                <span className="currency-pill">{activeCurrency.code}</span>
              </div>
            </div>
            <div className="avatar">JD</div>
          </div>
        </header>
        <div className="content-area custom-scrollbar">
          {children}
        </div>
      </main>

      <style jsx>{`
        .shell {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          margin-left: ${isCollapsed ? '90px' : '300px'};
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 45;
          display: none;
        }

        .top-navbar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          margin: 1rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          border-radius: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .menu-toggle-btn {
          background: var(--primary);
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px hsla(221, 100%, 31%, 0.2);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        
        .menu-toggle-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 15px hsla(221, 100%, 31%, 0.25);
        }

        .menu-toggle-btn:active {
          transform: translateY(0) scale(0.95);
        }

        .search-bar input {
          width: 350px;
          background: var(--secondary);
          border: 1px solid transparent;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .org-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.4rem 0.5rem 0.4rem 0.75rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .unit-text {
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .currency-pill {
          background: var(--primary);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          font-size: 0.65rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          box-shadow: 0 4px 10px hsla(221, 100%, 31%, 0.3);
        }

        .content-area {
          padding: 1rem 1.5rem 2rem 1.5rem;
          flex: 1;
          overflow-y: auto;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0 !important;
          }
          
          .menu-toggle-btn {
            display: flex;
          }

          .mobile-overlay {
            display: block;
          }

          .search-bar input {
            width: 200px;
          }

          .org-context {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .search-bar {
            display: none;
          }
          
          .top-navbar {
            padding: 0 1rem;
            margin: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
