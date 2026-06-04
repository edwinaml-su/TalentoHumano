
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.ContractTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BankScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AfpTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  rate: 'rate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isCorporate: 'isCorporate'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  employeeId: 'employeeId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserUnitAssignmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  locationId: 'locationId',
  roleId: 'roleId',
  isDefault: 'isDefault'
};

exports.Prisma.CostCenterScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  budget: 'budget',
  locationId: 'locationId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  taxId: 'taxId',
  legalName: 'legalName',
  commercialName: 'commercialName',
  countryId: 'countryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CountryScalarFieldEnum = {
  id: 'id',
  isoCode: 'isoCode',
  name: 'name',
  currencyId: 'currencyId'
};

exports.Prisma.CurrencyScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  symbol: 'symbol'
};

exports.Prisma.GerenciaScalarFieldEnum = {
  id: 'id',
  name: 'name',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  organizationId: 'organizationId',
  gerenciaId: 'gerenciaId'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  organizationId: 'organizationId'
};

exports.Prisma.PositionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  departmentId: 'departmentId',
  parentPositionId: 'parentPositionId',
  isActive: 'isActive'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  employeeCode: 'employeeCode',
  firstName: 'firstName',
  middleName: 'middleName',
  thirdName: 'thirdName',
  firstSurname: 'firstSurname',
  secondSurname: 'secondSurname',
  fullName: 'fullName',
  dui: 'dui',
  nit: 'nit',
  isssNumber: 'isssNumber',
  nupNumber: 'nupNumber',
  address: 'address',
  department: 'department',
  municipality: 'municipality',
  phone: 'phone',
  personalEmail: 'personalEmail',
  emergencyContact: 'emergencyContact',
  hireDate: 'hireDate',
  terminationDate: 'terminationDate',
  contractTypeId: 'contractTypeId',
  afpTypeId: 'afpTypeId',
  status: 'status',
  managerId: 'managerId',
  organizationId: 'organizationId',
  gerenciaId: 'gerenciaId',
  locationId: 'locationId',
  positionId: 'positionId',
  countryId: 'countryId',
  bankId: 'bankId',
  bankAccountType: 'bankAccountType',
  bankAccountNumber: 'bankAccountNumber',
  shiftId: 'shiftId',
  costCenterId: 'costCenterId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AcademicStudyScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  degree: 'degree',
  institution: 'institution',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CertificationScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  name: 'name',
  issuingEntity: 'issuingEntity',
  issueDate: 'issueDate',
  expiryDate: 'expiryDate',
  credentialId: 'credentialId',
  credentialUrl: 'credentialUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeDocumentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  category: 'category',
  title: 'title',
  fileUrl: 'fileUrl',
  uploadDate: 'uploadDate'
};

exports.Prisma.SalaryHistoryScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  amount: 'amount',
  currencyId: 'currencyId',
  effectiveDate: 'effectiveDate',
  createdAt: 'createdAt'
};

exports.Prisma.VacationScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  startDate: 'startDate',
  endDate: 'endDate',
  daysTaken: 'daysTaken',
  status: 'status'
};

exports.Prisma.LoanScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  totalAmount: 'totalAmount',
  balance: 'balance',
  installments: 'installments',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.FinancialObligationScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  type: 'type',
  description: 'description',
  totalAmount: 'totalAmount',
  quota: 'quota',
  balance: 'balance',
  startDate: 'startDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollRunScalarFieldEnum = {
  id: 'id',
  locationId: 'locationId',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  payrollType: 'payrollType',
  createdAt: 'createdAt'
};

exports.Prisma.PayrollIncidentScalarFieldEnum = {
  id: 'id',
  payrollRunId: 'payrollRunId',
  employeeId: 'employeeId',
  type: 'type',
  amount: 'amount',
  quantity: 'quantity',
  date: 'date',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollRunEmployeeScalarFieldEnum = {
  id: 'id',
  payrollRunId: 'payrollRunId',
  employeeId: 'employeeId',
  correlativo: 'correlativo',
  afpStatus: 'afpStatus',
  isssStatus: 'isssStatus',
  baseSalary: 'baseSalary',
  planHours: 'planHours',
  workedHours: 'workedHours',
  workedDays: 'workedDays',
  earnedSalary: 'earnedSalary',
  secondPositions: 'secondPositions',
  extraPlanHoursCount: 'extraPlanHoursCount',
  extraPlanHoursAmount: 'extraPlanHoursAmount',
  nightShiftHoursCount: 'nightShiftHoursCount',
  nightShiftAmount: 'nightShiftAmount',
  overtimeDayHoursCount: 'overtimeDayHoursCount',
  overtimeDayAmount: 'overtimeDayAmount',
  overtimeNightHoursCount: 'overtimeNightHoursCount',
  overtimeNightAmount: 'overtimeNightAmount',
  restDaysWorkedCount: 'restDaysWorkedCount',
  restDaysWorkedAmount: 'restDaysWorkedAmount',
  holidayDaysCount: 'holidayDaysCount',
  holidayDaysAmount: 'holidayDaysAmount',
  nightHolidayHoursCount: 'nightHolidayHoursCount',
  nightHolidayAmount: 'nightHolidayAmount',
  extraHolidayHoursCount: 'extraHolidayHoursCount',
  extraHolidayAmount: 'extraHolidayAmount',
  totalHolidaysAmount: 'totalHolidaysAmount',
  bonuses: 'bonuses',
  commissions: 'commissions',
  stipends: 'stipends',
  vacationBonus: 'vacationBonus',
  vacationDaysTaken: 'vacationDaysTaken',
  vacationDaysAmount: 'vacationDaysAmount',
  regencies: 'regencies',
  lateArrivalsDeduction: 'lateArrivalsDeduction',
  unjustifiedAbsencesCount: 'unjustifiedAbsencesCount',
  unjustifiedAbsencesAmount: 'unjustifiedAbsencesAmount',
  isssLeaveDeductionCount: 'isssLeaveDeductionCount',
  isssLeaveDeductionAmount: 'isssLeaveDeductionAmount',
  isssLeaveFullPayCount: 'isssLeaveFullPayCount',
  isssLeaveFullPayAmount: 'isssLeaveFullPayAmount',
  unpaidLeaveDeduction: 'unpaidLeaveDeduction',
  reimbursements: 'reimbursements',
  totalBenefits: 'totalBenefits',
  isssHealthDeduction: 'isssHealthDeduction',
  afpCrecerDeduction: 'afpCrecerDeduction',
  afpConfiaDeduction: 'afpConfiaDeduction',
  ipsfaDeduction: 'ipsfaDeduction',
  taxableIncome: 'taxableIncome',
  incomeTax: 'incomeTax',
  otherDeductions: 'otherDeductions',
  vialidadDeduction: 'vialidadDeduction',
  fsvDeduction: 'fsvDeduction',
  procuraduriaDeduction: 'procuraduriaDeduction',
  judicialSeizure: 'judicialSeizure',
  bankLoansDeduction: 'bankLoansDeduction',
  hospitalDeduction: 'hospitalDeduction',
  totalDeductions: 'totalDeductions',
  netPay: 'netPay',
  createdAt: 'createdAt'
};

exports.Prisma.ShiftScalarFieldEnum = {
  id: 'id',
  name: 'name',
  startTime: 'startTime',
  endTime: 'endTime',
  gracePeriod: 'gracePeriod',
  organizationId: 'organizationId',
  isActive: 'isActive',
  isOvernight: 'isOvernight',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  date: 'date',
  clockIn: 'clockIn',
  clockOut: 'clockOut',
  totalHours: 'totalHours',
  shiftId: 'shiftId',
  status: 'status',
  lateMinutes: 'lateMinutes',
  overtimeMinutes: 'overtimeMinutes',
  notes: 'notes',
  location: 'location',
  createdAt: 'createdAt'
};

exports.Prisma.TaxTableScalarFieldEnum = {
  id: 'id',
  name: 'name',
  countryId: 'countryId',
  frequency: 'frequency',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaxBracketScalarFieldEnum = {
  id: 'id',
  taxTableId: 'taxTableId',
  fromAmount: 'fromAmount',
  toAmount: 'toAmount',
  fixedAmount: 'fixedAmount',
  percentage: 'percentage',
  excessOf: 'excessOf',
  order: 'order'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  details: 'details',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.PerformanceGoalScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  title: 'title',
  description: 'description',
  weight: 'weight',
  targetValue: 'targetValue',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PerformanceReviewScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  evaluatorId: 'evaluatorId',
  period: 'period',
  status: 'status',
  score: 'score',
  feedback: 'feedback',
  selfEvaluation: 'selfEvaluation',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobPostingScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  salaryRange: 'salaryRange',
  status: 'status',
  locationId: 'locationId',
  departmentId: 'departmentId',
  positionId: 'positionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  jobPostingId: 'jobPostingId',
  candidateName: 'candidateName',
  candidateEmail: 'candidateEmail',
  candidatePhone: 'candidatePhone',
  resumeUrl: 'resumeUrl',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingCourseScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  durationHours: 'durationHours',
  isMandatory: 'isMandatory',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingEnrollmentScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  courseId: 'courseId',
  status: 'status',
  score: 'score',
  completionDate: 'completionDate',
  certificateUrl: 'certificateUrl',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurveyScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurveyResponseScalarFieldEnum = {
  id: 'id',
  surveyId: 'surveyId',
  employeeId: 'employeeId',
  score: 'score',
  comment: 'comment',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.EmployeeStatus = exports.$Enums.EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED'
};

exports.BankAccountType = exports.$Enums.BankAccountType = {
  SAVINGS: 'SAVINGS',
  CHECKING: 'CHECKING'
};

exports.StudyStatus = exports.$Enums.StudyStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
  PAUSED: 'PAUSED'
};

exports.DocumentCategory = exports.$Enums.DocumentCategory = {
  IDENTIFICATION: 'IDENTIFICATION',
  CONTRACTUAL: 'CONTRACTUAL',
  ACADEMIC: 'ACADEMIC',
  PAYROLL: 'PAYROLL',
  LEGAL: 'LEGAL'
};

exports.ObligationType = exports.$Enums.ObligationType = {
  HOSPITAL: 'HOSPITAL',
  BANK_LOAN: 'BANK_LOAN',
  JUDICIAL_SEIZURE: 'JUDICIAL_SEIZURE',
  PROCURADURIA: 'PROCURADURIA',
  FOSOFAMILIA: 'FOSOFAMILIA'
};

exports.IncidentType = exports.$Enums.IncidentType = {
  REINTEGRO: 'REINTEGRO',
  SEGUNDA_PLAZA: 'SEGUNDA_PLAZA',
  INCAPACIDAD_ISSS: 'INCAPACIDAD_ISSS',
  AUSENCIA_INJUSTIFICADA: 'AUSENCIA_INJUSTIFICADA',
  LLEGADA_TARDE: 'LLEGADA_TARDE',
  REGENCIA: 'REGENCIA',
  VACACIONES_GOCE: 'VACACIONES_GOCE',
  VACACIONES_PRIMA: 'VACACIONES_PRIMA',
  VIATICOS: 'VIATICOS',
  COMISION: 'COMISION',
  BONO: 'BONO',
  FESTIVIDAD_DIA: 'FESTIVIDAD_DIA',
  FESTIVIDAD_NOCHE: 'FESTIVIDAD_NOCHE',
  FESTIVIDAD_MONTO: 'FESTIVIDAD_MONTO',
  DIA_DESCANSO: 'DIA_DESCANSO',
  EXTRA_NOCTURNA: 'EXTRA_NOCTURNA',
  EXTRA_DIURNA: 'EXTRA_DIURNA',
  NOCTURNIDAD: 'NOCTURNIDAD',
  HORA_ADICIONAL: 'HORA_ADICIONAL'
};

exports.AttendanceStatus = exports.$Enums.AttendanceStatus = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  ABSENT: 'ABSENT',
  EXCUSED: 'EXCUSED',
  VACATION: 'VACATION',
  INCAPACITY: 'INCAPACITY',
  REST_DAY: 'REST_DAY'
};

exports.GoalStatus = exports.$Enums.GoalStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NOT_MET: 'NOT_MET'
};

exports.ReviewStatus = exports.$Enums.ReviewStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

exports.JobStatus = exports.$Enums.JobStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  DRAFT: 'DRAFT',
  ON_HOLD: 'ON_HOLD'
};

exports.ApplicationStatus = exports.$Enums.ApplicationStatus = {
  NEW: 'NEW',
  SCREENING: 'SCREENING',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED'
};

exports.EnrollmentStatus = exports.$Enums.EnrollmentStatus = {
  ENROLLED: 'ENROLLED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED'
};

exports.SurveyType = exports.$Enums.SurveyType = {
  CLIMATE: 'CLIMATE',
  ENPS: 'ENPS',
  EXIT: 'EXIT',
  QUICK_MOOD: 'QUICK_MOOD'
};

exports.Prisma.ModelName = {
  ContractType: 'ContractType',
  Bank: 'Bank',
  AfpType: 'AfpType',
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  User: 'User',
  UserUnitAssignment: 'UserUnitAssignment',
  CostCenter: 'CostCenter',
  Organization: 'Organization',
  Country: 'Country',
  Currency: 'Currency',
  Gerencia: 'Gerencia',
  Department: 'Department',
  Location: 'Location',
  Position: 'Position',
  Employee: 'Employee',
  AcademicStudy: 'AcademicStudy',
  Certification: 'Certification',
  EmployeeDocument: 'EmployeeDocument',
  SalaryHistory: 'SalaryHistory',
  Vacation: 'Vacation',
  Loan: 'Loan',
  FinancialObligation: 'FinancialObligation',
  PayrollRun: 'PayrollRun',
  PayrollIncident: 'PayrollIncident',
  PayrollRunEmployee: 'PayrollRunEmployee',
  Shift: 'Shift',
  Attendance: 'Attendance',
  TaxTable: 'TaxTable',
  TaxBracket: 'TaxBracket',
  AuditLog: 'AuditLog',
  PerformanceGoal: 'PerformanceGoal',
  PerformanceReview: 'PerformanceReview',
  JobPosting: 'JobPosting',
  JobApplication: 'JobApplication',
  TrainingCourse: 'TrainingCourse',
  TrainingEnrollment: 'TrainingEnrollment',
  Survey: 'Survey',
  SurveyResponse: 'SurveyResponse'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
