import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  PhoneCall, 
  ExternalLink, 
  Sparkles, 
  RotateCcw,
  CheckCheck,
  Globe,
  Clock,
  UserCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { createDecisionRequest } from '../../services/aiDecisionService';
import { AIDecisionRequest } from '../../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  isAi?: boolean;
  searchSources?: { title: string; url: string }[];
  decisionRequired?: boolean;
  decisionData?: Partial<AIDecisionRequest>;
}

export interface QuickPrompt {
  label: string;
  question: string;
  answer: string;
}

export interface ModuleChatWidgetProps {
  module: 'farm' | 'wedding' | 'restaurant';
  title: string;
  subtitle: string;
  avatarIcon: React.ReactNode;
  headerGradientClass?: string;
  accentColorClass?: string;
  hotline: string;
  hotlineFormatted: string;
  zaloPhone?: string;
  initialMessage: string;
  quickPrompts: QuickPrompt[];
  smartResponseHandler?: (userText: string) => string | null;
  onSpecialAction?: () => void;
  specialActionLabel?: string;
}

export const ModuleChatWidget: React.FC<ModuleChatWidgetProps> = ({
  module,
  title,
  subtitle,
  avatarIcon,
  headerGradientClass = 'bg-gradient-to-r from-orange-600 to-amber-600',
  accentColorClass = 'bg-orange-600 hover:bg-orange-700',
  hotline,
  hotlineFormatted,
  zaloPhone,
  initialMessage,
  quickPrompts,
  smartResponseHandler,
  onSpecialAction,
  specialActionLabel
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingStatus, setTypingStatus] = useState<string>('Đang suy nghĩ...');
  
  // Quick direct closing request form state
  const [showClosingForm, setShowClosingForm] = useState<boolean>(false);
  const [closingFormName, setClosingFormName] = useState<string>('');
  const [closingFormPhone, setClosingFormPhone] = useState<string>('');
  const [closingFormNotes, setClosingFormNotes] = useState<string>('');
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  const storageKey = `nn_chat_history_${module}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    return [
      {
        id: 'msg-init',
        sender: 'bot',
        text: initialMessage,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isAi: true
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, showClosingForm]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, storageKey]);

  // Send message through Server-side Gemini AI with Google Search & Decision detection
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: now
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTypingStatus('AI đang tra cứu dữ liệu & thông tin mạng...');

    try {
      // 1. Attempt server-side Gemini AI call
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          module,
          customerContext: {
            moduleName: module === 'farm' ? 'Trại Dúi KaKa' : module === 'wedding' ? 'Tiệc Cưới Ngọc Nhi' : 'Quán Ăn Ngọc Nhi'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.decisionRequest) {
          // Trigger local save and admin notification if returned from server
          try {
            createDecisionRequest({
              customerName: data.decisionRequest.customerName || 'Khách hàng trực tuyến',
              phone: data.decisionRequest.phone || '',
              module: module,
              decisionType: data.decisionRequest.decisionType || 'chot_don_giong',
              summary: data.decisionRequest.summary || trimmed,
              customerMessage: trimmed,
              estimatedValue: data.decisionRequest.estimatedValue || 0
            });
          } catch (e) {}
        }

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Dạ em đã ghi nhận thông tin và sẽ phản hồi Quý khách ngay ạ!',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isAi: true,
          searchSources: data.searchSources && data.searchSources.length > 0 ? data.searchSources : undefined
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (apiErr) {
      console.warn('API chat call error, using local fallback:', apiErr);
    }

    // 2. Fallback: local smart handler if server is unavailable
    setTimeout(() => {
      let botReply = '';
      if (smartResponseHandler) {
        const custom = smartResponseHandler(trimmed);
        if (custom) botReply = custom;
      }

      const lower = trimmed.toLowerCase();
      // ONLY escalate if customer EXPLICITLY confirms closing an order or booking
      const isExplicitClosing = /(tôi chốt|chốt đơn cho tôi|chốt đặt|tôi muốn chốt|xác nhận đặt|tôi đồng ý đặt|tôi mua luôn|chốt bàn cho tôi|chốt tiệc cho tôi)/i.test(lower);

      if (isExplicitClosing) {
        const phoneMatch = trimmed.match(/(0\d{9,10}|\+84\d{9,10})/);
        const detectedPhone = phoneMatch ? phoneMatch[0] : '';

        try {
          createDecisionRequest({
            customerName: 'Khách hàng chốt đặt',
            phone: detectedPhone,
            module: module,
            decisionType: module === 'wedding' ? 'chot_don_tiec' : module === 'restaurant' ? 'chot_ban_an' : 'chot_don_giong',
            summary: `Khách chốt đặt: "${trimmed}"`,
            customerMessage: trimmed
          });
        } catch (e) {}

        botReply = `Dạ em đã ghi nhận thông tin chốt đặt của Quý khách!

Đơn đã được chuyển đến Quản trị viên hệ thống để kiểm tra và liên hệ xác nhận cho Quý khách ${detectedPhone ? `vào số **${detectedPhone}**` : 'ngay khi Quý khách để lại Số điện thoại'} sớm nhất.

Cảm ơn Quý khách đã tin tưởng Hệ Thống Dịch Vụ Ngọc Nhi!`;
      }

      if (!botReply) {
        if (module === 'farm') {
          botReply = `Dạ Trại Dúi KaKa (Phan Dũng) đã tiếp nhận câu hỏi của Quý khách. Hiện tại trại có đầy đủ các dòng Dúi Mốc Đại và Má Đào tuyển chọn (3-4 lạng, 5-6 lạng, hậu bị, bố mẹ sinh sản). Quý khách cần chốt số lượng hoặc tư vấn kỹ thuật chuồng trại xin gọi trực tiếp Hotline/Zalo ${hotlineFormatted} ạ!`;
        } else if (module === 'wedding') {
          botReply = `Dạ Trung tâm Tiệc Cưới Ngọc Nhi đã tiếp nhận yêu cầu. Chúng tôi có 4 gói tiệc cưới trọn gói và dịch vụ nấu tiệc tại tư gia. Chị Ngọc Nhi sẽ liên hệ tư vấn sảnh và menu chi tiết qua số ${hotlineFormatted} ạ!`;
        } else {
          botReply = `Dạ Quán Ăn Đặc Sản Ngọc Nhi đã nhận tin nhắn. Chúng tôi phục vụ đặc sản Dúi 7 món cân sống tại chuồng và nhận đặt bàn tiệc. Hotline phục vụ nhanh: ${hotlineFormatted} ạ!`;
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isAi: true
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickPromptClick = (qp: QuickPrompt) => {
    handleSendMessage(qp.question);
  };

  const handleResetChat = () => {
    const resetMsg: ChatMessage = {
      id: `bot-init-${Date.now()}`,
      sender: 'bot',
      text: initialMessage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isAi: true
    };
    setMessages([resetMsg]);
    localStorage.removeItem(storageKey);
    setShowClosingForm(false);
  };

  // Submit direct closing request to Admin Phan Dung
  const handleSubmitClosingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingFormPhone.trim()) return;

    setIsSubmittingForm(true);

    const summaryText = closingFormNotes.trim() 
      ? `Khách yêu cầu chốt đơn: ${closingFormNotes.trim()}`
      : `Khách yêu cầu anh Phan Dũng gọi lại chốt đơn / tư vấn (${module === 'farm' ? 'Trại Dúi' : module === 'wedding' ? 'Tiệc Cưới' : 'Quán Ăn'})`;

    try {
      const dec = await createDecisionRequest({
        customerName: closingFormName.trim() || 'Khách hàng trực tuyến',
        phone: closingFormPhone.trim(),
        module: module,
        decisionType: module === 'wedding' ? 'chot_don_tiec' : module === 'restaurant' ? 'chot_ban_an' : 'chot_don_giong',
        summary: summaryText,
        customerMessage: `Tên: ${closingFormName.trim() || 'Khách'}, SĐT: ${closingFormPhone.trim()}. Nội dung: ${closingFormNotes.trim() || 'Cần chốt đơn ngay'}`
      });

      // Add user message & bot confirmation to chat
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: `⚡ YÊU CẦU CHỐT ĐƠN:\n- Tên: ${closingFormName.trim() || 'Khách hàng'}\n- SĐT: ${closingFormPhone.trim()}\n- Nội dung: ${closingFormNotes.trim() || 'Cần anh Phan Dũng duyệt chốt đơn'}`,
        time: now
      };

      const botConfirm: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Dạ em đã ghi nhận yêu cầu chốt đơn mã **#${dec.code}** và đã chuyển đến Quản trị viên để kiểm tra phê duyệt!\n\nQuản trị viên sẽ liên hệ lại ngay cho Quý khách vào số **${closingFormPhone.trim()}** để xác nhận và phục vụ nhanh nhất ạ!`,
        time: now,
        isAi: true
      };

      setMessages(prev => [...prev, userMsg, botConfirm]);
      setShowClosingForm(false);
      setClosingFormNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const rawPhone = hotline.replace(/\D/g, '');
  const rawZalo = (zaloPhone || hotline).replace(/\D/g, '');

  return (
    <>
      {/* Floating Chat Pill Button */}
      {!isOpen && (
        <button
          type="button"
          id={`btn-chat-trigger-${module}`}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border-2 border-white/60 cursor-pointer group"
          title="Bấm để trò chuyện với Trợ lý AI Trực Tuyến"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold tracking-tight leading-tight">Trợ Lý Ảo AI</span>
            <span className="text-[10px] text-amber-100 font-medium">Tra cứu & Báo giá 24/7</span>
          </div>
        </button>
      )}

      {/* Chat Interactive Window */}
      {isOpen && (
        <div 
          id={`chat-window-${module}`}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[410px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px] max-h-[88vh] animate-scaleUp text-slate-800"
        >
          {/* Header with AI & Web-connected indicator */}
          <div className={`p-3.5 flex items-center justify-between text-white ${headerGradientClass} shadow-xs`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 text-white">
                {avatarIcon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                    {title}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                    AI Live
                  </span>
                </div>
                <p className="text-[10px] text-amber-100 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">{subtitle} • Tra cứu dữ liệu & Web</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng khung chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hotline Quick Call & Admin Escalation Bar */}
          <div className="bg-slate-100/90 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Quản trị viên: <strong className="text-slate-900 font-bold">{hotlineFormatted}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowClosingForm(!showClosingForm)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
                title="Bấm để gửi yêu cầu chốt đơn trực tiếp đến Anh Phan Dũng"
              >
                <Sparkles className="w-2.5 h-2.5 text-slate-950" />
                <span>Chốt đơn ngay</span>
              </button>
              <a 
                href={`tel:${rawPhone}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-colors"
                title="Bấm để gọi điện thoại"
              >
                <span>Gọi</span>
              </a>
              <a 
                href={`https://zalo.me/${rawZalo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-2xs transition-colors"
                title="Chat Zalo trực tiếp"
              >
                <span>Zalo</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Quick Direct Closing Request Drawer (Admin Decision Form) */}
          {showClosingForm && (
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-200 shadow-inner animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Gửi Yêu Cầu Chốt Đơn Đến Anh Phan Dũng</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClosingForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10.5px] text-amber-800 leading-tight mb-2.5">
                AI sẽ chuyển trực tiếp hồ sơ đến Quản trị viên để liên hệ chốt giá sỉ, số lượng và hợp đồng ưu đãi nhất cho Quý khách.
              </p>
              <form onSubmit={handleSubmitClosingRequest} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Họ tên của bạn"
                    value={closingFormName}
                    onChange={(e) => setClosingFormName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white rounded-lg border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại (*)"
                    value={closingFormPhone}
                    onChange={(e) => setClosingFormPhone(e.target.value)}
                    className="px-2.5 py-1.5 bg-white rounded-lg border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nhu cầu chốt (VD: 5 cặp dúi giống 3-4 lạng / Đặt tiệc 10 bàn...)"
                  value={closingFormNotes}
                  onChange={(e) => setClosingFormNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClosingForm(false)}
                    className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm || !closingFormPhone.trim()}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmittingForm ? 'Đang gửi...' : 'Gửi anh Dũng duyệt ngay'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Special Action banner */}
          {onSpecialAction && specialActionLabel && (
            <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <span className="text-[10px] text-amber-900 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Tiện ích nhanh:
              </span>
              <button
                type="button"
                onClick={() => {
                  onSpecialAction();
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                {specialActionLabel} →
              </button>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[88%] p-3 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-orange-600 text-white rounded-br-xs shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[11.5px] sm:text-xs">
                    {msg.text}
                  </p>

                  {/* Web search sources if Gemini used Google Grounding */}
                  {msg.searchSources && msg.searchSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span>Nguồn tra cứu trực tuyến:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {msg.searchSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-[9.5px] text-blue-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            <span className="truncate max-w-[150px]">{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center gap-1 mt-1.5 text-[9px] ${msg.sender === 'user' ? 'text-orange-200 justify-end' : 'text-slate-400 justify-start'}`}>
                    <span>{msg.time}</span>
                    {msg.isAi && <span className="text-emerald-600 font-semibold">• AI Gemini</span>}
                    {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-orange-200 inline" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3 py-2.5 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[10.5px] text-slate-500 ml-1 font-medium">{typingStatus}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2 bg-white border-t border-slate-100">
            <div className="flex items-center justify-between mb-1 px-1">
              <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                Gợi ý tra cứu nhanh:
              </p>
              <button
                type="button"
                onClick={() => setShowClosingForm(!showClosingForm)}
                className="text-[9.5px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>⚡ Chốt đơn xin ý kiến anh Dũng</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPromptClick(qp)}
                  className="text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="p-2.5 bg-white border-t border-slate-200 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi kỹ thuật, giá giống hoặc yêu cầu chốt đơn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${accentColorClass}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
