'use strict';

/**
 * Render the CV as a stack of full-page canvases inside a small Chrome/Edge
 * -style toolbar (title, zoom, page indicator, download), instead of
 * embedding the PDF in an <iframe>.
 *
 * The previous iframe-based embed (with the browser's toolbar hidden) only
 * ever shows page 1 and doesn't let you scroll to the rest on iOS/iPadOS
 * Safari - the platform's inline PDF viewer inside an iframe doesn't expose
 * paging/scroll controls there the way desktop browsers do. Rendering each
 * page onto a <canvas> with pdf.js sidesteps that entirely: the pages
 * become normal elements in the page's own scroll flow, so standard touch
 * scrolling reaches every page on any device.
 */

const PDF_URL = encodeURI('static/CV, Zhexin Wu.pdf');
const PDFJS_VERSION = '4.6.82';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/`;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.1;

// zoom is relative to "fit the toolbar's page column" = 100%, matching how
// browsers' own PDF viewers label their default fit-width zoom level.
const state = { zoom: 1 };

async function renderPdf() {
    const container = document.getElementById('pdf-viewer');
    const fallback = document.getElementById('pdf-fallback');
    if (!container) return;

    try {
        const pdfjsLib = await import(`${PDFJS_BASE}pdf.min.mjs`);
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument(PDF_URL).promise;

        const pages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page';
            container.appendChild(canvas);
            pages.push({ page, canvas, renderTask: null });
        }

        const renderAll = () => pages.forEach(renderPage);
        renderAll();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(renderAll, 150);
        });

        setupZoomControls(renderAll);
        setupPageIndicator(pages);
    } catch (err) {
        console.error('Failed to render CV PDF inline:', err);
        showFallback(container, fallback);
    }
}

function renderPage(entry) {
    const { page, canvas } = entry;
    const containerWidth = canvas.parentElement.clientWidth;
    const outputScale = window.devicePixelRatio || 1;
    const fitWidthScale = containerWidth / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale: fitWidthScale * state.zoom });

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    if (entry.renderTask) {
        entry.renderTask.cancel();
    }

    const context = canvas.getContext('2d');
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
    entry.renderTask = page.render({ canvasContext: context, viewport, transform });
    entry.renderTask.promise.catch((err) => {
        // A cancelled in-flight render (superseded by a newer resize/zoom)
        // isn't an error worth logging.
        if (err && err.name !== 'RenderingCancelledException') {
            console.error('Failed to render CV page:', err);
        }
    });
}

function setupZoomControls(renderAll) {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLabel = document.getElementById('zoom-level');

    const updateLabel = () => {
        if (zoomLabel) zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    };
    updateLabel();

    zoomInBtn?.addEventListener('click', () => {
        state.zoom = Math.min(ZOOM_MAX, +(state.zoom + ZOOM_STEP).toFixed(2));
        updateLabel();
        renderAll();
    });

    zoomOutBtn?.addEventListener('click', () => {
        state.zoom = Math.max(ZOOM_MIN, +(state.zoom - ZOOM_STEP).toFixed(2));
        updateLabel();
        renderAll();
    });
}

/** Shows "current page / total pages" in the toolbar, tracking whichever
 * page currently fills the most of the viewport as the user scrolls -
 * the same behaviour browsers' built-in PDF viewers show. */
function setupPageIndicator(pages) {
    const indicator = document.getElementById('page-indicator');
    if (!indicator || pages.length === 0) return;

    indicator.textContent = `1 / ${pages.length}`;
    if (!('IntersectionObserver' in window)) return;

    const ratios = new Map();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio));

        let bestPage = 1;
        let bestRatio = 0;
        pages.forEach(({ canvas }, index) => {
            const ratio = ratios.get(canvas) || 0;
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestPage = index + 1;
            }
        });
        indicator.textContent = `${bestPage} / ${pages.length}`;
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

    pages.forEach(({ canvas }) => observer.observe(canvas));
}

function showFallback(container, fallback) {
    container.querySelectorAll('canvas.pdf-page').forEach((canvas) => canvas.remove());
    if (fallback) {
        fallback.hidden = false;
    }
}

renderPdf();
