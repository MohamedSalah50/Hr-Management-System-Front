// lib/types/api.types.ts

// ============= Enums =============
export enum RoleEnum {
  SUPER_ADMIN = "super-Admin",
  ADMIN = "admin",
  USER = "user",
}

export enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
}

export enum AttendanceEnum {
  PRESENT = "present",
  ABSENT = "absent",
  HOLIDAY = "holiday",
  SICK_LEAVE = "sick_leave",
}

export enum SettingsEnum {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}

// ============= Base Interfaces =============
export interface IResponse<T = unknown> {
  message?: string;
  status?: number;
  data?: T;
}

export interface IPaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  doc_count?: number;
  pages?: number;
  current_page?: number;
  limit?: number;
}

// ============= Auth Types =============
export interface ILoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface ISignupData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ILoginResponse {
  credentials: {
    access_token: string;
    refresh_token: string;
  };
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

// ============= User Types =============
export interface IRole {
  _id: string;
  name: string;
  description?: string;
  permissions?: string[] | IPermission[];
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  userGroupId: string | IUserGroup; // ✅ المجموعة (يمكن string أو object)
  isActive: boolean;
  id: string;
  createdAt?: string;
  updatedAt?: string;
  // Optional legacy fields
  role?: RoleEnum;
}

export interface ICreateUser {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  userGroupId: string; // ✅ المجموعة مطلوبة
}

export interface IUpdateUser {
  fullName?: string;
  userName?: string;
  email?: string;
  password?: string;
  userGroupId?: string; // ✅ إضافة المجموعة للتحديث
  isActive?: boolean;
}

// ============= Permission Types =============
export interface IPermission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreatePermission {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface IUpdatePermission {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export interface ICreateRole {
  name: string;
  description?: string;
  permissions: string[];
}

export interface IUpdateRole {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ============= Department Types =============
export interface IDepartment {
  _id: string;
  name: string;
  description?: string;
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateDepartment {
  name: string;
  description?: string;
}

export interface IUpdateDepartment {
  name?: string;
  description?: string;
}

// ============= Employee Types =============
export interface IEmployee {
  _id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: GenderEnum;
  nationality: string;
  contractDate: string;
  baseSalary: number;
  checkInTime: string;
  checkOutTime: string;
  departmentId: string;
  isActive: boolean;
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateEmployee {
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: GenderEnum;
  nationality: string;
  contractDate: string;
  baseSalary: number;
  checkInTime: string;
  checkOutTime: string;
  departmentId: string;
}

export interface IUpdateEmployee {
  fullName?: string;
  nationalId?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: GenderEnum;
  nationality?: string;
  contractDate?: string;
  baseSalary?: number;
  checkInTime?: string;
  checkOutTime?: string;
  departmentId?: string;
  isActive?: boolean;
}

// ============= Attendance Types =============
export interface IAttendance {
  _id: string;
  employeeId: string | IEmployee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  overtimeHours: number;
  lateHours: number;
  status: AttendanceEnum;
  notes?: string;
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateAttendance {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceEnum;
  notes?: string;
}

export interface IUpdateAttendance {
  employeeId?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceEnum;
  notes?: string;
}

export interface ISearchAttendance {
  employeeId?: string;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeName?: string;
  page?: number;
  limit?: number;
}

export interface IAttendanceStatistics {
  totalDays: number;
  presentDays: number;      // حاضر
  absentDays: number;       // غائب (سيُخصم)
  holidays: number;         // إجازات رسمية (لن يُخصم)
  sickLeave: number;        // إجازات مرضية (لن يُخصم)
  totalLateHours: number;
  totalOvertimeHours: number;
}

// ============= Official Holiday Types =============
export interface IOfficialHoliday {
  _id: string;
  name: string;
  date: string;
  year: number;
  isRecurring: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateOfficialHoliday {
  name: string;
  date: string;
  year: number;
  isRecurring?: boolean;
}

export interface IUpdateOfficialHoliday {
  name?: string;
  date?: string;
  year?: number;
  isRecurring?: boolean;
}

// ============= Salary Report Types =============
export interface ISalaryReport {
  _id: string;
  employeeId: {
    _id: string;
    fullName: string;
    nationalId: string;
    departmentId?: {
      _id: string;
      name: string;
    };
  };
  month: number;
  year: number;
  baseSalary: number;
  daysPresent: number;
  daysAbsent: number;
  holidays: number;
  sickLeave: number;
  overtimeHours: number;
  lateHours: number;
  overtimeAmount: number;
  deductionAmount: number;
  netSalary: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGenerateReport {
  employeeId: string;
  month: number;
  year: number;
}

export interface ISearchReport {
  employeeId?: string;
  month?: number;
  year?: number;
}

export interface ISalarySummary {
  month: number;
  year: number;
  totalEmployees: number;
  totalBaseSalary: number;
  totalOvertimeAmount: number;
  totalDeductionAmount: number;
  totalNetSalary: number;
  totalOvertimeHours: number;
  totalLateHours: number;
  totalDaysPresent: number;
  totalDaysAbsent: number;
}

export interface IReportForPrint {
  employeeName: string;
  nationalId: string;
  department: string;
  month: number;
  year: number;
  baseSalary: number;
  daysPresent: number;
  daysAbsent: number;
  overtimeHours: number;
  lateHours: number;
  overtimeAmount: number;
  deductionAmount: number;
  netSalary: number;
  generatedDate: string;
}

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat("ar-EG", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " جنيه"
  );
};

export const getMonthName = (month: number): string => {
  return MONTHS_AR[month - 1] || "";
};

// ============= Settings Types =============
export interface ISetting {
  _id: string;
  key: string;
  value: unknown;
  dataType: SettingsEnum;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateSetting {
  key: string;
  value: unknown;
  dataType: SettingsEnum;
  description?: string;
}

export interface IOvertimeDeductionSettings {
 overtimeHoursMultiplier: number; 
  deductionHoursMultiplier: number; 
  workingHoursPerDay: number;
}

export interface IWeekendSettings {
  weekendDays: string[];
}

// ============= User Group Types =============
export interface IUserGroup {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  userIds: string[];
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateUserGroup {
  name: string;
  description?: string;
  permissions: string[];
  userIds?: string[];
}

export interface IUpdateUserGroup {
  name?: string;
  description?: string;
  permissions?: string[];
  userIds?: string[];
}

// For validation rules in the UI
export interface IUserGroupValidationRule {
  id: number;
  type: "System" | "Custom";
  rule: string;
}

export interface IGeneralSettings
  extends IOvertimeDeductionSettings, IWeekendSettings { }
