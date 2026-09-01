'use strict';

/**
 * Keep the fixed header/footer from covering the page content by syncing
 * body padding to their live size. A plain one-time measurement (the old
 * approach) goes stale the moment the header wraps onto more lines than
 * expected - e.g. logos/nav wrapping on a narrow phone, images finishing
 * layout after first paint, or the viewport rotating - so we watch both
 * elements and keep the padding in sync whenever their size changes.
 */
function syncFixedOffsets() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (!header || !footer) return;

    const apply = () => {
        document.body.style.paddingTop = `${header.offsetHeight * 1.1}px`;
        document.body.style.paddingBottom = `${footer.offsetHeight * 1.1}px`;
    };

    apply();

    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(apply);
        observer.observe(header);
        observer.observe(footer);
    } else {
        // Fallback for browsers without ResizeObserver support.
        window.addEventListener('load', apply);
        window.addEventListener('resize', apply);
        window.addEventListener('orientationchange', apply);
    }
}

function activateNav() {
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (link.classList.contains('active')) return;
            const current = document.querySelector('a.nav-link.active');
            if (current) current.classList.remove('active');
            link.classList.add('active');
        });
    });
}

class Project {
    constructor(title, gifLink, desc, info) {
        this.title = title;
        this.gifLink = gifLink;
        this.desc = desc;
        this.info = info; // e.g. { code: '...', paper: '...', video: '...' }
    }
}

const BUTTON_COLORS = ['btn-primary', 'btn-secondary', 'btn-success', 'btn-info'];

function buttonsMarkup(info) {
    return Object.entries(info)
        .map(([label, url], index) => {
            const color = BUTTON_COLORS[Math.min(index, BUTTON_COLORS.length - 1)];
            return `<a href="${url}" target="_blank"><button type="button" class="btn ${color} pl-2">${label}</button></a>`;
        })
        .join('');
}

function createListItem(project, index, imgColClass, textColClass) {
    const li = document.createElement('li');
    li.className = 'list-group-item container justify-content-center';
    li.id = project.title;

    li.innerHTML = `
        <div class="row justify-content-center">
            <img class="img-fluid img-thumbnail rounded order-${index % 2} ${imgColClass}" src="${project.gifLink}" alt="${project.title}">
            <div class="${textColClass} card">
                <div class="card-body">
                    <div class="card-title">
                        <h4>${project.title}</h4>
                    </div>
                    <hr>
                    <div class="card-text">
                        ${project.desc}
                    </div>
                    <br class="d-block">
                    <br class="d-block">
                    <br class="d-block d-xl-none">
                    <div class="button-in-projs mt-4 mb-2 mt-md-0">${buttonsMarkup(project.info)}</div>
                </div>
            </div>
        </div>`;

    return li;
}

function renderInternships() {
    const list = document.querySelector('#internships ul');
    if (!list) return;

    const internships = [
        new Project(
            'IPO Internship', 'images/Sinolink_Securities.jpg',
            'We developed scraper programs to collect and analyze the latest data on IPO statuses, prospectuses, and inquiry letters from public websites. Additionally, we created custom GPTs to generate structured industry and company analysis reports, streamlining the process of gathering and interpreting relevant financial data.',
            { code: 'https://github.com/10258392511/IPODataAnalysis' }
        ),

        new Project(
            'Quantitative Internship in Factor Investment', 'images/China_Securities.jpg',
            'We constructed a comprehensive CSI 300 and CSI 500 factor database using the Tushare data terminal. Leveraging this database, we developed a trading strategy with an information-coefficient-weighted factor using the Zipline framework, enhancing factor-based investment decisions.',
            { code: 'https://github.com/10258392511/FactorAnalysis' }
        )
    ];

    internships.forEach((project, index) => {
        list.appendChild(createListItem(project, index, 'col-12 col-lg-4', 'col-12 col-lg-6'));
    });
}

function renderProjects() {
    const list = document.querySelector('#selected-projects ul');
    if (!list) return;

    const projects = [
        new Project('Multi-Agent Reinforcement Learning for Market Microstructure and Optimal Execution',
            'images/ABIDES-MARL.png', 'We present ABIDES-MARL, a framework that combines a new multi-agent reinforcement learning (MARL) methodology with a realistic limit-order-book (LOB) simulation system to study equilibrium behavior in financial markets. The platform models strategic interactions among informed traders, liquidity traders, and market makers, linking optimal execution and price formation. ABIDES-MARL provides a reproducible foundation for analyzing endogenous liquidity, strategic adaptation, and equilibrium dynamics in realistic, agent-based market environments.',
            {
                Paper: 'https://arxiv.org/abs/2511.02016'
            }
        ),
        new Project('Walmart Sales Prediction',
            'images/Walmart_logo.png', 'We developed a machine learning pipeline following the CRISP-DM framework, with a strong focus on explanatory model analysis to identify key factors driving sales. Based on model predictions and variable importance, we created executive recommendations to guide decision-making and improve sales strategies.',
            {
                'executive summary': 'https://drive.google.com/file/d/1ahHow2_FI_6N9bALM-RiYgqJ7qBaU58M/view',
                slides: 'https://drive.google.com/file/d/1p1oNAj_c9V140BZx4D1N8Ff300EYnN5c/view',
                code: 'https://github.com/10258392511/BusinessAnalyticsProject'
            }
        ),

        new Project('Thalamus Parcellation Project',
            'images/thalamus_parcellation_project.png', 'We developed a unified framework for clustering algorithms on diffusion MRI images to perform in-vivo fetal thalamus parcellation using unsupervised learning techniques. This pioneering, data-driven approach advanced developmental brain studies by providing new insights into fetal brain development.',
            {
                paper: 'https://www.biorxiv.org/content/10.1101/2024.08.27.608544v1.full',
                code: 'https://github.com/10258392511/Clustering'
            }
        ),

        new Project('MR Image Reconstruction with Diffusion Models and Implicit Neural Representations',
            'images/MR_recons_diffusion_model.gif', 'We proposed diffusion-model based spatial and temporal prior to overcome high undersampling in spatial dimension; and implicit neural representations to overcome coarse k-space binning in temporal dimension. Our proposed methods work well on &times; 40 2D MR image reconstruction with 4-coil SENSE; &times; 16 2D + time CMR image reconstruction with 4-coil SENSE; and &times; 6 fractional CMR image reconstruction with 1 coil from 4 k-space bins to 64 frames.',
            {
                paper: 'https://drive.google.com/file/d/1-iSUFZkoIT02vDIuxy5UKX1dDfXr6NwD/view?usp=drive_link',
                slides: 'https://drive.google.com/file/d/1QMFA5RJnj2YCNBIJSK137OS-v4oevCSK/view?usp=drive_link',
                repo1: 'https://github.com/10258392511/InverseProblemWithDiffusionModel',
                repo2: 'https://github.com/10258392511/ImplicitNeuralRepr'
            }
        ),

        new Project('Model Fusion for Medical Image Segmentation via Optimal Transport',
            'images/model_fusion.png', 'We extended model fusion via optimal transport from cascade-like architecture (VGG, ResNet \&etc) to more general architecture whose computational graph has richer adjacency structure. In particular, we proposed model fusion approaches for prevalent U-Net and Transformer architectures used for medical image segmentation. Practically, we conducted comprehensive ablation study on fusion weighting scheme for typical medical data scenarios including distributed learning and domain-shift issue.',
            {
                paper: 'https://drive.google.com/file/d/1zm285O6Y0Sd8u-HVG3HdIyzl2dddpmIR/view',
                code: 'https://github.com/10258392511/ModelFusion'
            }),

        new Project('Sequence Models in 3D MRI Brain Metastases Detection',
            'images/RL_brain_metastases_detection.gif', 'We investigated three sequence models with increasing complexity: a continuous patch sequence classifier, active learning model and deep reinforcement learning agent. We reduce computational cost by making detection based on local patches and potentially improve interpretability.',
            {
                paper: 'https://drive.google.com/file/d/1gEBHYo3Mji8oV0woQowabu4DaJHPc-xS/view',
                slides: 'https://drive.google.com/file/d/1Fkn-Uy4U79IrIDGPLhtzBTMje4IwsmWG/view',
                code: 'https://github.com/10258392511/SemesterProject2'
            }),

        new Project('Effects of Data Augmentation and Semi-Supervised Learning in Domain Generalization',
            'images/TTA.png', 'Convolutional neural networks (CNN) for medical image segmentation is highly senstive to domain-shift problem. We investigated the use of a consistency loss as both auxiliary loss for training and proxy loss for test-time adaptation. We also proposed a new inversion-based data augmentation. We show that the combination of these techniques can greatly reduce doamin-shift problem in cardiac MR image segmentation.',
            {
                paper: 'https://drive.google.com/file/d/1nSu8o_OhfhFLHp_YgQZT9yvLn41qqjIm/view',
                slides: 'https://drive.google.com/file/d/1ijIblQyeOHy2_NKANCEfnIwN7ZBOCufj/view',
                code: 'https://github.com/10258392511/SemesterProject1'
            }),

        new Project('Permutation-Invariant Variational Network for 2D + Time Cardiac Image Reconstruction',
            'images/VTV_Reconstruction.png', 'In under-sampled k-space MR image reconstruction, though producing high-quality reconstruction, loop-unrolling variational networks fail to address the issue of cardiac phases being improperly ordered. We address it by combining variational networks with a learnable time-permutation-invariant regularization.',
            {
                paper: 'https://drive.google.com/file/d/1ZmzT8seP1zO87Zx6Lb68nGKTViSKuEqw/view',
                code: 'https://github.com/10258392511/ImageReconstructionProject'
            }),

        new Project('Manifold Optimization & Neural Collapse',
            'images/epoch_30_K_5_True_M_2_True_dymanics.gif', 'We created a smooth introduction to Riemannian submanifold optimization with rich examples. We also carried out experiments on how oblique-manifold contraints can affect the phenonmenon of Neural Collapse of deep neural nets.',
            {
                paper: 'https://drive.google.com/file/d/1TkZ0Nl_rW2nFuFsLpNyRymqrZZbP1Nlb/view',
                code: 'https://github.com/10258392511/NeuralCollapse'
            }),

        new Project('Monitoring Social Distance and Masking Wearing',
            'images/mask.gif', 'We created a unified pipeline for social distance and mask wearing monitoring for real-time video. We highlight human localization, homography, face detection and mask detection.',
            {
                paper: 'https://drive.google.com/file/d/16vl32-ZHaAn97fBYLFODEPcB8eAN3I20/view',
                video: 'https://drive.google.com/file/d/1lscFYfbB8SQF2cpd7Cjatk-mr5rj8LXy/view',
                code: 'https://github.com/husun0822/Social_Distance_Mask_Detection'
            }),

        new Project('Michigan Tourist Guide',
            'images/demo.gif', "New to Michigan? Don't worry, this guide will help you to select where, when and how to navigate yourself in Michigan, especially if you are a busy UMich Wolverine like I used to be!",
            {
                paper: 'https://drive.google.com/file/d/16QrW0WiPrcG4--rOSSrpDT0DW4-DZnwe/view',
                video: 'https://drive.google.com/file/d/1cBlQ_MHVYpe0KXgB8a__5J7F2sOWsOCY/view',
                code: 'https://github.com/10258392511/SI507_Final_Project'
            })
    ];

    projects.forEach((project, index) => {
        list.appendChild(createListItem(project, index, 'col-12 col-lg-5', 'col-12 col-lg-5'));
    });
}

/**
 * Fade project entries in as they scroll into view. IntersectionObserver
 * replaces the old jQuery scroll handler, which recomputed every item's
 * offset on every scroll event - expensive, and prone to getting the
 * visibility check wrong right after a resize/orientation change.
 */
function animateProjects() {
    const items = Array.from(document.querySelectorAll('#selected-projects li')).slice(1);
    if (items.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        return;
    }

    items.forEach((item) => {
        item.style.opacity = '0';
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.style.transition = 'opacity 0.4s ease';
            entry.target.style.opacity = '1';
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    items.forEach((item) => observer.observe(item));
}

function capitalizeButtons() {
    document.querySelectorAll('button').forEach((btn) => {
        btn.textContent = btn.textContent
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    activateNav();
    renderInternships();
    renderProjects();
    animateProjects();
    capitalizeButtons();
    syncFixedOffsets();
});
