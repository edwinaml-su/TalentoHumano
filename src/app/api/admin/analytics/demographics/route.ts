import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const employees = await prisma.employee.findMany({
      where: { terminationDate: null } // Only active employees
    });

    const now = new Date();

    // Deterministic mock helper based on employee ID hash
    const getMockGender = (empId: string) => {
      const hash = empId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      if (hash % 3 === 0) return 'MALE';
      if (hash % 3 === 1) return 'FEMALE';
      return 'OTHER';
    };

    const getMockBirthYear = (empId: string) => {
      const hash = empId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return 1970 + (hash % 35); // Years between 1970 and 2005
    };

    // 1. Gender Distribution
    const genderDist = {
      MALE: employees.filter(e => getMockGender(e.id) === 'MALE').length,
      FEMALE: employees.filter(e => getMockGender(e.id) === 'FEMALE').length,
      OTHER: employees.filter(e => getMockGender(e.id) === 'OTHER').length
    };

    // 2. Age Distribution
    const ageGroups = {
      "< 25": 0,
      "25-35": 0,
      "35-45": 0,
      "45-55": 0,
      "> 55": 0
    };

    employees.forEach(e => {
      const birthYear = getMockBirthYear(e.id);
      const age = now.getFullYear() - birthYear;
      if (age < 25) ageGroups["< 25"]++;
      else if (age <= 35) ageGroups["25-35"]++;
      else if (age <= 45) ageGroups["35-45"]++;
      else if (age <= 55) ageGroups["45-55"]++;
      else ageGroups["> 55"]++;
    });

    // 3. Tenure Distribution (Antigüedad)
    const tenureGroups = {
      "< 1 año": 0,
      "1-3 años": 0,
      "3-5 años": 0,
      "> 5 años": 0
    };

    employees.forEach(e => {
      const years = (now.getTime() - new Date(e.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (years < 1) tenureGroups["< 1 año"]++;
      else if (years <= 3) tenureGroups["1-3 años"]++;
      else if (years <= 5) tenureGroups["3-5 años"]++;
      else tenureGroups["> 5 años"]++;
    });

    return NextResponse.json({
      gender: Object.entries(genderDist).map(([name, value]) => ({ name, value })),
      age: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
      tenure: Object.entries(tenureGroups).map(([name, value]) => ({ name, value }))
    });
  } catch (error) {
    console.error("DEMOGRAPHICS ANALYTICS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
