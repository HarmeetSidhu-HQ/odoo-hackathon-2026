import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Employee, Role } from '../types';
import { initialEmployees } from '../data/mockEmployees';
import { computeSalaryStructure } from '../utils/salaryCalculator';
import { generateLoginId } from '../utils/idGenerator';

interface EmployeeFilter {
  searchQuery: string;
  department: string;
  status: string;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  filter: EmployeeFilter;
  isProfileModalOpen: boolean;
  activeProfileTab: 'resume' | 'private' | 'salary' | 'security';
  
  // Actions
  setSelectedEmployee: (employee: Employee | null) => void;
  openProfileModal: (employee: Employee, tab?: 'resume' | 'private' | 'salary' | 'security') => void;
  closeProfileModal: () => void;
  setActiveProfileTab: (tab: 'resume' | 'private' | 'salary' | 'security') => void;
  setFilter: (updates: Partial<EmployeeFilter>) => void;
  resetFilter: () => void;
  
  // CRUD
  updateEmployee: (id: string, updates: Partial<Employee>, userRole: Role) => { success: boolean; error?: string };
  updateEmployeeSalary: (id: string, wage: number, wageType: 'monthly' | 'yearly') => boolean;
  addEmployee: (employeeData: Omit<Employee, 'id' | 'loginId' | 'salaryStructure' | 'leaveBalance'> & { monthlyWage?: number }) => Employee;
  deleteEmployee: (id: string) => void;
  resetToDefaultEmployees: () => void;
}

const initialFilter: EmployeeFilter = {
  searchQuery: '',
  department: 'all',
  status: 'all',
};

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: initialEmployees,
      selectedEmployee: null,
      filter: initialFilter,
      isProfileModalOpen: false,
      activeProfileTab: 'resume',

      setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

      openProfileModal: (employee, tab = 'resume') => {
        set({
          selectedEmployee: employee,
          activeProfileTab: tab,
          isProfileModalOpen: true,
        });
      },

      closeProfileModal: () => {
        set({
          selectedEmployee: null,
          isProfileModalOpen: false,
        });
      },

      setActiveProfileTab: (tab) => set({ activeProfileTab: tab }),

      setFilter: (updates) => {
        set((state) => ({
          filter: { ...state.filter, ...updates },
        }));
      },

      resetFilter: () => set({ filter: initialFilter }),

      updateEmployee: (id, updates, userRole) => {
        const { employees, selectedEmployee } = get();
        const empIndex = employees.findIndex((e) => e.id === id);
        if (empIndex === -1) return { success: false, error: 'Employee not found' };

        const currentEmp = employees[empIndex];

        // RBAC Field Validation: Employees can only edit Phone, Residing Address, and Avatar
        if (userRole === 'employee') {
          const allowedKeys: (keyof Employee)[] = ['phone', 'avatar', 'privateInfo'];
          const requestedKeys = Object.keys(updates) as (keyof Employee)[];
          
          const hasUnauthorizedKey = requestedKeys.some((k) => !allowedKeys.includes(k));
          if (hasUnauthorizedKey) {
            return {
              success: false,
              error: 'RBAC Restriction: Employees may only edit Phone, Residing Address, and Avatar.',
            };
          }

          // If privateInfo is being updated, only allow residingAddress
          if (updates.privateInfo) {
            const privateUpdates = updates.privateInfo;
            const updatedPrivate = {
              ...currentEmp.privateInfo,
              residingAddress: privateUpdates.residingAddress ?? currentEmp.privateInfo.residingAddress,
            };
            updates = { ...updates, privateInfo: updatedPrivate };
          }
        }

        const updatedEmp: Employee = {
          ...currentEmp,
          ...updates,
          privateInfo: updates.privateInfo
            ? { ...currentEmp.privateInfo, ...updates.privateInfo }
            : currentEmp.privateInfo,
          resume: updates.resume
            ? { ...currentEmp.resume, ...updates.resume }
            : currentEmp.resume,
          security: updates.security
            ? { ...currentEmp.security, ...updates.security }
            : currentEmp.security,
        };

        const updatedList = [...employees];
        updatedList[empIndex] = updatedEmp;

        set({
          employees: updatedList,
          selectedEmployee: selectedEmployee?.id === id ? updatedEmp : selectedEmployee,
        });

        return { success: true };
      },

      updateEmployeeSalary: (id, wage, wageType = 'monthly') => {
        const { employees, selectedEmployee } = get();
        const empIndex = employees.findIndex((e) => e.id === id);
        if (empIndex === -1) return false;

        const newSalaryStructure = computeSalaryStructure(wage, wageType);
        const updatedEmp: Employee = {
          ...employees[empIndex],
          salaryStructure: newSalaryStructure,
        };

        const updatedList = [...employees];
        updatedList[empIndex] = updatedEmp;

        set({
          employees: updatedList,
          selectedEmployee: selectedEmployee?.id === id ? updatedEmp : selectedEmployee,
        });

        return true;
      },

      addEmployee: (empData) => {
        const { employees } = get();
        const currentYear = new Date().getFullYear();
        const serial = employees.length + 1;
        const loginId = generateLoginId(empData.companyName, empData.name, currentYear, serial);
        const id = `emp-${Date.now()}`;
        const salaryStructure = computeSalaryStructure(empData.monthlyWage || 75000, 'monthly');

        const newEmployee: Employee = {
          id,
          loginId,
          name: empData.name,
          email: empData.email,
          phone: empData.phone,
          avatar: empData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
          companyName: empData.companyName,
          companyLogo: empData.companyLogo,
          department: empData.department,
          jobTitle: empData.jobTitle,
          manager: empData.manager || 'Sarah Jenkins',
          location: empData.location || 'HQ - San Francisco',
          status: empData.status || 'present',
          role: empData.role || 'employee',
          resume: empData.resume || {
            jobDescription: 'New team member joining Dayflow organization.',
            biography: 'Experienced professional with passion for innovation.',
            skills: ['Collaboration', 'Problem Solving'],
            certifications: [],
            experienceYears: 2,
          },
          privateInfo: empData.privateInfo || {
            dob: '1996-01-01',
            residingAddress: '100 Main St, City, Country',
            nationality: 'Citizen',
            gender: 'Other',
            joiningDate: new Date().toISOString().split('T')[0],
            bankDetails: {
              accountNumber: '100020003000',
              ifscCode: 'HDFC0001000',
              panNumber: 'ABCDE1234F',
              uanNumber: '100100200300',
              bankName: 'Enterprise Bank',
            },
          },
          salaryStructure,
          security: {
            lastPasswordChange: new Date().toISOString().split('T')[0],
            twoFactorEnabled: true,
            activeSessionsCount: 1,
          },
          leaveBalance: {
            paid: 24,
            sick: 7,
            casual: 5,
            usedPaid: 0,
            usedSick: 0,
            usedCasual: 0,
          },
        };

        set({ employees: [newEmployee, ...employees] });
        return newEmployee;
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
          selectedEmployee: state.selectedEmployee?.id === id ? null : state.selectedEmployee,
        }));
      },

      resetToDefaultEmployees: () => {
        set({ employees: initialEmployees, selectedEmployee: null });
      },
    }),
    {
      name: 'dayflow-employees-storage',
    }
  )
);
