// Loader Functionality
function showLoader(destination) {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    
    loader.classList.add('active');
    
    // Simulate loading time (2 seconds)
    setTimeout(() => {
        loader.classList.remove('active');
        if (destination) {
            window.location.href = destination;
        }
    }, 2000);
}

// Add event listeners to all navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Menu functionality
    var menuBtn = document.querySelector('.main-navbar .menu-btn');
    var menuList = document.querySelector('.main-navbar .nav-list');
    var menuListItems = document.querySelectorAll('.nav-list li a');

    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            menuBtn.classList.toggle('active');
            menuList.classList.toggle('active');
        });
    }

    for (var i = 0; i < menuListItems.length; i++) {
        menuListItems[i].addEventListener('click', menuItemClicked);
    }

    function menuItemClicked() {
        if (menuBtn && menuList) {
            menuBtn.classList.remove('active');
            menuList.classList.remove('active');
        }
    }

    // Scroll functionality
    var InicioSection = document.querySelector('.Inicio');
    if (InicioSection) {
        window.addEventListener('scroll', pageScrollFunction);
        window.addEventListener('load', pageScrollFunction);
    }

    function pageScrollFunction() {
        if (window.scrollY > 120) {
            InicioSection.classList.add('active');
        } else {
            InicioSection.classList.remove('active');
        }
    }

    // Navigation links
    document.querySelectorAll('a').forEach(link => {
        // Skip external links, anchors, and mailto links
        if (link.href.includes('http') || 
            link.getAttribute('href') === '#' || 
            link.href.startsWith('mailto:') ||
            link.getAttribute('target') === '_blank') {
            return;
        }
        
        // Skip if already has click handler
        if (link.hasAttribute('data-loader-handled')) {
            return;
        }
        
        link.setAttribute('data-loader-handled', 'true');
        link.addEventListener('click', function(e) {
            // Don't intercept if special key pressed (ctrl, meta, shift)
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                return;
            }
            
            e.preventDefault();
            showLoader(this.href);
        });
    });

    // Quiz button
    document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoader(btn.href);
        });
    });

    // Owl Carousel initialization
    if (typeof $ !== 'undefined' && $('.partners-slider').length) {
        $('.partners-slider').owlCarousel({
            loop: true,
            autoplay: true,
            autoplayTimeout: 3000,
            margin: 10,
            nav: true,
            navText: ["<i class='fa-solid fa-arrow-left'></i>",
                     "<i class='fa-solid fa-arrow-right'></i>"],
            responsive: {
                0: { items: 1 },
                500: { items: 2 },
                700: { items: 3 },
                1000: { items: 5 }
            }
        });
    }
});