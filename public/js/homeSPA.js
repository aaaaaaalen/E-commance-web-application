/* ALL HOME STATE FUNCTIONS IN THIS FILE */

// Runs whenever the home state is called
var initHome = async () => {
    // Build the sold out soon cards
    await initItems(
        '/phones/stock/1/5/asc',
        'lowStockContainer',
        'Sold out soon!'
    );

    // Build the best sellers cards
    await initItems(
        '/phones/rating/5/desc',
        'bestRatedContainer',
        'Highly rated!'
    );
};

// Factory function to build out the best sellers and low stock items on
// the home page state
const initItems = async (routePath, containerId, footerText) => {
    let res = null;

    // Fetch latest low stock/high rated items
    try {
        res = await axios.get(routePath);
    } catch (err) {
        console.error(err);
    }

    // Flush the old state and prep new population
    let container = document.getElementById(containerId);
    container.innerHTML = '';

    // If nothing found (e.g. empty or disabled database), render basic
    // message
    if (res.data.length === 0) {
        let msgContainer = document.createElement('div');
        msgContainer.className = 'mx-auto my-5 text-center lead';
        msgContainer.textContent =
            'Nothing found. Has the database been loaded?';
        container.append(msgContainer);
    }

    res.data.forEach((item) => {
        // Build new elements
        const itemWrapper = document.createElement('div');
        itemWrapper.className =
            'col-xl-2 col-lg-4 col-sm-6 ' + 'col-xs-12 my-2 mx-auto';

        const card = document.createElement('div');
        card.className = 'card text-center h-100';

        const heading = document.createElement('h5');
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

        let rating = null;
        if (item.avgRating) {
            rating = document.createElement('li');
            rating.className = 'list-group-item';
            rating.textContent =
                `Average Rating: ${item.avgRating.toFixed(2)}/5.00` +
                ` (${item.numReviews} reviews)`;
        }

        let btnWrapper = document.createElement('div');
        btnWrapper.className = 'card-body';
        let btn = document.createElement('a');
        btn.className = 'btn btn-primary';
        btn.textContent = 'More Info';
        btn.addEventListener('click', (e) => {
            loadItemHandler(item._id);
        });

        let footer = document.createElement('div');
        footer.className = 'card-footer text-muted';
        footer.textContent = footerText;

        // Now build the DOM sub-tree and connect to the root container
        container.appendChild(itemWrapper);

        itemWrapper.appendChild(card);
        card.appendChild(heading);
        card.appendChild(img);
        card.appendChild(titleContainer);
        card.appendChild(featureList);
        card.appendChild(btnWrapper);
        card.appendChild(footer);

        titleContainer.appendChild(title);
        featureList.appendChild(brand);
        featureList.appendChild(price);
        featureList.appendChild(stock);
        if (item.avgRating) {
            featureList.append(rating);
        }

        btnWrapper.append(btn);
    });
};

const loadItemHandler = async (phoneId) => {
    await initItem(phoneId);
    transitionPage('item');
};
