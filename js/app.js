/* ============================================
   SPA ROUTER + APP INITIALIZATION
   ============================================ */

(function () {
    const viewContainer = document.getElementById('view-container');
    const navItems = document.querySelectorAll('.nav-item');

    // View registry — arrow functions preserve `this` on the view objects
    const views = {
        'sorting': {
            mount: (c) => SortingView.mount(c),
            unmount: () => SortingView.unmount()
        },
        'graphs': {
            mount: (c) => GraphView.mount(c),
            unmount: () => GraphView.unmount()
        },
        'data-structures': {
            mount: (c) => DSView.mount(c),
            unmount: () => DSView.unmount()
        }
    };

    let currentView = null;

    function navigate(route) {
        // Unmount current view
        if (currentView && views[currentView] && views[currentView].unmount) {
            views[currentView].unmount();
        }

        // Update nav
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.route === route);
        });

        // Clear container
        viewContainer.innerHTML = '';

        // Mount new view
        if (views[route]) {
            currentView = route;
            views[route].mount(viewContainer);
        } else {
            // Default to sorting
            currentView = 'sorting';
            views['sorting'].mount(viewContainer);
            history.replaceState(null, '', '#sorting');
        }
    }

    // Nav click handlers
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const route = item.dataset.route;
            history.pushState(null, '', `#${route}`);
            navigate(route);
        });
    });

    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const route = location.hash.slice(1) || 'sorting';
        navigate(route);
    });

    // Initial route
    const initialRoute = location.hash.slice(1) || 'sorting';
    navigate(initialRoute);
})();
