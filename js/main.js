document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    // Check local storage or system preference
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

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Set active class
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
            
            // Close all open FAQs
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Toggle current FAQ
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // 4. Scroll Reveal Observer
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    // 5. Co-ownership Calculator Logic
    const homePriceInput = document.getElementById('home-price');
    const downPaymentInput = document.getElementById('down-payment');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const expensesInput = document.getElementById('monthly-expenses');

    // Partner Sliders
    const pASlider = document.getElementById('partner-a-share');
    const pBSlider = document.getElementById('partner-b-share');
    const pCSlider = document.getElementById('partner-c-share');

    const pAShareValue = document.getElementById('partner-a-share-value');
    const pBShareValue = document.getElementById('partner-b-share-value');
    const pCShareValue = document.getElementById('partner-c-share-value');

    // Outputs
    const totalMonthlyOutput = document.getElementById('total-monthly-payment');
    const pAMonthlyOutput = document.getElementById('partner-a-monthly');
    const pBMonthlyOutput = document.getElementById('partner-b-monthly');
    const pCMonthlyOutput = document.getElementById('partner-c-monthly');

    // Balances the 3 partner sliders to always equal 100%
    function balanceSliders(changedPartner) {
        let valA = parseFloat(pASlider.value);
        let valB = parseFloat(pBSlider.value);
        let valC = parseFloat(pCSlider.value);

        if (changedPartner === 'A') {
            const remaining = 100 - valA;
            const sumOthers = valB + valC;
            if (sumOthers > 0) {
                valB = Math.round((valB / sumOthers) * remaining);
                valC = 100 - valA - valB;
            } else {
                valB = Math.round(remaining / 2);
                valC = remaining - valB;
            }
        } else if (changedPartner === 'B') {
            const remaining = 100 - valB;
            const sumOthers = valA + valC;
            if (sumOthers > 0) {
                valA = Math.round((valA / sumOthers) * remaining);
                valC = 100 - valA - valB;
            } else {
                valA = Math.round(remaining / 2);
                valC = remaining - valA;
            }
        } else if (changedPartner === 'C') {
            const remaining = 100 - valC;
            const sumOthers = valA + valB;
            if (sumOthers > 0) {
                valA = Math.round((valA / sumOthers) * remaining);
                valB = 100 - valA - valC;
            } else {
                valA = Math.round(remaining / 2);
                valB = remaining - valA;
            }
        }

        // Apply balanced values to element states
        pASlider.value = valA;
        pBSlider.value = valB;
        pCSlider.value = valC;

        pAShareValue.textContent = valA + '%';
        pBShareValue.textContent = valB + '%';
        pCShareValue.textContent = valC + '%';
        
        calculatePayments();
    }

    function calculatePayments() {
        const homePrice = parseFloat(homePriceInput.value) || 0;
        const downPaymentPercent = parseFloat(downPaymentInput.value) || 0;
        const interestRate = parseFloat(interestRateInput.value) || 0;
        const loanTerm = parseInt(loanTermInput.value) || 30;
        const monthlyExpenses = parseFloat(expensesInput.value) || 0;

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

        const totalMonthlyPayment = monthlyMortgage + monthlyExpenses;
        
        // Split math
        const shareA = parseFloat(pASlider.value) / 100;
        const shareB = parseFloat(pBSlider.value) / 100;
        const shareC = parseFloat(pCSlider.value) / 100;

        const monthlyA = totalMonthlyPayment * shareA;
        const monthlyB = totalMonthlyPayment * shareB;
        const monthlyC = totalMonthlyPayment * shareC;

        // Render Outputs
        totalMonthlyOutput.textContent = '$' + Math.round(totalMonthlyPayment).toLocaleString();
        pAMonthlyOutput.textContent = '$' + Math.round(monthlyA).toLocaleString();
        pBMonthlyOutput.textContent = '$' + Math.round(monthlyB).toLocaleString();
        pCMonthlyOutput.textContent = '$' + Math.round(monthlyC).toLocaleString();
    }

    // Attach Calculator Event Listeners
    [homePriceInput, downPaymentInput, interestRateInput, loanTermInput, expensesInput].forEach(input => {
        input.addEventListener('input', calculatePayments);
    });

    pASlider.addEventListener('input', () => balanceSliders('A'));
    pBSlider.addEventListener('input', () => balanceSliders('B'));
    pCSlider.addEventListener('input', () => balanceSliders('C'));

    // Initialize Calculator numbers on load
    calculatePayments();

    // 6. Newsletter Subscription handling (Simulation)
    const newsletterForm = document.getElementById('newsletter-form');
    const feedbackMsg = document.getElementById('newsletter-feedback');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (email) {
                // Simulate success API call
                feedbackMsg.textContent = "Thank you! You have subscribed successfully.";
                feedbackMsg.className = "newsletter-feedback success";
                emailInput.value = "";
            } else {
                feedbackMsg.textContent = "Please enter a valid email address.";
                feedbackMsg.className = "newsletter-feedback error";
            }

            setTimeout(() => {
                feedbackMsg.style.opacity = '0';
            }, 4000);
        });
    }
});
