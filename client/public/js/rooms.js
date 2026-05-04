document.addEventListener("DOMContentLoaded", () => {
    // MODAL ELEMENTS
    const modal = document.getElementById("modal");
    const openBtn = document.querySelector("[href^='/houses/'][href$='/rooms/new']");
    const closeBtn = document.getElementById("closeModalBtn");

    // INPUTS & WRAPPERS
    const metersContainer = document.getElementById("metersContainer");

    // OPEN MODAL
    const openModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.remove("hidden");
        document.body.classList.add("modal-open");
        setTimeout(() => {
            const firstMeter = metersContainer.querySelector("input");
            if (firstMeter) firstMeter.focus();
        }, 100);
    };

    // CLOSE MODAL & RESET
    const closeModal = () => {
        modal.classList.add("hidden");
        document.body.classList.remove("modal-open");

        // Give transition time to hide before resetting UI
        setTimeout(() => {
            // Reset meters to default 1 input
            metersContainer.innerHTML = `
                <div class="form-group meter-row">
                    <input type="text" name="meters[]" class="form-control" placeholder="e.g. Master Bedroom" autocomplete="off" />
                    <button type="button" class="remove-meter-btn" title="Remove" style="visibility: hidden;">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
            `;
            if (typeof lucide !== "undefined") lucide.createIcons();
        }, 300);
    };

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // ADD METER
    if (document.getElementById("addMeterBtn")) {
        document.getElementById("addMeterBtn").addEventListener("click", () => {
            const row = document.createElement("div");
            row.className = "form-group meter-row";
            row.innerHTML = `
                <input type="text" name="meters[]" class="form-control" placeholder="e.g. Additional Room" autocomplete="off" />
                <button type="button" class="remove-meter-btn" title="Remove">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                </button>
            `;
            metersContainer.appendChild(row);
            if (typeof lucide !== "undefined") lucide.createIcons();

            // Focus new input
            row.querySelector("input").focus();
        });
    }

    // REMOVE METER (Event Delegation)
    if (metersContainer) {
        metersContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".remove-meter-btn");
            if (btn && metersContainer.querySelectorAll(".meter-row").length > 1) {
                btn.closest(".meter-row").remove();
            }
        });
    }

    // SUBMIT DATA
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const meters = Array.from(document.querySelectorAll("input[name='meters[]']"))
                .map(input => input.value.trim())
                .filter(v => v);

            // minimal validation
            if (meters.length === 0) {
                const firstInput = metersContainer.querySelector("input");
                if (firstInput) {
                    firstInput.style.borderColor = "var(--accent-orange)";
                    setTimeout(() => firstInput.style.borderColor = "var(--border-soft)", 1500);
                }
                return;
            }

            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "Saving...";
            submitBtn.disabled = true;

            try {
                // currentHouseId is passed via EJS inline script
                const res = await fetch(`/houses/${currentHouseId}/rooms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ meters: meters })
                });

                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("Failed to create room. Please check server logs.");
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
