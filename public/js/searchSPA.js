/* ALL SEARCH STATE FUNCTIONS IN THIS FILE */

// Pulls all the brands from the database.
// NOT based on the search results of the user query, but rather it
// gives the brands of ALL of the phones in the database
const populateBrands = (brands, phones) => {
    // Populate all brands in db
    const brandChoices = document.getElementById('brandChoice');
    brandChoices.innerHTML = '';

    // Add the empty choice
    let brandOption = document.createElement('option');
    brandOption.textContent = 'All Brands';
    brandOption.setAttribute('value', '');
    brandChoices.appendChild(brandOption);

    brands.forEach((brand) => {
        let brandOption = document.createElement('option');
        brandOption.setAttribute('value', brand);
        brandOption.textContent = brand;
        brandChoices.appendChild(brandOption);
    });

    if (brandFilter) brandChoices.value = brandFilter;

    loadSearchResults(phones); // Use updated values

    // Event listener/handler for value change
    brandChoices.onchange = (e) => {
        brandFilter = e.target.value;
        loadSearchResults(phones);
    };
};

// Sets the lower, upper and current values of the slider based on the
// search query. Will default the current value to the max value found
// based on the search query, in order to not prematurely filter out the
// user search results
const setSliderValues = (phones) => {
    // Set slider range and label
    const slider = document.getElementById('maxPriceSlider');
    let maxPrice = 100; // Default, in case of no match

    phones.forEach((phone) => {
        if (phone.price > maxPrice) {
            maxPrice = Math.ceil(phone.price);
        }
    });

    maxPrice = Math.ceil(maxPrice / 10) * 10; // Account for the step of 10

    slider.setAttribute('max', maxPrice);

    slider.value = priceFilter ? priceFilter : maxPrice;

    const tooltip = document.getElementById('sliderTooltip');
    tooltip.textContent = `\$${slider.value}`;

    loadSearchResults(phones); // Use updated values

    // Event listener/handler for value change
    slider.onchange = (e) => {
        tooltip.textContent = `\$${slider.value}`;
        priceFilter = slider.value;
        loadSearchResults(phones);
    };
};

// Factory function to populate the search result page based on the
// search query on search state initialisation
const loadSearchResults = (phones) => {
    const grid = document.getElementById('searchResultsGrid');

    // Clear old results
    grid.innerHTML = '';

    let i = 0;
    let j = 0;
    let row = null;

    if (phones.length === 0) {
        let msg = document.createElement('div');
        msg.textContent = 'No matching results';
        msg.className = 'text-center my-5 lead';
        grid.appendChild(msg);
        return;
    }

    let found = false;

    for (; i < phones.length; i++) {
        // New row needed
        if (i === 0 || (j % 4 === 0 && j > 0)) {
            row = document.createElement('div');
            row.className = 'row my-4 mx-auto';
            grid.appendChild(row);
        }

        let item = phones[i];

        // Check filter
        const maxValue = document.getElementById('maxPriceSlider').value;
        const selectedBrand = document.getElementById('brandChoice').value;

        // Check price
        if (!(item.price < maxValue)) {
            continue;
        } else {
            // Check brand
            if (selectedBrand.length > 0) {
                if (item.brand !== selectedBrand) continue;
            }
        }
        
        // We found a match!
        found = true;

        j++;

        // Build the profile
        // This is very similar to home state, with different formatting...
        let column = document.createElement('div');
        column.className = 'col-xl-3 col-sm-6 col-xs-12 my-2';

        let card = document.createElement('div');
        card.className = 'card text-center h-100';

        let heading = document.createElement('h5');
        heading.className = 'card-header';
        heading.textContent = `${item.brand} Phone`;

        const img = document.createElement('img');
        img.className = 'card-img mx-auto mt-4';

        let imgPath = getImgPath(item);
        img.setAttribute('src', imgPath);
        img.setAttribute('alt', `${item.brand} Phone`);

        let titleContainer = document.createElement('div');
        titleContainer.className = 'card-body h-100';
        let title = document.createElement('p');
        title.className = 'card-text';
        title.textContent = item.title.substring(0, 100);
        if (item.title.length > 100) {
            title.textContent += '...';
        }

        let featureList = document.createElement('ul');
        featureList.className = 'list-group list-group-flush';
        let brand = document.createElement('li');
        brand.className = 'list-group-item';
        brand.textContent = `Brand: ${item.brand}`;
        let price = document.createElement('li');
        price.className = 'list-group-item';
        price.textContent = `Price: \$${item.price.toFixed(2)}`;
        let stock = document.createElement('li');
        stock.className = 'list-group-item';
        stock.textContent = `Stock: ${item.stock}`;

        let btnWrapper = document.createElement('div');
        btnWrapper.className = 'card-body';
        let btn = document.createElement('a');
        btn.className = 'btn btn-primary';
        btn.textContent = 'More Info';
        btn.addEventListener('click', (e) => {
            loadItemHandler(item._id);
        });

        // Build DOM sub-tree and add
        row.append(column);
        column.appendChild(card);

        card.appendChild(heading);
        card.appendChild(img);
        card.appendChild(titleContainer);
        card.appendChild(featureList);
        card.appendChild(btnWrapper);

        titleContainer.appendChild(title);
        featureList.appendChild(brand);
        featureList.appendChild(price);
        featureList.appendChild(stock);
        btnWrapper.append(btn);
    }

    // Catchall for when the user filters and doesn't have any results
    if (!found) {
        let msg = document.createElement('div');
        msg.textContent = 'No matching results, try adjusting your filters';
        msg.className = 'text-center my-5 lead';
        grid.appendChild(msg);
        return;
    }
};

var initSearch = async () => {
    let phones = null;
    let brands = null;

    try {
        let res = await axios.get(`/phones/name/${searchTerm}`);
        phones = res.data;

        res = await axios.get(`/phones/brands`);
        brands = res.data;
    } catch (err) {
        console.error(err);
    }

    populateBrands(brands, phones);
    setSliderValues(phones);

    // Event listener for return to home button
    let homeBtn = document.getElementById('homeBtn');

    homeBtn.addEventListener('click', async () => {
        // Clear search preferences, or else it will be weird when
        // user wants to make a new search
        brandFilter = null;
        priceFilter = null;
        searchTerm = '';

        document.getElementById('searchBar').value = '';

        await initHome();
        transitionPage('home');
    });

    // Load the phones in the grid
    loadSearchResults(phones);
};
