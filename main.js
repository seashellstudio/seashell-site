// main.js

let currentStep = 0; // 0 = Landing, 1-5 = Onboarding Steps

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
    const languageCard = document.querySelector('.language-card');
    const languageInput = document.getElementById('language-input');
    const hasLanguage = !!languageInput && languageInput.value.trim().length > 0;
    const languageFieldGroup = languageInput ? languageInput.closest('.language-field-group') : null;

    if (languageFieldGroup) {
        languageFieldGroup.classList.toggle('has-value', hasLanguage);
    }

    setFeatureSectionSelected(languageCard, hasLanguage);
};

window.syncSocialFeatureState = function() {
    const socialCard = document.querySelector('.social-card');
    const activePlatforms = socialCard ? socialCard.querySelectorAll('.social-option.is-selected').length : 0;
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

    if (currentStep === 0) {
        landingView.classList.add('active');
        onboardingView.classList.remove('active');
    } else {
        landingView.classList.remove('active');
        onboardingView.classList.add('active');
        
        // Update Steps Visibility
        for (let i = 1; i <= 6; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) {
                if (i === currentStep) {
                    stepEl.classList.add('active');
                } else {
                    stepEl.classList.remove('active');
                }
            }
        }
        
        // Hide sidebar and bottom nav on Step 6
        if (currentStep === 6) {
            document.querySelector('.sidebar').style.display = 'none';
            document.querySelector('.floating-action-btn').style.display = 'none';
        } else {
            document.querySelector('.sidebar').style.display = 'flex';
            document.querySelector('.floating-action-btn').style.display = 'flex';
        }
        
        // Update Sidebar Nav
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (parseInt(item.getAttribute('data-step')) === currentStep) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        updateNavigationButtons();

        // Theme Isolation: Only Step 1 allows background customisation
        const mainContainer = document.querySelector('.onboarding-main');
        if (currentStep !== 1 && mainContainer) {
            mainContainer.style.background = '#131313'; // Standard Dark Mode Default
        } else if (currentStep === 1) {
            // Re-sync theme if returning to Step 1
            const activeBgMode = document.querySelector('.mode-option.active');
            if (activeBgMode) {
                const modeValues = {
                    'mode-light': 'light',
                    'mode-palette': 'palette',
                    'mode-dark': 'dark'
                };
                updateBgMode(modeValues[activeBgMode.id] || 'dark');
            }
        }
    }
}

function navigateToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex <= 6) {
        currentStep = stepIndex;
        updateView();
    }
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
            let colourPalette = selectedPaletteColor;
            const activePaletteEl = document.querySelector('.palette-option.active-palette');
            if (activePaletteEl) {
                const paletteGrid = activePaletteEl.parentElement;
                if (paletteGrid && paletteGrid.classList.contains('palette-grid')) {
                    const index = Array.from(paletteGrid.children).indexOf(activePaletteEl);
                    if (index !== -1) {
                        const cols = 6;
                        const rows = 4;
                        const x = (index % cols) + 1;
                        const y = rows - Math.floor(index / cols);
                        colourPalette = `${x},${y}`;
                    }
                }
            }
            
            const activeFontEl = document.querySelector('.font-option-card.active');
            const stylePreference = activeFontEl ? activeFontEl.getAttribute('data-font') : '';
            const layoutSections = sections.filter(s => s.active).map(s => s.id);
            
            const optionalFeatures = [];
            document.querySelectorAll('.feature-toggle-card.selected').forEach(c => {
                optionalFeatures.push(c.querySelector('.card-title').innerText);
            });
            const selectedSocials = Array.from(document.querySelectorAll('.social-option.is-selected'))
                .map(btn => btn.querySelector('.social-option-name').innerText.trim());
            if (selectedSocials.length > 0) {
                optionalFeatures.push(...selectedSocials);
            }
            const languageInput = document.getElementById('language-input');
            if (languageInput && languageInput.value.trim() !== '') {
                optionalFeatures.push('Language: ' + languageInput.value.trim());
            }

            const businessNameInput = document.getElementById('input-business-name');
            const emailInput = document.getElementById('input-email');
            const customersInput = document.getElementById('input-customers');
            const locationInput = document.getElementById('input-location');

            const businessName = businessNameInput.value.trim();
            const email = emailInput.value.trim();
            const mainCustomers = customersInput.value.trim();
            const location = locationInput.value.trim();

            const activeTimelineEl = document.querySelector('.timeline-btn.active');
            const timeline = activeTimelineEl ? activeTimelineEl.innerText : '';
            const references = document.getElementById('input-reference')?.value || '';
            const finalNotes = document.getElementById('input-final-notes')?.value || '';

            let backgroundColour = "dark";
            const activeBgMode = document.querySelector('.mode-option.active');
            if (activeBgMode) {
                if (activeBgMode.id === 'mode-light') backgroundColour = "light";
                else if (activeBgMode.id === 'mode-palette') backgroundColour = "palette";
            }

            let hasError = false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const validateField = (inputElement, isInvalid) => {
                if (isInvalid) {
                    inputElement.classList.add('input-error');
                    hasError = true;
                } else {
                    inputElement.classList.remove('input-error');
                }
            };

            validateField(businessNameInput, !businessName);
            validateField(emailInput, !email || !emailRegex.test(email));
            validateField(customersInput, !mainCustomers);
            validateField(locationInput, !location);

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

            const { data, error } = await supabaseClient
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

window.selectPalette = function(el, color) {
    document.querySelectorAll('.palette-option').forEach(div => {
        div.classList.remove('active-palette');
    });
    el.classList.add('active-palette');
    selectedPaletteColor = el.children[4]?.style.backgroundColor || color;
    if (currentMode === 'palette') updateBgMode('palette');
};

window.updateBgMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-option').forEach(opt => {
        opt.classList.remove('active');
        opt.querySelector('.custom-radio').classList.remove('active');
        opt.querySelector('.radio-dot').classList.remove('active');
    });
    const selected = document.getElementById('mode-' + mode);
    if (selected) {
        selected.classList.add('active');
        selected.querySelector('.custom-radio').classList.add('active');
        selected.querySelector('.radio-dot').classList.add('active');
    }

    const step1El = document.getElementById('step-1');
    const mainContainer = document.querySelector('.onboarding-main');
    step1El.classList.remove('theme-light', 'theme-match-palette', 'light-mode-active');
    
    const bgIcon = document.querySelector('#step-1 .seashell-bg-icon');

    if (mode === 'dark') {
        const darkBg = '#131313';
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
        const matchGrad = `radial-gradient(120% 120% at 50% 0%, rgba(${rgb.r},${rgb.g},${rgb.b}, 0.18) 0%, #09090b 100%)`;
        step1El.style.background = matchGrad;
        if (mainContainer && currentStep === 1) mainContainer.style.background = '#09090b';
        
        step1El.classList.add('theme-match-palette');
        
        // Smart tune global orange glow if palette is extremely warm/orange
        const isWarm = (rgb.r > 200 && rgb.g > 100 && rgb.g < 180 && rgb.b < 100);
        if (bgIcon) bgIcon.style.opacity = isWarm ? '0.005' : '0.03';
    }
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

const sectionTemplates = {
    hero: '<div class="tpl-hero" style="position:relative; overflow:hidden;"><div style="display:flex; justify-content:space-between; align-items:center; height:100%;"><div style="flex:1; display:flex; flex-direction:column; gap:0.5em;"><div class="tpl-box" style="height:1.5em; width:90%;"></div><div class="tpl-box" style="height:0.5em; width:70%;"></div><div class="tpl-box" style="height:0.5em; width:60%;"></div><div class="tpl-box" style="height:1.5em; width:4em; border-radius:1em; margin-top:0.5em;"></div></div><div class="tpl-box" style="width:4em; height:4em; border-radius:0.5em;"></div></div></div>',
    about: '<div class="tpl-std" style="flex-direction:row; gap:0.5em; align-items:center;"><div class="tpl-box" style="flex:1; height:3.5em; border-radius:0.25em;"></div><div style="flex:1; display:flex; flex-direction:column; gap:0.25em;"><div class="tpl-box" style="height:0.5em; width:80%;"></div><div class="tpl-box" style="height:0.25em; width:100%;"></div><div class="tpl-box" style="height:0.25em; width:100%;"></div><div class="tpl-box" style="height:0.25em; width:60%;"></div></div></div>',
    gallery: '<div class="tpl-std" style="flex-direction:column; gap:0.5em;"><div style="display:flex; gap:0.25em;"><div class="tpl-box" style="flex:2; height:3em;"></div><div class="tpl-box" style="flex:1; height:3em;"></div></div><div style="display:flex; gap:0.25em;"><div class="tpl-box" style="flex:1; height:2em;"></div><div class="tpl-box" style="flex:1.5; height:2em;"></div><div class="tpl-box" style="flex:1; height:2em;"></div></div></div>',
    testimonials: '<div class="tpl-std" style="flex-direction:column; gap:0.5em; align-items:center; justify-content:center;"><div style="display:flex; gap:0.5em; width:100%;"><div class="tpl-box" style="flex:1; height:3em; border-radius:0.5em; padding:0.25em; display:flex; flex-direction:column; gap:0.25em;"><div style="display:flex; gap:0.25em; align-items:center;"><div class="tpl-box" style="width:1em; height:1em; border-radius:50%; background:rgba(255,255,255,0.2)"></div><div class="tpl-box" style="height:0.25em; width:2em;"></div></div><div class="tpl-box" style="height:0.25em; width:100%;"></div><div class="tpl-box" style="height:0.25em; width:80%;"></div></div><div class="tpl-box" style="flex:1; height:3em; border-radius:0.5em; padding:0.25em; display:flex; flex-direction:column; gap:0.25em;"><div style="display:flex; gap:0.25em; align-items:center;"><div class="tpl-box" style="width:1em; height:1em; border-radius:50%; background:rgba(255,255,255,0.2)"></div><div class="tpl-box" style="height:0.25em; width:2em;"></div></div><div class="tpl-box" style="height:0.25em; width:100%;"></div><div class="tpl-box" style="height:0.25em; width:80%;"></div></div></div></div>',
    bookings: '<div class="tpl-std" style="flex-direction:column; gap:0.25em;"><div style="display:flex; justify-content:space-between; align-items:center;"><div class="tpl-box" style="height:0.5em; width:3em;"></div><div style="display:flex; gap:0.15em;"><div class="tpl-box" style="height:0.25em; width:0.25em;"></div><div class="tpl-box" style="height:0.25em; width:0.25em;"></div></div></div><div class="tpl-box" style="height:3em; width:100%; border-radius:0.25em; display:grid; grid-template-columns:repeat(7, 1fr); gap:0.15em; padding:0.15em;"><div class="tpl-box" style="background:rgba(255,255,255,0.2)"></div><div class="tpl-box" style="background:rgba(255,255,255,0.2)"></div><div class="tpl-box"></div><div class="tpl-box"></div><div class="tpl-box" style="background:rgba(255,159,74,0.5)"></div><div class="tpl-box"></div><div class="tpl-box"></div><div class="tpl-box"></div><div class="tpl-box" style="background:rgba(255,159,74,0.5)"></div><div class="tpl-box"></div><div class="tpl-box"></div><div class="tpl-box"></div><div class="tpl-box"></div><div class="tpl-box"></div></div></div>',
    pricing: '<div class="tpl-std" style="flex-direction:column; gap:0.25em;"><div style="display:flex; justify-content:center;"><div class="tpl-box" style="height:0.5em; width:3em;"></div></div><div style="display:flex; gap:0.25em; align-items:flex-end; height:100%; margin-top:0.25em;"><div class="tpl-box" style="flex:1; height:3em; border:1px solid rgba(255,255,255,0.1); border-radius:0.25em; padding:0.25em; display:flex; flex-direction:column; gap:0.25em; align-items:center;"><div class="tpl-box" style="height:0.25em; width:60%;"></div><div class="tpl-box" style="height:0.5em; width:40%; background:rgba(255,159,74,0.3);"></div><div class="tpl-box" style="height:0.5em; width:80%; border-radius:0.5em;"></div></div><div class="tpl-box" style="flex:1; height:3.5em; border:1px solid rgba(255,159,74,0.4); background:rgba(255,159,74,0.05); border-radius:0.25em; padding:0.25em; display:flex; flex-direction:column; gap:0.25em; align-items:center;"><div class="tpl-box" style="height:0.25em; width:60%;"></div><div class="tpl-box" style="height:0.5em; width:40%; background:rgba(255,159,74,0.6);"></div><div class="tpl-box" style="height:0.5em; width:80%; border-radius:0.5em; background:rgba(255,159,74,0.4);"></div></div><div class="tpl-box" style="flex:1; height:3em; border:1px solid rgba(255,255,255,0.1); border-radius:0.25em; padding:0.25em; display:flex; flex-direction:column; gap:0.25em; align-items:center;"><div class="tpl-box" style="height:0.25em; width:60%;"></div><div class="tpl-box" style="height:0.5em; width:40%; background:rgba(255,159,74,0.3);"></div><div class="tpl-box" style="height:0.5em; width:80%; border-radius:0.5em;"></div></div></div></div>',
    team: '<div class="tpl-std" style="flex-direction:column; gap:0.25em; align-items:center;"><div class="tpl-box" style="height:0.4em; width:3em; margin-bottom:0.25em;"></div><div style="display:flex; gap:0.5em; width:100%; justify-content:center;"><div style="display:flex; flex-direction:column; align-items:center; gap:0.25em;"><div class="tpl-box" style="width:2em; height:2em; border-radius:50%;"></div><div class="tpl-box" style="height:0.2em; width:1.5em;"></div><div class="tpl-box" style="height:0.1em; width:1em;"></div></div><div style="display:flex; flex-direction:column; align-items:center; gap:0.25em;"><div class="tpl-box" style="width:2em; height:2em; border-radius:50%;"></div><div class="tpl-box" style="height:0.2em; width:1.5em;"></div><div class="tpl-box" style="height:0.1em; width:1em;"></div></div><div style="display:flex; flex-direction:column; align-items:center; gap:0.25em;"><div class="tpl-box" style="width:2em; height:2em; border-radius:50%;"></div><div class="tpl-box" style="height:0.2em; width:1.5em;"></div><div class="tpl-box" style="height:0.1em; width:1em;"></div></div></div></div>',
    contact: '<div class="tpl-std" style="flex-direction:column; gap:0.25em; align-items:center;"><div class="tpl-box" style="height:3.5em; width:80%; border-radius:0.1em; padding:0.25em; display:flex; flex-direction:column; gap:0.15em;"><div style="display:flex; gap:0.1em;"><div style="flex:1; display:flex; flex-direction:column; gap:0.05em;"><div class="tpl-box" style="height:0.1em; width:50%;"></div><div class="tpl-box" style="height:0.4em; width:100%; background:rgba(255,255,255,0.2);"></div></div><div style="flex:1; display:flex; flex-direction:column; gap:0.05em;"><div class="tpl-box" style="height:0.1em; width:50%;"></div><div class="tpl-box" style="height:0.4em; width:100%; background:rgba(255,255,255,0.2);"></div></div></div><div style="display:flex; flex-direction:column; gap:0.05em;"><div class="tpl-box" style="height:0.1em; width:20%;"></div><div class="tpl-box" style="height:0.4em; width:100%; background:rgba(255,255,255,0.2);"></div></div><div style="display:flex; flex-direction:column; gap:0.05em;"><div class="tpl-box" style="height:0.1em; width:20%;"></div><div class="tpl-box" style="height:0.8em; width:100%; background:rgba(255,255,255,0.2);"></div></div><div class="tpl-box" style="height:0.3em; width:2em; background:rgba(255,159,74,0.6); border-radius:0.2em; align-self:flex-end; margin-top:0.1em;"></div></div></div>',
    footer: '<div class="tpl-std" style="flex-direction:column; justify-content:flex-end; height:3.5em; padding-bottom:0.1em; padding-top:0.5em;"><div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%; border-top:1px solid rgba(255,255,255,0.1); padding-top:0.25em;"><div style="display:flex; flex-direction:column; gap:0.15em;"><div class="tpl-box" style="height:0.25em; width:2em;"></div><div class="tpl-box" style="height:0.15em; width:1.5em;"></div><div class="tpl-box" style="height:0.15em; width:1.5em;"></div></div><div style="display:flex; gap:0.25em;"><div class="tpl-box" style="width:0.5em; height:0.5em; border-radius:50%;"></div><div class="tpl-box" style="width:0.5em; height:0.5em; border-radius:50%;"></div><div class="tpl-box" style="width:0.5em; height:0.5em; border-radius:50%;"></div></div></div></div>'
};

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
    canvas.innerHTML = '';
    const activeSections = sections.filter(s => s.active);
    
    let scale = 1;
    if (activeSections.length > 3) {
        scale = Math.max(0.4, 1 - (activeSections.length - 3) * 0.12);
    }
    canvas.style.fontSize = scale + 'em';
    
    activeSections.forEach(s => {
      canvas.innerHTML += sectionTemplates[s.id];
    });
    
    const count = activeSections.length;
    const label = document.getElementById('active-sections-count');
    if (label) label.innerText = `${count} ACTIVE SECTIONS`;
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
    document.querySelectorAll('.font-option-card').forEach(card => {
        card.classList.remove('active');
        card.querySelector('.custom-radio').classList.remove('active');
        card.querySelector('.radio-dot').classList.remove('active');
        card.querySelector('.font-icon').classList.remove('active-icon');
        card.querySelector('.font-name').classList.remove('active-text');
        card.querySelector('.font-desc').classList.remove('active-desc');
    });
    el.classList.add('active');
    el.querySelector('.custom-radio').classList.add('active');
    el.querySelector('.radio-dot').classList.add('active');
    el.querySelector('.font-icon').classList.add('active-icon');
    el.querySelector('.font-name').classList.add('active-text');
    el.querySelector('.font-desc').classList.add('active-desc');

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
});
