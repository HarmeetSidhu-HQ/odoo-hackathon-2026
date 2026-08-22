import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { formatCurrency } from '../../utils/salaryCalculator';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuthStore();
  const { employees } = useEmployeeStore();
  const { systray } = useAttendanceStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Hi! I am your AI HR Assistant. I can help you with your leave balances, payslips, or attendance status. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isAuthenticated || !currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText, timestamp: new Date() };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    // Process intent
    setTimeout(() => {
      const botResponse = processInput(userText);
      const newBotMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponse, timestamp: new Date() };
      setMessages(prev => [...prev, newBotMsg]);
    }, 500);
  };

  const processInput = (text: string): string => {
    const lowerText = text.toLowerCase();
    const me = employees.find(e => e.id === currentUser.employeeId || e.loginId === currentUser.loginId);
    
    if (!me) {
      return "I couldn't find your employee record in the database.";
    }

    // 1. Leave Balances
    if (lowerText.match(/\b(leave|leaves|paid|sick|casual|time off)\b/)) {
      const { paid, sick, casual, usedPaid, usedSick, usedCasual } = me.leaveBalance;
      const remPaid = paid - usedPaid;
      const remSick = sick - usedSick;
      const remCasual = casual - usedCasual;
      
      return `You have the following leave balances available:\n- Paid Leave: ${remPaid} day(s)\n- Sick Leave: ${remSick} day(s)\n- Casual Leave: ${remCasual} day(s)`;
    }

    // 2. Payslip / Salary
    if (lowerText.match(/\b(payslip|salary|pay|compensation)\b/)) {
      const s = me.salaryStructure;
      return `Here is your payslip summary for last month:\n\n- Gross Pay: ${formatCurrency(s.grossMonthly)}\n- Deductions: -${formatCurrency(s.totalDeductions)}\n- Net Take-Home: ${formatCurrency(s.netMonthly)}\n\n(This includes your base, allowances, and statutory deductions.)`;
    }

    // 3. Attendance
    if (lowerText.match(/\b(check in|checked in|attendance|status)\b/) && !lowerText.includes('team')) {
      if (systray.isCheckedIn) {
        return `Yes, you are currently checked in. Your session started at ${systray.checkInTime || 'an unknown time'} and you have been active for ${systray.activeTimer}.`;
      } else {
        return "You are not currently checked in.";
      }
    }

    // 4. Admin Team Queries
    if (currentUser.role === 'admin' && lowerText.match(/\b(team|people|everyone|present)\b/)) {
      const presentCount = employees.filter(e => e.status === 'present').length;
      const leaveCount = employees.filter(e => e.status === 'on_leave').length;
      return `Team Overview:\n- Present: ${presentCount} employee(s)\n- On Leave: ${leaveCount} employee(s)\n- Total Headcount: ${employees.length}`;
    }

    // 5. Greeting / Help
    if (lowerText.match(/\b(hi|hello|hey|help|what can you do)\b/)) {
      let cap = "I can help with:\n- Your leave balances (\"how many paid leaves do I have left?\")\n- Your payslip (\"generate my payslip\")\n- Your attendance status (\"am I checked in?\")";
      if (currentUser.role === 'admin') {
        cap += "\n- Team overview (\"how many people are present today?\")";
      }
      return cap;
    }

    // Fallback
    return "I'm a rule-based HR assistant, so I didn't quite catch that. Try asking me about your leaves, payslip, or attendance status.";
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-all z-40 focus:outline-none cursor-pointer ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-surface border border-surface-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-4 py-3 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="text-sm font-bold text-white">AI HR Assistant</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Live Systems Connected</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-canvas space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 mt-1">
                  {msg.sender === 'bot' ? (
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                      <Bot className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-surface-elevated border border-surface-border text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-surface-elevated border-t border-surface-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about leaves, payslip..."
            className="flex-1 bg-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
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
