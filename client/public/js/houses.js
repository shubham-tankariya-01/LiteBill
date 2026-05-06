document.addEventListener("DOMContentLoaded", () => {
    // MODAL ELEMENTS
    const modal = document.getElementById("modal");
    const openBtns = document.querySelectorAll("a[href='/houses/new'], button[data-href='/houses/new']");
    const closeBtn = document.getElementById("closeModalBtn");

    // STEP ELEMENTS
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");

    // INPUTS & WRAPPERS
    const houseNameInput = document.getElementById("houseName");
    const metersContainer = document.getElementById("metersContainer");

    // OPEN MODAL
    const openModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.remove("hidden");
        document.body.classList.add("modal-open");
        setTimeout(() => houseNameInput.focus(), 100);
    };

    // CLOSE MODAL & RESET
    const closeModal = () => {
        modal.classList.add("hidden");
        document.body.classList.remove("modal-open");

        // Give transition time to hide before resetting UI
        setTimeout(() => {
            step2.classList.add("hidden");
            step1.classList.remove("hidden");
            houseNameInput.value = "";

            // Reset meters to default 1 input
            metersContainer.innerHTML = `
                <div class="form-group meter-row">
                    <input type="text" name="meters[]" class="form-control" placeholder="e.g. Main Electricity" autocomplete="off" />
                    <button type="button" class="remove-meter-btn" title="Remove" style="visibility: hidden;">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
            `;
            if (typeof lucide !== "undefined") lucide.createIcons();
        }, 300);
    };

    if (openBtns.length > 0) {
        openBtns.forEach(btn => btn.addEventListener("click", openModal));
    }
    if (closeBtn) closeBtn.addEventListener("click", closeModal);



    // BACK TO STEP 1
    const backBtn = document.getElementById("backToStep1Btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            step2.classList.add("hidden");
            step1.classList.remove("hidden");
        });
    }

    // NEXT (STEP 1 -> STEP 2)
    document.getElementById("nextBtn").addEventListener("click", () => {
        const houseName = houseNameInput.value.trim();
        if (!houseName) {
            houseNameInput.style.borderColor = "var(--accent-orange)";
            setTimeout(() => houseNameInput.style.borderColor = "var(--border-soft)", 1500);
            return; // required
        }
        step1.classList.add("hidden");
        step2.classList.remove("hidden");

        // focus first meter input
        setTimeout(() => {
            const firstMeter = metersContainer.querySelector("input");
            if (firstMeter) firstMeter.focus();
        }, 100);
    });

    // ADD METER
    document.getElementById("addMeterBtn").addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "form-group meter-row";
        row.innerHTML = `
            <input type="text" name="meters[]" class="form-control" placeholder="e.g. Water Meter" autocomplete="off" />
            <button type="button" class="remove-meter-btn" title="Remove">
                <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
            </button>
        `;
        metersContainer.appendChild(row);
        if (typeof lucide !== "undefined") lucide.createIcons();

        // Focus new input
        row.querySelector("input").focus();
    });

    // REMOVE METER (Event Delegation)
    metersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".remove-meter-btn");
        if (btn && metersContainer.querySelectorAll(".meter-row").length > 1) {
            btn.closest(".meter-row").remove();
        }
    });

    // SUBMIT DATA
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click", async () => {
        const houseName = houseNameInput.value.trim();
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
        submitBtn.innerHTML = "Creating...";
        submitBtn.disabled = true;

        try {
            const res = await fetch("/houses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ house_name: houseName, meters: meters })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert("Failed to create house. Please check server logs.");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});
