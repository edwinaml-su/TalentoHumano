"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Unit {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  countryId: string;
  countryName: string;
  currencySymbol: string;
  currencyCode: string;
  roleName: string;
  isCorporate: boolean;
}

interface OrganizationContextType {
  availableUnits: Unit[];
  selectedUnitIds: string[];
  selectedOrgIds: string[];
  selectedCountryIds: string[];
  isMultiSelectMode: boolean;
  toggleUnit: (unitId: string) => void;
  toggleOrganization: (orgId: string) => void;
  toggleCountry: (countryId: string) => void;
  selectSingleUnit: (unitId: string) => void;
  activeCurrency: { symbol: string; code: string };
  isLoading: boolean;
  isGlobalAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  // Persistence Key
  const STORAGE_KEY = 'hr_selection_scope';

  useEffect(() => {
    fetchUserAccess();
  }, []);

  const fetchUserAccess = async () => {
    try {
      const res = await fetch("/api/auth/access");
      if (res.ok) {
        const data = await res.json();
        const units: Unit[] = data.units;
        setAvailableUnits(units);
        
        const globalAccess = units.some((u: any) => u.roleName === 'Administrador Global' || u.isCorporate);
        setIsGlobalAdmin(globalAccess);
        
        // Load persistency
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const { units: sUnits, orgs: sOrgs, countries: sCountries } = JSON.parse(saved);
            // Verify IDs still exist in available units (Scope Hardening)
            const validUnits = sUnits.filter((id: string) => units.some(u => u.id === id));
            if (validUnits.length > 0) {
              setSelectedUnitIds(validUnits);
              setSelectedOrgIds(sOrgs.filter((id: string) => units.some(u => u.organizationId === id)));
              setSelectedCountryIds(sCountries.filter((id: string) => units.some(u => u.countryId === id)));
              setIsLoading(false);
              return;
            }
          } catch (e) { console.error("Persistence error", e); }
        }

        // Default Fallback
        const defaultUnit = units.find((u: any) => u.isDefault) || units[0];
        if (defaultUnit) {
          setSelectedUnitIds([defaultUnit.id]);
          setSelectedOrgIds([defaultUnit.organizationId]);
          setSelectedCountryIds([defaultUnit.countryId]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user access", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Persistence
  useEffect(() => {
    if (!isLoading && availableUnits.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        units: selectedUnitIds,
        orgs: selectedOrgIds,
        countries: selectedCountryIds
      }));
    }
  }, [selectedUnitIds, selectedOrgIds, selectedCountryIds, isLoading]);

  const isMultiSelectMode = isGlobalAdmin || availableUnits.some(
    u => selectedUnitIds.includes(u.id) && u.isCorporate
  );

  const toggleCountry = (countryId: string) => {
    const unitsInCountry = availableUnits.filter(u => u.countryId === countryId);
    const orgsInCountry = Array.from(new Set(unitsInCountry.map(u => u.organizationId)));
    const unitIdsInCountry = unitsInCountry.map(u => u.id);

    setSelectedCountryIds(prev => prev.includes(countryId) ? prev.filter(id => id !== countryId) : [...prev, countryId]);
    
    // Toggle all children if needed (Cascading AC 3)
    const isAdding = !selectedCountryIds.includes(countryId);
    if (isAdding) {
      setSelectedOrgIds(prev => Array.from(new Set([...prev, ...orgsInCountry])));
      setSelectedUnitIds(prev => Array.from(new Set([...prev, ...unitIdsInCountry])));
    } else {
      setSelectedOrgIds(prev => prev.filter(id => !orgsInCountry.includes(id)));
      setSelectedUnitIds(prev => prev.filter(id => !unitIdsInCountry.includes(id)));
    }
  };

  const toggleOrganization = (orgId: string) => {
    const unitsInOrg = availableUnits.filter(u => u.organizationId === orgId);
    const unitIdsInOrg = unitsInOrg.map(u => u.id);

    setSelectedOrgIds(prev => prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]);

    const isAdding = !selectedOrgIds.includes(orgId);
    if (isAdding) {
      setSelectedUnitIds(prev => Array.from(new Set([...prev, ...unitIdsInOrg])));
    } else {
      setSelectedUnitIds(prev => prev.filter(id => !unitIdsInOrg.includes(id)));
    }
  };

  const toggleUnit = (unitId: string) => {
    if (!isMultiSelectMode) {
      setSelectedUnitIds([unitId]);
      return;
    }

    setSelectedUnitIds(prev => {
      if (prev.includes(unitId)) {
        if (prev.length === 1) return prev; 
        return prev.filter(id => id !== unitId);
      }
      return [...prev, unitId];
    });
  };

  const selectSingleUnit = (unitId: string) => {
    const unit = availableUnits.find(u => u.id === unitId);
    if (unit) {
      setSelectedUnitIds([unitId]);
      setSelectedOrgIds([unit.organizationId]);
      setSelectedCountryIds([unit.countryId]);
    }
  };

  const activeUnit = availableUnits.find(u => u.id === selectedUnitIds[0]);
  const activeCurrency = {
    symbol: activeUnit?.currencySymbol || "$",
    code: activeUnit?.currencyCode || "USD"
  };

  return (
    <OrganizationContext.Provider value={{
      availableUnits,
      selectedUnitIds,
      selectedOrgIds,
      selectedCountryIds,
      isMultiSelectMode,
      toggleUnit,
      toggleOrganization,
      toggleCountry,
      selectSingleUnit,
      activeCurrency,
      isLoading,
      isGlobalAdmin
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
