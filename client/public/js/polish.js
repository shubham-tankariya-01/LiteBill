document.addEventListener("DOMContentLoaded", () => {
    initPageTransitions();
    initNumberAnimations();
    initToasts();
    initFormLoadingStates();
    initInlineValidation();
});

function initPageTransitions() {
    const animated = document.querySelectorAll(".stagger-in, .card, .card-raised, .analytic-card, .page-header");
    animated.forEach((element, index) => {
        if (element.classList.contains("stagger-in")) return;
        element.classList.add("stagger-in");
        element.style.animationDelay = `${index * 60}ms`;
    });
}

function initNumberAnimations() {
    const counters = document.querySelectorAll("[data-target], [data-counter], .count-up");

    const formatValue = (value, decimals) => Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    const animateCounter = (element) => {
        const rawTarget = element.dataset.target || element.dataset.counter || element.textContent;
        const numericTarget = Number(String(rawTarget).replace(/[^0-9.]/g, ""));
        if (Number.isNaN(numericTarget)) return;

        const decimals = Number.isInteger(numericTarget) ? 0 : 2;
        const duration = 300;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = formatValue(numericTarget * eased, decimals);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                element.textContent = formatValue(numericTarget, decimals);
            }
        };

        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    counters.forEach((counter) => observer.observe(counter));
}

function initToasts() {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    window.showToast = (message, type = "info") => {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icons = {
            success: "check-circle",
            error: "alert-circle",
            warning: "alert-triangle",
            info: "info"
        };

        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${icons[type] || "info"}"></i></div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" type="button" aria-label="Dismiss">
                <i data-lucide="x"></i>
            </button>
        `;

        container.appendChild(toast);
        if (typeof lucide !== "undefined") lucide.createIcons();

        toast.querySelector(".toast-close")?.addEventListener("click", () => toast.remove());
        setTimeout(() => toast.remove(), 4000);
    };
}

function initFormLoadingStates() {
    document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", () => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn || submitBtn.dataset.loadingApplied === "true") return;

            submitBtn.dataset.loadingApplied = "true";
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i data-lucide="loader-2" style="width: 16px; height: 16px;"></i> Saving...`;
            if (typeof lucide !== "undefined") lucide.createIcons();
        });
    });
}

function initInlineValidation() {
    const meterInputs = document.querySelectorAll('input[name*="reading"], .meter-input');
    meterInputs.forEach((input) => {
        input.addEventListener("input", () => {
            const value = parseFloat(input.value);
            const parent = input.parentElement;
            if (!parent) return;

            let feedback = parent.querySelector(".input-feedback");
            if (!feedback) {
                feedback = document.createElement("div");
                feedback.className = "input-feedback";
                feedback.style.position = "absolute";
                feedback.style.right = "16px";
                feedback.style.top = "50%";
                feedback.style.transform = "translateY(-50%)";
                parent.style.position = "relative";
                parent.appendChild(feedback);
            }

            if (!Number.isNaN(value) && value >= 0) {
                feedback.innerHTML = '<i data-lucide="check" style="color: var(--accent-green); width: 18px; height: 18px;"></i>';
            } else if (input.value !== "") {
                feedback.innerHTML = '<i data-lucide="x" style="color: var(--accent-orange); width: 18px; height: 18px;"></i>';
            } else {
                feedback.innerHTML = "";
            }

            if (typeof lucide !== "undefined") lucide.createIcons();
        });
    });
}
