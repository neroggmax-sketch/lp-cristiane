/**
 * REVIVA SENIOR'S RESIDENCE — JAVASCRIPT
 * Lógica para alternância das unidades, galeria lightbox, acordeão de dúvidas,
 * menu responsivo e integração direta com WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroVideo();
    initHeroTypewriter();
    initHeaderScroll();
    initMobileMenu();
    initUnitsCarousel();
    initFaqAccordion();
    initHeroLeafAnimation();
    initBlueprintCanvasAnimation('unidades-bg-canvas');
    initBlueprintCanvasAnimation('bio-bg-canvas');
    initBioAnimations();
    initSpotlightCards();
    initScrollTriggerAnimations();
});

/* ==========================================================================
   0. VÍDEO DE FUNDO DO HERO (AUTOPLAY & LOOP SEGURO)
   ========================================================================== */
function initHeroVideo() {
    const video = document.querySelector('.hero-bg-video');
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay seguro caso o navegador exija interação
        });
    }
}

/* ==========================================================================
   0.1 EFEITO TYPEWRITER NO HERO (DIGITA E APAGA)
   ========================================================================== */
function initHeroTypewriter() {
    const el = document.getElementById('heroTypewriter');
    if (!el) return;

    // Palavras que alternam com animação suave de digitação e apagamento
    const words = [
        "Taquaral",
        "Taquaral, Campinas",
        "bairro Taquaral"
    ];

    let wordIdx = 0;
    let charIdx = words[0].length;
    let isDeleting = true; // Já inicia preenchido com a primeira palavra e prepara para apagar após a pausa

    // Pausa inicial confortável antes de começar a apagar pela primeira vez (2.2s)
    setTimeout(typeLoop, 2200);

    function typeLoop() {
        const currentWord = words[wordIdx];

        if (isDeleting) {
            charIdx--;
            el.textContent = currentWord.substring(0, charIdx);
        } else {
            charIdx++;
            el.textContent = currentWord.substring(0, charIdx);
        }

        let speed = isDeleting ? 48 : 88;

        // Se terminou de digitar a palavra inteira
        if (!isDeleting && charIdx === currentWord.length) {
            speed = 2400; // Tempo de pausa exibindo a palavra completa
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            speed = 420; // Pausa antes de digitar a próxima palavra
        }

        setTimeout(typeLoop, speed);
    }
}

/* ==========================================================================
   1. HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   2. MENU MOBILE RESPONSIVO
   ========================================================================== */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });

    // Fechar ao clicar em qualquer link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Fechar ao clicar fora do menu no celular
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            navMenu.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });
}

/* ==========================================================================
   3. CARROSSEL DE CONDOMÍNIOS (ESTILO NETFLIX COM PRÉVIA ESCURA)
   ========================================================================== */
let currentUnitIndex = 0;
const totalUnits = 3;

function initUnitsCarousel() {
    const track = document.getElementById('unitsSliderTrack');
    const prevBtn = document.getElementById('unitsPrevBtn');
    const nextBtn = document.getElementById('unitsNextBtn');
    const wrapper = document.getElementById('unitsCarouselWrapper');

    if (!track) return;

    // Criar clone da Unidade 1 no final para que a Unidade 3 também mostre a prévia da Unidade 1 na direita
    const originalSlides = Array.from(track.querySelectorAll('.unit-slide'));
    if (originalSlides.length > 0 && !track.querySelector('.unit-slide-clone')) {
        const firstClone = originalSlides[0].cloneNode(true);
        firstClone.classList.add('unit-slide-clone');
        firstClone.classList.remove('active');
        firstClone.removeAttribute('id');
        firstClone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        firstClone.setAttribute('data-index', '0');
        track.appendChild(firstClone);
    }

    function getSlideStep() {
        if (window.innerWidth <= 768) {
            const viewport = track.parentElement;
            return viewport ? (viewport.getBoundingClientRect().width || viewport.clientWidth) : track.clientWidth;
        }
        const firstSlide = track.querySelector('.unit-slide');
        if (!firstSlide) return 0;
        const style = window.getComputedStyle(track);
        const parsedGap = parseFloat(style.columnGap || style.gap);
        const gap = isNaN(parsedGap) ? 24 : parsedGap;
        return firstSlide.offsetWidth + gap;
    }

    let isTransitioning = false;

    function updateSlideStates(activeIdx) {
        const allSlides = Array.from(track.querySelectorAll('.unit-slide'));
        allSlides.forEach((slide, idx) => {
            if (idx === activeIdx) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }



    // ==========================================================================
    // ==========================================================================
    // AUTO-PLAY CONTÍNUO: CICLO FOTO 1 -> 2 -> 3 -> 4 E AVANÇO AUTOMÁTICO DE BLOCO
    // ==========================================================================
    const PHOTO_DISPLAY_TIME = 2600; // 2.6 segundos por imagem
    let autoPlayTimer = null;
    let currentPhotoIndex = 0;
    let isHovered = false;
    let isSectionVisible = true;

    function getActiveSlideElement() {
        const slides = Array.from(track.querySelectorAll('.unit-slide'));
        return slides[currentUnitIndex] || slides[0];
    }

    function getThumbsForSlide(slideEl) {
        if (!slideEl) return [];
        return Array.from(slideEl.querySelectorAll('.gallery-thumb'));
    }

    function switchPhotoInCurrentUnit(photoIdx) {
        const slide = getActiveSlideElement();
        if (!slide) return;
        const thumbs = getThumbsForSlide(slide);
        if (thumbs.length === 0) return;

        currentPhotoIndex = Math.max(0, Math.min(photoIdx, thumbs.length - 1));
        const targetThumb = thumbs[currentPhotoIndex];
        if (targetThumb) {
            targetThumb.click();
        }
    }

    function startAutoPlay() {
        stopAutoPlay();
        if (isHovered || !isSectionVisible) return;

        autoPlayTimer = setTimeout(() => {
            if (isHovered || !isSectionVisible) return;

            const slide = getActiveSlideElement();
            const thumbs = getThumbsForSlide(slide);
            const totalPhotos = thumbs.length || 4;

            if (currentPhotoIndex < totalPhotos - 1) {
                // Passa para a próxima imagem dentro do condomínio atual (1 -> 2 -> 3 -> 4)
                currentPhotoIndex++;
                switchPhotoInCurrentUnit(currentPhotoIndex);
                startAutoPlay();
            } else {
                currentPhotoIndex = 0;
                // No mobile, apenas cicla as fotos da unidade atual sem trocar de condomínio sozinho
                if (window.innerWidth <= 768) {
                    switchPhotoInCurrentUnit(0);
                    startAutoPlay();
                } else {
                    goToSlide(currentUnitIndex + 1);
                }
            }
        }, PHOTO_DISPLAY_TIME);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    function goToSlide(targetIndex) {
        if (isTransitioning) return;
        const step = getSlideStep();
        currentPhotoIndex = 0; // Sempre inicia na 1ª foto ao mudar de bloco

        // Se estiver no último slide (Unidade 3) e avançar -> vai para o clone da Unidade 1
        if (targetIndex >= totalUnits) {
            isTransitioning = true;
            currentUnitIndex = 0; // Visualmente volta para a Unidade 1

            // Prepara a 1ª foto no clone
            const allSlides = Array.from(track.querySelectorAll('.unit-slide'));
            const cloneSlide = allSlides[totalUnits];
            if (cloneSlide) {
                const cloneThumbs = getThumbsForSlide(cloneSlide);
                if (cloneThumbs[0]) cloneThumbs[0].click();
            }

            track.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
            track.style.transform = `translateX(-${totalUnits * step}px)`;

            updateSlideStates(totalUnits); // Ativa o clone durante o deslize

            const onTransitionEnd = () => {
                track.removeEventListener('transitionend', onTransitionEnd);
                // Reseta silenciosamente para o slide real 0
                track.style.transition = 'none';
                track.style.transform = 'translateX(0px)';
                updateSlideStates(0);
                switchPhotoInCurrentUnit(0);
                track.offsetHeight; // Forçar reflow síncrono
                track.style.transition = '';
                isTransitioning = false;
                restartAutoPlay();
            };
            track.addEventListener('transitionend', onTransitionEnd);
            return;
        }

        if (targetIndex < 0) {
            targetIndex = totalUnits - 1;
        }

        currentUnitIndex = targetIndex;

        // Ativa a 1ª foto do slide que está entrando
        const allSlides = Array.from(track.querySelectorAll('.unit-slide'));
        const nextSlide = allSlides[currentUnitIndex];
        if (nextSlide) {
            const nextThumbs = getThumbsForSlide(nextSlide);
            if (nextThumbs[0]) nextThumbs[0].click();
        }

        track.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
        track.style.transform = `translateX(-${currentUnitIndex * step}px)`;
        updateSlideStates(currentUnitIndex);
        restartAutoPlay();
    }

    // Botão da Direita: Passa para o próximo bloco
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(currentUnitIndex + 1);
        });
    }

    // Botão da Esquerda: Volta para o bloco anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(currentUnitIndex - 1);
        });
    }

    // Clique direto no bloco de prévia escuro para avançar
    track.addEventListener('click', (e) => {
        const overlay = e.target.closest('.unit-slide-dark-overlay');
        if (overlay) {
            e.preventDefault();
            goToSlide(currentUnitIndex + 1);
            return;
        }

        // Clique manual em qualquer miniatura sincroniza o índice e continua o ciclo
        const thumb = e.target.closest('.gallery-thumb');
        if (thumb) {
            const thumbsContainer = thumb.closest('.unit-gallery-thumbs');
            if (thumbsContainer) {
                const thumbsList = Array.from(thumbsContainer.querySelectorAll('.gallery-thumb'));
                const clickedIdx = thumbsList.indexOf(thumb);
                if (clickedIdx !== -1) {
                    currentPhotoIndex = clickedIdx;
                    restartAutoPlay();
                }
            }
        }
    });

    // Suporte a gestos touch (deslizar com o dedo) no celular
    let touchStartX = 0;
    let touchStartY = 0;

    track.addEventListener('touchstart', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        // Se o movimento horizontal for predominante e maior que 40px
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) {
                goToSlide(currentUnitIndex + 1);
            } else {
                goToSlide(currentUnitIndex - 1);
            }
        }
        startAutoPlay();
    }, { passive: true });

    // Pausar autoplay quando o mouse estiver sobre o carrossel e retomar ao sair
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
            isHovered = true;
            stopAutoPlay();
            wrapper.classList.add('autoplay-paused');
        });

        wrapper.addEventListener('mouseleave', () => {
            isHovered = false;
            wrapper.classList.remove('autoplay-paused');
            startAutoPlay();
        });

        // Suporte para teclas de seta do teclado (ArrowRight / ArrowLeft)
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToSlide(currentUnitIndex + 1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSlide(currentUnitIndex - 1);
            }
        });
    }

    // Pausar quando o usuário trocar de aba para poupar recursos
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else if (!isHovered && isSectionVisible) {
            startAutoPlay();
        }
    });

    // Recalcular posicionamento no redimensionamento da janela
    window.addEventListener('resize', () => {
        const step = getSlideStep();
        track.style.transition = 'none';
        track.style.transform = `translateX(-${currentUnitIndex * step}px)`;
    });

    // Iniciar autoplay somente quando a seção estiver visível na tela
    const sectionUnidades = document.getElementById('unidades');
    if (sectionUnidades && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isSectionVisible = entry.isIntersecting;
                if (isSectionVisible && !isHovered) {
                    if (wrapper) wrapper.classList.remove('autoplay-paused');
                    startAutoPlay();
                } else {
                    if (wrapper) wrapper.classList.add('autoplay-paused');
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.2 });
        observer.observe(sectionUnidades);
    } else {
        startAutoPlay();
    }

    // Inicializar estado ativo
    updateSlideStates(0);

    // Expor globalmente para eventual chamada externa
    window.goToUnitSlide = goToSlide;
}

/* Troca da imagem principal ao clicar na miniatura da galeria */
function swapMainImage(unitId, imgSrc, captionText) {
    let targetSlide = document.querySelector('.unit-slide.active');
    if (!targetSlide || !targetSlide.id.includes(unitId)) {
        targetSlide = document.getElementById(`pane-${unitId}`) || targetSlide;
    }

    if (targetSlide) {
        const mainImg = targetSlide.querySelector('.unit-gallery-main img');
        if (mainImg) {
            mainImg.style.opacity = '0.35';
            setTimeout(() => {
                mainImg.src = imgSrc;
                mainImg.style.opacity = '1';
            }, 120);

            const mainContainer = mainImg.parentElement;
            if (mainContainer) {
                mainContainer.setAttribute('onclick', `openLightbox('${imgSrc}', '${captionText.replace(/'/g, "\\'")}')`);
            }
        }

        const thumbs = targetSlide.querySelectorAll('.gallery-thumb');
        thumbs.forEach(thumb => {
            const thumbImg = thumb.querySelector('img');
            if (thumbImg && (thumbImg.getAttribute('src') === imgSrc || thumbImg.src.includes(imgSrc))) {
                thumb.classList.remove('active');
                void thumb.offsetWidth; // Força reflow para reiniciar do zero a barra e o efeito de carregamento
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    } else {
        const mainImg = document.getElementById(`mainImg-${unitId}`);
        if (mainImg) {
            mainImg.style.opacity = '0.35';
            setTimeout(() => {
                mainImg.src = imgSrc;
                mainImg.style.opacity = '1';
            }, 120);
        }
    }
}

/* ==========================================================================
   BIOGRAFIA DA FUNDADORA (CRISTIANE ALBERTI): ANIMAÇÃO E DIGITAÇÃO
   ========================================================================== */
function initBioAnimations() {
    const bioSection = document.getElementById('biografia');
    const quoteEl = document.getElementById('bioQuoteText');
    if (!bioSection) return;

    const fullQuote = '"O cuidado vai além da técnica: ele nasce do afeto. Um lugar onde o amor se traduz em ação."';
    let typingTimer = null;
    let initialDelayTimer = null;

    function resetBio() {
        bioSection.classList.remove('is-visible');
        if (typingTimer) {
            clearTimeout(typingTimer);
            typingTimer = null;
        }
        if (initialDelayTimer) {
            clearTimeout(initialDelayTimer);
            initialDelayTimer = null;
        }
        if (quoteEl) {
            quoteEl.classList.remove('typing');
            quoteEl.textContent = '';
        }
    }

    function playBio() {
        resetBio();

        // Força reflow no elemento para reiniciar o pipeline de animações/transições CSS
        void bioSection.offsetWidth;

        // Dispara a entrada suave dos textos da esquerda e da direita
        bioSection.classList.add('is-visible');

        // Animação de digitação de letras na citação lateral
        if (quoteEl) {
            quoteEl.textContent = '';
            quoteEl.classList.add('typing');
            let charIndex = 0;

            function typeChar() {
                if (!bioSection.classList.contains('is-visible')) return;
                if (charIndex < fullQuote.length) {
                    quoteEl.textContent += fullQuote.charAt(charIndex);
                    charIndex++;
                    typingTimer = setTimeout(typeChar, 42);
                } else {
                    quoteEl.classList.remove('typing');
                }
            }

            // Inicia a digitação suave com ritmo calmo e cadenciado
            initialDelayTimer = setTimeout(typeChar, 750);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                playBio();
                // No celular mantém visível sem reiniciar repetidamente ao rolar
                if (window.innerWidth <= 768) {
                    observer.unobserve(bioSection);
                }
            } else {
                if (window.innerWidth > 768) {
                    resetBio();
                }
            }
        });
    }, { 
        threshold: 0.10,
        rootMargin: '0px 0px -20px 0px'
    });

    observer.observe(bioSection);
}

/* ==========================================================================
   4. MODAL LIGHTBOX PARA FOTOS
   ========================================================================== */
function openLightbox(imgSrc, caption) {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const modalCaption = document.getElementById('lightboxCaption');

    if (modal && modalImg) {
        modalImg.src = imgSrc;
        if (modalCaption) modalCaption.textContent = caption || 'Ambiente Reviva Senior\'s Residence';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightboxDirect() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeLightbox(e) {
    if (e.target.id === 'lightboxModal') {
        closeLightboxDirect();
    }
}

// Fechar lightbox ao pressionar tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightboxDirect();
    }
});

/* ==========================================================================
   5. ACORDEÃO DO FAQ (DÚVIDAS)
   ========================================================================== */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (questionBtn && answer) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Fechar outros itens
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                });

                // Alternar item atual
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                }
            });
        }
    });
}

/* ==========================================================================
   6. ANIMAÇÃO DE FOLHAS REALISTAS EM 3D NO HERO (CENÁRIO VIVO)
   ========================================================================== */
function initHeroLeafAnimation() {
    const canvas = document.getElementById('heroLeafCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let leaves = [];
    let ripples = [];
    let windSpeed = 1.15;
    let windGustSurge = 0;
    let mouseWindX = 0;
    let mouseWindY = 0;

    function resizeCanvas() {
        const heroSection = canvas.parentElement;
        width = canvas.width = heroSection ? heroSection.clientWidth : window.innerWidth;
        height = canvas.height = heroSection ? heroSection.clientHeight : window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5);
        const ny = (e.clientY / window.innerHeight - 0.5);
        mouseWindX = nx * 1.5;
        mouseWindY = ny * 0.7;
    });

    // Classe de Onda de Choque / Brisa Suave no Toque
    class WindRipple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 12;
            this.maxRadius = 150;
            this.alpha = 0.5;
            this.active = true;
        }

        update() {
            this.radius += (this.maxRadius - this.radius) * 0.14 + 1.8;
            this.alpha *= 0.91;
            if (this.alpha < 0.015) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 225, 190, ${this.alpha * 0.75})`;
            ctx.lineWidth = 2.5 * (this.alpha / 0.5);
            ctx.stroke();

            // Anel secundário sutil
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.radius * 0.62), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(220, 245, 215, ${this.alpha * 0.4})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        }
    }

    // Classe de Folha Botânica com Rotação Tridimensional Real
    class RealisticLeaf {
        constructor(startX = null, startY = null, isBurst = false) {
            this.isBurst = isBurst;
            this.active = true;
            this.reset(startX, startY);
        }

        reset(startX = null, startY = null) {
            if (startX !== null && startY !== null) {
                this.x = startX + (Math.random() * 26 - 13);
                this.y = startY + (Math.random() * 26 - 13);
                const burstAngle = Math.random() * Math.PI * 2;
                const burstForce = Math.random() * 7.5 + 4.5;
                this.speedX = Math.cos(burstAngle) * burstForce + 1.4;
                this.speedY = Math.sin(burstAngle) * burstForce - (Math.random() * 3 + 1.5);
            } else {
                this.x = Math.random() * (width + 300) - 150;
                this.y = Math.random() * -height * 0.7 - 25;
                this.speedX = (Math.random() * 1.2 - 0.2);
                this.speedY = Math.random() * 1.3 + 0.7;
            }

            // Tamanho proporcional
            this.size = Math.random() * 11 + 9; // 9px a 20px
            this.aspectRatio = Math.random() * 0.35 + 0.45;
            
            // Ângulos 3D (Roll, Pitch e Yaw)
            this.angleZ = Math.random() * Math.PI * 2;
            this.angleX = Math.random() * Math.PI * 2;
            this.angleY = Math.random() * Math.PI * 2;

            if (this.isBurst) {
                this.rotSpeedZ = (Math.random() * 0.08 - 0.04);
                this.rotSpeedX = (Math.random() * 0.1 + 0.035);
                this.rotSpeedY = (Math.random() * 0.08 + 0.03);
            } else {
                this.rotSpeedZ = (Math.random() * 0.025 - 0.012);
                this.rotSpeedX = (Math.random() * 0.04 + 0.018);
                this.rotSpeedY = (Math.random() * 0.03 + 0.012);
            }

            this.flutterAngle = Math.random() * Math.PI * 2;
            this.flutterSpeed = Math.random() * 0.04 + 0.02;
            this.flutterAmplitude = Math.random() * 1.5 + 0.7;

            this.depth = Math.random() * 0.55 + 0.55; // 0.55 a 1.1
            this.opacity = Math.random() * 0.25 + 0.75;
            this.curve = (Math.random() * 0.3 - 0.15);

            // Paleta de cores da natureza em tom suave/apagado
            const palettes = [
                {
                    topColor: '#455f3c',
                    backColor: '#6f8564',
                    veinColor: 'rgba(215, 230, 205, 0.35)'
                },
                {
                    topColor: '#53683f',
                    backColor: '#7a8e63',
                    veinColor: 'rgba(225, 235, 210, 0.3)'
                },
                {
                    topColor: '#6b5e40',
                    backColor: '#8c7d5c',
                    veinColor: 'rgba(235, 220, 195, 0.35)'
                },
                {
                    topColor: '#5d543e',
                    backColor: '#7e7358',
                    veinColor: 'rgba(230, 220, 200, 0.3)'
                }
            ];
            this.palette = palettes[Math.floor(Math.random() * palettes.length)];
        }

        update() {
            this.angleZ += this.rotSpeedZ;
            this.angleX += this.rotSpeedX;
            this.angleY += this.rotSpeedY;
            this.flutterAngle += this.flutterSpeed;

            // Fator aerodinâmico de sustentação no ar
            const faceNormal = Math.abs(Math.cos(this.angleX) * Math.cos(this.angleY));
            const lift = faceNormal * 0.5;

            const flutterX = Math.sin(this.flutterAngle) * this.flutterAmplitude;
            const flutterY = Math.cos(this.flutterAngle * 0.7) * 0.35;

            const currentWind = windSpeed + windGustSurge;

            if (this.isBurst) {
                this.speedX *= 0.96;
                this.speedY = this.speedY * 0.95 + 0.05 * 1.1;
                this.rotSpeedX = this.rotSpeedX * 0.98 + 0.02 * 0.03;
                this.rotSpeedY = this.rotSpeedY * 0.98 + 0.02 * 0.02;
            }

            this.x += (this.speedX + flutterX + (currentWind * 1.1) + mouseWindX) * this.depth;
            this.y += (this.speedY - lift + flutterY + (currentWind * 0.15) + mouseWindY * 0.25) * this.depth;

            if (this.isBurst) {
                if (this.y > height + 45 || this.x > width + 180 || this.x < -180) {
                    this.active = false;
                }
            } else {
                if (this.y > height + 35 || this.x > width + 150 || this.x < -150) {
                    this.reset();
                    this.y = -25;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angleZ);

            // Rotação 3D verdadeira na projeção da escala
            const scale3DX = Math.cos(this.angleY);
            const scale3DY = Math.cos(this.angleX);
            
            ctx.scale(Math.abs(scale3DX) < 0.05 ? 0.05 : scale3DX, Math.abs(scale3DY) < 0.05 ? 0.05 : scale3DY);
            ctx.globalAlpha = this.opacity * this.depth;

            const isBackSide = (scale3DX * scale3DY) < 0;
            const baseColor = isBackSide ? this.palette.backColor : this.palette.topColor;

            const l = this.size;
            const w = this.size * this.aspectRatio;

            // Sombra suave sob folhas próximas
            if (this.depth > 0.85) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetY = 3;
            }

            // 1. Pecíolo / Cabinho
            ctx.beginPath();
            ctx.strokeStyle = '#32281a';
            ctx.lineWidth = 1.1;
            ctx.moveTo(0, l * 0.75);
            ctx.lineTo(0, l * 0.95);
            ctx.stroke();
            ctx.shadowColor = 'transparent';

            // 2. Limbo da Folha com Curvatura Orgânica
            ctx.beginPath();
            ctx.moveTo(0, -l * 0.75);

            ctx.bezierCurveTo(
                w * 1.1, -l * 0.3 + (this.curve * 10),
                w * 0.95, l * 0.4,
                0, l * 0.75
            );

            ctx.bezierCurveTo(
                -w * 0.95, l * 0.4,
                -w * 1.1, -l * 0.3 - (this.curve * 10),
                0, -l * 0.75
            );

            const grad = ctx.createLinearGradient(-w, 0, w, 0);
            grad.addColorStop(0, baseColor);
            grad.addColorStop(0.5, isBackSide ? '#7b916f' : '#4d6943');
            grad.addColorStop(1, isBackSide ? '#5e7254' : '#394e31');

            ctx.fillStyle = grad;
            ctx.fill();

            // 3. Nervura Central Botânica
            ctx.beginPath();
            ctx.strokeStyle = this.palette.veinColor;
            ctx.lineWidth = 0.9;
            ctx.moveTo(0, -l * 0.7);
            ctx.quadraticCurveTo(this.curve * 3, 0, 0, l * 0.75);
            ctx.stroke();

            // 4. Nervuras Secundárias
            ctx.strokeStyle = this.palette.veinColor;
            ctx.lineWidth = 0.5;
            for (let v = 1; v <= 4; v++) {
                const py = -l * 0.5 + (v * (l * 0.22));
                const pw = w * (1 - Math.abs(py / l)) * 0.65;
                
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(pw, py - l * 0.1);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(-pw, py - l * 0.1);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Disparador de Efeito Interativo ao Clicar / Tocar na Tela Inicial
    function triggerLeafBurst(clickX, clickY) {
        // 1. Efeito visual de onda de brisa suave
        ripples.push(new WindRipple(clickX, clickY));

        // 2. Dispersão radial nas folhas existentes que estão por perto
        for (let i = 0; i < leaves.length; i++) {
            const leaf = leaves[i];
            const dx = leaf.x - clickX;
            const dy = leaf.y - clickY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 280 && dist > 2) {
                const force = (1 - dist / 280) * 11;
                leaf.speedX += (dx / dist) * force;
                leaf.speedY += (dy / dist) * force - 2.5;
                leaf.rotSpeedX += (Math.random() * 0.08 - 0.04);
                leaf.rotSpeedY += (Math.random() * 0.08 - 0.04);
                leaf.rotSpeedZ += (Math.random() * 0.09 - 0.045);
            }
        }

        // 3. Revoada de novas folhas 3D rodopiando a partir do toque
        const burstCount = 16;
        for (let i = 0; i < burstCount; i++) {
            leaves.push(new RealisticLeaf(clickX, clickY, true));
        }

        // 4. Rajada temporária no fluxo global do vento
        windGustSurge = Math.min(windGustSurge + 3.2, 7.0);
    }

    // Escutar toque e clique na tela inicial (Hero)
    const heroSection = document.getElementById('inicio');
    if (heroSection) {
        heroSection.addEventListener('pointerdown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            triggerLeafBurst(clickX, clickY);
        });
    }

    // Inicializar conjunto de folhas base
    const leafCount = 36;
    for (let i = 0; i < leafCount; i++) {
        leaves.push(new RealisticLeaf());
    }

    // Render loop suave
    function render() {
        ctx.clearRect(0, 0, width, height);

        // Decaimento suave da rajada de vento
        if (windGustSurge > 0.01) {
            windGustSurge *= 0.95;
        } else {
            windGustSurge = 0;
        }

        // 1. Desenhar e atualizar ondas de brisa (ripples)
        for (let i = 0; i < ripples.length; i++) {
            ripples[i].update();
            ripples[i].draw();
        }
        ripples = ripples.filter(r => r.active);

        // 2. Atualizar e desenhar folhas
        for (let i = 0; i < leaves.length; i++) {
            leaves[i].update();
            leaves[i].draw();
        }

        // Limpeza de folhas de rajada que já saíram da tela
        if (leaves.length > 45) {
            leaves = leaves.filter(l => l.active !== false);
        }

        requestAnimationFrame(render);
    }
    render();
}

/* ==========================================================================
   ANIMAÇÃO GEOMÉTRICA DE FUNDO (BLUEPRINT / MOLDURAS & LINHAS ARQUITETURAIS)
   Inspirada na tecnologia da Diamond Vidros, adaptada com a paleta nobre da Reviva
   ========================================================================== */
function initBlueprintCanvasAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frames = [];
    let profiles = [];
    let nodes = [];

    // Paleta harmônica Reviva (Esmeralda nobre, verde folha, toques dourados e menta luminoso)
    const palette = {
        baseDark: '#124525',     // Esmeralda escuro
        baseMid: '#1e6d3c',      // Esmeralda vibrante
        baseLight: '#5ea82c',    // Verde folha vivo
        accentBright: '#9ee668', // Luminous mint/lime
        accentGold: '#d4af37'    // Dourado suave
    };

    function hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        width = canvas.width = parent.offsetWidth;
        height = canvas.height = parent.offsetHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // 1. Linhas de Perfil Ortogonais (Verticais e Horizontais que deslizam no fundo)
    class ProfileLine {
        constructor() {
            this.isVertical = Math.random() > 0.5;
            this.reset(true);
        }

        reset(initial = false) {
            if (this.isVertical) {
                this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? -10 : width + 10);
                this.y = 0;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = 0;
            } else {
                this.x = 0;
                this.y = initial ? Math.random() * height : (Math.random() > 0.5 ? -10 : height + 10);
                this.vx = 0;
                this.vy = (Math.random() - 0.5) * 0.35;
            }
            this.thickness = Math.random() * 1.2 + 0.6;
            this.opacity = Math.random() * 0.28 + 0.1;
            this.color = Math.random() > 0.4 ? palette.baseMid : palette.baseDark;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.isVertical && (this.x < -60 || this.x > width + 60)) this.reset();
            if (!this.isVertical && (this.y < -60 || this.y > height + 60)) this.reset();
        }

        draw() {
            ctx.beginPath();
            if (this.isVertical) {
                ctx.moveTo(this.x, 0);
                ctx.lineTo(this.x, height);
            } else {
                ctx.moveTo(0, this.y);
                ctx.lineTo(width, this.y);
            }
            ctx.strokeStyle = hexToRgba(this.color, this.opacity);
            ctx.lineWidth = this.thickness;
            ctx.setLineDash([]);
            ctx.stroke();
        }
    }

    // 2. Molduras Geométricas Animadas (Self-drawing Rectangles com Transparência)
    class WindowFrame {
        constructor() {
            this.reset(true);
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }

        reset(initial = false) {
            this.w = Math.random() * 220 + 120;
            this.h = Math.random() * 280 + 140;
            this.x = initial ? Math.random() * (width - this.w) : (Math.random() > 0.5 ? -this.w - 30 : width + 30);
            this.y = Math.random() * (height - this.h);
            this.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.4 + 0.15);
            this.vy = (Math.random() - 0.5) * 0.18;
            this.perimeter = (this.w * 2) + (this.h * 2);
            this.drawPhase = Math.random() * Math.PI * 2;
            this.drawSpeed = Math.random() * 0.008 + 0.004;
            this.hasMullionX = Math.random() > 0.35;
            this.hasMullionY = Math.random() > 0.5;
            this.mullionXPos = this.w * (Math.random() * 0.4 + 0.3);
            this.mullionYPos = this.h * (Math.random() * 0.4 + 0.3);

            const randColor = Math.random();
            if (randColor > 0.78) {
                this.frameColor = palette.accentGold;
                this.glassColor = palette.baseDark;
            } else if (randColor > 0.38) {
                this.frameColor = palette.baseLight;
                this.glassColor = palette.baseDark;
            } else {
                this.frameColor = palette.baseMid;
                this.glassColor = '#06170d';
            }
            this.mullionColor = palette.baseMid;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.drawPhase += this.drawSpeed;
            if (
                (this.vx > 0 && this.x > width + 140) ||
                (this.vx < 0 && this.x < -this.w - 140) ||
                this.y > height + 140 || this.y < -this.h - 140
            ) {
                this.reset();
            }
        }

        draw() {
            let progress = (Math.sin(this.drawPhase) + 1) / 2;
            let currentDrawLength = this.perimeter * progress;
            let glassAlpha = progress > 0.85 ? 0.09 : 0.035;

            // Preenchimento translúcido de fundo
            ctx.fillStyle = hexToRgba(this.glassColor, glassAlpha);
            ctx.fillRect(this.x, this.y, this.w, this.h);

            // Borda com efeito traçado contínuo (stroke-dash)
            ctx.strokeStyle = hexToRgba(this.frameColor, 0.45 + (progress * 0.3));
            ctx.lineWidth = 1.4;
            ctx.setLineDash([this.perimeter]);
            ctx.lineDashOffset = this.perimeter - currentDrawLength;
            ctx.strokeRect(this.x, this.y, this.w, this.h);

            // Divisórias internas (mullions estilo blueprint)
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = hexToRgba(this.mullionColor, 0.35);
            ctx.globalAlpha = progress;

            if (this.hasMullionX) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.mullionXPos, this.y);
                ctx.lineTo(this.x + this.mullionXPos, this.y + this.h);
                ctx.stroke();
            }

            if (this.hasMullionY) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.mullionYPos);
                ctx.lineTo(this.x + this.w, this.y + this.mullionYPos);
                ctx.stroke();
            }

            ctx.globalAlpha = 1.0;
        }
    }

    // 3. Nódulos Circulares Tecnológicos com Radar e Ponto Pulsante
    class TechNode {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = (Math.random() - 0.5) * 0.25;
            this.radius = Math.random() * 12 + 10;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.color = Math.random() > 0.5 ? palette.accentBright : palette.baseLight;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;
            if (this.x < -30 || this.x > width + 30 || this.y < -30 || this.y > height + 30) {
                this.reset();
            }
        }

        draw() {
            const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
            const currentRadius = this.radius + (pulse * 4);
            const alpha = 0.35 + (pulse * 0.35);

            // Anel externo
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(this.color, alpha * 0.7);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Ponto central brilhante
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(this.color, alpha);
            ctx.fill();
        }
    }

    function initElements() {
        frames = [];
        profiles = [];
        nodes = [];
        for (let i = 0; i < 14; i++) {
            frames.push(new WindowFrame());
        }
        for (let i = 0; i < 9; i++) {
            profiles.push(new ProfileLine());
        }
        for (let i = 0; i < 4; i++) {
            nodes.push(new TechNode());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        profiles.forEach(p => {
            p.update();
            p.draw();
        });

        frames.forEach(f => {
            f.update();
            f.draw();
        });

        nodes.forEach(n => {
            n.update();
            n.draw();
        });

        requestAnimationFrame(animate);
    }

    initElements();
    animate();
}

/* ==========================================================================
   EFEITO SPOTLIGHT DINÂMICO NOS CARDS MULTIDISCIPLINARES
   ========================================================================== */
function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        // Touch support para dispositivos móveis
        card.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const rect = card.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        }, { passive: true });
    });
}

/* ==========================================================================
   ANIMAÇÃO EXCLUSIVA DE VITALIDADE & FLUXO SINÁPTICO (TERAPIAS)
   Partículas orgânicas com halos bioluminescentes, ondas harmônicas e sinapses
   ========================================================================== */
function initCareParticlesAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let waves = [];

    const colors = [
        { r: 94, g: 168, b: 44 },   // Verde folha
        { r: 164, g: 234, b: 117 }, // Menta radiante
        { r: 212, g: 163, b: 75 },  // Ouro nobre
        { r: 243, g: 212, b: 141 }  // Âmbar suave
    ];

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        width = canvas.width = parent.offsetWidth;
        height = canvas.height = parent.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class VitalityParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 10;
            this.radius = Math.random() * 3 + 1.5;
            this.baseRadius = this.radius;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = -(Math.random() * 0.45 + 0.2);
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.floatAmp = Math.random() * 20 + 10;
            this.startX = this.x;
        }

        update() {
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;
            this.x = this.startX + Math.sin(this.pulsePhase) * this.floatAmp;

            if (this.y < -20 || this.x < -30 || this.x > width + 30) {
                this.reset();
            }
        }

        draw() {
            const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
            const currentRadius = this.baseRadius + pulse * 1.5;
            const currentAlpha = this.alpha * (0.6 + pulse * 0.4);

            // Halo suave com gradiente radial
            const glow = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, currentRadius * 4
            );
            glow.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha})`);
            glow.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha * 0.4})`);
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius * 4, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Ponto central
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha * 0.9})`;
            ctx.fill();
        }
    }

    // Ondas orgânicas senoidais de cura que percorrem suavemente o fundo
    class BioWave {
        constructor(yRatio, speed, amp, colorStr) {
            this.yRatio = yRatio;
            this.speed = speed;
            this.amp = amp;
            this.color = colorStr;
            this.phase = Math.random() * Math.PI * 2;
        }

        update() {
            this.phase += this.speed;
        }

        draw() {
            const baseY = height * this.yRatio;
            ctx.beginPath();
            ctx.moveTo(0, baseY);

            for (let x = 0; x <= width; x += 15) {
                const waveY = baseY + Math.sin((x * 0.003) + this.phase) * this.amp
                                    + Math.cos((x * 0.006) - this.phase * 0.5) * (this.amp * 0.4);
                ctx.lineTo(x, waveY);
            }

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    function init() {
        particles = [];
        const count = Math.min(35, Math.floor(width / 35) + 15);
        for (let i = 0; i < count; i++) {
            particles.push(new VitalityParticle());
        }

        waves = [
            new BioWave(0.3, 0.006, 25, 'rgba(94, 168, 44, 0.12)'),
            new BioWave(0.65, -0.005, 30, 'rgba(164, 234, 117, 0.1)'),
            new BioWave(0.85, 0.004, 20, 'rgba(212, 163, 75, 0.08)')
        ];
    }

    function drawConnections() {
        const maxDist = 95;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.22;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(164, 234, 117, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // 1. Desenhar ondas orgânicas
        waves.forEach(w => {
            w.update();
            w.draw();
        });

        // 2. Desenhar partículas
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // 3. Desenhar fios sinápticos entre partículas próximas
        drawConnections();

        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/* ==========================================================================
   ANIMAÇÕES DE ENTRADA SUAVE NAS SEÇÕES (DIFERENCIAIS, FAQ & AGENDAMENTO)
   Todas com repetição dinâmica ao subir e descer a página
   ========================================================================== */
function initScrollTriggerAnimations() {
    const animatedSections = [
        { id: 'diferenciais', threshold: 0.10 },
        { id: 'duvidas', threshold: 0.10 },
        { id: 'agendamento', threshold: 0.10 }
    ];

    animatedSections.forEach(({ id, threshold }) => {
        const section = document.getElementById(id);
        if (!section) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    section.classList.add('is-visible');
                    // No mobile, mantém visível para evitar piscadas ao rolar a página
                    if (window.innerWidth <= 768) {
                        observer.unobserve(section);
                    }
                } else {
                    if (window.innerWidth > 768) {
                        section.classList.remove('is-visible');
                    }
                }
            });
        }, {
            threshold: threshold,
            rootMargin: '0px 0px -20px 0px'
        });

        observer.observe(section);
    });

    // Suporte ao toque e clique no mobile para o efeito de carregamento de borda nos cards de diferenciais
    const pillarCards = document.querySelectorAll('.pillar-card');
    pillarCards.forEach(card => {
        let touchTimeout = null;

        card.addEventListener('pointerdown', () => {
            pillarCards.forEach(c => c.classList.remove('is-charging'));
            card.classList.add('is-charging');

            clearTimeout(touchTimeout);
            touchTimeout = setTimeout(() => {
                card.classList.remove('is-charging');
            }, 2600);
        });

        card.addEventListener('pointerleave', () => {
            clearTimeout(touchTimeout);
            card.classList.remove('is-charging');
        });
    });
}
