const MOBILE_BREAKPOINT = 1060;
const LAST_ONBOARDING_STEP = 5;
const STEP_IDS = [1, 2, 3, 4, 5];
const DEFAULT_ONBOARDING_BACKGROUND = '#131313';
const THANK_YOU_SUMMARY_STORAGE_KEY = 'seashellStudioThankYouSummary';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const backgroundModeMap = {
    'mode-light': 'light',
    'mode-palette': 'palette',
    'mode-dark': 'dark'
};

let currentStep = 0; // 0 = Landing, 1-5 = Onboarding Steps
const onboardingStepLabels = {
    1: 'Colour Palette',
    2: 'Style',
    3: 'Layout',
    4: 'Features',
    5: 'Final Details'
};

function $(selector, root = document) {
    return root ? root.querySelector(selector) : null;
}

function $$(selector, root = document) {
    return root ? Array.from(root.querySelectorAll(selector)) : [];
}

function isMobileViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function isOnboardingStep(step = currentStep) {
    return step >= 1 && step <= LAST_ONBOARDING_STEP;
}

function getActiveBackgroundMode() {
    const activeBgMode = $('.mode-option.active');
    return activeBgMode ? backgroundModeMap[activeBgMode.id] || 'dark' : 'dark';
}

function observeResize(elements, callback) {
    if (!('ResizeObserver' in window)) return;
    const observer = new ResizeObserver(callback);
    elements.filter(Boolean).forEach(element => observer.observe(element));
}

function updatePaletteScrollHeight() {
    const paletteShell = document.querySelector('#step-1 .palette-scroll-shell');
    const paletteViewport = document.querySelector('#step-1 .palette-scroll-viewport');
    const paletteGrid = document.querySelector('#step-1 .palette-grid');

    if (!paletteShell || !paletteViewport || !paletteGrid) return;

    if (!isMobileViewport()) {
        paletteShell.style.removeProperty('height');
        paletteShell.style.removeProperty('max-height');
        paletteViewport.style.removeProperty('height');
        paletteViewport.style.removeProperty('max-height');
        return;
    }

    const viewportStyles = window.getComputedStyle(paletteViewport);
    const gridStyles = window.getComputedStyle(paletteGrid);
    const paddingLeft = parseFloat(viewportStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(viewportStyles.paddingRight) || 0;
    const paddingTop = parseFloat(viewportStyles.paddingTop) || 0;
    const paddingBottom = parseFloat(viewportStyles.paddingBottom) || 0;
    const columnGap = parseFloat(gridStyles.columnGap) || 0;
    const availableWidth = paletteViewport.clientWidth - paddingLeft - paddingRight;

    if (availableWidth <= 0) return;

    const columnCount = 4;
    const visibleRows = 3;
    const cardWidth = (availableWidth - (columnGap * (columnCount - 1))) / columnCount;
    const cardHeight = cardWidth / 2;
    const targetHeight = paddingTop + paddingBottom + (cardHeight * visibleRows) + (columnGap * (visibleRows - 1));

    paletteShell.style.height = `${targetHeight}px`;
    paletteShell.style.maxHeight = `${targetHeight}px`;
    paletteViewport.style.height = `${targetHeight}px`;
    paletteViewport.style.maxHeight = `${targetHeight}px`;
}

function updatePaletteScrollAffordance() {
    const paletteShell = document.querySelector('#step-1 .palette-scroll-shell');
    const paletteViewport = document.querySelector('#step-1 .palette-scroll-viewport');

    if (!paletteShell || !paletteViewport) return;

    const overflowThreshold = 2;
    const hasOverflow = paletteViewport.scrollHeight - paletteViewport.clientHeight > overflowThreshold;
    const isAtBottom = !hasOverflow || (paletteViewport.scrollTop + paletteViewport.clientHeight >= paletteViewport.scrollHeight - overflowThreshold);

    paletteShell.classList.toggle('has-overflow', hasOverflow);
    paletteShell.classList.toggle('is-at-bottom', isAtBottom);
}

function initializePaletteScrollAffordance() {
    const paletteShell = document.querySelector('#step-1 .palette-scroll-shell');
    const paletteViewport = document.querySelector('#step-1 .palette-scroll-viewport');
    const paletteGrid = document.querySelector('#step-1 .palette-grid');

    if (!paletteShell || !paletteViewport) return;

    if (!paletteShell.dataset.scrollAffordanceBound) {
        paletteViewport.addEventListener('scroll', updatePaletteScrollAffordance, { passive: true });
        paletteShell.dataset.scrollAffordanceBound = 'true';
    }

    if ('ResizeObserver' in window && !paletteShell.dataset.scrollAffordanceObserved) {
        const paletteObserver = new ResizeObserver(() => {
            updatePaletteScrollHeight();
            updatePaletteScrollAffordance();
        });

        paletteObserver.observe(paletteShell);
        paletteObserver.observe(paletteViewport);

        if (paletteGrid) {
            paletteObserver.observe(paletteGrid);
        }

        paletteShell.dataset.scrollAffordanceObserved = 'true';
    }

    updatePaletteScrollAffordance();
}

function updateMobileProgress() {
    const mobileShell = document.getElementById('mobile-progress-shell');
    if (!mobileShell) return;

    const isVisibleStep = isOnboardingStep();
    mobileShell.style.display = isVisibleStep ? '' : 'none';

    if (!isVisibleStep) return;

    const stepLabel = document.getElementById('mobile-step-label');
    const stepName = document.getElementById('mobile-step-name');

    if (stepLabel) {
        stepLabel.textContent = `Step ${currentStep} of ${LAST_ONBOARDING_STEP}`;
    }

    if (stepName) {
        stepName.textContent = onboardingStepLabels[currentStep] || '';
    }

    $$('.mobile-progress-segment').forEach(segment => {
        const stepNumber = parseInt(segment.getAttribute('data-step'), 10);
        segment.classList.toggle('active', stepNumber === currentStep);
        segment.classList.toggle('complete', stepNumber < currentStep);
    });
}

function updateMobileHeaderOffset() {
    const onboardingView = document.getElementById('view-onboarding');
    const mobileShell = document.getElementById('mobile-progress-shell');

    if (!onboardingView || !mobileShell) return;

    if (!isMobileViewport() || !isOnboardingStep()) {
        onboardingView.style.setProperty('--mobile-progress-shell-height', '0px');
        return;
    }

    const shellHeight = Math.ceil(mobileShell.getBoundingClientRect().height);
    onboardingView.style.setProperty('--mobile-progress-shell-height', `${shellHeight}px`);
}

function updateMobileActionBarOffset() {
    const onboardingView = document.getElementById('view-onboarding');
    const actionBar = $('.floating-action-btn');

    if (!onboardingView || !actionBar) return;

    if (!isMobileViewport() || !isOnboardingStep()) {
        onboardingView.style.setProperty('--mobile-floating-action-height', '3rem');
        return;
    }

    const actionBarHeight = Math.ceil(actionBar.getBoundingClientRect().height);
    onboardingView.style.setProperty('--mobile-floating-action-height', `${actionBarHeight}px`);
}

/** Desktop-only: fit #step-4-mobile-fit into the step (mobile uses updateStepCompositionScale). */
function updateStepFourDesktopCompositionScale() {
    const stepFour = document.getElementById('step-4');
    const fit = document.getElementById('step-4-mobile-fit');

    if (!stepFour || !fit || !stepFour.classList.contains('active')) return;
    if (isMobileViewport()) return;

    stepFour.style.setProperty('--step-4-fit-scale', '1');

    const stepStyle = getComputedStyle(stepFour);
    const paddingTop = parseFloat(stepStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(stepStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(stepStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(stepStyle.paddingRight) || 0;
    const availableHeight = stepFour.clientHeight - paddingTop - paddingBottom;
    const availableWidth = stepFour.clientWidth - paddingLeft - paddingRight;

    const prevHeight = fit.style.height;
    fit.style.height = 'auto';
    const contentHeight = fit.scrollHeight;
    const contentWidth = fit.scrollWidth;
    fit.style.height = prevHeight;

    if (!availableWidth || !availableHeight || !contentWidth || !contentHeight) return;

    const scale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);
    stepFour.style.setProperty('--step-4-fit-scale', scale.toFixed(4));
}

function resetStepFourMobileTransformState() {
    const stepFour = document.getElementById('step-4');
    if (!stepFour) return;
    if (isMobileViewport()) {
        stepFour.style.setProperty('--step-4-fit-scale', '1');
    }
    stepFour.style.setProperty('--step-4-translate-y', '0px');
}

function updateStepCompositionScale(stepId, contentId, cssVariable, maxScale = 1) {
    const step = document.getElementById(stepId);
    const viewport = step ? step.querySelector('.step-mobile-fit-viewport') : null;
    const content = document.getElementById(contentId);

    if (!step) return;

    step.style.setProperty(cssVariable, '1');

    if (isMobileViewport() || !viewport || !content || !step.classList.contains('active')) {
        return;
    }

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;

    if (!viewportWidth || !viewportHeight || !contentWidth || !contentHeight) return;

    const scale = Math.min(maxScale, viewportWidth / contentWidth, viewportHeight / contentHeight);
    step.style.setProperty(cssVariable, scale.toFixed(4));
}

function updateFinalDetailsReferenceAlignment() {
    const step = document.getElementById('step-5');
    const locationField = document.getElementById('input-location');
    const referenceField = document.getElementById('input-reference');

    if (!step || !locationField || !referenceField) return;

    referenceField.style.height = '';

    if (isMobileViewport() || !step.classList.contains('active')) {
        return;
    }

    const locationBottom = locationField.getBoundingClientRect().bottom;
    const referenceBottom = referenceField.getBoundingClientRect().bottom;
    const delta = locationBottom - referenceBottom;

    if (Math.abs(delta) < 0.5) return;

    const nextHeight = Math.max(40, referenceField.offsetHeight + delta);
    referenceField.style.height = `${nextHeight}px`;
}

function updateOnboardingStepScales() {
    updateStepCompositionScale('step-1', 'step-1-mobile-fit', '--step-1-mobile-scale');
    updateStepCompositionScale('step-2', 'step-2-mobile-fit', '--step-2-mobile-scale');
    updateStepCompositionScale('step-3', 'step-3-mobile-fit', '--step-3-mobile-scale');
    updateStepCompositionScale('step-4', 'step-4-mobile-fit', '--step-4-mobile-scale');
    updateStepCompositionScale('step-5', 'step-5-mobile-fit', '--step-5-mobile-scale');
    resetStepFourMobileTransformState();
    updateStepFourDesktopCompositionScale();
    requestAnimationFrame(() => {
        if (currentStep === 3) {
            syncLayoutPreviewDensity();
        }
        resetStepFourMobileTransformState();
        requestAnimationFrame(() => {
            resetStepFourMobileTransformState();
            requestAnimationFrame(updateFinalDetailsReferenceAlignment);
        });
    });
}

function getSelectedFeatureCount() {
    const stepFour = document.getElementById('step-4');
    if (!stepFour) return 0;
    return stepFour.querySelectorAll('.glass-card.selected').length;
}

function setFeatureSectionSelected(cardElement, isSelected) {
    if (!cardElement) return;
    cardElement.classList.toggle('selected', isSelected);
    if (currentStep === 4) {
        updateNavigationButtons();
    }
}

window.syncLanguageFeatureState = function() {
    const languageCard = $('.language-card');
    const languageInput = document.getElementById('language-input');
    const hasLanguage = !!languageInput && languageInput.value.trim().length > 0;
    const languageFieldGroup = languageInput ? languageInput.closest('.language-field-group') : null;

    if (languageFieldGroup) {
        languageFieldGroup.classList.toggle('has-value', hasLanguage);
    }

    setFeatureSectionSelected(languageCard, hasLanguage);
};

window.syncSocialFeatureState = function() {
    const socialCard = $('.social-card');
    const activePlatforms = socialCard ? $$('.social-option.is-selected', socialCard).length : 0;
    setFeatureSectionSelected(socialCard, activePlatforms > 0);
}

function updateNavigationButtons() {
    const nextBtn = document.getElementById('btn-next');

    if (!nextBtn) return;

    if (currentStep === 5) {
        nextBtn.textContent = 'Submit';
        return;
    }

    if (currentStep === 4) {
        nextBtn.textContent = getSelectedFeatureCount() > 0 ? 'Next' : 'Skip';
        return;
    }

    nextBtn.textContent = 'Next';
}

function updateView() {
    // Top-level View Toggling
    const landingView = document.getElementById('view-landing');
    const onboardingView = document.getElementById('view-onboarding');
    document.body.classList.toggle('features-step-active', currentStep === 4);
    document.body.classList.toggle('step-5-active', currentStep === 5);

    if (currentStep === 0) {
        landingView.classList.add('active');
        onboardingView.classList.remove('active');
    } else {
        landingView.classList.remove('active');
        onboardingView.classList.add('active');
        
        // Update Steps Visibility
        // Active step is flex-displayed immediately so its fade-in can run.
        // Inactive steps keep display:flex through their 0.4s fade-out, then
        // get display:none so they no longer affect layout or measurement.
        STEP_IDS.forEach(i => {
            const stepEl = document.getElementById(`step-${i}`);
            if (!stepEl) return;
            const willBeActive = i === currentStep;
            if (willBeActive) {
                stepEl.style.display = 'flex';
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
                setTimeout(() => {
                    if (!stepEl.classList.contains('active')) {
                        stepEl.style.display = 'none';
                    }
                }, 450);
            }
        });

        const sidebar = $('.sidebar');
        const actionBar = $('.floating-action-btn');
        if (sidebar) sidebar.style.display = 'flex';
        if (actionBar) actionBar.style.display = 'flex';
        
        // Update Sidebar Nav
        $$('.nav-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.getAttribute('data-step'), 10) === currentStep);
        });

        updateNavigationButtons();

        // Theme Isolation: Only Step 1 allows background customisation
        const mainContainer = $('.onboarding-main');
        if (currentStep !== 1 && mainContainer) {
            mainContainer.style.background = DEFAULT_ONBOARDING_BACKGROUND;
        } else if (currentStep === 1) {
            updateBgMode(getActiveBackgroundMode());
        }
    }

    updateMobileProgress();
    requestAnimationFrame(() => {
        updateMobileHeaderOffset();
        updateMobileActionBarOffset();
        updatePaletteScrollHeight();
        updatePaletteScrollAffordance();
        updateOnboardingStepScales();
        requestAnimationFrame(() => {
            updateOnboardingStepScales();
        });
    });
}

function navigateToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex <= LAST_ONBOARDING_STEP) {
        currentStep = stepIndex;
        updateView();
    }
}

function validateField(inputElement, isInvalid) {
    if (!inputElement) return false;
    const invalid = isInvalid(inputElement.value.trim());
    inputElement.classList.toggle('input-error', invalid);
    return invalid;
}

function getSelectedPaletteValue() {
    const activePaletteEl = $('.palette-option.active-palette');
    if (!activePaletteEl) {
        return selectedPaletteColor;
    }

    const paletteGrid = activePaletteEl.parentElement;
    if (!paletteGrid || !paletteGrid.classList.contains('palette-grid')) {
        return selectedPaletteColor;
    }

    const index = Array.from(paletteGrid.children).indexOf(activePaletteEl);
    if (index === -1) {
        return selectedPaletteColor;
    }

    const cols = 6;
    const rows = 4;
    const x = (index % cols) + 1;
    const y = rows - Math.floor(index / cols);
    return `${x},${y}`;
}

function getOptionalFeatures() {
    const optionalFeatures = [];

    $$('.feature-toggle-card.selected').forEach(card => {
        const title = $('.card-title', card)?.innerText;
        if (title) {
            optionalFeatures.push(title);
        }
    });

    const selectedSocials = $$('.social-option.is-selected')
        .map(button => $('.social-option-name', button)?.innerText.trim())
        .filter(Boolean);

    if (selectedSocials.length > 0) {
        optionalFeatures.push(...selectedSocials);
    }

    const languageValue = document.getElementById('language-input')?.value.trim();
    if (languageValue) {
        optionalFeatures.push(`Language: ${languageValue}`);
    }

    return optionalFeatures;
}

window.nextStep = async function() {
    if (currentStep < 5) {
        navigateToStep(currentStep + 1);
    } else if (currentStep === 5) {
        const nextBtn = document.getElementById('btn-next');
        const prevText = nextBtn.innerText;
        nextBtn.innerText = "Submitting...";
        nextBtn.disabled = true;

        try {
            const colourPalette = getSelectedPaletteValue();
            const activeFontEl = $('.font-option-card.active');
            const stylePreference = activeFontEl ? activeFontEl.getAttribute('data-font') : '';
            const layoutSections = sections.filter(s => s.active).map(s => s.id);
            const optionalFeatures = getOptionalFeatures();

            const businessNameInput = document.getElementById('input-business-name');
            const emailInput = document.getElementById('input-email');
            const customersInput = document.getElementById('input-customers');
            const locationInput = document.getElementById('input-location');

            const businessName = businessNameInput.value.trim();
            const email = emailInput.value.trim();
            const mainCustomers = customersInput.value.trim();
            const location = locationInput.value.trim();

            const activeTimelineEl = $('.timeline-btn.active');
            const timeline = activeTimelineEl ? activeTimelineEl.innerText : '';
            const references = document.getElementById('input-reference')?.value || '';
            const finalNotes = document.getElementById('input-final-notes')?.value || '';

            const hasError = [
                validateField(businessNameInput, value => !value),
                validateField(emailInput, value => !value || !emailRegex.test(value)),
                validateField(customersInput, value => !value),
                validateField(locationInput, value => !value)
            ].some(Boolean);

            if (hasError) {
                nextBtn.innerText = prevText;
                nextBtn.disabled = false;
                return;
            }

            if (!window.supabase) {
                throw new Error("Supabase library failed to load. Check your connection or ad blocker.");
            }

            const supabaseUrl = 'https://gqnrotkkoibtnmjgtkpt.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxbnJvdGtrb2lidG5tamd0a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NjE2MDEsImV4cCI6MjA5MDIzNzYwMX0.kagTDYzlTfhAqhRuVw6D3Si6MRcdGe7F_X-lRyhFN3M';
            const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
            const backgroundColour = getActiveBackgroundMode();

            const { error } = await supabaseClient
                .from('onboarding_submissions')
                .insert([
                    {
                        colour_palette: colourPalette,
                        background_colour: backgroundColour,
                        font: stylePreference,
                        layout_sections: layoutSections,
                        optional_features: optionalFeatures,
                        business_name: businessName,
                        email: email,
                        main_customers: mainCustomers,
                        location: location,
                        timeline: timeline,
                        references: references,
                        final_notes: finalNotes
                    }
                ]);

            if (error) throw error;

            window.sessionStorage.setItem(THANK_YOU_SUMMARY_STORAGE_KEY, JSON.stringify({
                palette: colourPalette ? `Palette ${colourPalette}` : '',
                backgroundMode: backgroundColour,
                font: stylePreference,
                sections: layoutSections,
                features: optionalFeatures,
                timeline,
                references,
                finalNotes,
                form: {
                    businessName,
                    email,
                    customers: mainCustomers,
                    location
                }
            }));
            
            window.location.href = 'thank-you.html';
        } catch (error) {
            console.error('Error submitting form:', error);
            alert("There was an issue submitting your request. Please try again: " + error.message);
            nextBtn.innerText = prevText;
            nextBtn.disabled = false;
        }
    }
}

window.prevStep = function() {
    if (currentStep > 0) {
        navigateToStep(currentStep - 1);
    }
}

// Functionality for Step 4 Toggle Cards
function toggleCard(buttonElement) {
    buttonElement.classList.toggle('selected');
    if (buttonElement.hasAttribute('aria-pressed')) {
        const isPressed = buttonElement.classList.contains('selected');
        buttonElement.setAttribute('aria-pressed', String(isPressed));
    }
    if (currentStep === 4) {
        updateNavigationButtons();
    }
}

window.handleFeatureCardKey = function(event, cardElement) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleCard(cardElement);
};

window.setLanguageSuggestion = function(event, language) {
    if (event) event.stopPropagation();
    const languageInput = document.getElementById('language-input');
    if (!languageInput) return;
    languageInput.value = language;
    languageInput.focus();
    syncLanguageFeatureState();
};

window.clearLanguageInput = function(event) {
    if (event) event.stopPropagation();
    const languageInput = document.getElementById('language-input');
    if (!languageInput) return;
    languageInput.value = '';
    syncLanguageFeatureState();
    languageInput.focus();
};

window.toggleSelectableOption = function(event, buttonElement) {
    if (event) event.stopPropagation();
    const nextPressed = buttonElement.getAttribute('aria-pressed') !== 'true';
    buttonElement.setAttribute('aria-pressed', String(nextPressed));
    buttonElement.classList.toggle('is-selected', nextPressed);
    syncSocialFeatureState();
};

// Functionality for Step 1
let selectedPaletteColor = '#CDEFF0';
let currentMode = 'dark';

function getRgbValues(colorValue) {
    if (!colorValue) return { r: 0, g: 0, b: 0 };

    if (colorValue.startsWith('#')) {
        let hex = colorValue.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    const rgbMatch = colorValue.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
        return {
            r: parseInt(rgbMatch[0], 10),
            g: parseInt(rgbMatch[1], 10),
            b: parseInt(rgbMatch[2], 10)
        };
    }

    return { r: 0, g: 0, b: 0 };
}

function relativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

window.selectPalette = function(el, color) {
    document.querySelectorAll('.palette-option').forEach(div => {
        div.classList.remove('active-palette');
    });
    el.classList.add('active-palette');
    selectedPaletteColor = el.children[4]?.style.backgroundColor || color;
    updateBgMode(currentMode);
};

window.updateBgMode = function(mode) {
    currentMode = mode;
    $$('.mode-option').forEach(opt => {
        opt.classList.remove('active');
        $('.custom-radio', opt)?.classList.remove('active');
        $('.radio-dot', opt)?.classList.remove('active');
    });
    const selected = document.getElementById('mode-' + mode);
    if (selected) {
        selected.classList.add('active');
        $('.custom-radio', selected)?.classList.add('active');
        $('.radio-dot', selected)?.classList.add('active');
    }

    const step1El = document.getElementById('step-1');
    const mainContainer = $('.onboarding-main');
    step1El.classList.remove('theme-light', 'theme-match-palette', 'light-mode-active');
    
    const bgIcon = $('#step-1 .seashell-bg-icon');

    if (mode === 'dark') {
        const darkBg = DEFAULT_ONBOARDING_BACKGROUND;
        step1El.style.background = darkBg;
        if (mainContainer) mainContainer.style.background = darkBg;
        if (bgIcon) bgIcon.style.opacity = '0.03';
        
    } else if (mode === 'light') {
        const rgb = getRgbValues(selectedPaletteColor);
        const lightBgBase = '#FCFBF9';
        // Note: We only apply to the parent container IF we are currently on Step 1.
        // Isolation logic in updateView handles the reset for other steps.
        const lightGrad = `radial-gradient(120% 120% at 0% 0%, rgba(${rgb.r},${rgb.g},${rgb.b}, 0.05) 0%, ${lightBgBase} 100%)`;
        step1El.style.background = lightGrad;
        if (mainContainer && currentStep === 1) mainContainer.style.background = lightBgBase; 
        
        step1El.classList.add('theme-light');
        if (bgIcon) bgIcon.style.opacity = '0.02'; 
        
    } else if (mode === 'palette') {
        const rgb = getRgbValues(selectedPaletteColor);
        const mix = 0.15;
        const br = Math.round(9 + (rgb.r - 9) * mix);
        const bg = Math.round(9 + (rgb.g - 9) * mix);
        const bb = Math.round(11 + (rgb.b - 11) * mix);
        const flatBg = `rgb(${br}, ${bg}, ${bb})`;
        step1El.style.background = flatBg;
        if (mainContainer && currentStep === 1) mainContainer.style.background = flatBg;

        step1El.classList.add('theme-match-palette');

        step1El.style.setProperty('--match-bg-r', br);
        step1El.style.setProperty('--match-bg-g', bg);
        step1El.style.setProperty('--match-bg-b', bb);

        const isWarm = (rgb.r > 200 && rgb.g > 100 && rgb.g < 180 && rgb.b < 100);
        if (bgIcon) bgIcon.style.opacity = isWarm ? '0.005' : '0.03';
    }

    requestAnimationFrame(() => {
        updatePaletteScrollHeight();
        updatePaletteScrollAffordance();
        updateOnboardingStepScales();
    });
};

// --- Step 3: Layout Architect ---
const sections = [
    { id: 'hero', name: 'Hero Section', active: true, icon: 'view_quilt', locked: true },
    { id: 'about', name: 'About Services', active: false, icon: 'info' },
    { id: 'gallery', name: 'Gallery', active: false, icon: 'image' },
    { id: 'testimonials', name: 'Testimonials', active: false, icon: 'forum' },
    { id: 'bookings', name: 'Bookings', active: false, icon: 'calendar_month' },
    { id: 'pricing', name: 'Pricing', active: false, icon: 'payments' },
    { id: 'team', name: 'Team', active: false, icon: 'group' },
    { id: 'contact', name: 'Contact', active: false, icon: 'description' },
    { id: 'footer', name: 'Footer', active: true, icon: 'view_stream', locked: true }
];

const LAYOUT_PREVIEW_DENSITY_ORDER = ['relaxed', 'balanced', 'compact', 'dense', 'micro'];
const LAYOUT_PREVIEW_PREFERRED_DENSITY = {
    2: 'relaxed',
    3: 'balanced',
    4: 'compact',
    5: 'compact',
    6: 'dense',
    7: 'micro',
    8: 'micro'
};

const LAYOUT_PREVIEW_DENSITY_PRESETS = {
    relaxed: {
        '--preview-font-scale': '0.88',
        '--preview-header-pad-y': '0.72rem',
        '--preview-header-pad-x': '0.88rem',
        '--preview-canvas-pad-top': '0.72rem',
        '--preview-canvas-pad-x': '0.8rem',
        '--preview-canvas-pad-bottom': '0.64rem',
        '--preview-canvas-gap': '0.32rem',
        '--preview-block-pad': '0.5rem',
        '--preview-block-gap': '0.24rem',
        '--preview-inline-gap': '0.24em',
        '--preview-grid-gap': '0.16em',
        '--preview-line-height': '0.34em',
        '--preview-hero-line-height': '0.9em',
        '--preview-chip-height': '0.95em',
        '--preview-media-size': '3.3em',
        '--preview-avatar-size': '0.92em',
        '--preview-label-size': '0.38rem',
        '--preview-count-font': '0.56rem',
        '--preview-count-pad-x': '0.7rem'
    },
    balanced: {
        '--preview-font-scale': '0.8',
        '--preview-header-pad-y': '0.64rem',
        '--preview-header-pad-x': '0.78rem',
        '--preview-canvas-pad-top': '0.64rem',
        '--preview-canvas-pad-x': '0.72rem',
        '--preview-canvas-pad-bottom': '0.56rem',
        '--preview-canvas-gap': '0.24rem',
        '--preview-block-pad': '0.42rem',
        '--preview-block-gap': '0.2rem',
        '--preview-inline-gap': '0.2em',
        '--preview-grid-gap': '0.14em',
        '--preview-line-height': '0.3em',
        '--preview-hero-line-height': '0.78em',
        '--preview-chip-height': '0.8em',
        '--preview-media-size': '2.95em',
        '--preview-avatar-size': '0.84em',
        '--preview-label-size': '0.34rem',
        '--preview-count-font': '0.53rem',
        '--preview-count-pad-x': '0.62rem'
    },
    compact: {
        '--preview-font-scale': '0.72',
        '--preview-header-pad-y': '0.58rem',
        '--preview-header-pad-x': '0.72rem',
        '--preview-canvas-pad-top': '0.58rem',
        '--preview-canvas-pad-x': '0.64rem',
        '--preview-canvas-pad-bottom': '0.5rem',
        '--preview-canvas-gap': '0.2rem',
        '--preview-block-pad': '0.34rem',
        '--preview-block-gap': '0.16rem',
        '--preview-inline-gap': '0.17em',
        '--preview-grid-gap': '0.11em',
        '--preview-line-height': '0.26em',
        '--preview-hero-line-height': '0.66em',
        '--preview-chip-height': '0.68em',
        '--preview-media-size': '2.55em',
        '--preview-avatar-size': '0.74em',
        '--preview-label-size': '0.31rem',
        '--preview-count-font': '0.49rem',
        '--preview-count-pad-x': '0.56rem'
    },
    dense: {
        '--preview-font-scale': '0.6',
        '--preview-header-pad-y': '0.48rem',
        '--preview-header-pad-x': '0.58rem',
        '--preview-canvas-pad-top': '0.46rem',
        '--preview-canvas-pad-x': '0.52rem',
        '--preview-canvas-pad-bottom': '0.42rem',
        '--preview-canvas-gap': '0.13rem',
        '--preview-block-pad': '0.24rem',
        '--preview-block-gap': '0.11rem',
        '--preview-inline-gap': '0.12em',
        '--preview-grid-gap': '0.08em',
        '--preview-line-height': '0.2em',
        '--preview-hero-line-height': '0.48em',
        '--preview-chip-height': '0.5em',
        '--preview-media-size': '1.92em',
        '--preview-avatar-size': '0.58em',
        '--preview-label-size': '0.26rem',
        '--preview-count-font': '0.43rem',
        '--preview-count-pad-x': '0.46rem'
    },
    micro: {
        '--preview-font-scale': '0.52',
        '--preview-header-pad-y': '0.42rem',
        '--preview-header-pad-x': '0.52rem',
        '--preview-canvas-pad-top': '0.38rem',
        '--preview-canvas-pad-x': '0.46rem',
        '--preview-canvas-pad-bottom': '0.36rem',
        '--preview-canvas-gap': '0.1rem',
        '--preview-block-pad': '0.2rem',
        '--preview-block-gap': '0.08rem',
        '--preview-inline-gap': '0.1em',
        '--preview-grid-gap': '0.07em',
        '--preview-line-height': '0.17em',
        '--preview-hero-line-height': '0.4em',
        '--preview-chip-height': '0.42em',
        '--preview-media-size': '1.58em',
        '--preview-avatar-size': '0.5em',
        '--preview-label-size': '0.23rem',
        '--preview-count-font': '0.39rem',
        '--preview-count-pad-x': '0.4rem'
    }
};

function previewLine(widthClass, extraClass = '') {
    return `<div class="preview-line ${widthClass}${extraClass ? ` ${extraClass}` : ''}"></div>`;
}

function previewBox(extraClass = '') {
    return `<div class="preview-box${extraClass ? ` ${extraClass}` : ''}"></div>`;
}

function renderHeroPreview() {
    return `
        <div class="tpl-hero preview-node preview-node--hero">
            <div class="preview-node__row preview-node__row--hero">
                <div class="preview-node__stack preview-node__stack--grow">
                    ${previewLine('preview-line--headline preview-line--w90')}
                    ${previewLine('preview-line--w72')}
                    ${previewLine('preview-line--w58')}
                    <div class="preview-chip preview-chip--cta"></div>
                </div>
                <div class="preview-media preview-media--hero"></div>
            </div>
        </div>
    `;
}

function renderAboutPreview() {
    return `
        <div class="tpl-std preview-node preview-node--about">
            <div class="preview-node__row preview-node__row--media">
                <div class="preview-media preview-media--panel"></div>
                <div class="preview-node__stack preview-node__stack--grow">
                    ${previewLine('preview-line--w78')}
                    ${previewLine('preview-line--w100')}
                    ${previewLine('preview-line--w92')}
                    ${previewLine('preview-line--w62')}
                </div>
            </div>
        </div>
    `;
}

function renderGalleryPreview() {
    return `
        <div class="tpl-std preview-node preview-node--gallery">
            <div class="preview-node__stack preview-node__stack--grow">
                <div class="preview-node__row">
                    <div class="preview-media preview-media--gallery preview-media--wide"></div>
                    <div class="preview-media preview-media--gallery"></div>
                </div>
                <div class="preview-node__row preview-node__row--gallery-secondary">
                    <div class="preview-media preview-media--gallery"></div>
                    <div class="preview-media preview-media--gallery preview-media--wide"></div>
                    <div class="preview-media preview-media--gallery"></div>
                </div>
            </div>
        </div>
    `;
}

function renderTestimonialsPreview() {
    return `
        <div class="tpl-std preview-node preview-node--testimonials">
            <div class="preview-node__row preview-node__row--equal">
                <div class="preview-card-skeleton">
                    <div class="preview-node__row preview-node__row--avatar">
                        <div class="preview-avatar"></div>
                        ${previewLine('preview-line--w46')}
                    </div>
                    ${previewLine('preview-line--w100')}
                    ${previewLine('preview-line--w78')}
                </div>
                <div class="preview-card-skeleton">
                    <div class="preview-node__row preview-node__row--avatar">
                        <div class="preview-avatar"></div>
                        ${previewLine('preview-line--w46')}
                    </div>
                    ${previewLine('preview-line--w100')}
                    ${previewLine('preview-line--w78')}
                </div>
            </div>
        </div>
    `;
}

function renderBookingsPreview() {
    return `
        <div class="tpl-std preview-node preview-node--bookings">
            <div class="preview-node__stack preview-node__stack--grow">
                <div class="preview-node__row preview-node__row--spread">
                    ${previewLine('preview-line--w38')}
                    <div class="preview-dot-group">
                        ${previewBox('preview-box--dot preview-box--accent')}
                        ${previewBox('preview-box--dot')}
                    </div>
                </div>
                <div class="preview-calendar">
                    ${Array.from({ length: 14 }, (_, index) => previewBox(index === 4 || index === 8 ? 'preview-box--cell preview-box--accent' : 'preview-box--cell')).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderPricingPreview() {
    return `
        <div class="tpl-std preview-node preview-node--pricing">
            <div class="preview-node__stack preview-node__stack--grow">
                <div class="preview-node__row preview-node__row--center">
                    ${previewLine('preview-line--w38')}
                </div>
                <div class="preview-node__row preview-node__row--equal preview-node__row--pricing">
                    <div class="preview-plan">
                        ${previewLine('preview-line--w56')}
                        <div class="preview-chip"></div>
                        <div class="preview-button-skeleton"></div>
                    </div>
                    <div class="preview-plan preview-plan--featured">
                        ${previewLine('preview-line--w56')}
                        <div class="preview-chip preview-chip--accent"></div>
                        <div class="preview-button-skeleton preview-button-skeleton--accent"></div>
                    </div>
                    <div class="preview-plan">
                        ${previewLine('preview-line--w56')}
                        <div class="preview-chip"></div>
                        <div class="preview-button-skeleton"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTeamPreview() {
    return `
        <div class="tpl-std preview-node preview-node--team">
            <div class="preview-node__stack preview-node__stack--grow preview-node__stack--center">
                ${previewLine('preview-line--w38')}
                <div class="preview-node__row preview-node__row--equal preview-node__row--team">
                    <div class="preview-profile">
                        <div class="preview-avatar preview-avatar--large"></div>
                        ${previewLine('preview-line--w60')}
                        ${previewLine('preview-line--w42 preview-line--muted')}
                    </div>
                    <div class="preview-profile">
                        <div class="preview-avatar preview-avatar--large"></div>
                        ${previewLine('preview-line--w60')}
                        ${previewLine('preview-line--w42 preview-line--muted')}
                    </div>
                    <div class="preview-profile">
                        <div class="preview-avatar preview-avatar--large"></div>
                        ${previewLine('preview-line--w60')}
                        ${previewLine('preview-line--w42 preview-line--muted')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderContactPreview() {
    return `
        <div class="tpl-std preview-node preview-node--contact">
            <div class="preview-form-skeleton">
                <div class="preview-node__row preview-node__row--equal">
                    <div class="preview-field">
                        ${previewLine('preview-line--w50 preview-line--muted')}
                        <div class="preview-input"></div>
                    </div>
                    <div class="preview-field">
                        ${previewLine('preview-line--w50 preview-line--muted')}
                        <div class="preview-input"></div>
                    </div>
                </div>
                <div class="preview-field">
                    ${previewLine('preview-line--w24 preview-line--muted')}
                    <div class="preview-input"></div>
                </div>
                <div class="preview-field preview-field--message">
                    ${previewLine('preview-line--w24 preview-line--muted')}
                    <div class="preview-input preview-input--tall"></div>
                </div>
                <div class="preview-button-skeleton preview-button-skeleton--accent preview-button-skeleton--align-end"></div>
            </div>
        </div>
    `;
}

function renderFooterPreview() {
    return `
        <div class="tpl-std preview-node preview-node--footer">
            <div class="preview-footer">
                <div class="preview-footer__left">
                    ${previewLine('preview-line--w38')}
                    ${previewLine('preview-line--w30 preview-line--muted')}
                    ${previewLine('preview-line--w30 preview-line--muted')}
                </div>
                <div class="preview-dot-group preview-dot-group--footer">
                    ${previewBox('preview-box--dot')}
                    ${previewBox('preview-box--dot')}
                    ${previewBox('preview-box--dot')}
                </div>
            </div>
        </div>
    `;
}

const sectionTemplateRenderers = {
    hero: renderHeroPreview,
    about: renderAboutPreview,
    gallery: renderGalleryPreview,
    testimonials: renderTestimonialsPreview,
    bookings: renderBookingsPreview,
    pricing: renderPricingPreview,
    team: renderTeamPreview,
    contact: renderContactPreview,
    footer: renderFooterPreview
};

function applyLayoutPreviewDensity(previewPanel, canvas, densityName, activeCount) {
    const preset = LAYOUT_PREVIEW_DENSITY_PRESETS[densityName] || LAYOUT_PREVIEW_DENSITY_PRESETS.micro;

    previewPanel.dataset.previewDensity = densityName;
    previewPanel.dataset.activeCount = String(activeCount);
    canvas.dataset.previewDensity = densityName;
    canvas.dataset.activeCount = String(activeCount);

    Object.entries(preset).forEach(([propertyName, propertyValue]) => {
        previewPanel.style.setProperty(propertyName, propertyValue);
    });
}

function layoutPreviewHasOverflow(canvas) {
    if (!canvas) return false;

    if (canvas.scrollHeight - canvas.clientHeight > 1) {
        return true;
    }

    return Array.from(canvas.querySelectorAll('.tpl-hero, .tpl-std')).some(block => (
        (block.scrollHeight - block.clientHeight > 1) ||
        (block.scrollWidth - block.clientWidth > 1)
    ));
}

function syncLayoutPreviewDensity() {
    const canvas = document.getElementById('preview-canvas');
    const previewPanel = document.querySelector('#step-3 .layout-step-preview');

    if (!canvas || !previewPanel) return;

    const activeCount = sections.filter(section => section.active).length;
    const preferredDensity = LAYOUT_PREVIEW_PREFERRED_DENSITY[activeCount] || 'micro';
    const preferredIndex = Math.max(0, LAYOUT_PREVIEW_DENSITY_ORDER.indexOf(preferredDensity));
    let appliedDensity = LAYOUT_PREVIEW_DENSITY_ORDER[LAYOUT_PREVIEW_DENSITY_ORDER.length - 1];

    for (let densityIndex = preferredIndex; densityIndex < LAYOUT_PREVIEW_DENSITY_ORDER.length; densityIndex += 1) {
        const densityName = LAYOUT_PREVIEW_DENSITY_ORDER[densityIndex];
        applyLayoutPreviewDensity(previewPanel, canvas, densityName, activeCount);

        if (!layoutPreviewHasOverflow(canvas)) {
            appliedDensity = densityName;
            break;
        }
    }

    applyLayoutPreviewDensity(previewPanel, canvas, appliedDensity, activeCount);
}

function renderList() {
    const list = document.getElementById('section-list');
    if (!list) return;
    list.innerHTML = '';
    sections.forEach(s => {
      const item = document.createElement('div');
      item.className = `section-item ${s.active ? 'active' : ''} ${s.locked ? 'locked' : ''}`;
      if (!s.locked) {
        item.onclick = () => toggleSection(s.id);
      }
      if (s.locked) {
        item.setAttribute('aria-disabled', 'true');
      }
      item.innerHTML = `
        <div class="left-group">
          <span class="material-symbols-outlined sec-icon" ${s.active ? "style=\"font-variation-settings: 'FILL' 1;\"" : ''}>${s.icon}</span>
          <span class="sec-name">${s.name}</span>
        </div>
        <span class="material-symbols-outlined sec-action">${s.active ? 'check_circle' : 'add_circle'}</span>
      `;
      list.appendChild(item);
    });
}

function renderPreview() {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return;
    const activeSections = sections.filter(s => s.active);
    canvas.innerHTML = activeSections.map(section => {
        const renderSection = sectionTemplateRenderers[section.id];
        return renderSection ? renderSection() : '';
    }).join('');
    
    const count = activeSections.length;
    const label = document.getElementById('active-sections-count');
    if (label) label.innerText = `${count} ACTIVE SECTIONS`;

    syncLayoutPreviewDensity();
}

function toggleSection(id) {
    const section = sections.find(s => s.id === id);
    if (section && !section.locked) {
      section.active = !section.active;
      renderList();
      renderPreview();
    }
}

// --- Step 5: Finish ---
window.selectTimeline = function(btn) {
    document.querySelectorAll('.timeline-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
}

// --- View Updates ---
window.selectFont = function(el) {
    $$('.font-option-card').forEach(card => {
        card.classList.remove('active');
        $('.custom-radio', card)?.classList.remove('active');
        $('.radio-dot', card)?.classList.remove('active');
        $('.font-icon', card)?.classList.remove('active-icon');
        $('.font-name', card)?.classList.remove('active-text');
        $('.font-desc', card)?.classList.remove('active-desc');
    });
    el.classList.add('active');
    $('.custom-radio', el)?.classList.add('active');
    $('.radio-dot', el)?.classList.add('active');
    $('.font-icon', el)?.classList.add('active-icon');
    $('.font-name', el)?.classList.add('active-text');
    $('.font-desc', el)?.classList.add('active-desc');

    const selectedFont = el.getAttribute('data-font');
    document.getElementById('preview-text').style.fontFamily = `'${selectedFont}', sans-serif`;
    document.getElementById('preview-paragraph').style.fontFamily = `'${selectedFont}', sans-serif`;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateView();
    syncLanguageFeatureState();
    syncSocialFeatureState();
    renderList();
    renderPreview();
    updatePaletteScrollHeight();
    initializePaletteScrollAffordance();
    updatePaletteScrollAffordance();
    updateOnboardingStepScales();

    // Real-time validation UX
    const inputsToValidate = ['input-business-name', 'input-email', 'input-customers', 'input-location'];
    inputsToValidate.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                el.classList.remove('input-error');
            });
        }
    });

    observeResize([document.getElementById('mobile-progress-shell')], () => {
        updateMobileHeaderOffset();
        updateOnboardingStepScales();
    });

    observeResize([$('.floating-action-btn')], () => {
        updateMobileActionBarOffset();
        updateOnboardingStepScales();
    });

    observeResize([
        $('#step-1 .step-mobile-fit-viewport'),
        $('#step-2 .step-mobile-fit-viewport'),
        $('#step-3 .step-mobile-fit-viewport'),
        $('#step-5 .step-mobile-fit-viewport'),
        $('#step-4 .step-mobile-fit-viewport')
    ], () => {
        updateOnboardingStepScales();
    });
});

window.addEventListener('resize', () => {
    updateMobileHeaderOffset();
    updateMobileActionBarOffset();
    updatePaletteScrollHeight();
    updatePaletteScrollAffordance();
    updateOnboardingStepScales();
    if (currentStep === 3) {
        syncLayoutPreviewDensity();
    }
});
