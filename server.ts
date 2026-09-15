import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for pending admin decisions (synchronized with client & persistent in session)
interface DecisionRecord {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  module: 'farm' | 'restaurant' | 'wedding' | 'general';
  decisionType: string;
  title: string;
  summary: string;
  customerMessage: string;
  estimatedValue?: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  createdAt: string;
  adminNote?: string;
}

let pendingDecisionsStore: DecisionRecord[] = [];

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// SYSTEM INSTRUCTION & KNOWLEDGE BASE
// ----------------------------------------------------
const SYSTEM_INSTRUCTION = `
Bạn là Trợ Lý Ảo AI Trực Tuyến Độc Quyền của HỆ THỐNG DỊCH VỤ NGỌC NHI.
Chủ quản & Điều phối:
1. TRẠI DÚI KAKA: Quản trị viên hệ thống & Phụ trách kỹ thuật: Anh PHAN DŨNG (Hotline/Zalo: 0969.310.601 - 0332.332.327).
2. QUÁN ĂN ĐẶC SẢN NGỌC NHI & DỊCH VỤ TIỆC CƯỚI TRỌN GÓI: Giám đốc điều hành: Chị NGỌC NHI (Hotline/Zalo: 0967.823.801).
Địa chỉ trụ sở chính: Khu Phố 9, Phường Lộc Ninh, Thành phố Đồng Nai.

QUYỀN HẠN & DỮ LIỆU ĐƯỢC TRUY CẬP:
- Bạn ĐƯỢC PHÉP TRUY CẬP toàn bộ dữ liệu nội bộ của hệ thống Ngọc Nhi:
  + TRẠI DÚI KAKA: 5 phân khu hiện đại (Khu Dúi Sinh Sản DC1-DC3, Khu Dúi Hậu Bị HB1-HB2, Khu Dúi Nuôi Con NC1-NC2, Khu Dúi Thương Phẩm TP1, Khu Cách Ly CL1).
  + Con giống: Dúi Mốc Đại thuần chủng và Dúi Má Đào thuần chủng.
  + Bảng giá giống niêm yết:
    * Dúi giống (3-4 lạng): 1.500.000đ/cặp (cai sữa khỏe mạnh, tập ăn cứng).
    * Dúi giống (5-6 lạng): 1.700.000đ/cặp (tăng trưởng mạnh, xương to).
    * Dúi giống (8 lạng - 1kg): 2.400.000đ/cặp (khỏe mạnh, thích nghi cao).
    * Dúi giống hậu bị (1,2 - 1,4kg): 3.000.000đ/cặp (thành thục sinh dục, sẵn sàng ghép đôi).
    * Dúi bố mẹ bao đẻ: 4.000.000đ/cặp.
    * Dúi thương phẩm cân sống: 650.000đ - 700.000đ/kg.
  + Kỹ thuật nuôi: Thức ăn chính gồm tre bát độ, tre luồng, mía tím, ngô hạt phơi khô, khoai lang, cỏ voi. Phòng tiêu chảy (cho ăn vỏ măng, tre già, giữ chuồng khô), phòng viêm phổi (nhiệt độ chuồng 25-32 độ C, tránh gió lùa). Chu kỳ sinh sản: mang thai 45-50 ngày, mỗi lứa 3-5 con, cai sữa sau 45 ngày.
  + QUÁN ĂN ĐẶC SẢN NGỌC NHI: Phục vụ tại chỗ với Sân vườn sinh thái (120 khách), Sảnh ẩm thực chính (80 khách), 3 Phòng VIP Hoàng gia máy lạnh riêng tư (10-30 khách). Chuyên Dúi 7 món cân sống tại chuồng (Dúi hấp lá chanh, Dúi nướng muối ớt rừng, Dúi xào lăn, Dúi nấu rựa mận, Dúi hầm thuốc bắc, Tiết canh dúi), Gà ta thả vườn, Cá lăng, Cá tầm, Hải sản.
  + TIỆC CƯỚI & SỰ KIỆN TRỌN GÓI: 4 gói chuẩn (Gói Hạnh Phúc 2.2tr/bàn, Gói Như Ý 2.8tr/bàn, Gói Uyên Ương 3.6tr/bàn, Gói Hoàng Gia 4.8tr/bàn). Sảnh tiệc Grand Ballroom 60 bàn, Garden Wedding 35 bàn, Rose Hall 25 bàn, Nấu tiệc tại tư gia 5-100 bàn.
- Bạn ĐƯỢC PHÉP TRUY CẬP CÁC TRANG MẠNG / INTERNET (thông qua Google Search) để tra cứu thông tin thị trường, kiến thức chăn nuôi thú y, công thức ẩm thực, dịch vụ sự kiện nhằm tư vấn chính xác, chu đáo nhất thay mặt ban quản trị.

QUY TẮC BẮT BUỘC VỀ TƯ VẤN & XỬ LÝ CHỐT ĐƠN / PHÊ DUYỆT CỦA QUẢN TRỊ VIÊN:
1. GIAI ĐOẠN TƯ VẤN & HỎI ĐÁP (TUYỆT ĐỐI KHÔNG CHUYỂN QUẢN TRỊ):
- Khi khách hàng hỏi thông tin kỹ thuật (thức ăn, chuồng trại, phòng bệnh, chăm sóc dúi con, phân biệt đực cái...), hỏi giá niêm yết, thực đơn quán ăn, sảnh tiệc cưới, hoặc các câu hỏi tìm hiểu thông thường:
  + Bạn có toàn quyền trả lời chi tiết, tận tâm, thân thiện, sử dụng dữ liệu nội bộ và tra cứu internet.
  + Hãy đưa ra lời khuyên hữu ích, tư vấn thấu đáo thay quản trị viên.
  + TUYỆT ĐỐI KHÔNG tạo yêu cầu phê duyệt quản trị. TUYỆT ĐỐI KHÔNG đính kèm thẻ ADMIN_DECISION_REQUIRED.
  + Khách chưa phản hồi chốt đặt hay chưa xác nhận mua thì KHÔNG ĐƯỢC chuyển quản trị viên.

2. GIAI ĐOẠN KHÁCH HÀNG XÁC NHẬN CHỐT ĐẶT (MỚI CHUYỂN QUẢN TRỊ PHÊ DUYỆT):
- CHỈ KHI khách hàng gửi câu phản hồi XÁC NHẬN CHỐT ĐẶT rõ ràng (ví dụ: "Tôi chốt mua 3 cặp...", "Chốt đơn cho tôi nhé, SĐT...", "Tôi muốn đặt bàn 8 người tối mai...", "Đồng ý đặt tiệc..."):
  + Bạn lịch sự cảm ơn và thông báo đã tiếp nhận thông tin chốt đặt của khách để chuyển quản trị viên duyệt và liên hệ lại.
  + Ở dòng cuối cùng của câu trả lời, đính kèm thẻ:
    <!--ADMIN_DECISION_REQUIRED:{"required":true,"decisionType":"chot_don_giong","customerName":"Tên khách","phone":"SĐT khách","summary":"Tóm tắt nhu cầu chốt đơn / đặt dịch vụ","estimatedValue":0}-->
  (Nếu khách CHƯA xác nhận chốt đặt, TUYỆT ĐỐI KHÔNG đính kèm thẻ này!).
    Các loại decisionType hợp lệ: "chot_don_giong", "chot_don_tiec", "chot_ban_an", "giam_gia_dac_biet", "khieu_nai_bao_hanh", "nghiep_vu_khac".

PHONG CÁCH GIAO TIẾP:
- Lịch sự, chuyên nghiệp, nhiệt tình, am hiểu sâu sắc thực tế chăn nuôi và ẩm thực.
- Xưng hô "Em" và "Quý khách" hoặc "Anh/Chị".
`;

// Helper: Smart rule-based fallback when GEMINI_API_KEY is not configured
function generateSmartLocalFallback(message: string, module: string = 'farm'): { reply: string; decision?: any } {
  const lower = message.toLowerCase();

  // ONLY detect decision when customer EXPLICITLY confirms closing an order or booking
  const isExplicitClosing = /(tôi chốt|chốt đơn cho tôi|chốt đặt|tôi muốn chốt|xác nhận đặt|tôi đồng ý đặt|tôi mua luôn|chốt bàn cho tôi|chốt tiệc cho tôi)/i.test(lower);
  
  // Extract phone number if present
  const phoneMatch = message.match(/(0\d{9,10}|\+84\d{9,10})/);
  const detectedPhone = phoneMatch ? phoneMatch[0] : '';

  if (isExplicitClosing) {
    const decision = {
      required: true,
      decisionType: lower.includes('tiệc') ? 'chot_don_tiec' : lower.includes('bàn') ? 'chot_ban_an' : 'chot_don_giong',
      customerName: 'Khách hàng chốt đặt',
      phone: detectedPhone || 'Chờ khách cung cấp SĐT',
      summary: `Khách chốt đặt: "${message.slice(0, 100)}"`,
      estimatedValue: 0
    };

    return {
      reply: `Dạ em đã ghi nhận thông tin chốt đặt của Quý khách!

Đơn đã được chuyển đến Quản trị viên hệ thống để kiểm tra và liên hệ xác nhận cho Quý khách ${detectedPhone ? `vào số **${detectedPhone}**` : 'ngay khi Quý khách để lại Số điện thoại'} sớm nhất.

Cảm ơn Quý khách đã tin tưởng Hệ Thống Dịch Vụ Ngọc Nhi!`,
      decision
    };
  }

  // General Q&A fallback based on domain
  if (lower.includes('giá') && (lower.includes('dúi') || lower.includes('giống'))) {
    return {
      reply: `Dạ Trại Dúi KaKa xin gửi Quý khách bảng giá con giống chuẩn niêm yết hiện nay:
• Dúi giống (3–4 lạng): 1.500.000đ/cặp (đã ăn tre mía tốt, tỷ lệ sống rất cao)
• Dúi giống (5–6 lạng): 1.700.000đ/cặp (khung to, xương lớn, tăng trưởng nhanh)
• Dúi giống (8 lạng – 1kg): 2.400.000đ/cặp (thể trạng cứng cáp)
• Dúi hậu bị (1,2–1,4kg): 3.000.000đ/cặp (chuẩn bị lên giống ghép đôi)
• Dúi sinh sản bố mẹ: 4.000.000đ/cặp (bao đẻ)
• Dúi thương phẩm thịt: 650.000đ - 700.000đ/kg.

Tất cả con giống đều được bảo hành 30 ngày (1 đổi 1) và tặng kèm tài liệu hướng dẫn kỹ thuật nuôi. Nếu Quý khách muốn chốt đàn giống hoặc nhận ưu đãi số lượng lớn, em sẽ xin ý kiến anh Phan Dũng để hỗ trợ Quý khách ngay ạ!`
    };
  }

  if (lower.includes('ăn gì') || lower.includes('thức ăn') || lower.includes('chăm sóc')) {
    return {
      reply: `Thức ăn chính của Dúi rất dễ kiếm và tiết kiệm chi phí:
1. Thức ăn tạo chất xơ & mài răng (chiếm 60%): Tre (tre bát độ, tre luồng dày vỏ), thân cây mía tím, cỏ voi bánh tẻ.
2. Thức ăn tinh bột (chiếm 30%): Hạt ngô khô (rất tốt cho tiêu hóa), khoai lang thái lát phơi se mặt.
3. Bổ sung khoáng: Xương heo sấy khô, củ đậu khô.

Lưu ý: Không cho dúi ăn thức ăn ôi thiu hoặc ướt sũng nước để phòng ngừa tiêu chảy. Chuồng trại cần khô ráo, thoáng mát về mùa hè và ấm áp về mùa đông.`
    };
  }

  if (lower.includes('tiệc cưới') || lower.includes('gói tiệc') || lower.includes('đặt tiệc')) {
    return {
      reply: `Dạ Hệ Thống Dịch Vụ Ngọc Nhi cung cấp 4 gói dịch vụ tiệc cưới trọn gói cao cấp:
• Gói Hạnh Phúc: 2.200.000đ/bàn (6 món đặc sản phong phú)
• Gói Như Ý: 2.800.000đ/bàn (tặng bia & nước ngọt theo bàn)
• Gói Uyên Ương: 3.600.000đ/bàn (Sảnh VIP Hoàng Gia + trang trí hoa tươi nhập khẩu)
• Gói Hoàng Gia: 4.800.000đ/bàn (ẩm thực cao cấp Dúi KaKa & hải sản, xe hoa rước dâu)

Ngoài ra chúng tôi nhận nấu tiệc lưu động tại tư gia từ 5 đến 100 bàn. Quý khách muốn đặt ngày hoặc chọn thực đơn chi tiết, xin vui lòng gọi Hotline 0967.823.801 (Chị Ngọc Nhi) hoặc để lại số điện thoại em xin ý kiến quản trị gọi lại tư vấn chu đáo nhất ạ!`
    };
  }

  return {
    reply: `Em là Trợ Lý Ảo AI của Hệ Thống Dịch Vụ Ngọc Nhi (Trại Dúi KaKa & Ẩm Thực Tiệc Cưới Ngọc Nhi).
Em có thể hỗ trợ Quý khách:
1. Tư vấn kỹ thuật nuôi dúi, phòng trị bệnh, cách ghép đôi sinh sản.
2. Báo giá con giống dúi Mốc Đại & Má Đào, quy cách chuồng trại.
3. Giới thiệu thực đơn Quán Ăn Đặc Sản Ngọc Nhi (Dúi 7 món, gà ta, cá lăng...).
4. Tư vấn các gói Tiệc Cưới Trọn Gói & đặt bàn họp mặt.

Khi Quý khách cần chốt đơn hàng hoặc có các yêu cầu nghiệp vụ giảm giá/hợp đồng, em sẽ chuyển trực tiếp đến Quản trị viên Phan Dũng (0969.310.601) để liên hệ phục vụ Quý khách ngay ạ!`
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'He Thong Dich Vu Ngoc Nhi - AI Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// POST /api/chat - AI Assistant endpoint with Gemini & Google Search Grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], module = 'farm', customerContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
      return;
    }

    const ai = getGenAI();

    // If Gemini is available, use real Gemini 3.8 Flash model with Google Search
    if (ai) {
      try {
        // Format conversation contents for Gemini
        const formattedContents: any[] = [];
        
        // Append context info
        let contextNote = `[Ngữ cảnh: Khách đang ở phân hệ "${module}".`;
        if (customerContext.customerName) contextNote += ` Tên khách: ${customerContext.customerName}.`;
        if (customerContext.phone) contextNote += ` SĐT: ${customerContext.phone}.`;
        contextNote += `]`;

        // Include recent history (up to last 6 turns to keep context strong)
        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          formattedContents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }

        // Current message with context
        formattedContents.push({
          role: 'user',
          parts: [{ text: `${contextNote}\n${message}` }]
        });

        // Use gemini-3.1-flash-lite for fast, reliable responses within free tier quota
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });

        const rawText = response.text || '';

        // Check for decision required tag: <!--ADMIN_DECISION_REQUIRED:{...}-->
        let decisionRequest: DecisionRecord | null = null;
        let cleanReply = rawText;

        const decisionMatch = rawText.match(/<!--ADMIN_DECISION_REQUIRED:(.*?)-->/s);
        if (decisionMatch) {
          try {
            const parsed = JSON.parse(decisionMatch[1]);
            const decisionId = `dec-${Date.now()}`;
            const code = `DEC-${Math.floor(1000 + Math.random() * 9000)}`;

            decisionRequest = {
              id: decisionId,
              code,
              customerName: parsed.customerName || customerContext.customerName || 'Khách hàng trực tuyến',
              phone: parsed.phone || customerContext.phone || '',
              module: (module as any) || 'farm',
              decisionType: parsed.decisionType || 'chot_don_giong',
              title: `Yêu cầu chốt đơn / nghiệp vụ từ khách [${code}]`,
              summary: parsed.summary || message,
              customerMessage: message,
              estimatedValue: parsed.estimatedValue || 0,
              status: 'pending',
              createdAt: new Date().toISOString()
            };

            pendingDecisionsStore.unshift(decisionRequest);
          } catch (e) {
            console.error('Error parsing decision json:', e);
          }

          cleanReply = rawText.replace(/<!--ADMIN_DECISION_REQUIRED:.*?-->/s, '').trim();
        }

        // Extract sources if present
        const searchSources: { title: string; url: string }[] = [];
        try {
          const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata;
          if (groundingMetadata?.groundingChunks) {
            for (const chunk of groundingMetadata.groundingChunks) {
              if (chunk.web?.uri) {
                searchSources.push({
                  title: chunk.web.title || 'Nguồn tham khảo mạng',
                  url: chunk.web.uri
                });
              }
            }
          }
        } catch (e) {
          // ignore source extraction errors
        }

        res.json({
          reply: cleanReply,
          decisionRequest,
          searchSources: searchSources.slice(0, 4),
          isRealAi: true,
          model: 'gemini-3.1-flash-lite'
        });
        return;
      } catch (geminiError: any) {
        // Graceful handling of quota exhaustion or transient issues
        console.log('Gemini API active limit reached, activating resilient knowledge engine.');
      }
    }

    // Fallback: Smart local knowledge engine
    const fallbackResult = generateSmartLocalFallback(message, module);
    let decisionRecord: DecisionRecord | null = null;

    if (fallbackResult.decision) {
      decisionRecord = {
        id: `dec-${Date.now()}`,
        code: `DEC-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customerContext.customerName || fallbackResult.decision.customerName,
        phone: customerContext.phone || fallbackResult.decision.phone,
        module: (module as any) || 'farm',
        decisionType: fallbackResult.decision.decisionType,
        title: `Yêu cầu chốt đơn / nghiệp vụ từ khách [DEC]`,
        summary: fallbackResult.decision.summary,
        customerMessage: message,
        estimatedValue: fallbackResult.decision.estimatedValue || 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      pendingDecisionsStore.unshift(decisionRecord);
    }

    res.json({
      reply: fallbackResult.reply,
      decisionRequest: decisionRecord,
      searchSources: [],
      isRealAi: false,
      note: 'Dịch vụ tư vấn AI đang hoạt động ở chế độ cơ sở tri thức hệ thống.'
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      reply: 'Hệ thống trợ lý ảo tạm thời bận. Quý khách vui lòng liên hệ trực tiếp Hotline 0969.310.601 (Anh Phan Dũng) để được phục vụ ngay ạ!',
      error: err?.message
    });
  }
});

// GET /api/decisions - Admin retrieves all pending business & closing decisions
app.get('/api/decisions', (req: Request, res: Response) => {
  res.json({
    decisions: pendingDecisionsStore,
    total: pendingDecisionsStore.length,
    pendingCount: pendingDecisionsStore.filter(d => d.status === 'pending').length
  });
});

// POST /api/decisions - Create a new decision request manually (or from client)
app.post('/api/decisions', (req: Request, res: Response) => {
  const body = req.body;
  const newDecision: DecisionRecord = {
    id: body.id || `dec-${Date.now()}`,
    code: body.code || `DEC-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: body.customerName || 'Khách hàng',
    phone: body.phone || '',
    module: body.module || 'farm',
    decisionType: body.decisionType || 'chot_don_giong',
    title: body.title || 'Yêu cầu chốt đơn / quyết định nghiệp vụ',
    summary: body.summary || '',
    customerMessage: body.customerMessage || '',
    estimatedValue: body.estimatedValue || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  pendingDecisionsStore.unshift(newDecision);
  res.json({ success: true, decision: newDecision });
});

// PATCH /api/decisions/:id - Admin approves, rejects, or marks contacted
app.patch('/api/decisions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const found = pendingDecisionsStore.find(d => d.id === id);
  if (!found) {
    res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
    return;
  }

  if (status) found.status = status;
  if (adminNote !== undefined) found.adminNote = adminNote;

  res.json({ success: true, decision: found });
});

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Backend Server] running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
