import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Smart PDF Generator that prevents page breaks from splitting text or table rows horizontally.
 *
 * @param {HTMLElement} element - The DOM node to render as PDF.
 * @param {Object} options - Configuration options.
 * @param {string} [options.filename] - Output PDF filename. If provided, saves the file automatically.
 * @param {string} [options.orientation='portrait'] - 'portrait' or 'landscape'.
 * @param {number} [options.margin] - Uniform margin in mm (overridden by marginTop/marginBottom/marginSide if specified).
 * @param {number} [options.marginTop=10] - Top margin in mm.
 * @param {number} [options.marginBottom=12] - Bottom margin in mm.
 * @param {number} [options.marginSide=8] - Left and right margin in mm.
 * @param {number} [options.scale=2] - html2canvas scale factor for high resolution.
 * @param {number} [options.quality=0.98] - JPEG quality (0 to 1).
 * @returns {Promise<jsPDF>} - Resolves to the generated jsPDF instance.
 */
export async function generateSmartPdf(element, options = {}) {
    if (!element) {
        throw new Error("Target element not provided to generateSmartPdf");
    }

    const {
        filename,
        orientation = "portrait",
        scale = 2,
        quality = 0.98,
        marginTop = options.margin !== undefined ? options.margin : 10,
        marginBottom = options.margin !== undefined ? options.margin : 12,
        marginSide = options.margin !== undefined ? options.margin : 8,
    } = options;

    const isLandscape = orientation === "landscape";
    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;

    const usableWidth = pageWidth - marginSide * 2;
    const usableHeight = pageHeight - marginTop - marginBottom;

    // Capture the target element into a high-DPI canvas
    const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        letterRendering: true,
    });

    const containerRect = element.getBoundingClientRect();
    const containerHeight = containerRect.height || element.offsetHeight || 1;

    // Ratio of canvas pixels to DOM rect height
    const scaleY = canvas.height / containerHeight;

    // Canvas height corresponding to 1 usable page in PDF
    const usableCanvasPageHeight = (usableHeight * canvas.width) / usableWidth;

    // Query breakable elements (table rows, sections, cards, headers, paragraph blocks)
    const selectors = "tr, .page-break-avoid, header, footer, .pdf-section, .card, .avoid-break, p, h1, h2, h3, h4, h5, h6";
    const breakableElements = Array.from(element.querySelectorAll(selectors));

    const elementBounds = breakableElements
        .map((el) => {
            const rect = el.getBoundingClientRect();
            const top = (rect.top - containerRect.top) * scaleY;
            const bottom = (rect.bottom - containerRect.top) * scaleY;
            return { top, bottom, height: bottom - top };
        })
        .filter((b) => b.bottom > b.top && b.height > 0);

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation });

    let currentY = 0;
    let pageIndex = 0;
    const totalCanvasHeight = canvas.height;

    // If total content fits on a single page, handle cleanly with slight auto-shrink if needed
    const totalImgHeightMm = (totalCanvasHeight * usableWidth) / canvas.width;
    if (totalImgHeightMm <= usableHeight + 10) {
        let finalWidth = usableWidth;
        let finalHeight = totalImgHeightMm;
        if (finalHeight > usableHeight) {
            const shrink = usableHeight / finalHeight;
            finalHeight = usableHeight;
            finalWidth = usableWidth * shrink;
        }
        const xOffset = marginSide + (usableWidth - finalWidth) / 2;
        const imgData = canvas.toDataURL("image/jpeg", quality);
        pdf.addImage(imgData, "JPEG", xOffset, marginTop, finalWidth, finalHeight);
        if (filename) pdf.save(filename);
        return pdf;
    }

    // Multi-page smart canvas slicing loop
    while (currentY < totalCanvasHeight) {
        const targetY = currentY + usableCanvasPageHeight;
        let breakY = targetY;

        if (targetY >= totalCanvasHeight) {
            breakY = totalCanvasHeight;
        } else {
            // Check if any breakable element spans across targetY
            for (const bound of elementBounds) {
                if (bound.top < targetY && bound.bottom > targetY) {
                    // Check if element starts after currentY + 20px (so it's not right at the top of current page)
                    if (bound.top > currentY + 20) {
                        breakY = Math.min(breakY, bound.top);
                    }
                }
            }
        }

        // Safety fallback: Ensure breakY always advances by at least 20px
        if (breakY <= currentY + 20) {
            breakY = targetY;
        }

        const sliceCanvasHeight = breakY - currentY;

        // Create temporary canvas slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceCanvasHeight;
        const ctx = sliceCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        ctx.drawImage(
            canvas,
            0,
            currentY,
            canvas.width,
            sliceCanvasHeight,
            0,
            0,
            canvas.width,
            sliceCanvasHeight
        );

        const sliceImgData = sliceCanvas.toDataURL("image/jpeg", quality);
        const sliceHeightMm = (sliceCanvasHeight * usableWidth) / canvas.width;

        if (pageIndex > 0) {
            pdf.addPage();
        }

        pdf.addImage(sliceImgData, "JPEG", marginSide, marginTop, usableWidth, sliceHeightMm);

        currentY = breakY;
        pageIndex++;
    }

    if (filename) {
        pdf.save(filename);
    }
    return pdf;
}
