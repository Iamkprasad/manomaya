document.addEventListener('DOMContentLoaded', () => {
    console.log('Manomaya: Initializing premium features...');

    // 1. Initialize Shared Observer early
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    // Cache selectors
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const progressBar = document.querySelector('.scroll-progress');
    const navbar = document.querySelector('.navbar');
    const stackingContainer = document.querySelector('.stacking-section');
    const reflectionsStackContainer = document.getElementById('reflections-stack-container');

    // Page Reveal
    setTimeout(() => {
        document.body.classList.add('active');
        document.querySelectorAll('.scroll-anim').forEach(el => scrollObserver.observe(el));
    }, 100);

    // Custom Cursor
    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        const interactiveElements = document.querySelectorAll('a, button, .gallery-item, .feature-card-link');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.backgroundColor = 'hsla(38, 52%, 62%, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // Performance Optimized Scroll Logic
    let isScrolling = false;
    const isMobile = window.innerWidth <= 768;
    
    // Cache all stack images once they are loaded
    let activeStackImages = [];
    const updateActiveImages = () => {
        activeStackImages = Array.from(document.querySelectorAll('.stack-img'));
    };

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScroll();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    function handleScroll() {
        const winScroll = window.pageYOffset || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolledPercent = (winScroll / height) * 100;

        if (progressBar) progressBar.style.width = `${scrolledPercent}%`;

        if (navbar) {
            if (winScroll > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }

        // Parallax for stacking images - ONLY on desktop for performance
        if (!isMobile) {
            activeStackImages.forEach(img => {
                const rect = img.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const shift = (rect.top / window.innerHeight) * 10;
                    img.style.transform = `scale(1.05) translateY(${shift}px)`;
                }
            });
        }
    }

    // Dynamic Content Fetching with Cache Busting
    const cacheBuster = `?t=${new Date().getTime()}`;

    if (stackingContainer) {
        fetch(`data/stack-images.json${cacheBuster}`)
            .then(res => res.json())
            .then(data => {
                renderStackImages(data);
                updateActiveImages(); // Update cache
            })
            .catch(err => {
                console.error('Error loading stack images:', err);
                stackingContainer.innerHTML = '<p class="text-center py-20 text-muted-foreground">Unable to load content.</p>';
            });
    }

    if (reflectionsStackContainer) {
        fetch(`data/reflections.json${cacheBuster}`)
            .then(res => res.json())
            .then(data => {
                renderStackReflections(data);
                updateActiveImages(); // Update cache
            })
            .catch(err => {
                console.error('Error loading reflections:', err);
            });
    }

    function renderStackImages(images) {
        stackingContainer.innerHTML = images.map(img => `
            <div class="stack-layer">
                <div class="stack-content">
                    <div class="stack-img-wrapper">
                        <img src="${img.image}" alt="${img.title}" class="stack-img">
                        <div class="stack-overlay"></div>
                    </div>
                    <div class="stack-text scroll-anim">
                        <h2 class="stack-title">${img.title}</h2>
                        <p class="stack-desc">${img.desc}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        stackingContainer.querySelectorAll('.scroll-anim').forEach(el => scrollObserver.observe(el));
    }

    function renderStackReflections(reflections) {
        const savedIds = JSON.parse(localStorage.getItem('manomaya_saved') || '[]');
        reflectionsStackContainer.innerHTML = reflections.map(r => `
            <div class="reflection-stack-layer">
                <div class="stack-img-wrapper" style="opacity: 0.3;">
                    <img src="${r.image}" alt="" class="stack-img" style="filter: blur(10px);">
                </div>
                <div class="reflection-stack-card scroll-anim">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span class="feed-label">${r.label}</span>
                        <button class="save-btn ${savedIds.includes(r.id) ? 'saved' : ''}" data-id="${r.id}" aria-label="Save">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                        </button>
                    </div>
                    <h2 class="feed-title mt-2 mb-3">${r.title}</h2>
                    <p class="feed-quote text-muted-foreground italic mb-6">"${r.quote}"</p>
                    <div class="feed-body space-y-3">
                        ${r.body}
                    </div>
                    <div class="feed-footer mt-8 pt-4">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-muted-50">${r.author}</span>
                            <span class="text-muted-30">·</span>
                            <span class="text-xs text-muted-40">${r.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        reflectionsStackContainer.querySelectorAll('.scroll-anim').forEach(el => scrollObserver.observe(el));
    }

    // Mobile Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (menuBtn && mobileNav) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');
            if (!isOpen) {
                mobileNav.classList.add('open');
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            } else {
                mobileNav.classList.remove('open');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        });
    }

    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Interactive Breathwork Widget (Butterfly Sync)
    function initBreathwork() {
        // Create Modal
        const modalHtml = `
            <div class="breathwork-modal" id="breatheModal">
                <button class="breathwork-close" id="closeBreathe">×</button>
                <div class="breathe-container">
                    <div class="butterfly-container">
                        <div class="butterfly-wing left"></div>
                        <div class="butterfly-wing right"></div>
                    </div>
                    <div class="breathe-text-container">
                        <span class="bt-inhale">Breathe in deeply...</span>
                        <span class="bt-hold1">Hold the stillness...</span>
                        <span class="bt-exhale">Release slowly...</span>
                        <span class="bt-hold2">Rest...</span>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('breatheModal');
        const closeBtn = document.getElementById('closeBreathe');

        // Inject Nav Buttons
        const breatheBtnHtml = `<button class="nav-breathe-btn breathe-trigger">Breathe</button>`;
        const desktopNav = document.querySelector('.desktop-nav');
        const mobileNavContent = document.querySelector('.mobile-nav-content');
        
        if (desktopNav) desktopNav.insertAdjacentHTML('beforeend', breatheBtnHtml);
        if (mobileNavContent) mobileNavContent.insertAdjacentHTML('beforeend', breatheBtnHtml);

        function startBreathing() {
            modal.classList.add('breathing');
        }

        function stopBreathing() {
            modal.classList.remove('breathing');
        }

        // Event Listeners
        document.querySelectorAll('.breathe-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
                if (mobileNav && mobileNav.classList.contains('open')) {
                    menuBtn.click(); // close mobile menu if open
                }
                // Small delay to allow fade-in before animation starts
                setTimeout(startBreathing, 500);
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            stopBreathing();
        });
    }

    initBreathwork();

    // Blog logic
    const blogFeedContainer = document.getElementById('blog-feed-container');
    const singlePostContainer = document.getElementById('single-post-container');

    if (blogFeedContainer || singlePostContainer) {
        fetch(`data/blogs.json${cacheBuster}`)
            .then(res => res.json())
            .then(blogs => {
                if (blogFeedContainer) renderBlogFeed(blogs, blogFeedContainer);
                if (singlePostContainer) renderSinglePost(blogs, singlePostContainer);
            });
    }

    function renderBlogFeed(blogs, container) {
        if (blogs.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-12">No thoughts recorded yet.</p>';
            return;
        }
        const savedIds = JSON.parse(localStorage.getItem('manomaya_saved') || '[]');
        container.innerHTML = blogs.map((blog, index) => `
            <div class="block fade-in-up" style="animation-delay: ${0.2 + (index * 0.1)}s; position: relative;">
                <a href="blog-post.html?id=${blog.id}#${blog.id}" style="display: block;">
                    <article class="blog-summary-card">
                        <div class="blog-summary-content">
                            <span class="feed-label">${blog.label}</span>
                            <h2 class="feed-title blog-card-title">${blog.title}</h2>
                            <p class="feed-desc line-clamp-2">${blog.excerpt}</p>
                            <div class="blog-summary-meta">
                                <span>${blog.date}</span>
                                <span class="mx-2">·</span>
                                <span class="blog-read-more">Read more</span>
                            </div>
                        </div>
                        ${blog.image ? `<div class="blog-summary-img-wrapper"><img src="${blog.image}" alt="${blog.title}" class="blog-summary-img" loading="lazy"></div>` : ''}
                    </article>
                </a>
                <button class="save-btn ${savedIds.includes(blog.id) ? 'saved' : ''}" data-id="${blog.id}" aria-label="Save" style="position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
            </div>
        `).join('');
    }

    function renderSinglePost(blogs, container) {
        const urlParams = new URLSearchParams(window.location.search);
        let postId = urlParams.get('id') || (window.location.hash ? window.location.hash.substring(1) : null);
        const blog = blogs.find(b => b.id === postId);
        if (!blog) {
            container.innerHTML = '<div class="text-center py-20 text-muted-foreground">Post not found.</div>';
            return;
        }
        document.title = `${blog.title} | Manomaya`;

        // Simple Markdown-like formatting logic
        let formattedContent = blog.content;
        if (formattedContent) {
            formattedContent = formattedContent
                .replace(/\*(.*?)\*/g, '<strong>$1</strong>') // *bold*
                .replace(/_(.*?)_/g, '<em>$1</em>')         // _italic_
                .replace(/~(.*?)~/g, '<u>$1</u>');          // ~underline~
        }

        container.innerHTML = `
            <div class="text-center mb-10 fade-in-up">
                <span class="feed-label mb-4 inline-block">${blog.label}</span>
                <h1 class="text-4xl font-serif mb-4">${blog.title}</h1>
                <div class="text-sm"><span>${blog.author || 'manomaya'}</span><span class="mx-2">·</span><span>${blog.date}</span></div>
            </div>
            ${blog.image ? `<div class="blog-img-container mb-12 fade-in-up"><img src="${blog.image}" class="blog-post-main-img"></div>` : ''}
            <div class="feed-body space-y-6 blog-post-content text-justify fade-in">${formattedContent}</div>
        `;
    }

    // --- Saved Wisdom (My Journey) Logic ---
    const isJourneyPage = window.location.pathname.includes('journey');
    const savedLinkHtmlDesktop = `<a href="journey.html" class="nav-link ${isJourneyPage ? 'active' : ''}">Journey</a>`;
    const savedLinkHtmlMobile = `<a href="journey.html" class="mobile-nav-link ${isJourneyPage ? 'active' : ''}">Journey</a>`;
    
    const desktopNavObj = document.querySelector('.desktop-nav');
    const mobileNavObj = document.querySelector('.mobile-nav-content');
    if (desktopNavObj) desktopNavObj.insertAdjacentHTML('beforeend', savedLinkHtmlDesktop);
    if (mobileNavObj) mobileNavObj.insertAdjacentHTML('beforeend', savedLinkHtmlMobile);

    function getSavedItems() {
        return JSON.parse(localStorage.getItem('manomaya_saved') || '[]');
    }

    // Toast Notification System
    const toastHtml = `<div id="toast" class="toast-notification">Saved to your journey.</div>`;
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toast = document.getElementById('toast');
    let toastTimeout;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.save-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.dataset.id;
            let saved = getSavedItems();
            
            if (saved.includes(id)) {
                saved = saved.filter(item => item !== id);
                btn.classList.remove('saved');
                showToast('Removed from your journey.');
                
                if (isJourneyPage) {
                    const layer = btn.closest('.reflection-stack-layer') || btn.closest('.block');
                    if (layer) layer.remove();
                    if (getSavedItems().length === 0 || saved.length === 0) {
                        const container = document.getElementById('saved-container');
                        if (container) container.innerHTML = '<p class="text-center text-muted-foreground py-20">Your journey is currently empty. Explore and save wisdom to see it here.</p>';
                    }
                }
            } else {
                saved.push(id);
                btn.classList.add('saved');
                showToast('Added to your journey.');
            }
            localStorage.setItem('manomaya_saved', JSON.stringify(saved));
        }
    });

    // Private Journal Logic
    const journalInput = document.getElementById('journal-input');
    const saveJournalBtn = document.getElementById('save-journal-btn');
    
    if (journalInput && saveJournalBtn) {
        const savedJournal = localStorage.getItem('manomaya_journal') || '';
        journalInput.value = savedJournal;

        saveJournalBtn.addEventListener('click', () => {
            localStorage.setItem('manomaya_journal', journalInput.value);
            showToast('Reflection saved privately.');
        });
    }

    const savedContainer = document.getElementById('saved-container');
    if (savedContainer) {
        const savedIds = getSavedItems();
        if (savedIds.length === 0) {
            savedContainer.innerHTML = '<p class="text-center text-muted-foreground py-20">Your journey is currently empty. Explore and save wisdom to see it here.</p>';
        } else {
            Promise.all([
                fetch(`data/reflections.json${cacheBuster}`).then(res => res.json()),
                fetch(`data/blogs.json${cacheBuster}`).then(res => res.json())
            ]).then(([reflections, blogs]) => {
                const savedReflections = reflections.filter(r => savedIds.includes(r.id));
                const savedBlogs = blogs.filter(b => savedIds.includes(b.id)).map(b => ({
                    id: b.id,
                    label: b.label || 'Blog',
                    title: b.title,
                    quote: b.excerpt,
                    body: (b.content || '').substring(0, 150) + '...',
                    author: b.author || 'manomaya',
                    date: b.date,
                    image: b.image || 'assets/gallery-5.jpg',
                    link: `blog-post.html?id=${b.id}`
                }));

                const allSaved = [...savedReflections, ...savedBlogs];
                
                if (allSaved.length === 0) {
                     savedContainer.innerHTML = '<p class="text-center text-muted-foreground py-20">Your journey is currently empty.</p>';
                     return;
                }
                
                savedContainer.innerHTML = allSaved.map(r => `
                    <div class="reflection-stack-layer">
                        <div class="stack-img-wrapper" style="opacity: 0.3;">
                            <img src="${r.image}" alt="" class="stack-img" style="filter: blur(10px);">
                        </div>
                        <div class="reflection-stack-card scroll-anim">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span class="feed-label">${r.label}</span>
                                <button class="save-btn saved" data-id="${r.id}" aria-label="Save">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                </button>
                            </div>
                            <h2 class="feed-title mt-2 mb-3">${r.title}</h2>
                            <p class="feed-quote text-muted-foreground italic mb-6">"${r.quote}"</p>
                            <div class="feed-body space-y-3">
                                ${r.body}
                                ${r.link ? `<br><a href="${r.link}" class="text-gold mt-2 inline-block">Read full post →</a>` : ''}
                            </div>
                            <div class="feed-footer mt-8 pt-4">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-muted-50">${r.author}</span>
                                    <span class="text-muted-30">·</span>
                                    <span class="text-xs text-muted-40">${r.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                savedContainer.querySelectorAll('.scroll-anim').forEach(el => scrollObserver.observe(el));
            });
        }
    }
});
