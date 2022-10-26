let cart = null;

// Retrieve the cart from storage and load into the page
// Returns ONLY the phones with an associated user matching the
// currently logged in user (else you'd see other people's carts)
const getCartFromStorage = () => {
    let lsItems = { ...localStorage };
    lsItems = Object.entries(lsItems);

    let matching = [];

    // item[0] is (phoneId, userId) so item[0][1] is userId stored in LS
    for (let i = 0; i < lsItems.length; i++) {
        let key = null;

        try {
            key = JSON.parse(lsItems[i][0]);
        } catch (err) {
            continue; // The key is not an array or other parse-able JSON
        }
        let value = JSON.parse(lsItems[i][1]);

        let storageUser = key[1];

        // Add if user matches
        if (storageUser === user._id) {
            matching.push(value);
        }
    }

    return matching;
};

// Loads all the cart info from the cart global variable as list items
const initCart = async () => {
    // Edge case - no items in cart
    if (cart.length === 0) {
        dispCartMsg('You have no items in your cart.', []);
        return;
    }

    for (let i = 0; i < cart.length; i++) {
        let phone = cart[i];
        let msgs = [];

        // Check if enough stock, say to avoid race conditions
        let added = phone.addedQty;

        // Get a fresh copy of phone to check stock
        let res = await axios.get(`/phones/id/${phone._id}`);
        phone = res.data;
        phone.addedQty = added; // Re-add the user quantity

        let stockAvailable = phone.stock;

        if (added <= stockAvailable) {
            addItemToCartList(phone);
        } else {
            // We have more added to cart than what is available, remove
            // the item and prompt user to re-add item manually in the
            // absence of more explicit instructions
            msgs.push(
                `${phone.title.substring(0, 30)}...` +
                    ` does not have enough stock, you added ${added}` +
                    ` but only ${stockAvailable} is available`
            );

            localStorage.removeItem(JSON.stringify([phone._id, user._id]));
        }

        if (msgs.length > 0) {
            dispCartMsg(
                'Error, some items had to removed for the following reasons:',
                msgs
            );
        }
    }
};

// Update grand total at bottom of the page iteratively
const updateGrandTotal = () => {
    let grandTotal = document.getElementById('grandTotalFigure');

    let rows = document.querySelectorAll('#cartList li');
    let subTotal = 0;

    rows.forEach((row) => {
        let box = row.querySelector("input[type='checkbox']");
        let price = row.querySelector("div[name='totalPrice']").textContent;
        price = Number.parseFloat(price.replace('$', ''));
        subTotal += price;
    });

    // Update quantity at bottom
    grandTotal.textContent = subTotal.toFixed(2);
};

// Fires when a checkbox is selected, and adds the item total price to total
const updateSelectedTotal = () => {
    let rows = document.querySelectorAll('#cartList li');
    let subTotal = 0;

    rows.forEach((row) => {
        let box = row.querySelector("input[type='checkbox']");
        let price = row.querySelector("div[name='totalPrice']").textContent;
        price = Number.parseFloat(price.replace('$', ''));

        if (box.checked) {
            subTotal += price;
        }
    });

    // Update quantity at bottom
    document.getElementById('selectedTotalFigure').textContent =
        subTotal.toFixed(2);
};

// Fires when the quantity changes
// Change reflects in item total, and also triggers subtotal change
// NOTE: implicitly calls updateSelectedTotal() since individual item totals change
const updateItemTotals = () => {
    let rows = document.querySelectorAll('#cartList li');

    rows.forEach((row) => {
        let qtyField = row.querySelector("input[type='number']");
        let qty = qtyField.value;
        let unitPrice = row.querySelector("div[name='unitPrice']").textContent;
        unitPrice = Number.parseFloat(unitPrice.replace('$', ''));

        let newPrice = qty * unitPrice;

        let totalPrice = row.querySelector("div[name='totalPrice']");
        totalPrice.textContent = `\$${newPrice.toFixed(2)}`;
    });

    updateSelectedTotal();
};

// Builds the list item and populate the container
const addItemToCartList = (item) => {
    // Build all the DOM elements
    let itemContainer = document.createElement('li');
    itemContainer.setAttribute('phoneKey', item._id);
    itemContainer.className =
        'list-group-item row d-flex justify-content-between align-items-center border border-1 py-3';

    let iconContainer = document.createElement('div');
    iconContainer.className =
        'col-lg-1 col-1 order-0 order-lg-0 py-2 align-items-start remove-item-icon';

    let icon = document.createElement('i');
    icon.className = 'fas fa-times';
    icon.addEventListener('click', () => removeItemFromCart(item));

    let qtyContainer = document.createElement('div');
    qtyContainer.className =
        'col-lg-1 col-6 order-2 order-lg-1 py-2 justify-content-center';
    let qtyLabel = document.createElement('div');
    qtyLabel.className = 'd-lg-none w-25 mx-auto';
    qtyLabel.textContent = 'Qty:';
    let qty = document.createElement('input');
    qty.className = 'w-75 w-lg-100 text-center';
    qty.setAttribute('type', 'number');
    qty.setAttribute('name', 'qty');
    qty.setAttribute('min', '0');
    qty.setAttribute('value', item.addedQty);
    qty.addEventListener('change', (e) => {
        handleIncrement(e.target, item);
    });

    let titleContainer = document.createElement('div');
    titleContainer.className =
        'fst-italic col-11 col-lg-6 order-1 order-lg-2 py-2';
    let titleInnerContainer = document.createElement('div');
    titleInnerContainer.className = 'row px-5 justify-content-center';
    let imgContainer = document.createElement('div');
    imgContainer.className = 'col-lg-3 col-12 order-0 order-lg-1';
    let img = document.createElement('img');
    img.className = 'w-75 w-lg-100';

    // Handle weird paths in DB
    let imgPath = '';
    if (item.image.includes('http')) {
        imgPath = item.image;
    } else {
        imgPath = '/img/' + item.brand + '.jpeg';
    }

    img.setAttribute('src', imgPath);

    let itemSelectorWrapper = document.createElement('div');
    itemSelectorWrapper.className =
        'mt-3 col-1 order-1 order-lg-0 selector-cart';
    let itemSelector = document.createElement('input');
    itemSelector.setAttribute('type', 'checkbox');
    itemSelector.className = 'w-100 h-100';
    itemSelector.addEventListener('change', (e) => {
        updateSelectedTotal(e);
    });

    let title = document.createElement('div');
    title.className =
        'mt-3 mt-lg-0 col-lg-8 col-11 order-2 align-items-center d-flex justify-content-center';
    title.setAttribute('name', 'itemTitle');
    title.textContent = item.title;

    let unitPriceContainer = document.createElement('div');
    unitPriceContainer.className = 'col-lg-2 col-3 order-3 order-lg-3 py-2';
    let unitPriceLabel = document.createElement('div');
    unitPriceLabel.className = 'd-inline d-lg-none';
    unitPriceLabel.textContent = 'Price/Unit:';
    let unitPrice = document.createElement('div');
    unitPrice.setAttribute('name', 'unitPrice');
    unitPrice.textContent = `\$${item.price.toFixed(2)}`;

    let totalPriceContainer = document.createElement('div');
    totalPriceContainer.className = 'col-lg-2 col-3 order-3 order-lg-3 py-2';
    let totalPriceLabel = document.createElement('div');
    totalPriceLabel.className = 'd-inline d-lg-none';
    totalPriceLabel.textContent = 'Total Price:';
    let totalPrice = document.createElement('div');
    totalPrice.setAttribute('name', 'totalPrice');

    let summedPrice = (item.price * item.addedQty).toFixed(2);
    totalPrice.textContent = `\$${summedPrice}`;

    // Now nest all the DOM elements in the tree for rendering
    itemContainer.appendChild(iconContainer);
    iconContainer.appendChild(icon);

    itemContainer.appendChild(qtyContainer);
    qtyContainer.appendChild(qtyLabel);
    qtyContainer.appendChild(qty);

    itemContainer.appendChild(titleContainer);
    titleContainer.appendChild(titleInnerContainer);
    titleInnerContainer.appendChild(itemSelectorWrapper);
    titleInnerContainer.appendChild(imgContainer);
    titleInnerContainer.appendChild(title);
    itemSelectorWrapper.appendChild(itemSelector);
    imgContainer.appendChild(img);

    itemContainer.append(unitPriceContainer);
    unitPriceContainer.append(unitPriceLabel);
    unitPriceContainer.append(unitPrice);

    itemContainer.append(totalPriceContainer);
    totalPriceContainer.append(totalPriceLabel);
    totalPriceContainer.append(totalPrice);

    // Finally, add to the parent
    document.getElementById('cartList').appendChild(itemContainer);

    // Update grand total at bottom
    updateGrandTotal();
};

// Remove item from cart, also removes from localStorage
// Cart rendered state always refreshsed after removal of item
const removeItemFromCart = (item) => {
    let row = document.querySelector(`li[phonekey="${item._id}"`);

    let summedPrice = row.querySelector(`div[name="totalPrice"]`);

    updateGrandTotal();

    row.parentElement.removeChild(row);

    // Update LocalStorage to reflect this
    localStorage.removeItem(JSON.stringify([item._id, user._id]));

    // Inform user of state change
    dispCartMsg('Item removed from cart:', [
        `[${item.title.substring(0, 100)}` +
            (item.title.length > 100 ? `...]` : `]`),
    ]);

    // Update global variable
    cart = getCartFromStorage();
};

// Fires when the quantity input field is updated
// Always updates all on-page totals by calling the update methods above
const handleIncrement = (qtyField, item) => {
    // We do a lazy check to prevent user over-buying
    // In reality, this would be checked against database on checkout,
    // but since it is not specified to actually check this, we do a
    // local version check to avoid hitting the DB every time we increment

    if (qtyField.value > item.stock) {
        qtyField.value = item.stock;
        dispCartMsg('Error, cart quantity adjusted for the following reason:', [
            `Cart quantity for [${item.title.substring(0, 100)}` +
                (item.title.length > 100 ? `...]` : `]`) +
                ` exceeds last known stock level of ${item.stock}`,
        ]);
    } else if (qtyField.value == 0) {
        removeItemFromCart(item);
    }

    updateItemTotals();
    updateGrandTotal();
};

// Method to intercept the pay button, display success message and
// then redirect after a timetout period
const payCart = () => {
    let msgs = [];
    let purchased = [];

    // Edge case - no items in cart
    if (cart.length === 0) {
        return;
    }

    // Check if nothing selected
    let rows = document.querySelectorAll('#cartList li');
    let found = 0;

    rows.forEach((row) => {
        let checkBox = row.querySelector("input[type='checkbox']");
        if (checkBox.checked) {
            found += 1;
        }
    });

    if (found === 0) {
        dispCartMsg('No items selected for checkout', [
            'Please select at least 1 item for checkout',
        ]);
        return;
    }

    cart.forEach((item) => {
        // Check if it is checked, if not, then do nothing
        let row = document.querySelector(`li[phonekey="${item._id}"`);
        let checkBox = row.querySelector("input[type='checkbox']");
        if (checkBox.checked) {
            purchased.push(item);
            let title = item.title;
            let qty = Number.parseInt(item.addedQty);

            msgs.push(
                `${qty} x [${title.substring(0, 100)}` +
                    (title.length > 100 ? `...]` : `]`)
            );

            // Update database
            axios
                .post(`/phones/${item._id}/quantity/${-1 * qty}`)
                .then((res) => {})
                .catch((err) => console.error(err));
        }
    });

    // Purge items from LS, after we do the other updates to avoid
    // bad behaviour with iterator/generator looping
    purchased.forEach((item) => {
        // Remove item from localStorage
        removeItemFromCart(item);
    });

    dispCartMsg(
        "Success! You've successfully paid. You will be " + 'redirected soon.',
        msgs
    );

    // Update on-page totals even for the timeout period
    updateGrandTotal();
    updateSelectedTotal();

    // Disable button to prevent multiple clicks
    let btn = document.getElementById('payBtn');
    btn.className = 'btn btn-block btn-dark disabled';
    btn.textContent = 'Paid';
    btn.onclick = () => {
        console.log('disabled');
    };

    // We do not need to back to previous page
    setTimeout(() => {
        window.location.href = '/';
    }, 5000);
};

// Displays a message above the cart area
const dispCartMsg = (header, lines) => {
    document.getElementById('cart-ticker').hidden = false;
    let headerDiv = document.getElementById('msgLine1');
    let msgDiv = document.getElementById('msgLine2');
    msgDiv.textContent = '';

    headerDiv.textContent = header;

    for (let i = 0; i < lines.length; i++) {
        let newMsgDiv = document.createElement('div');
        newMsgDiv.className = 'my-2';
        newMsgDiv.textContent = lines[i];
        msgDiv.appendChild(newMsgDiv);
    }
};

window.onload = () => {
    cart = getCartFromStorage();
    initCart();

    // Load event listener to buttons
    document.getElementById('payBtn').addEventListener('click', (e) => {
        e.preventDefault();
        payCart();
    });
};
