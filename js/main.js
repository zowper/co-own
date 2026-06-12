document.addEventListener('DOMContentLoaded', () => {
    // 0. Dark Mode Toggler
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-theme');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // 1. Mobile Navigation Menu & Overlay Trigger
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

    // 2. FAQ Accordion Toggles
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

    // 3. Rent Equalization Calculator
    const homePriceInput = document.getElementById('home-price');
    const downPaymentInput = document.getElementById('down-payment');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const expensesInput = document.getElementById('monthly-expenses');
    
    const rentMainInput = document.getElementById('rent-main');
    const rentAduInput = document.getElementById('rent-adu');

    const splitOptions = document.querySelectorAll('.split-option');
    let currentSplit = '50-50'; // Default 50/50 split

    splitOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            splitOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentSplit = opt.getAttribute('data-split');
            calculateEqualization();
        });
    });

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

        // Calculate Monthly Mortgage
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

        // Determine splits
        let shareMain = 0.5;
        let shareAdu = 0.5;

        if (currentSplit === '60-40') {
            shareMain = 0.6;
            shareAdu = 0.4;
        }

        const mainBaseShare = totalMonthlyCost * shareMain;
        const aduBaseShare = totalMonthlyCost * shareAdu;

        // Rent Equalization Calculation:
        // Total utility = appraisalMain + appraisalAdu
        // Entitled Main = Total * shareMain
        // Entitled ADU = Total * shareAdu
        // Diff = Entitled Main - appraisalMain
        const totalUtility = appraisalMain + appraisalAdu;
        const entitledMain = totalUtility * shareMain;
        
        const equalizationPayment = entitledMain - appraisalMain; 
        
        let displayEqualization = 0;
        let directionText = "Balanced split:";
        let mainNet = mainBaseShare;
        let aduNet = aduBaseShare;

        if (equalizationPayment < 0) {
            // Main consumed more than entitled (appraisalMain > entitledMain). Main pays ADU.
            displayEqualization = Math.abs(equalizationPayment);
            directionText = "Main House pays ADU:";
            mainNet = mainBaseShare + displayEqualization;
            aduNet = aduBaseShare - displayEqualization;
        } else if (equalizationPayment > 0) {
            // ADU consumed more than entitled. ADU pays Main.
            displayEqualization = Math.abs(equalizationPayment);
            directionText = "ADU pays Main House:";
            mainNet = mainBaseShare - displayEqualization;
            aduNet = aduBaseShare + displayEqualization;
        }

        // Render Outputs
        totalMonthlyOutput.textContent = '$' + Math.round(totalMonthlyCost).toLocaleString();
        mainBaseOutput.textContent = '$' + Math.round(mainBaseShare).toLocaleString();
        aduBaseOutput.textContent = '$' + Math.round(aduBaseShare).toLocaleString();
        equalizationAmountOutput.textContent = '$' + Math.round(displayEqualization).toLocaleString() + ' / mo';
        equalizationDirectionOutput.textContent = directionText;
        mainNetOutput.textContent = '$' + Math.round(mainNet).toLocaleString();
        aduNetOutput.textContent = '$' + Math.round(aduNet).toLocaleString();

        // Update Share Bar Visuals
        const mainBar = document.getElementById('segment-main-bar');
        const aduBar = document.getElementById('segment-adu-bar');
        const mainPct = document.getElementById('pct-main-label');
        const aduPct = document.getElementById('pct-adu-label');

        if (mainBar && aduBar && mainPct && aduPct) {
            const mainPctVal = totalMonthlyCost > 0 ? Math.round((mainNet / totalMonthlyCost) * 100) : 50;
            const aduPctVal = 100 - mainPctVal;

            mainBar.style.width = mainPctVal + '%';
            aduBar.style.width = aduPctVal + '%';

            mainPct.textContent = mainPctVal + '%';
            aduPct.textContent = aduPctVal + '%';

            mainPct.style.display = mainPctVal < 12 ? 'none' : 'block';
            aduPct.style.display = aduPctVal < 12 ? 'none' : 'block';
        }
    }

    [homePriceInput, downPaymentInput, interestRateInput, loanTermInput, expensesInput, rentMainInput, rentAduInput].forEach(input => {
        input.addEventListener('input', calculateEqualization);
    });

    calculateEqualization();

    // 4. Refinancing Timeline Slider
    const timelineData = [
        { year: 0, val: 800000, loan: 725000, equity: 75000, buyout: 37500, l90: -5000, a90: false, l80: -85000, a80: false },
        { year: 1, val: 840000, loan: 716504, equity: 123496, buyout: 57500, l90: 39496, a90: false, l80: -44504, a80: false },
        { year: 2, val: 882000, loan: 707463, equity: 174537, buyout: 78500, l90: 86337, a90: true, l80: -1863, a80: false },
        { year: 3, val: 926100, loan: 697839, equity: 228261, buyout: 100550, l90: 135651, a90: true, l80: 43041, a80: false },
        { year: 4, val: 972405, loan: 687596, equity: 284809, buyout: 123703, l90: 187568, a90: true, l80: 90328, a80: false },
        { year: 5, val: 1021025, loan: 676695, equity: 344330, buyout: 148013, l90: 242228, a90: true, l80: 140125, a80: false },
        { year: 6, val: 1072077, loan: 665092, equity: 406985, buyout: 173538, l90: 299776, a90: true, l80: 192569, a80: true },
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

        // Update Chart segments
        const segEquity = document.getElementById('chart-segment-equity');
        const segLoan = document.getElementById('chart-segment-loan');
        const valEquity = document.getElementById('chart-val-equity');
        const valLoan = document.getElementById('chart-val-loan');
        const lblVal = document.getElementById('chart-lbl-val');

        const segExcess = document.getElementById('chart-segment-excess');
        const segBuyout = document.getElementById('chart-segment-buyout');
        const valExcess = document.getElementById('chart-val-excess');
        const valBuyout = document.getElementById('chart-val-buyout');
        const lblRefi = document.getElementById('chart-lbl-refi');

        if (segEquity && segLoan && valEquity && valLoan && lblVal) {
            const loanPct = Math.round((data.loan / data.val) * 100);
            const equityPct = 100 - loanPct;

            segEquity.style.height = equityPct + '%';
            segLoan.style.height = loanPct + '%';

            valEquity.textContent = Math.round(data.equity / 1000) + 'k';
            valLoan.textContent = Math.round(data.loan / 1000) + 'k';

            valEquity.style.display = equityPct < 15 ? 'none' : 'block';
            valLoan.style.display = loanPct < 15 ? 'none' : 'block';

            lblVal.textContent = '$' + (data.val / 1000000).toFixed(2) + 'M';
        }

        if (segExcess && segBuyout && valExcess && valBuyout && lblRefi) {
            let buyoutPct = 0;
            let excessPct = 0;
            let refiLabel = "$0 Max";
            let excessLabelText = "$0";
            let buyoutLabelText = Math.round(data.buyout / 1000) + 'k';

            if (data.l90 > 0) {
                refiLabel = '$' + Math.round(data.l90 / 1000) + 'k Max';
                if (data.l90 >= data.buyout) {
                    buyoutPct = Math.round((data.buyout / data.l90) * 100);
                    excessPct = 100 - buyoutPct;
                    excessLabelText = '$' + Math.round((data.l90 - data.buyout) / 1000) + 'k';
                } else {
                    buyoutPct = 100;
                    excessPct = 0;
                    excessLabelText = 'Short';
                }
            } else {
                buyoutPct = 100;
                excessPct = 0;
                excessLabelText = 'No Cap';
                refiLabel = '$0 Max';
            }

            segExcess.style.height = excessPct + '%';
            segBuyout.style.height = buyoutPct + '%';

            valExcess.textContent = excessLabelText;
            valBuyout.textContent = buyoutLabelText;

            valExcess.style.display = excessPct < 15 ? 'none' : 'block';
            valBuyout.style.display = buyoutPct < 15 ? 'none' : 'block';

            lblRefi.textContent = refiLabel;
        }

        // Update badges
        if (data.a90) {
            ltv90Badge.textContent = "Yes";
            ltv90Badge.className = "status-badge status-yes";
        } else {
            ltv90Badge.textContent = "No";
            ltv90Badge.className = "status-badge status-no";
        }

        if (data.a80) {
            ltv80Badge.textContent = "Yes";
            ltv80Badge.className = "status-badge status-yes";
        } else {
            ltv80Badge.textContent = "No";
            ltv80Badge.className = "status-badge status-no";
        }

        // Description text updates
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
        
        updateTimeline(5);
    }

    // 5. Dynamic Property Showcase Controller
    const searchInput = document.getElementById('search-input');
    const cityFilter = document.getElementById('city-filter');
    const sortBy = document.getElementById('sort-by');
    
    const toggleAdu = document.getElementById('toggle-adu');
    const toggleEntrance = document.getElementById('toggle-entrance');
    const toggleNoHoa = document.getElementById('toggle-no-hoa');
    const toggleBasement = document.getElementById('toggle-basement');
    
    const propGrid = document.getElementById('prop-grid');
    const resultsCount = document.getElementById('results-count');
    const btnShowMore = document.getElementById('btn-show-more');
    const showMoreContainer = document.getElementById('show-more-container');

    let currentPage = 1;
    const pageSize = 6;
    let filteredProperties = [];
    let selectedCompareMls = [];

    function createPropertyCard(prop) {
        const formattedPrice = '$' + prop.price.toLocaleString();
        const formattedLot = prop.lot_size.toFixed(2) + ' Acres';
        const formattedHoa = prop.hoa_fee > 0 ? `📝 HOA: $${prop.hoa_fee}/mo` : '🚫 HOA: $0';
        const displayRating = prop.avg_rating ? `${prop.avg_rating} / 5` : 'N/A';
        
        let badgesHtml = '';
        if (prop.adu === 'Yes') {
            badgesHtml += `<span class="prop-badge prop-badge-adu">ADU</span>`;
        }
        if (prop.private_entrance === 'Yes') {
            badgesHtml += `<span class="prop-badge prop-badge-entrance">Private Entry</span>`;
        }
        if (prop.finished_basement === 'Yes') {
            badgesHtml += `<span class="prop-badge prop-badge-basement">Basement</span>`;
        }
        if (prop.hoa_fee === 0) {
            badgesHtml += `<span class="prop-badge prop-badge-nohoa">No HOA</span>`;
        }

        const utahRealEstateUrl = `https://www.utahrealestate.com/report/public.single.report/report/detailed/listno/${prop.mls}`;

        return `
            <div class="prop-card">
                <div class="prop-img-wrapper">
                    <img src="${prop.photo_url}" alt="${prop.street}, ${prop.city}, UT" loading="lazy">
                    <span class="prop-rating-tag">Rating: ${displayRating}</span>
                </div>
                <div class="prop-details">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                        <div class="prop-price" style="margin-bottom: 0;">${formattedPrice}</div>
                        <label class="compare-checkbox-label">
                            <input type="checkbox" class="prop-compare-check" data-mls="${prop.mls}" ${selectedCompareMls.includes(prop.mls) ? 'checked' : ''}>
                            <span class="compare-custom-check"></span>
                            <span>Compare</span>
                        </label>
                    </div>
                    <div class="prop-address">${prop.street}<br>${prop.city}, UT</div>
                    
                    <div class="prop-badge-container">
                        ${badgesHtml}
                    </div>
                    
                    <div class="prop-meta-grid">
                        <span>📐 ${prop.sq_ft.toLocaleString()} Sq. Ft.</span>
                        <span>🌳 ${formattedLot}</span>
                        <span>🏠 Built in ${prop.year_built}</span>
                        <span>${formattedHoa}</span>
                    </div>
                    
                    <a href="${utahRealEstateUrl}" target="_blank" rel="noopener" class="prop-action-btn">
                        View on UtahRealEstate.com
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }

    function renderProperties() {
        if (currentPage === 1) {
            propGrid.innerHTML = '';
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageSlice = filteredProperties.slice(startIndex, endIndex);

        let html = '';
        pageSlice.forEach(prop => {
            html += createPropertyCard(prop);
        });

        propGrid.insertAdjacentHTML('beforeend', html);

        // Update count text
        const displayedCount = Math.min(currentPage * pageSize, filteredProperties.length);
        resultsCount.textContent = `Showing ${displayedCount} of ${filteredProperties.length} properties`;

        // Update show more button visibility
        if (displayedCount < filteredProperties.length) {
            showMoreContainer.style.display = 'flex';
        } else {
            showMoreContainer.style.display = 'none';
        }

        attachCompareListeners();
    }

    function filterAndSortProperties() {
        currentPage = 1;
        
        const searchQuery = searchInput.value.toLowerCase().trim();
        const cityValue = cityFilter.value;
        
        const filterAdu = toggleAdu.checked;
        const filterEntrance = toggleEntrance.checked;
        const filterNoHoa = toggleNoHoa.checked;
        const filterBasement = toggleBasement.checked;
        
        const sortValue = sortBy.value;

        // Apply filters
        filteredProperties = PROPERTIES_DATA.filter(prop => {
            // Search Query Filter
            if (searchQuery) {
                const streetMatch = prop.street ? prop.street.toLowerCase().includes(searchQuery) : false;
                const cityMatch = prop.city ? prop.city.toLowerCase().includes(searchQuery) : false;
                if (!streetMatch && !cityMatch) return false;
            }

            // City Filter
            if (cityValue !== 'all') {
                if (prop.city !== cityValue) return false;
            }

            // Toggles
            if (filterAdu && prop.adu !== 'Yes') return false;
            if (filterEntrance && prop.private_entrance !== 'Yes') return false;
            if (filterNoHoa && prop.hoa_fee > 0) return false;
            if (filterBasement && prop.finished_basement !== 'Yes') return false;

            return true;
        });

        // Apply sorting
        filteredProperties.sort((a, b) => {
            if (sortValue === 'rating-desc') {
                const ratingA = a.avg_rating || 0;
                const ratingB = b.avg_rating || 0;
                return ratingB - ratingA;
            } else if (sortValue === 'price-asc') {
                return a.price - b.price;
            } else if (sortValue === 'price-desc') {
                return b.price - a.price;
            } else if (sortValue === 'sqft-desc') {
                return b.sq_ft - a.sq_ft;
            }
            return 0;
        });

        renderProperties();
    }

    // Attach listeners
    if (searchInput) searchInput.addEventListener('input', filterAndSortProperties);
    if (cityFilter) cityFilter.addEventListener('change', filterAndSortProperties);
    if (sortBy) sortBy.addEventListener('change', filterAndSortProperties);
    
    [toggleAdu, toggleEntrance, toggleNoHoa, toggleBasement].forEach(toggle => {
        if (toggle) toggle.addEventListener('change', filterAndSortProperties);
    });

    if (btnShowMore) {
        btnShowMore.addEventListener('click', () => {
            currentPage++;
            renderProperties();
        });
    }

    // Property Comparison UI Operations
    const compareTray = document.getElementById('compare-tray');
    const compareCount = document.getElementById('compare-count');
    const compareThumbnails = document.getElementById('compare-thumbnails');
    const btnCompareNow = document.getElementById('btn-compare-now');
    const btnCompareClear = document.getElementById('btn-compare-clear');

    const compareModalOverlay = document.getElementById('compare-modal-overlay');
    const compareModalClose = document.getElementById('compare-modal-close');
    const compareModalBody = document.getElementById('compare-modal-body');

    function attachCompareListeners() {
        const checks = document.querySelectorAll('.prop-compare-check');
        checks.forEach(check => {
            // Remove existing listener to avoid duplication
            const newCheck = check.cloneNode(true);
            check.parentNode.replaceChild(newCheck, check);
            
            newCheck.addEventListener('change', (e) => {
                const mls = e.target.getAttribute('data-mls');
                if (e.target.checked) {
                    if (selectedCompareMls.length >= 3) {
                        e.target.checked = false;
                        alert("You can compare up to 3 properties at a time.");
                        return;
                    }
                    if (!selectedCompareMls.includes(mls)) {
                        selectedCompareMls.push(mls);
                    }
                } else {
                    selectedCompareMls = selectedCompareMls.filter(id => id !== mls);
                }
                updateCompareTray();
            });
        });
    }

    function updateCompareTray() {
        if (!compareTray) return;
        
        if (selectedCompareMls.length > 0) {
            compareTray.classList.add('active');
        } else {
            compareTray.classList.remove('active');
        }

        if (compareCount) compareCount.textContent = selectedCompareMls.length;

        if (btnCompareNow) btnCompareNow.disabled = selectedCompareMls.length < 2;

        if (compareThumbnails) {
            compareThumbnails.innerHTML = '';
            selectedCompareMls.forEach(mls => {
                const prop = PROPERTIES_DATA.find(p => p.mls === mls);
                if (prop) {
                    const img = document.createElement('img');
                    img.src = prop.photo_url;
                    img.className = 'compare-thumb-img';
                    img.alt = prop.street;
                    img.title = prop.street + ' - Click to remove';
                    img.addEventListener('click', () => {
                        selectedCompareMls = selectedCompareMls.filter(id => id !== mls);
                        updateCompareTray();
                        const checkbox = document.querySelector(`.prop-compare-check[data-mls="${mls}"]`);
                        if (checkbox) checkbox.checked = false;
                    });
                    compareThumbnails.appendChild(img);
                }
            });
        }
    }

    if (btnCompareClear) {
        btnCompareClear.addEventListener('click', () => {
            selectedCompareMls = [];
            updateCompareTray();
            document.querySelectorAll('.prop-compare-check').forEach(chk => chk.checked = false);
        });
    }

    if (btnCompareNow) {
        btnCompareNow.addEventListener('click', () => {
            openCompareModal();
        });
    }

    if (compareModalClose) {
        compareModalClose.addEventListener('click', () => {
            if (compareModalOverlay) compareModalOverlay.classList.remove('active');
        });
    }

    if (compareModalOverlay) {
        compareModalOverlay.addEventListener('click', (e) => {
            if (e.target === compareModalOverlay) {
                compareModalOverlay.classList.remove('active');
            }
        });
    }

    function openCompareModal() {
        if (selectedCompareMls.length < 2) return;
        
        const props = selectedCompareMls.map(mls => PROPERTIES_DATA.find(p => p.mls === mls)).filter(Boolean);
        
        let headerRowHtml = '<th>Field</th>';
        let imgRowHtml = '<td>Photo</td>';
        let priceRowHtml = '<td>Price</td>';
        let addressRowHtml = '<td>Address</td>';
        let sqftRowHtml = '<td>Sq. Ft.</td>';
        let lotRowHtml = '<td>Lot Size</td>';
        let yearRowHtml = '<td>Year Built</td>';
        let bedBathRowHtml = '<td>Bed/Bath</td>';
        let basementRowHtml = '<td>Finished Basement</td>';
        let aduRowHtml = '<td>ADU Ready</td>';
        let entranceRowHtml = '<td>Private Entrance</td>';
        let hoaRowHtml = '<td>HOA Fee</td>';
        let ratingRowHtml = '<td>Average Rating</td>';
        let linkRowHtml = '<td>Action</td>';

        props.forEach(prop => {
            headerRowHtml += `<th>MLS #${prop.mls}</th>`;
            imgRowHtml += `<td><img src="${prop.photo_url}" class="compare-table-img" alt="${prop.street}"></td>`;
            priceRowHtml += `<td style="font-weight: 700; color: var(--color-accent);">$${prop.price.toLocaleString()}</td>`;
            addressRowHtml += `<td>${prop.street}, ${prop.city}</td>`;
            sqftRowHtml += `<td>${prop.sq_ft.toLocaleString()} sq ft</td>`;
            lotRowHtml += `<td>${prop.lot_size.toFixed(2)} Acres</td>`;
            yearRowHtml += `<td>${prop.year_built}</td>`;
            bedBathRowHtml += `<td>${prop.bedrooms} Bed / ${prop.bathrooms} Bath</td>`;
            basementRowHtml += `<td>${prop.finished_basement}</td>`;
            aduRowHtml += `<td>${prop.adu}</td>`;
            entranceRowHtml += `<td>${prop.private_entrance}</td>`;
            hoaRowHtml += `<td>$${prop.hoa_fee}/mo</td>`;
            ratingRowHtml += `<td style="font-weight: 600;">${prop.avg_rating || 'N/A'} / 5</td>`;
            
            const utahRealEstateUrl = `https://www.utahrealestate.com/report/public.single.report/report/detailed/listno/${prop.mls}`;
            linkRowHtml += `<td><a href="${utahRealEstateUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border-radius: var(--radius-sm);">View Details</a></td>`;
        });

        const tableHtml = `
            <div class="compare-table-container">
                <table class="compare-table">
                    <thead>
                        <tr>${headerRowHtml}</tr>
                    </thead>
                    <tbody>
                        <tr>${imgRowHtml}</tr>
                        <tr>${priceRowHtml}</tr>
                        <tr>${addressRowHtml}</tr>
                        <tr>${sqftRowHtml}</tr>
                        <tr>${lotRowHtml}</tr>
                        <tr>${yearRowHtml}</tr>
                        <tr>${bedBathRowHtml}</tr>
                        <tr>${basementRowHtml}</tr>
                        <tr>${aduRowHtml}</tr>
                        <tr>${entranceRowHtml}</tr>
                        <tr>${hoaRowHtml}</tr>
                        <tr>${ratingRowHtml}</tr>
                        <tr>${linkRowHtml}</tr>
                    </tbody>
                </table>
            </div>
        `;

        if (compareModalBody) compareModalBody.innerHTML = tableHtml;
        if (compareModalOverlay) compareModalOverlay.classList.add('active');
    }

    // 6. Scroll-Reveal Animation Logic
    const revealSections = document.querySelectorAll('.reveal-on-scroll');
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -55px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // keep revealed
            }
        });
    }, revealObserverOptions);

    revealSections.forEach(section => {
        revealObserver.observe(section);
    });

    // Initial load
    if (propGrid) {
        filterAndSortProperties();
    }
});
