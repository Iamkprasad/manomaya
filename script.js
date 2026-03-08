document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle logic
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

    // Set Current Year in Footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Scroll Animations using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-anim');
    scrollElements.forEach(el => scrollObserver.observe(el));

    // Blog Rendering Logic
    const blogFeedContainer = document.getElementById('blog-feed-container');
    const singlePostContainer = document.getElementById('single-post-container');

    if (blogFeedContainer || singlePostContainer) {
        fetch('data/blogs.json')
            .then(response => response.json())
            .then(blogs => {
                if (blogFeedContainer) {
                    renderBlogFeed(blogs, blogFeedContainer);
                }
                
                if (singlePostContainer) {
                    renderSinglePost(blogs, singlePostContainer);
                }
            })
            .catch(error => console.error('Error loading blogs:', error));
    }

    function renderBlogFeed(blogs, container) {
        if (blogs.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-12">No thoughts recorded yet.</p>';
            return;
        }

        let html = '';
        blogs.forEach((blog, index) => {
            const delay = 0.2 + (index * 0.1);
            html += `
                <a href="blog-post.html?id=${blog.id}#${blog.id}" class="block fade-in-up" style="animation-delay: ${delay}s">
                    <article class="blog-summary-card">
                        <div class="blog-summary-content">
                            <span class="feed-label">${blog.label}</span>
                            <h2 class="feed-title blog-card-title">${blog.title}</h2>
                            <p class="feed-desc line-clamp-2">${blog.excerpt}</p>
                            <div class="blog-summary-meta">
                                <span>${blog.date}</span>
                                <span class="mx-2">·</span>
                                <span class="blog-read-more">
                                    Read more <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </span>
                            </div>
                        </div>
                        ${blog.image ? `
                        <div class="blog-summary-img-wrapper">
                            <img src="${blog.image}" alt="${blog.title}" class="blog-summary-img" loading="lazy">
                        </div>
                        ` : ''}
                    </article>
                </a>
            `;
        });
        container.innerHTML = html;
        
        // Re-trigger animations for injected content
        const newScrollElements = container.querySelectorAll('.fade-in-up');
        setTimeout(() => {
            newScrollElements.forEach(el => {
                el.classList.add('in-view');
            });
        }, 50);
    }

    function renderSinglePost(blogs, container) {
        // Get ID from URL or Hash fallback for aggressive servers
        const urlParams = new URLSearchParams(window.location.search);
        let postId = urlParams.get('id');

        if (!postId && window.location.hash) {
            postId = window.location.hash.substring(1); // remove '#'
        }

        if (!postId) {
            container.innerHTML = '<div class="text-center py-20 text-muted-foreground">Post not found. Please return to the blog.</div>';
            return;
        }

        const blog = blogs.find(b => b.id === postId);

        if (!blog) {
            container.innerHTML = '<div class="text-center py-20 text-muted-foreground">Post not found. Please return to the blog.</div>';
            return;
        }

        // Set Document Title automatically
        document.title = `${blog.title} | Author Blog | Manomaya`;

        // Render content
        container.innerHTML = `
            <div class="text-center mb-10 fade-in-up">
                <span class="feed-label mb-4 inline-block">${blog.label}</span>
                <h1 class="text-4xl font-serif blog-post-title mb-4">${blog.title}</h1>
                <div class="blog-post-meta flex items-center justify-center text-sm">
                    <span>${blog.author || 'manomaya'}</span>
                    <span class="mx-2">·</span>
                    <span>${blog.date}</span>
                </div>
            </div>

            ${blog.image ? `
            <div class="blog-img-container mb-12 fade-in-up" style="animation-delay: 0.2s">
                <img src="${blog.image}" alt="${blog.title}" class="blog-post-main-img">
            </div>
            ` : ''}

            <div class="feed-body space-y-6 blog-post-content text-justify fade-in" style="animation-delay: 0.4s">
                ${blog.content}
            </div>

            <div class="divider-gold mx-auto my-16"></div>
            
            <div class="text-center pb-8">
                 <button class="share-btn group mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-icon transition-colors mr-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                    <span class="transition-colors font-medium">Share this thought</span>
                </button>
            </div>
        `;
        
        // Trigger animations immediately for injected content since it's already in viewport
        setTimeout(() => {
            const injectedAnims = container.querySelectorAll('.fade-in, .fade-in-up');
            injectedAnims.forEach(el => el.classList.add('in-view'));
        }, 50);
    }
});
