import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useTimeOffStore } from '../../store/timeOffStore';
import { formatCurrency, calculateDynamicSalary } from '../../utils/salaryCalculator';


interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  suggestedPrompts?: string[];
}

export const Chatbot: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuthStore();
  const { employees } = useEmployeeStore();
  const { records, isCheckedIn, checkInTimestamp, activeTimerFormatted, anomalies } = useAttendanceStore();
  const { requests } = useTimeOffStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const getInitialWelcome = (): string => {
    if (isAdmin) {
      return `👋 Hello **${currentUser?.name || 'Administrator'}**! I am your **Dayflow Executive AI Assistant**.\n\n🛡️ **Admin Privileges Active**: I have full access to organization-wide payroll, ML attendance anomalies, pending leave approvals, employee records, and workforce analytics.\n\nWhat would you like to inspect today?`;
    } else {
      return `👋 Hi **${currentUser?.name || 'there'}**! I am your **Dayflow Personal HR Assistant**.\n\nI can help you with your **leave balances**, **payslip & take-home breakdown**, **clock-in status**, and **company HR policies**.\n\nHow can I help you today?`;
    }
  };

  const getRolePrompts = (): string[] => {
    if (isAdmin) {
      return [
        "📊 Today's Attendance Overview",
        "⚠️ Any Attendance Anomalies?",
        "⏳ Pending Leave Approvals",
        "💰 Total Monthly Payroll Bill",
        "👥 Department Headcount Breakdown"
      ];
    } else {
      return [
        "🌴 My Leave Balances",
        "💵 My Payslip Breakdown",
        "⏱️ Am I Checked In?",
        "📅 Status of My Leaves",
        "📜 Company Work Hours Policy"
      ];
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: getInitialWelcome(),
      timestamp: new Date(),
      suggestedPrompts: getRolePrompts()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-initialize greeting when user switches roles
  useEffect(() => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: getInitialWelcome(),
        timestamp: new Date(),
        suggestedPrompts: getRolePrompts()
      }
    ]);
  }, [currentUser?.role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  if (!isAuthenticated || !currentUser) return null;

  const handleSendPrompt = (promptText: string) => {
    processAndAddMessage(promptText);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    processAndAddMessage(userText);
  };

  const processAndAddMessage = (userText: string) => {
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = processInput(userText);
      const newBotMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: botResponse, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 450);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: getInitialWelcome(),
        timestamp: new Date(),
        suggestedPrompts: getRolePrompts()
      }
    ]);
  };

  const processInput = (text: string): string => {
    const lower = text.toLowerCase().trim();
    const me = employees.find(e => e.id === currentUser.employeeId || e.loginId === currentUser.loginId);

    // ==========================================
    // 1. ADMIN EXCLUSIVE INTENTS
    // ==========================================

    // Admin Intent: ML Attendance Anomalies & Fraud Heuristics
    if (lower.match(/\b(anomaly|anomalies|fraud|ghost|rapid bounce|time drift|unusual|flagged|deviations)\b/)) {
      if (!isAdmin) {
        return "🔒 **RBAC Restricted**: Attendance anomaly detection and audit triage logs are restricted to HR Executives and System Administrators.";
      }
      const activeAnomalies = anomalies.filter(a => !a.isResolved);
      if (activeAnomalies.length === 0) {
        return "✅ **No Active Anomalies Detected**: All employee punches today conform to standard shifts and statistical averages.";
      }
      
      let res = `⚠️ **${activeAnomalies.length} Attendance Anomalies Flagged Today**:\n\n`;
      activeAnomalies.forEach((a, idx) => {
        res += `${idx + 1}. **${a.employeeName}** — ${a.title} (*Severity: ${a.severity}* | *Score: ${a.score}/100*)\n   ↳ *${a.description}*\n`;
      });
      res += `\n💡 *You can triage and acknowledge these from the Attendance console.*`;
      return res;
    }

    // Admin Intent: Organization Payroll & Total Wage Bill
    if (lower.match(/\b(total payroll|wage bill|total salary|company payroll|total compensation|budget)\b/) || 
       (isAdmin && lower.match(/\b(payroll|salary budget|salaries)\b/) && !lower.match(/\b(my|personal|mine)\b/))) {
      if (!isAdmin) {
        return "🔒 **Confidentiality Notice**: Company-wide financial payroll metrics are restricted to Administrators under corporate governance.";
      }
      const totalMonthlyGross = employees.reduce((acc, e) => acc + e.salaryStructure.grossMonthly, 0);
      const totalAnnualCTC = employees.reduce((acc, e) => acc + e.salaryStructure.yearlyWage, 0);
      const totalNetDisbursal = employees.reduce((acc, e) => acc + e.salaryStructure.netMonthly, 0);
      const totalPF = employees.reduce((acc, e) => acc + e.salaryStructure.pfDeduction, 0);

      return `💼 **Company-Wide Payroll Summary**:\n\n` +
             `• **Active Headcount**: ${employees.length} employees\n` +
             `• **Total Monthly Gross Wage Bill**: ${formatCurrency(totalMonthlyGross)}\n` +
             `• **Total Annualized CTC**: ${formatCurrency(totalAnnualCTC)}\n` +
             `• **Net Monthly Bank Disbursals**: ${formatCurrency(totalNetDisbursal)}\n` +
             `• **Monthly Statutory EPF Pool**: ${formatCurrency(totalPF)}\n\n` +
             `*Average Monthly Salary per Employee*: ${formatCurrency(Math.round(totalMonthlyGross / (employees.length || 1)))}`;
    }

    // Admin Intent: Lookup Specific Employee Compensation
    if (lower.match(/\b(salary of|compensation of|pay of|wage of|how much does|ctc of)\b/)) {
      if (!isAdmin) {
        return "🔒 **RBAC Restriction**: Viewing salary and private compensation structures of other colleagues is prohibited under Dayflow Privacy & Governance rules.";
      }
      const matchedEmp = employees.find(e => lower.includes(e.name.toLowerCase()) || lower.includes(e.loginId.toLowerCase()));
      if (matchedEmp) {
        const s = matchedEmp.salaryStructure;
        return `👤 **Compensation Profile for ${matchedEmp.name}** (${matchedEmp.jobTitle}, ${matchedEmp.department}):\n\n` +
               `• **Monthly Wage (Gross)**: ${formatCurrency(s.grossMonthly)}\n` +
               `• **Annual CTC**: ${formatCurrency(s.yearlyWage)}\n` +
               `• **Basic Pay (50%)**: ${formatCurrency(s.basic)}\n` +
               `• **HRA (25%)**: ${formatCurrency(s.hra)}\n` +
               `• **Allowances (Fixed + Std + Bonus)**: ${formatCurrency(s.standardAllowance + s.fixedAllowance + s.performanceBonus + s.lta)}\n` +
               `• **Statutory Deductions (PF + PT)**: -${formatCurrency(s.totalDeductions)}\n` +
               `• **Net Disbursed Take-Home**: ${formatCurrency(s.netMonthly)}`;
      }
    }

    // Admin Intent: Pending Leave Approval Queue
    if (lower.match(/\b(pending leave|leave requests|approvals|who applied|leave queue|approval queue)\b/)) {
      if (!isAdmin) {
        // Employee viewing their own requests
        const myRequests = requests.filter(r => r.employeeId === currentUser.employeeId || r.employeeLoginId === currentUser.loginId);
        if (myRequests.length === 0) return "You currently have no leave requests on file.";
        let res = `📋 **Your Leave Requests Summary**:\n\n`;
        myRequests.forEach(r => {
          res += `• **${r.leaveType.toUpperCase()} Leave** (${r.startDate} to ${r.endDate}, ${r.daysCount} days): *${r.status.toUpperCase()}* ${r.reviewComment ? `— "${r.reviewComment}"` : ''}\n`;
        });
        return res;
      }

      const pending = requests.filter(r => r.status === 'pending');
      if (pending.length === 0) {
        return "🎉 **All Clear**: There are currently no pending leave requests awaiting approval!";
      }

      let res = `⏳ **${pending.length} Pending Leave Request(s) Awaiting Review**:\n\n`;
      pending.forEach((r, i) => {
        res += `${i + 1}. **${r.employeeName}** (${r.employeeLoginId})\n` +
               `   • Type: ${r.leaveType.toUpperCase()} | Duration: ${r.daysCount} day(s) (${r.startDate} to ${r.endDate})\n` +
               `   • Reason: "${r.reason}"\n\n`;
      });
      res += `👉 *Head to the **Time Off** tab to approve or decline with collision analysis.*`;
      return res;
    }

    // Admin Intent: Department Headcount & Directory Breakdown
    if (lower.match(/\b(department|departments|headcount|engineering|design|sales|marketing|hr team)\b/)) {
      const deptMap: Record<string, number> = {};
      employees.forEach(e => {
        deptMap[e.department] = (deptMap[e.department] || 0) + 1;
      });

      let res = `👥 **Workforce Headcount by Department** (Total: ${employees.length}):\n\n`;
      Object.entries(deptMap).forEach(([dept, count]) => {
        res += `• **${dept}**: ${count} employee(s)\n`;
      });

      if (!isAdmin) {
        res += `\n*You are currently assigned to the **${me?.department || 'General'}** department.*`;
      }
      return res;
    }

    // Admin Intent: Employee Search / Profile Lookup
    const searchedEmp = employees.find(e => 
      e.name.toLowerCase() !== currentUser.name.toLowerCase() && 
      (lower.includes(e.name.toLowerCase()) || lower.includes(e.loginId.toLowerCase()))
    );
    if (searchedEmp && lower.match(/\b(who is|tell me about|info on|profile of|lookup|find)\b/)) {
      if (!isAdmin) {
        return `👤 **${searchedEmp.name}** is a **${searchedEmp.jobTitle}** in the **${searchedEmp.department}** department (Manager: ${searchedEmp.manager}).\n\n🔒 *Private financial and contact details are restricted to Administrators.*`;
      }
      return `👤 **Employee Profile: ${searchedEmp.name}**\n\n` +
             `• **Login ID**: ${searchedEmp.loginId}\n` +
             `• **Job Title**: ${searchedEmp.jobTitle} (${searchedEmp.department})\n` +
             `• **Reporting Line**: Reports to ${searchedEmp.manager}\n` +
             `• **Email**: ${searchedEmp.email} | **Phone**: ${searchedEmp.phone}\n` +
             `• **Location**: ${searchedEmp.location}\n` +
             `• **Joining Date**: ${searchedEmp.privateInfo.joiningDate}\n` +
             `• **Current Status**: ${searchedEmp.status.toUpperCase()}\n` +
             `• **Monthly Wage**: ${formatCurrency(searchedEmp.salaryStructure.monthlyWage)}`;
    }

    // ==========================================
    // 2. ATTENDANCE & LIVE ROSTER (Both Roles)
    // ==========================================
    if (lower.match(/\b(attendance overview|team attendance|who is present|who is absent|who is on leave|team status|roster)\b/)) {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = records.filter(r => r.date === today);
      const presentEmps = todayRecords.filter(r => r.status === 'present');
      const absentEmps = todayRecords.filter(r => r.status === 'absent');
      const leaveEmps = todayRecords.filter(r => r.status === 'on_leave');

      if (isAdmin) {
        return `📊 **Organization Attendance Summary for Today (${today})**:\n\n` +
               `• **Total Workforce**: ${employees.length} employees\n` +
               `• **Present**: ${presentEmps.length} (${Math.round((presentEmps.length / employees.length) * 100)}% attendance rate)\n` +
               `• **Absent**: ${absentEmps.length}\n` +
               `• **On Approved Leave**: ${leaveEmps.length}\n\n` +
               (presentEmps.length > 0 ? `🟢 *Currently In Shift*: ${presentEmps.map(p => p.employeeName).join(', ')}` : '');
      } else {
        return `📊 **Today's Team Presence Status**:\n\n` +
               `• **Total Present Colleagues**: ${presentEmps.length}\n` +
               `• **Colleagues On Leave**: ${leaveEmps.length}\n` +
               `• **Your Status**: ${isCheckedIn ? `🟢 Checked In (${activeTimerFormatted} active)` : '⚪ Not Checked In'}`;
      }
    }

    // ==========================================
    // 3. PERSONAL EMPLOYEE INTENTS (Leaves, Payslip, Check-In)
    // ==========================================

    // Personal Leave Balances
    if (lower.match(/\b(my leave|my leaves|leave balance|remaining leaves|paid leave|sick leave|casual leave|how many leaves|time off balance)\b/)) {
      if (!me) return "Could not find your employee profile.";
      const { paid, sick, casual, usedPaid, usedSick, usedCasual } = me.leaveBalance;
      const remPaid = paid - usedPaid;
      const remSick = sick - usedSick;
      const remCasual = casual - usedCasual;
      const totalAvailable = remPaid + remSick + remCasual;

      return `🌴 **Your Available Leave Balances (${me.name})**:\n\n` +
             `• **Paid Annual Leave**: **${remPaid}** days left (Used: ${usedPaid}/${paid})\n` +
             `• **Sick Leave**: **${remSick}** days left (Used: ${usedSick}/${sick})\n` +
             `• **Casual Leave**: **${remCasual}** days left (Used: ${usedCasual}/${casual})\n\n` +
             `✨ **Total Available**: **${totalAvailable} days**.\n\n` +
             `👉 *You can apply for leave in real-time from the **Time Off** tab with automatic team collision detection.*`;
    }

    // Personal Payslip & Salary Breakdown
    if (lower.match(/\b(my payslip|my salary|my pay|my take home|my compensation|net pay|breakdown|salary structure)\b/)) {
      if (!me) return "Could not find your employee profile.";
      
      const myUnpaidRequests = requests.filter(r => 
        (r.employeeId === me.id || r.employeeLoginId === me.loginId) && r.leaveType === 'unpaid'
      );
      const dynamicSalary = calculateDynamicSalary(me.salaryStructure, myUnpaidRequests, 0);

      return `💵 **Your Monthly Salary Breakdown (${me.name})**:\n\n` +
             `• **Base Monthly Gross**: ${formatCurrency(dynamicSalary.baseGross)}\n` +
             `  - Basic Pay (50%): ${formatCurrency(dynamicSalary.monthlyBasic)}\n` +
             `  - HRA (25%): ${formatCurrency(dynamicSalary.monthlyHRA)}\n` +
             `  - Allowances (Special/Bonus/LTA): ${formatCurrency(dynamicSalary.monthlySpecialAllowance)}\n\n` +
             (dynamicSalary.lopDeductionTotal > 0 ? `• **(-) Unpaid LOP Deductions (${dynamicSalary.unpaidLeaveDays} days)**: -${formatCurrency(dynamicSalary.lopDeductionTotal)}\n` : '') +
             `• **(-) Statutory Deductions**: -${formatCurrency(dynamicSalary.totalDeductions)}\n` +
             `  - EPF (Employee 12%): ${formatCurrency(dynamicSalary.epfDeduction)}\n` +
             `  - Professional Tax (PT): ${formatCurrency(dynamicSalary.professionalTax)}\n\n` +
             `💰 **Final Net Disbursed Take-Home**: **${formatCurrency(dynamicSalary.netPayable)}**`;
    }

    // Personal Check-In & Clock-In Status
    if (lower.match(/\b(am i checked in|my attendance|clock in|clocked in|my status|active shift|timer|check in)\b/)) {
      if (isCheckedIn) {
        return `⏱️ **You are currently CHECKED IN!**\n\n` +
               `• **Session Started**: ${checkInTimestamp ? new Date(checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier today'}\n` +
               `• **Active Shift Timer**: **${activeTimerFormatted || 'Active'}**\n` +
               `• **Clearance Status**: Normal Shift (Standard 8.0 hrs requirement)`;
      } else {
        return `⚪ **You are currently CHECKED OUT**.\n\n` +
               `Click the **"CHECK IN TO SHIFT"** button in the top navigation or Attendance page to begin logging your hours for today.`;
      }
    }

    // ==========================================
    // 4. GENERAL HR POLICIES & WORKPLACE RULES
    // ==========================================
    if (lower.match(/\b(policy|policies|working hours|shift timing|holidays|weekend|overtime rule|rules)\b/)) {
      return `📜 **Dayflow Organization Workplace Policies**:\n\n` +
             `• **Standard Hours**: 9:00 AM – 6:00 PM (Monday through Friday, 8.0 working hours + 1 hr break).\n` +
             `• **Weekends**: Saturdays & Sundays are non-working rest days.\n` +
             `• **Overtime Policy**: Any hours logged over 8.0 hrs/day are calculated as Extra Hours and tracked for compensatory clearance.\n` +
             `• **Loss of Pay (LOP)**: Unpaid leaves are prorated against total working days in the calendar month.\n` +
             `• **Leave Notice**: Applied time-off requests are validated against department capacity to ensure ≥50% team coverage.`;
    }

    // ==========================================
    // 5. GREETING / HELP & CAPABILITY INTENTS
    // ==========================================
    if (lower.match(/\b(hi|hello|hey|help|what can you do|who are you|features|commands)\b/)) {
      let cap = `🤖 **Dayflow AI Assistant Capabilities** (${isAdmin ? '👑 Administrator Mode' : '👤 Employee Mode'}):\n\n`;
      
      if (isAdmin) {
        cap += `**Executive & Governance Tools**:\n` +
               `• *Organization Payroll*: "What is the total monthly payroll bill?"\n` +
               `• *Employee Salary Lookup*: "What is Priya Sharma's compensation?"\n` +
               `• *ML Anomaly Detection*: "Show all attendance anomalies today"\n` +
               `• *Leave Approvals*: "Show all pending leave requests"\n` +
               `• *Live Attendance*: "Give me today's attendance overview"\n` +
               `• *Headcount*: "Department headcount breakdown"`;
      } else {
        cap += `**Personal HR Self-Service**:\n` +
               `• *Leave Balances*: "How many sick and paid leaves do I have left?"\n` +
               `• *Payslip & Net Pay*: "Show my payslip and take-home breakdown"\n` +
               `• *Check-in Status*: "Am I checked in right now?"\n` +
               `• *Leave Status*: "Status of my pending leaves"\n` +
               `• *Policies*: "What are the company working hours and overtime rules?"`;
      }
      return cap;
    }

    // Default Fallback with intelligent context
    return `🤔 I didn't quite catch that. As your **Dayflow AI Assistant** (${isAdmin ? 'Admin mode' : 'Employee mode'}), you can ask me about:\n\n` +
           (isAdmin 
             ? `• **Payroll Analytics** ("Total monthly wage bill" or "Salary of John Doe")\n• **Attendance Anomalies** ("Show today's anomalies")\n• **Leave Approvals** ("Pending leave requests")\n• **Roster Overview** ("Who is present today?")`
             : `• **Leave Balances** ("My remaining leaves")\n• **Payslip Breakdown** ("Calculate my take-home pay")\n• **Clock-in Status** ("Am I checked in?")\n• **Company Policies** ("What is the overtime policy?")`);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 hover:bg-brand-500 hover:scale-105 transition-all z-40 focus:outline-none cursor-pointer flex items-center justify-center ${isOpen ? 'scale-0' : 'scale-100'}`}
        title="Open AI HR Assistant"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-canvas animate-pulse" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-[410px] bg-surface border border-surface-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-4 py-3 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Dayflow AI</h3>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  isAdmin 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                }`}>
                  {isAdmin ? 'ADMIN CONSOLE' : 'EMPLOYEE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live HR & Payroll Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Reset Chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto min-h-[320px] max-h-[420px] bg-canvas space-y-4 text-xs font-sans">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 mt-1">
                  {msg.sender === 'bot' ? (
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                      <Sparkles className="w-3 h-3 text-brand-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                      <User className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className={`px-3.5 py-2.5 rounded-xl whitespace-pre-wrap leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-surface-elevated border border-surface-border text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>

              {/* Render Suggested Prompts if attached */}
              {msg.suggestedPrompts && (
                <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
                  {msg.suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(p)}
                      className="px-2.5 py-1 rounded-full bg-surface-elevated hover:bg-brand-600/20 text-[11px] text-brand-300 border border-brand-500/20 hover:border-brand-500/40 transition-all cursor-pointer text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 pl-8">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[10px] font-mono text-slate-500">Querying live database...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-surface-elevated border-t border-surface-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAdmin ? "Ask about anomalies, payroll, leaves, employees..." : "Ask about leave balances, payslip, check-in..."}
            className="flex-1 bg-canvas border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="p-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};

