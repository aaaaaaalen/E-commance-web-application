/* TOP BAR FUNCTIONS*/
window.addEventListener('load', (e) => {
    // Update top navbar cart button quantity on page load
    if (user) {
        updateCartHeader();
    }

    // Search triggers for state change for navbar search
    let btn = document.querySelector('#navbar-search-btn');
    let searchBox = document.querySelector("input[type='search']");
    searchBox.value = ''; // Default value

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        let value = document.querySelector("input[type='search']").value;
        if (value.length === 0) {
            return;
        }

        searchTerm = value;
        await initSearch();
        transitionPage('search');
    });

    searchBox.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            let value = document.querySelector("input[type='search']").value;
            if (value.length === 0) {
                return;
            }

            searchTerm = value;
            await initSearch();
            transitionPage('search');
        }
    });
});

// Updates the total QUANTITY of items in the cart, not the total number
// of unique entries in the cart. Usually called on load of the page or
// in the event of adding to cart from the item page
var updateCartHeader = () => {
    let lsItems = { ...localStorage };
    let lsKeys = Object.keys(lsItems);
    let lsValues = Object.values(lsItems);
    let cartHeaderBtn = document.getElementById('cartHeaderBtn');

    let total = 0;
    for (let i = 0; i < lsKeys.length; i++) {
        let key = '';

        try {
            key = JSON.parse(lsKeys[i]);
        } catch (err) {
            continue; // The key is not an array or other parse-able JSON
        }

        let value = JSON.parse(lsValues[i]);

        let storedUser = key[1];
        let phone = value;

        if (storedUser === user._id) {
            total += phone.addedQty;
        }
    }

    cartHeaderBtn.innerText = `Cart (${total})`;
};

/* State-wide functions */
// Helper function to hide all but but the new active container
var transitionPage = async (newState, loadCached = false, cached = {}) => {
    // Save page state to return to when page transitions
    cachePageState('/');

    const homeContainer = document.getElementById('homeContainer');
    const itemContainer = document.getElementById('itemContainer');
    const searchContainer = document.getElementById('searchContainer');

    homeContainer.hidden = true;
    itemContainer.hidden = true;
    searchContainer.hidden = true;

    if (loadCached) {
        activePhone = cached.activePhone;
        searchTerm = cached.searchTerm;
        brandFilter = cached.brandFilter;
        priceFilter = cached.priceFilter;
    }

    switch (newState) {
        case 'home':
            if (loadCached) {
                await initHome();
            }
            homeContainer.hidden = false;
            currentState = 'home';
            break;
        case 'item':
            if (loadCached) {
                // Item page will still fetch latest data in case it has been
                // updated in database since the redirect
                await initItem(activePhone._id);
            }
            itemContainer.hidden = false;
            currentState = 'item';
            break;
        case 'search':
            if (loadCached) {
                await initSearch(cached.searchTerm);
            }
            searchContainer.hidden = false;
            currentState = 'search';
            break;
    }
};

// Helper function to return user to where they were before redirect/state change
var cachePageState = (path) => {
    localStorage.setItem(
        'lastPage',
        JSON.stringify({
            path,
            currentState,
            activePhone,
            searchTerm,
            brandFilter,
            priceFilter,
            redirected: false,
        })
    );
};

// Helper function to clear cache state when we don't need a redirect
var clearCache = () => {
    localStorage.removeItem('lastPage');
};

// Helper function to handle weird temporary URIs in database for image
// Returns a URL usable to set as src for <img>
var getImgPath = (phoneObj) => {
    let imgPath = '';

    if (phoneObj.image.includes('http')) {
        imgPath = phoneObj.image;
    } else {
        imgPath = `/img/${phoneObj.brand}.jpeg`;
    }

    return imgPath;
};

// Retrieve page state if any and load
window.addEventListener('load', async (e) => {
    let cached = localStorage.getItem('lastPage');
    if (cached) {
        cached = JSON.parse(cached);
    }

    // If we've never been redirected... load default state
    if (cached) {
        // cached.redirected must set to true by the forwarding page
        // to complete the redirect, see comment below
        if (!cached.redirected) {
            await initHome();
            transitionPage('home');
            // Clear the cache in case user returns to home page w/o logging in
            // after partial redirect e.g. they walk away from the computer
            // to avoid falsely restoring session
            clearCache(); // Clean slate
        } else {
            // Load existing search if any into search bar
            let searchBar = document.getElementById('searchBar');
            searchBar.value = cached.searchTerm;

            // Load previous page, note this "consumes" the redirect
            // by setting a new cache in transitionPage()
            transitionPage(
                cached.currentState,
                (loadCached = true),
                (cached = cached)
            );
        }
    } else {
        // Default action
        await initHome();
        transitionPage('home');
    }
});
