/**
 * Tiện ích in ấn thẻ QR dán chuồng và nhãn Decal trực tiếp đến máy in
 * Hỗ trợ:
 * 1. In qua iframe ẩn trực tiếp (Silent/Direct print dialog)
 * 2. In qua cửa sổ/tab độc lập (Bypass iframe sandbox restrictions)
 * 3. Hỗ trợ máy in tem nhiệt Decal (80x100mm, 75x105mm) và máy in giấy A4/A5
 */

export interface PrintLabelOptions {
  title: string;
  imageDataUrl: string;
  size?: 'decal' | 'a4' | 'a5';
  idLabel?: string;
  extraInfo?: string;
}

/**
 * Sinh mã HTML hoàn chỉnh tối ưu cho máy in tem decal hoặc máy in giấy
 */
export function buildPrintHtml(options: PrintLabelOptions): string {
  const isDecal = options.size === 'decal' || !options.size;
  const maxWidth = isDecal ? '90mm' : options.size === 'a5' ? '135mm' : '180mm';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>In Thẻ QR: ${options.title}</title>
  <style>
    @page {
      size: ${isDecal ? '80mm 110mm' : 'auto'};
      margin: 2mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-container {
      width: 100%;
      max-width: ${maxWidth};
      margin: 0 auto;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .qr-image {
      width: 100%;
      height: auto;
      max-height: 96vh;
      display: block;
      margin: 0 auto;
      object-fit: contain;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }

    /* Giao diện thanh công cụ khi xem trên màn hình trước khi in */
    @media screen {
      body {
        background: #f8fafc;
        padding: 60px 16px 24px;
        min-height: 100vh;
      }
      .screen-toolbar {
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #ffffff;
        padding: 10px 22px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        z-index: 9999;
        font-size: 13px;
        font-weight: 500;
      }
      .screen-toolbar strong {
        color: #34d399;
      }
      .btn-action {
        border: none;
        padding: 8px 16px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 12.5px;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .btn-print {
        background: #059669;
        color: #ffffff;
      }
      .btn-print:hover {
        background: #047857;
      }
      .btn-close {
        background: #334155;
        color: #cbd5e1;
      }
      .btn-close:hover {
        background: #475569;
        color: #ffffff;
      }
      .print-container {
        background: #ffffff;
        box-shadow: 0 4px 25px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
      }
    }

    /* Định dạng máy in thực tế */
    @media print {
      .screen-toolbar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        min-height: auto !important;
        padding: 0 !important;
      }
      .print-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      .qr-image {
        max-height: none !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <span>Thẻ: <strong>${options.title}</strong></span>
    <button class="btn-action btn-print" onclick="triggerPrint()">🖨️ KẾT NỐI MÁY IN & IN NGAY</button>
    <button class="btn-action btn-close" onclick="window.close()">✕ Đóng</button>
  </div>

  <div class="print-container">
    <img id="printTargetImg" class="qr-image" src="${options.imageDataUrl}" alt="${options.title}" />
  </div>

  <script>
    function triggerPrint() {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Lỗi khi kích hoạt hộp thoại in:', err);
      }
    }

    // Tự động mở hộp thoại in của hệ điều hành ngay khi ảnh nạp xong
    window.addEventListener('load', function() {
      var img = document.getElementById('printTargetImg');
      if (img.complete) {
        setTimeout(triggerPrint, 350);
      } else {
        img.onload = function() {
          setTimeout(triggerPrint, 350);
        };
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Thực hiện in trực tiếp qua iframe ẩn.
 * Nếu thành công sẽ mở hộp thoại máy in ngay trên trang hiện tại.
 */
export function printViaHiddenIframe(htmlContent: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Xóa các iframe in cũ nếu có
      const oldIframe = document.getElementById('direct-print-iframe');
      if (oldIframe) {
        oldIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'direct-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = '0';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        resolve(false);
        return;
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      // Đợi ảnh và CSS trong iframe sẵn sàng
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            resolve(true);
          } catch (err) {
            console.warn('Iframe print bị chặn bởi chính sách trình duyệt:', err);
            resolve(false);
          }
        }, 500);
      };

      // Timeout dự phòng
      setTimeout(() => {
        resolve(true);
      }, 2000);
    } catch (err) {
      console.warn('Lỗi khi khởi tạo iframe in:', err);
      resolve(false);
    }
  });
}

/**
 * Mở cửa sổ in chuyên dụng độc lập để kết nối máy in
 * Giải pháp hoàn hảo 100% vượt qua mọi giới hạn sandbox iframe của trình duyệt.
 */
export function openDirectPrintWindow(htmlContent: string): boolean {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');

    if (printWindow) {
      printWindow.focus();
      return true;
    } else {
      // Nếu popup bị chặn, fallback sang ghi trực tiếp vào window mới
      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(htmlContent);
        win.document.close();
        win.focus();
        return true;
      }
      return false;
    }
  } catch (err) {
    console.error('Lỗi khi mở cửa sổ in:', err);
    return false;
  }
}
