(async () => {
    console.log("[Inject] Running…");

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    function findScrollContainer() {
        return Array.from(document.querySelectorAll("*"))
            .filter(el => el.scrollHeight > el.clientHeight + 50)
            .sort((a, b) => b.scrollHeight - a.scrollHeight)[0] || null;
    }

    function countPagesDOM() {
        return document.querySelectorAll('div[role="presentation"]').length;
    }

    function getLoadedImages() {
        return Array.from(document.querySelectorAll("img"))
            .filter(img =>
                img.naturalWidth > 50 &&
                img.src.startsWith("blob:") &&
                !img.src.includes("chrome-extension")
            );
    }

    async function loadAllPages() {
        const container = findScrollContainer();
        if (!container) return alert("Scrollable container not found");

        console.log("[Inject] Scroll container located");

        let lastPageCount = 0;
        let lastImageCount = 0;
        let stableTicks = 0;

        while (stableTicks < 4) {
            container.scrollBy(0, container.clientHeight * 0.9);
            await wait(700);

            const pageCount = countPagesDOM();
            const imgCount = getLoadedImages().length;

            console.log(`Pages: ${pageCount}, Images Loaded: ${imgCount}`);

            // Has progress been made?
            if (pageCount === lastPageCount && imgCount === lastImageCount) {
                stableTicks++;
            } else {
                stableTicks = 0;
                lastPageCount = pageCount;
                lastImageCount = imgCount;
            }
        }

        console.log("[Inject] ✅ All pages loaded!");
    }

    // Load all pages first
    await loadAllPages();

    // PDF generation
    console.log("[Inject] Starting PDF generation…");

    const imgs = getLoadedImages();
    if (imgs.length === 0) return alert("No pages loaded!");

    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (const img of imgs) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const data = canvas.toDataURL("image/png").split(",")[1];
        const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));

        const png = await pdfDoc.embedPng(bytes);
        const page = pdfDoc.addPage([png.width, png.height]);
        page.drawImage(png, { x: 0, y: 0 });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (document.title || "Document") + ".pdf";
    a.click();

    console.log("[Inject] ✅ PDF download started!");
})();
