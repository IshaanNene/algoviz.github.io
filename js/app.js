/* ============================================
   APP — SPA Router
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
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
        if (currentView && views[currentView] && views[currentView].unmount) {
            views[currentView].unmount();
        }
        viewContainer.innerHTML = '';
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.route === route);
        });
        if (views[route]) {
            views[route].mount(viewContainer);
            currentView = route;
        }
    }

    function onHashChange() {
        const hash = window.location.hash.slice(1) || 'sorting';
        navigate(hash);
    }

    window.addEventListener('hashchange', onHashChange);
    onHashChange();
});
