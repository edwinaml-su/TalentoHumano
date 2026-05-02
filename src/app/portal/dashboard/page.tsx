import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import Link from "next/link";

async function EmployeeProfile({ employeeId }: { employeeId: string }) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      position: { include: { department: true } },
      salaryHistory: { orderBy: { effectiveDate: 'desc' }, take: 1 }
    }
  });

  if (!employee) return <div>Empleado no encontrado</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen de Contrato</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Puesto</p>
            <p className="font-medium text-gray-900">{employee.position?.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Departamento</p>
            <p className="font-medium text-gray-900">{employee.position?.department?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Fecha Ingreso</p>
            <p className="font-medium text-gray-900">{employee.hireDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Salario Base</p>
            <p className="font-medium text-gray-900">${employee.salaryHistory[0]?.amount.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
        <h2 className="text-lg font-medium opacity-90 mb-2">Próxima Fecha de Pago</h2>
        <p className="text-3xl font-bold mb-4">30 Mar 2026</p>
        <div className="h-0.5 bg-white/20 mb-4"></div>
        <p className="text-sm opacity-80">Ciclo actual:</p>
        <p className="font-medium">16 Mar - 31 Mar</p>
      </div>
    </div>
  );
}

export default async function EmployeeDashboardPage() {
  // Simulator: for now pick the first employee
  const employee = await prisma.employee.findFirst();
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Hola, {employee?.firstName} 👋</h1>
        <p className="text-gray-500 mt-1">Bienvenido a tu portal de autoservicio.</p>
      </header>

      <Suspense fallback={<div>Cargando perfil...</div>}>
        {employee && <EmployeeProfile employeeId={employee.id} />}
      </Suspense>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/portal/pay-stubs" className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left block">
            <span className="text-2xl mb-2 block">📄</span>
            <span className="font-medium text-gray-900">Ver Recibos</span>
          </Link>
          <Link href="/portal/vacations" className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left block">
            <span className="text-2xl mb-2 block">🏖️</span>
            <span className="font-medium text-gray-900">Vacaciones</span>
          </Link>
          <button className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left">
            <span className="text-2xl mb-2 block">🏦</span>
            <span className="font-medium text-gray-900">Datos Bancarios</span>
          </button>
          <button className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left">
            <span className="text-2xl mb-2 block">🔑</span>
            <span className="font-medium text-gray-900">Seguridad</span>
          </button>
        </div>
      </section>
    </div>
  );
}
