document.addEventListener('DOMContentLoaded', function () {
    const PURCHASE_STORAGE_KEY = 'abdouAutoPurchaseSelection';
    const RENTAL_STORAGE_KEY = 'abdouAutoRentalSelection';

    // Mobile Nav Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^=\"#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Gallery Slider with Swipe
    document.querySelectorAll('.car-gallery').forEach(gallery => {
        const imgs = gallery.querySelectorAll('img');
        if (imgs.length < 2) return;

        let current = 0;
        let startX = 0;
        let isDragging = false;

        function showImage(index) {
            imgs.forEach((img, i) => {
                img.style.display = i === index ? 'block' : 'none';
            });
        }

        showImage(current);

        // Arrow buttons
        const leftBtn = document.createElement('button');
        leftBtn.innerHTML = '‹';
        leftBtn.className = 'gallery-arrow left';
        leftBtn.onclick = (e) => {
            e.stopPropagation();
            current = (current - 1 + imgs.length) % imgs.length;
            showImage(current);
        };

        const rightBtn = document.createElement('button');
        rightBtn.innerHTML = '›';
        rightBtn.className = 'gallery-arrow right';
        rightBtn.onclick = (e) => {
            e.stopPropagation();
            current = (current + 1) % imgs.length;
            showImage(current);
        };

        gallery.append(leftBtn, rightBtn);

        // Touch Swipe
        gallery.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        gallery.addEventListener('touchmove', e => {
            if (!isDragging) return;
            e.preventDefault();
        });

        gallery.addEventListener('touchend', e => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            if (Math.abs(diffX) > 50) { // Swipe threshold
                if (diffX > 0) {
                    current = (current + 1) % imgs.length;
                } else {
                    current = (current - 1 + imgs.length) % imgs.length;
                }
                showImage(current);
            }
            isDragging = false;
        });
    });

    function extractDetailLines(detailEl) {
        return Array.from(detailEl.querySelectorAll('p')).map((line) => line.textContent.trim()).filter(Boolean);
    }

    window.goToPurchase = function (button) {
        const card = button?.closest('.car-card');
        if (!card) return;

        const title = card.querySelector('h3')?.textContent?.trim() || 'Vehicule premium';
        const image = card.querySelector('.car-gallery img')?.src || '';
        const purchaseDetails = card.querySelector('[id^="details-achat"]');
        const specs = purchaseDetails ? extractDetailLines(purchaseDetails) : [];
        const priceLine = specs.find((item) => item.toLowerCase().includes('prix')) || 'Prix sur demande';

        const payload = {
            title,
            image,
            specs,
            price: priceLine
        };

        sessionStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(payload));
        const targetUrl = `achat.html?mode=achat&vehicule=${encodeURIComponent(title)}`;
        window.location.href = targetUrl;
    };

    window.goToRental = function (button) {
        const card = button?.closest('.car-card');
        if (!card) return;

        const title = card.querySelector('h3')?.textContent?.trim() || 'Vehicule premium';
        const image = card.querySelector('.car-gallery img')?.src || '';
        const rentalDetails = card.querySelector('[id^="details-location"]');
        const rates = rentalDetails ? extractDetailLines(rentalDetails) : [];
        const rateLine = rates[0] || 'Tarif sur demande';

        const payload = {
            title,
            image,
            specs: rates,
            price: rateLine
        };

        sessionStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(payload));
        const targetUrl = `louer.html?mode=location&vehicule=${encodeURIComponent(title)}`;
        window.location.href = targetUrl;
    };

    // Modal Details (replaces popup)
    window.showDetails = function (id) {
        const detailEl = document.getElementById(id);
        if (!detailEl) return;

        const existingVisible = document.querySelector('.details.visible');
        if (existingVisible && existingVisible !== detailEl) {
            existingVisible.classList.remove('visible');
            if (existingVisible.dataset.originalContent) {
                existingVisible.innerHTML = existingVisible.dataset.originalContent;
            }
        }

        // Store original content
        if (!detailEl.dataset.originalContent) {
            detailEl.dataset.originalContent = detailEl.innerHTML;
        }
        const originalContent = detailEl.dataset.originalContent;

        // Create overlay if not exists
        let overlay = document.getElementById('modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'modal-overlay';
            overlay.className = 'overlay';
            document.body.appendChild(overlay);
        }

        // Show modal
        const card = detailEl.closest('.car-card');
        const title = card.querySelector('h3').textContent;
        const imgSrc = card.querySelector('.car-gallery img').src;

        const modalContent = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <img src="${imgSrc}" alt="${title}">
            ${originalContent}
        `;

        detailEl.innerHTML = modalContent;
        detailEl.classList.add('visible');
        overlay.classList.add('visible');
        document.body.classList.add('modal-open');

        // Close events
        overlay.onclick = () => closeModal();
        const closeBtn = detailEl.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                closeModal();
            };
        }

        function closeModal() {
            overlay.classList.remove('visible');
            detailEl.classList.remove('visible');
            detailEl.innerHTML = originalContent;
            document.body.classList.remove('modal-open');
        }
    };

    // Contact Form
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            alert(`Merci ${data.nom || 'Client'}! Votre message a été envoyé.\nEmail: ${data.email}`);
            console.log('Form data:', data);
            form.reset();
        });
    }

    // Purchase Page
    const purchaseForm = document.querySelector('.purchase-form');
    if (purchaseForm) {
        let selection = null;
        try {
            selection = JSON.parse(sessionStorage.getItem(PURCHASE_STORAGE_KEY) || 'null');
        } catch (error) {
            selection = null;
        }

        const params = new URLSearchParams(window.location.search);
        if (!selection && params.get('vehicule')) {
            selection = {
                title: params.get('vehicule'),
                image: '',
                specs: [],
                price: 'Prix sur demande'
            };
        }

        const pageTitle = document.getElementById('purchase-title');
        const pagePrice = document.getElementById('purchase-price');
        const pageImage = document.getElementById('purchase-image');
        const specsContainer = document.getElementById('purchase-specs');

        if (selection) {
            if (pageTitle) pageTitle.textContent = selection.title || 'Vehicule premium';
            if (pagePrice) pagePrice.textContent = selection.price || 'Prix sur demande';
            if (pageImage && selection.image) {
                pageImage.src = selection.image;
                pageImage.alt = selection.title || 'Vehicule selectionne';
            } else if (pageImage) {
                pageImage.style.display = 'none';
            }
            if (specsContainer) {
                specsContainer.innerHTML = '';
                (selection.specs || []).forEach((spec) => {
                    const item = document.createElement('p');
                    item.className = 'spec-item';
                    item.textContent = spec;
                    specsContainer.appendChild(item);
                });
                if (!selection.specs || selection.specs.length === 0) {
                    const item = document.createElement('p');
                    item.className = 'spec-item';
                    item.textContent = 'Un conseiller vous transmettra la fiche complete du vehicule apres validation de votre demande.';
                    specsContainer.appendChild(item);
                }
            }
        }

        purchaseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(purchaseForm);
            const data = Object.fromEntries(formData);
            const confirmation = document.getElementById('purchase-confirmation');
            const confirmationMessage = document.getElementById('confirmation-message');
            const vehicleName = selection?.title || 'le vehicule selectionne';

            if (confirmation && confirmationMessage) {
                confirmation.hidden = false;
                confirmationMessage.textContent = `${data.nom || 'Client'}, votre demande d'achat pour ${vehicleName} a bien ete envoyee. Un conseiller vous recontactera via ${data.mode_contact || 'votre canal choisi'} pour confirmer la disponibilite et organiser la suite.`;
                confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            purchaseForm.reset();
        });
    }

    // Rental Page
    const rentalForm = document.querySelector('.rental-form');
    if (rentalForm) {
        let selection = null;
        try {
            selection = JSON.parse(sessionStorage.getItem(RENTAL_STORAGE_KEY) || 'null');
        } catch (error) {
            selection = null;
        }

        const params = new URLSearchParams(window.location.search);
        if (!selection && params.get('vehicule')) {
            selection = {
                title: params.get('vehicule'),
                image: '',
                specs: [],
                price: 'Tarif sur demande'
            };
        }

        const pageTitle = document.getElementById('rental-title');
        const pagePrice = document.getElementById('rental-price');
        const pageImage = document.getElementById('rental-image');
        const specsContainer = document.getElementById('rental-specs');

        if (selection) {
            if (pageTitle) pageTitle.textContent = selection.title || 'Vehicule premium';
            if (pagePrice) pagePrice.textContent = selection.price || 'Tarif sur demande';
            if (pageImage && selection.image) {
                pageImage.src = selection.image;
                pageImage.alt = selection.title || 'Vehicule selectionne pour location';
            } else if (pageImage) {
                pageImage.style.display = 'none';
            }
            if (specsContainer) {
                specsContainer.innerHTML = '';
                (selection.specs || []).forEach((spec) => {
                    const item = document.createElement('p');
                    item.className = 'spec-item';
                    item.textContent = spec;
                    specsContainer.appendChild(item);
                });
                if (!selection.specs || selection.specs.length === 0) {
                    const item = document.createElement('p');
                    item.className = 'spec-item';
                    item.textContent = 'Les conditions completes de location vous seront confirmees apres reception de votre demande.';
                    specsContainer.appendChild(item);
                }
            }
        }

        rentalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(rentalForm);
            const data = Object.fromEntries(formData);
            const confirmation = document.getElementById('rental-confirmation');
            const confirmationMessage = document.getElementById('rental-confirmation-message');
            const vehicleName = selection?.title || 'le vehicule selectionne';

            if (confirmation && confirmationMessage) {
                confirmation.hidden = false;
                confirmationMessage.textContent = `${data.nom || 'Client'}, votre demande de location pour ${vehicleName} a bien ete envoyee. Un conseiller vous recontactera via ${data.mode_contact || 'votre canal choisi'} pour confirmer les dates, la disponibilite et les conditions de remise.`;
                confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            rentalForm.reset();
        });
    }

    // Intersection Observer for animations
    const animatedItems = document.querySelectorAll('.car-card, .section h2, .purchase-card, .purchase-hero, .contact-panel, .contact-form-wrap');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        animatedItems.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s, transform 0.6s';
            observer.observe(el);
        });
    } else {
        animatedItems.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }

});
