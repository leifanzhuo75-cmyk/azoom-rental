// === Car fleet data ===
const carFleet = [
    { carId: "CAR-E01", name: "Eco-1 Economy EV", type: "Economy", priceDaily: 78, priceWeekly: 420, priceMonthly: 1450, img: "images/car-e01.jpg" },
    { carId: "CAR-S02", name: "PowerX Electric SUV", type: "SUV", priceDaily: 125, priceWeekly: 680, priceMonthly: 2200, img: "images/car-s02.jpg" },
    { carId: "CAR-F03", name: "Family-Max EV", type: "Family", priceDaily: 140, priceWeekly: 760, priceMonthly: 2500, img: "images/car-f03.jpg" },
    { carId: "CAR-L04", name: "Luxury EV Sedan", type: "Luxury", priceDaily: 210, priceWeekly: 1150, priceMonthly: 3800, img: "images/car-l04.jpg" }
];

// === Data storage ===
let reservationList = [];
let rentalList = [];
let returnList = [];
let inspectList = [];
let billList = [];

let resIdCounter = 1000;
let rentIdCounter = 2000;
let retIdCounter = 3000;
let inspIdCounter = 4000;
let billIdCounter = 5000;

// === Initialisation ===
window.addEventListener('DOMContentLoaded', () => {
    renderCarFleet(carFleet);
    fillCarSelect();
    bindAllEvents();
    initTheme();
    setupDateFormatting();
});

// === Auto-scroll feature: Smoothly scroll to the next module ===
function scrollToNextSection(nextSectionId) {
    const nextSection = document.getElementById(nextSectionId);
    if(nextSection) {
        setTimeout(() => {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a subtle highlight animation to the target input field to guide the user
            const input = nextSection.querySelector('input[type="text"]');
            if(input) {
                input.style.transition = "background-color 0.5s ease";
                input.style.backgroundColor = "#d4edda"; // 浅绿色
                setTimeout(() => { input.style.backgroundColor = ""; }, 1500);
            }
        }, 500); // Delay for half a second, allowing the user to first see the current step's popup or result
    }
}

function setupDateFormatting() {
    const dateInputs = document.querySelectorAll('.date-picker');
    dateInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 4 && value.length <= 6) {
                value = value.slice(0, 4) + '-' + value.slice(4);
            } else if (value.length > 6) {
                value = value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 8);
            }
            this.value = value;
        });
    });
}

function initTheme() {
    const themeToggleBtn = document.getElementById("themeToggle");
    const icon = themeToggleBtn.querySelector("i");
    
    const currentTheme = localStorage.getItem("theme") || "light";
    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        icon.classList.replace("fa-moon", "fa-sun");
    }

    themeToggleBtn.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        if (theme === "dark") {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
            icon.classList.replace("fa-sun", "fa-moon");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            icon.classList.replace("fa-moon", "fa-sun");
        }
    });
}

function renderCarFleet(list) {
    const container = document.getElementById("carFleetContainer");
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = "<p style='padding:20px;'>No cars match your filter.</p>";
        return;
    }
    list.forEach(car => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "car-card"; 
        cardDiv.innerHTML = `
            <img src="${car.img}" alt="${car.name}" loading="lazy">
            <div class="card-body">
                <h4>${car.name}</h4>
                <span class="type-badge">${car.type}</span>
                <div class="price-line">ID: <strong>${car.carId}</strong></div>
                <div class="price-line">Daily: <strong>$${car.priceDaily}</strong></div>
                <div class="price-line">Weekly: <strong>$${car.priceWeekly}</strong></div>
                <div class="price-line">Monthly: <strong>$${car.priceMonthly}</strong></div>
            </div>
        `;
        container.appendChild(cardDiv);
    });
}

function fillCarSelect() {
    const sel = document.getElementById("resCarId");
    sel.innerHTML = "";
    carFleet.forEach(car => {
        let opt = document.createElement("option");
        opt.value = car.carId;
        opt.textContent = `${car.carId} — ${car.name}`;
        sel.appendChild(opt);
    });
}

function bindAllEvents() {
    // Login popup logic
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const loginModal = document.getElementById("loginModal");
    const closeModalBtn = document.getElementById("closeModal");
    const confirmLoginBtn = document.getElementById("confirmLogin");

    if(loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.remove("hidden"));
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => loginModal.classList.add("hidden"));

    if(confirmLoginBtn) confirmLoginBtn.addEventListener('click', () => {
        const u = document.getElementById("modalUser").value.trim();
        const p = document.getElementById("modalPwd").value.trim();
        if (u && p) {
            alert("✅ Login Success (Simulation)");
            loginModal.classList.add("hidden");
            loginBtn.classList.add("hidden");
            logoutBtn.classList.remove("hidden");
        } else {
            alert("⚠️ Please fill username and password");
        }
    });

    if(logoutBtn) logoutBtn.addEventListener('click', () => {
        alert("✅ Logout completed");
        logoutBtn.classList.add("hidden");
        loginBtn.classList.remove("hidden");
    });

    // Search logic
    document.getElementById("searchCarForm").addEventListener('submit', e => {
        e.preventDefault();
        const typeFilter = document.getElementById("carTypeSelect").value;
        let filtered = [...carFleet];
        if (typeFilter) {
            filtered = filtered.filter(car => car.type === typeFilter);
        }
        renderCarFleet(filtered);
    });

    // 1. Booking
    document.getElementById("reserveForm").addEventListener('submit', e => {
        e.preventDefault();
        const custName = document.getElementById("resCustName").value.trim();
        const selCarId = document.getElementById("resCarId").value;
        const period = document.getElementById("rentalPeriod").value;
        const pickupBr = document.getElementById("resPickup").value;
        const ccNum = document.getElementById("resCC").value.trim();

        if (!custName || !ccNum) {
            alert("⚠️ Please fill all required fields.");
            return;
        }

        const newResId = resIdCounter++;
        const record = { resId: newResId, customer: custName, carId: selCarId, rentalPeriod: period, pickupBranch: pickupBr, creditCard: ccNum };
        reservationList.push(record);

        const outputDiv = document.getElementById("reserveOutput");
        outputDiv.innerHTML = `<div class="record-item">
            <strong>Reservation-ID: ${newResId}</strong><br>
            Customer: ${custName}<br>
            Car: ${selCarId}<br>
            Period: ${period} | Pick-up: ${pickupBr}<br>
        </div>`;
        
        // Automatically fill in the next step's ID and scroll to it
        document.getElementById("rentResId").value = newResId;
        alert(`✅ Reservation submitted! Your Reservation ID = ${newResId}.`);
        scrollToNextSection('rent');
        document.getElementById("reserveForm").reset();
    });

    // 2. Pick up the car
    document.getElementById("rentForm").addEventListener('submit', e => {
        e.preventDefault();
        const inputResId = Number(document.getElementById("rentResId").value.trim());
        const foundRes = reservationList.find(r => r.resId === inputResId);
        const outDiv = document.getElementById("rentOutput");
        if (!foundRes) {
            outDiv.innerHTML = `<span class="error-text">❌ Cannot find this Reservation ID!</span>`;
            return;
        }
        const newRentId = rentIdCounter++;
        const rentRec = { rentId: newRentId, linkedResId: inputResId, customer: foundRes.customer, carId: foundRes.carId, period: foundRes.rentalPeriod };
        rentalList.push(rentRec);
        outDiv.innerHTML = `<div class="record-item" style="border-left: 4px solid var(--primary-color); padding-left:10px;">
            <span style="color:var(--primary-color);">✅ Rent confirmed</span><br>
            <strong>Rental-ID: ${newRentId}</strong><br>
            Customer: ${foundRes.customer}<br>
            Car: ${foundRes.carId}
        </div>`;
        
        // Automatically fill in the next step's ID and scroll to it
        document.getElementById("returnRentId").value = newRentId;
        alert(`✅ Car rented successfully! Rental ID = ${newRentId}.`);
        scrollToNextSection('return');
        document.getElementById("rentForm").reset();
    });

    // 3. Return the car
    document.getElementById("returnForm").addEventListener('submit', e => {
        e.preventDefault();
        const inputRentId = Number(document.getElementById("returnRentId").value.trim());
        const retPark = document.getElementById("returnPark").value;
        const foundRent = rentalList.find(x => x.rentId === inputRentId);
        const outDiv = document.getElementById("returnOutput");
        if (!foundRent) {
            outDiv.innerHTML = `<span class="error-text">❌ No matching active Rental ID!</span>`;
            return;
        }
        const newRetId = retIdCounter++;
        const retRec = { returnId: newRetId, linkedRentId: inputRentId, customer: foundRent.customer, carId: foundRent.carId, returnParkLocation: retPark };
        returnList.push(retRec);
        outDiv.innerHTML = `<div class="record-item" style="border-left: 4px solid var(--secondary-color); padding-left:10px;">
            <span style="color:var(--secondary-color);">✅ Car returned</span><br>
            <strong>Return-Record-ID: ${newRetId}</strong><br>
            Customer: ${foundRent.customer}<br>
            Park: ${retPark}
        </div>`;
        
        // Automatically fill in the next step's ID and scroll to it
        document.getElementById("inspectReturnId").value = newRetId;
        alert(`✅ Car return logged! Return ID = ${newRetId}.`);
        scrollToNextSection('inspect');
        document.getElementById("returnForm").reset();
    });

    // 4. Inspection
    document.getElementById("inspectForm").addEventListener('submit', e => {
        e.preventDefault();
        const inputRetId = Number(document.getElementById("inspectReturnId").value.trim());
        const dmg = document.getElementById("damageStatus").value;
        const foundRet = returnList.find(r => r.returnId === inputRetId);
        const outDiv = document.getElementById("inspectOutput");
        if (!foundRet) {
            outDiv.innerHTML = `<span class="error-text">❌ Cannot find return record ID</span>`;
            return;
        }
        let damageCharge = 0;
        if (dmg === "minor") damageCharge = 150;
        if (dmg === "major") damageCharge = 600;

        const newInspId = inspIdCounter++;
        const inspRec = { inspectId: newInspId, linkedReturnId: inputRetId, customer: foundRet.customer, carId: foundRet.carId, damageLevel: dmg, damageFee: damageCharge };
        inspectList.push(inspRec);
        outDiv.innerHTML = `<div class="record-item" style="border-left: 4px solid #ff9800; padding-left:10px;">
            <span style="color:#ff9800;">✅ Inspection Done</span><br>
            <strong>Inspect-ID: ${newInspId}</strong><br>
            Damage: ${dmg === 'no-damage' ? 'No Damage' : dmg + ' ($'+damageCharge+')'}
        </div>`;
        
        // Automatically fill in the next step's ID and scroll to it
        document.getElementById("billInspectId").value = newInspId;
        alert(`✅ Inspection done! Inspection ID = ${newInspId}.`);
        scrollToNextSection('billing');
        document.getElementById("inspectForm").reset();
    });

    // 5. Bill
    document.getElementById("billingForm").addEventListener('submit', e => {
        e.preventDefault();
        const inputInspId = Number(document.getElementById("billInspectId").value.trim());
        const foundInsp = inspectList.find(x => x.inspectId === inputInspId);
        const outDiv = document.getElementById("billingOutput");
        if (!foundInsp) {
            outDiv.innerHTML = `<span class="error-text">❌ Inspection record not found!</span>`;
            return;
        }
        const targetCar = carFleet.find(c => c.carId === foundInsp.carId);
        let rentalCost = targetCar.priceDaily;
        const newBillId = billIdCounter++;
        const totalAmount = rentalCost + foundInsp.damageFee;
        const billRec = { billId: newBillId, linkedInspectId: inputInspId, customer: foundInsp.customer, carId: foundInsp.carId, rentalFee: rentalCost, damageFee: foundInsp.damageFee, grandTotal: totalAmount };
        billList.push(billRec);
        
        outDiv.innerHTML = `<div class="record-item" style="background: var(--surface-color); padding:20px; border-radius:8px; border: 1px solid var(--primary-color);">
            <h4 style="color:var(--primary-color); margin-bottom:15px;">🧾 Bill ID: ${newBillId}</h4>
            Customer: ${foundInsp.customer}<br>
            Vehicle: ${foundInsp.carId}<br>
            Rental: $${rentalCost}<br>
            Damage: $${foundInsp.damageFee}<br>
            <hr style="margin: 15px 0; border:0; border-top:1px solid var(--border-color);">
            <strong style="font-size:1.2rem; color:var(--primary-color);">TOTAL: $${totalAmount}</strong><br>
            <small style="color:var(--text-secondary); display:block; margin-top:5px;">✔ Payment simulated.</small>
        </div>`;
        alert(`✅ Bill generated! Total amount $${totalAmount}`);
        document.getElementById("billingForm").reset();
    });
}

function scrollToReserve() {
    document.getElementById("reserve").scrollIntoView({ behavior: "smooth" });
}