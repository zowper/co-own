document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

    // 2. Mobile Navigation Menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navOverlay = document.getElementById('nav-overlay');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
    });

    navOverlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 3. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question-btn');
        const answer = item.querySelector('.faq-answer');

        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // 4. Rent Equalization Calculator
    const homePriceInput = document.getElementById('home-price');
    const downPaymentInput = document.getElementById('down-payment');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const expensesInput = document.getElementById('monthly-expenses');
    
    // Rent Appraisals
    const rentMainInput = document.getElementById('rent-main');
    const rentAduInput = document.getElementById('rent-adu');

    // Split buttons
    const splitOptions = document.querySelectorAll('.split-option');
    let currentSplit = '50-50'; // Default split

    splitOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            splitOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentSplit = opt.getAttribute('data-split');
            calculateEqualization();
        });
    });

    // Output Elements
    const totalMonthlyOutput = document.getElementById('total-monthly-payment');
    const mainBaseOutput = document.getElementById('main-base-payment');
    const aduBaseOutput = document.getElementById('adu-base-payment');
    const equalizationAmountOutput = document.getElementById('equalization-amount');
    const equalizationDirectionOutput = document.getElementById('equalization-direction');
    const mainNetOutput = document.getElementById('main-net-payment');
    const aduNetOutput = document.getElementById('adu-net-payment');

    function calculateEqualization() {
        const homePrice = parseFloat(homePriceInput.value) || 0;
        const downPaymentPercent = parseFloat(downPaymentInput.value) || 0;
        const interestRate = parseFloat(interestRateInput.value) || 0;
        const loanTerm = parseInt(loanTermInput.value) || 30;
        const monthlyExpenses = parseFloat(expensesInput.value) || 0;

        const appraisalMain = parseFloat(rentMainInput.value) || 0;
        const appraisalAdu = parseFloat(rentAduInput.value) || 0;

        // 1. Calculate Mortgage
        const downPaymentAmount = homePrice * (downPaymentPercent / 100);
        const loanAmount = homePrice - downPaymentAmount;

        let monthlyMortgage = 0;
        if (loanAmount > 0) {
            const monthlyRate = (interestRate / 100) / 12;
            const totalPayments = loanTerm * 12;
            if (monthlyRate === 0) {
                monthlyMortgage = loanAmount / totalPayments;
            } else {
                monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
            }
        }

        const totalMonthlyCost = monthlyMortgage + monthlyExpenses;

        // 2. Base split factors
        let shareMain = 0.5;
        let shareAdu = 0.5;

        if (currentSplit === '60-40') {
            shareMain = 0.6;
            shareAdu = 0.4;
        }

        const mainBaseShare = totalMonthlyCost * shareMain;
        const aduBaseShare = totalMonthlyCost * shareAdu;

        // 3. Rent Equalization Payment math:
        // Total utility consumed = appraisalMain + appraisalAdu
        // Each family is entitled to their ownership share of the total utility:
        // Main entitled: (Main + ADU) * shareMain
        // ADU entitled: (Main + ADU) * shareAdu
        // Difference represents what Main House consumed in excess (or deficit) of entitlement.
        const totalUtility = appraisalMain + appraisalAdu;
        const entitledMain = totalUtility * shareMain;
        const entitledAdu = totalUtility * shareAdu;

        // Positive means Main House consumed more than entitled, so they pay ADU.
        const equalizationPayment = entitledMain - appraisalMain; 
        
        let displayEqualization = 0;
        let directionText = "No payment needed";
        let mainNet = mainBaseShare;
        let aduNet = aduBaseShare;

        if (equalizationPayment < 0) {
            // Main consumed more than entitled. Pay ADU.
            displayEqualization = Math.abs(equalizationPayment);
            directionText = "Main House pays ADU:";
            mainNet = mainBaseShare + displayEqualization;
            aduNet = aduBaseShare - displayEqualization;
        } else if (equalizationPayment > 0) {
            // ADU consumed more than entitled relative to split. Pay Main.
            displayEqualization = Math.abs(equalizationPayment);
            directionText = "ADU pays Main House:";
            mainNet = mainBaseShare - displayEqualization;
            aduNet = aduBaseShare + displayEqualization;
        } else {
            directionText = "Balanced split:";
        }

        // Render Outputs
        totalMonthlyOutput.textContent = '$' + Math.round(totalMonthlyCost).toLocaleString();
        mainBaseOutput.textContent = '$' + Math.round(mainBaseShare).toLocaleString();
        aduBaseOutput.textContent = '$' + Math.round(aduBaseShare).toLocaleString();
        equalizationAmountOutput.textContent = '$' + Math.round(displayEqualization).toLocaleString() + ' / mo';
        equalizationDirectionOutput.textContent = directionText;
        mainNetOutput.textContent = '$' + Math.round(mainNet).toLocaleString();
        aduNetOutput.textContent = '$' + Math.round(aduNet).toLocaleString();
    }

    // Attach Calculator Event Listeners
    [homePriceInput, downPaymentInput, interestRateInput, loanTermInput, expensesInput, rentMainInput, rentAduInput].forEach(input => {
        input.addEventListener('input', calculateEqualization);
    });

    calculateEqualization();

    // 5. Refinancing Timeline Data (from Excel exit plan sheet)
    const timelineData = [
        { year: 0, val: 800000, loan: 725000, equity: 75000, buyout: 37500, l90: -5000, a90: false, l80: -85000, a80: false },
        { year: 1, val: 840000, loan: 716504, equity: 123496, buyout: 57500, l90: 39496, a90: false, l80: -44504, a80: false },
        { year: 2, val: 882000, loan: 707463, equity: 174537, buyout: 78500, l90: 86337, a90: true, l80: -1863, a80: false },
        { year: 3, val: 926100, loan: 697839, equity: 228261, buyout: 100550, l90: 135651, a90: true, l80: 43041, a80: false },
        { year: 4, val: 972405, loan: 687596, equity: 284809, buyout: 123703, l90: 187568, a90: true, l80: 90328, a80: false },
        { year: 5, val: 1021025, loan: 676695, equity: 344330, buyout: 148013, l90: 242228, a90: true, l80: 140125, a80: false }, // Close but short at 80%
        { year: 6, val: 1072077, loan: 665092, equity: 406985, buyout: 173538, l90: 299776, a90: true, l80: 192569, a80: true },  // Both Yes
        { year: 7, val: 1125680, loan: 652744, equity: 472936, buyout: 200340, l90: 360369, a90: true, l80: 247801, a80: true },
        { year: 8, val: 1181964, loan: 639600, equity: 542364, buyout: 228482, l90: 424168, a90: true, l80: 305971, a80: true },
        { year: 9, val: 1241063, loan: 625612, equity: 615451, buyout: 258031, l90: 491345, a90: true, l80: 367238, a80: true },
        { year: 10, val: 1303116, loan: 610723, equity: 692393, buyout: 289058, l90: 562081, a90: true, l80: 431769, a80: true }
    ];

    const tlRange = document.getElementById('timeline-range');
    const tlYearBadge = document.getElementById('timeline-year-badge');
    const tlHomeValue = document.getElementById('tl-home-value');
    const tlMortgageLeft = document.getElementById('tl-mortgage-left');
    const tlJointEquity = document.getElementById('tl-joint-equity');
    const tlBuyoutNeeded = document.getElementById('tl-buyout-needed');
    const tlStatusDesc = document.getElementById('tl-status-desc');
    
    const ltv90Badge = document.getElementById('ltv-90-badge');
    const ltv80Badge = document.getElementById('ltv-80-badge');

    function updateTimeline(yearIdx) {
        const data = timelineData[yearIdx];
        if (!data) return;

        tlYearBadge.textContent = "Year " + data.year + ".0";
        tlHomeValue.textContent = '$' + Math.round(data.val).toLocaleString();
        tlMortgageLeft.textContent = '$' + Math.round(data.loan).toLocaleString();
        tlJointEquity.textContent = '$' + Math.round(data.equity).toLocaleString();
        tlBuyoutNeeded.textContent = '$' + Math.round(data.buyout).toLocaleString();

        // 90% LTV badge check
        if (data.a90) {
            ltv90Badge.textContent = "Yes";
            ltv90Badge.className = "status-badge status-yes";
        } else {
            ltv90Badge.textContent = "No";
            ltv90Badge.className = "status-badge status-no";
        }

        // 80% LTV badge check
        if (data.a80) {
            ltv80Badge.textContent = "Yes";
            ltv80Badge.className = "status-badge status-yes";
        } else {
            ltv80Badge.textContent = "No";
            ltv80Badge.className = "status-badge status-no";
        }

        // Status description updates
        let statusHtml = "";
        if (data.year === 0) {
            statusHtml = "Initial purchase closing. No refinance capacity built yet.";
        } else {
            const borrowLimit90 = Math.round(data.l90);
            if (data.a90) {
                statusHtml = `At 90% LTV, a refinance allows borrowing up to <strong>$${borrowLimit90.toLocaleString()}</strong> in cash, which is <strong>fully sufficient</strong> to fund the $${Math.round(data.buyout).toLocaleString()} buyout.`;
                if (data.a80) {
                    const borrowLimit80 = Math.round(data.l80);
                    statusHtml += ` Even at a conservative 80% LTV, we have <strong>$${borrowLimit80.toLocaleString()}</strong> in borrow capacity, easily covering the buyout.`;
                } else {
                    statusHtml += ` An 80% LTV refinance is currently short by $${Math.round(Math.abs(data.l80)).toLocaleString()}.`;
                }
            } else {
                statusHtml = `Refinancing is not yet viable. Available cash is short of the needed buyout amount by $${Math.round(Math.abs(data.l90)).toLocaleString()}.`;
            }
        }
        tlStatusDesc.innerHTML = statusHtml;
    }

    if (tlRange) {
        tlRange.addEventListener('input', (e) => {
            updateTimeline(parseInt(e.target.value));
        });
        
        // Initialize Year 5
        updateTimeline(5);
    }
});
