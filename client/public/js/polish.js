
/**
 * LiteBill Micro-interactions & Polish
 * Implements: Page transitions, number counters, toast system, 
 * scroll behaviors, and data visualization polish.
 */

document.addEventListener("DOMContentLoaded", () => {
    initPageTransitions();
    initNumberAnimations();
    initToasts();
    initScrollBehaviors();
    initChartAnimations();
    initFormLoadingStates();
    initInlineValidation();
});

// 1. Page Transitions
function initPageTransitions() {
    const mainContainer = document.querySelector('.main-container');
    if (!mainContainer) return;

    // Select all cards/sections for staggered animation
    const elements = mainContainer.querySelectorAll('.card, .card-raised, .analytic-card, .grid-layout, .grid-3, .grid-4, .page-header, h1, h2, table, .badge');
    
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 50); // 50ms staggering
    });
}

// 2. Number Animations (Counter)
function initNumberAnimations() {
    const counters = document.querySelectorAll('.stat-number, [data-counter]');
    
    const animateCounter = (el) => {
        const target = parseFloat(el.innerText.replace(/[^0-9.]/g, ''));
        const prefix = el.innerText.includes('₹') ? '₹' : '';
        const suffix = el.innerText.includes('U') ? ' U' : '';
        const duration = 300; // 300ms as per request
        const startTime = performance.now();
        
        const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // EaseOutQuad
            const easeProgress = progress * (2 - progress);
            
            const current = (target * easeProgress).toFixed(target % 1 === 0 ? 0 : 2);
            el.innerText = prefix + parseFloat(current).toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(c => observer.observe(c));
}

// 3. Toast Notification System
function initToasts() {
    // Create toast container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Global showToast function
    window.showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${icons[type] || 'info'}"></i></div>
            <div class="toast-content">${message}</div>
            <button class="toast-close"><i data-lucide="x"></i></button>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        // Close button
        toast.querySelector('.toast-close').onclick = () => removeToast(toast);

        // Auto-dismiss after 4s
        setTimeout(() => removeToast(toast), 4000);
    };

    function removeToast(toast) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }

    // Override native alert (optional but requested)
    window.alert = (msg) => window.showToast(msg, 'info');
}

// 4. Scroll Behaviors (Sticky Header & Back to Top)
function initScrollBehaviors() {
    // Sticky Headers
    const headers = document.querySelectorAll('.page-header');
    headers.forEach(h => {
        if (document.body.scrollHeight > window.innerHeight * 1.5) {
            h.classList.add('sticky-header');
        }
    });
}

// 5. Chart Animations (Intersection Observer)
function initChartAnimations() {
    const bars = document.querySelectorAll('.chart-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    bars.forEach(b => observer.observe(b));
}

// 6. Form Loading States
function initFormLoadingStates() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin" style="width: 16px; margin-right: 8px;"></i> Saving...`;
                lucide.createIcons();
            }
        });
    });
}

// 7. Inline Validation
function initInlineValidation() {
    // Meter reading inputs
    const meterInputs = document.querySelectorAll('input[name*="reading"], .meter-input');
    meterInputs.forEach(input => {
        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            const parent = input.parentElement;
            let feedback = parent.querySelector('.input-feedback');
            
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'input-feedback';
                feedback.style.position = 'absolute';
                feedback.style.right = '1rem';
                feedback.style.top = '50%';
                feedback.style.transform = 'translateY(-50%)';
                parent.style.position = 'relative';
                parent.appendChild(feedback);
            }

            if (!isNaN(val) && val >= 0) {
                feedback.innerHTML = '<i data-lucide="check" style="color: var(--accent-green); width: 18px;"></i>';
            } else if (input.value !== '') {
                feedback.innerHTML = '<i data-lucide="x" style="color: var(--accent-red); width: 18px;"></i>';
            } else {
                feedback.innerHTML = '';
            }
            lucide.createIcons();
        });
    });

    // Mobile number formatting
    const mobileInputs = document.querySelectorAll('input[type="tel"], name*="mobile"');
    mobileInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    });
}
