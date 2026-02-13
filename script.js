// Performance optimized JavaScript with lazy loading and debouncing

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS with performance settings
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
            disable: window.innerWidth < 768 // Disable on mobile for better performance
        });
    }

    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Navbar scroll effect (throttled for performance)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', throttle(function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 16)); // ~60fps
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting (debounced)
    window.addEventListener('scroll', debounce(function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    }, 100));

    // Mobile menu handling
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navbarCollapse.classList.remove('show');
            });
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            navbarCollapse?.classList.remove('show');
        }
    });

    // Lazy load animations when elements come into viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for lazy loading
    document.querySelectorAll('.tool-card, .development-card, .importance-card, .feature-card').forEach(element => {
        element.classList.add('loading');
        animationObserver.observe(element);
    });

    // Counter animation (optimized)
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = +counter.getAttribute('data-target');
                        const duration = 2000;
                        const increment = target / (duration / 16);
                        let current = 0;
                        
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }

    // Progress bar animation (optimized)
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const width = bar.style.width;
                        bar.style.width = '0%';
                        requestAnimationFrame(() => {
                            bar.style.width = width;
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(bar);
        });
    }

    // Initialize animations
    animateCounters();
    animateProgressBars();

    // Form submission handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[type="text"]')?.value;
            const email = this.querySelector('input[type="email"]')?.value;
            const subject = this.querySelector('input[type="text"]:nth-of-type(2)')?.value;
            const message = this.querySelector('textarea')?.value;
            
            if (!name || !email || !subject || !message) {
                showNotification('يرجى ملء جميع الحقول', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الإرسال...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: slideDown 0.3s ease;
            min-width: 300px;
            text-align: center;
        `;
        
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Parallax effect (disabled on mobile for performance)
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', throttle(function() {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            const heroContent = document.querySelector('.hero-content');
            
            if (heroSection && heroContent) {
                heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - scrolled / 600;
            }
        }, 16));
    }

    // Floating elements animation (simplified for performance)
    const floatingElements = document.querySelectorAll('.float-element');
    floatingElements.forEach((element, index) => {
        const duration = 3 + Math.random() * 3;
        const delay = Math.random() * 2;
        element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });

    // Timeline animation (optimized)
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
            item.style.transition = 'all 0.6s ease';
            timelineObserver.observe(item);
        });
    }

    // Loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Console welcome message
    console.log('%c🤖 مرحباً بك في عالم الذكاء الاصطناعي!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
    console.log('%cاستكشف مستقبل التكنولوجيا معنا', 'color: #8b5cf6; font-size: 14px;');
});
