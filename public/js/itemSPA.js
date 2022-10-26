/* ALL ITEM PROFILE STATE FUNCTIONS IN THIS FILE */

// Globals
let pid = 0;

const loadMoreReviews = async () => {
    await reloadPhone();

    const reviewContainer = document.querySelector('.review-wrapper');
    const loadedReviews = document.querySelectorAll('.review-wrapper .row');
    let reviewCounter = loadedReviews.length;

    const reviewLoader = document.querySelector('#reviewLoader');

    for (let i = 0; i < 3; i++) {
        let review = activePhone.reviews[reviewCounter];

        if (reviewCounter >= activePhone.reviews.length) {
            break;
        }

        // Build the review template
        let row = document.createElement('div');
        row.classList.add('row', 'my-2');
        let col = document.createElement('div');
        col.classList.add('col-12', 'p-3');
        let nameContainer = document.createElement('div');
        nameContainer.classList.add('mb-3');
        let nameWrapper = document.createElement('span');
        nameWrapper.classList.add('fw-bold');
        nameWrapper.textContent = `${review.reviewer.firstname} ${review.reviewer.lastname} `;
        let ratingWrapper = document.createElement('span');

        // Set number of stars
        for (let j = 0; j < review.rating; j++) {
            let star = document.createElement('i');
            star.classList.add('fas', 'fa-star', 'fa-xs', 'fa-fw');
            ratingWrapper.appendChild(star);
        }
        let reviewWrapper = document.createElement('div');

        // Truncate review if too long and add button to show all
        if (review.comment.length >= 200) {
            reviewWrapper.textContent =
                review.comment.substring(0, 200) + ' ... ';
            let loadCommentBtn = document.createElement('div');
            loadCommentBtn.className = 'comment-loader btn btn-outline-info';
            loadCommentBtn.textContent = 'More';
            loadCommentBtn.setAttribute('review-index', reviewCounter);
            loadCommentBtn.addEventListener('click', () => {
                loadFullComment(loadCommentBtn, activePhone);
            });
            reviewWrapper.appendChild(loadCommentBtn);
        } else {
            reviewWrapper.textContent = review.comment;
        }

        // Link everything together
        row.appendChild(col);
        col.appendChild(nameContainer);
        col.appendChild(reviewWrapper);
        nameContainer.appendChild(nameWrapper);
        nameContainer.append(ratingWrapper);

        reviewContainer.insertBefore(
            row,
            document.querySelector('#reviewLoader')
        );

        // Increment and continue
        reviewCounter++;
    }

    // Alter button display to show no more reviews
    if (reviewCounter >= activePhone.reviews.length) {
        if (reviewLoader) {
            reviewLoader.textContent = 'No More Reviews';
            reviewLoader.disabled = true;
            reviewLoader.classList.remove('btn-info');
            reviewLoader.classList.add('btn-dark', 'disabled');
        }
    }
};

const loadFullComment = (cmtBtn, phone) => {
    let index = cmtBtn.getAttribute('review-index');
    let parent = cmtBtn.parentElement;
    parent.removeChild(cmtBtn);
    parent.textContent = `${phone.reviews[index].comment}`;
};

const updateCartQty = (phone) => {
    // If user is not logged in, there IS no cart
    if (!user) {
        cartQtyDisp.textContent = 0;
    } else {
        let localItem = localStorage.getItem(
            JSON.stringify([phone._id, user._id])
        );
        let cartQtyDisp = document.querySelector('#cartQtyDisp');

        // Match found, update view
        if (localItem) {
            localItem = JSON.parse(localItem);
            cartQtyDisp.textContent = localItem.addedQty;
        } else {
            cartQtyDisp.textContent = 0;
        }

        // Update navbar value
        updateCartHeader();
    }
};

// Basic integer validation check, accepts string and returns number
// if string is valid, else it returns null
const checkInteger = (value) => {
    let regex = /^\d+$/;
    let check_num = regex.test(value) || value % 1 === 0;

    if (check_num) {
        return Number.parseInt(value);
    } else {
        return false;
    }
};

const promptCart = () => {
    let promptCartBtn = document.querySelector('#cartBtn');
    promptCartBtn.hidden = true;

    let cartGroup = document.querySelector('#cartGroup');
    cartGroup.hidden = false;
};

const confirmCart = (phone) => {
    // Check if logged in, if not, redirect
    if (!user) {
        cachePageState('/');
        window.location.href = '/auth/login';
        return;
    }

    const qtyForm = document.querySelector('input#cartQty');

    let res = checkInteger(qtyForm.value);
    console.log(res);
    if (res) {
        // Negative integer
        if (res <= 0) {
            showMsg('You must input a positive integer into the cart.');
            return;
        }

        // Check stock levels
        // Pull from cart and add new quantity on
        let localItem = localStorage.getItem(
            JSON.stringify([phone._id, user._id])
        );
        let currentQty = 0;

        if (localItem) {
            localItem = JSON.parse(localItem);
            currentQty = localItem.addedQty;
        }

        let total = currentQty + res;

        if (currentQty > phone.stock) {
            showMsg(`You've already added ${currentQty} to your cart when there's only ${phone.stock} stock available. 
             Please reduce the quantity in your cart.`);
            return;
        }

        if (total > phone.stock) {
            showMsg(
                `Not enough stock to add to cart. You can only add ${
                    phone.stock - currentQty
                } more to your cart.`
            );
            return;
        }

        // Else we are good to proceed adding to cart
        if (localItem) {
            if (localItem.addedQty) {
                localItem.addedQty += res;
            } else {
                localItem.addedQty = res;
            }
        } else {
            localItem = phone;
            localItem.addedQty = res;
        }

        localStorage.setItem(
            JSON.stringify([phone._id, user._id]),
            JSON.stringify(localItem)
        );
        showMsg('Added ' + res + ' to cart');
        cancelCart(phone);
    } else {
        // Display error message for bad input
        showMsg('You must input a positive integer into the cart.');
    }

    updateCartQty(phone);
};

const cancelCart = () => {
    let promptCartBtn = document.querySelector('#cartBtn');
    promptCartBtn.hidden = false;

    let cartGroup = document.querySelector('#cartGroup');
    cartGroup.hidden = true;

    // Also reset the input field
    let cartQtyField = document.querySelector('#cartQty');
    cartQtyField.value = 0;
};

// Submit a review, override default POST to avoid page redirect
const submitReview = async (e) => {
    e.preventDefault();

    // Technically this shouldn't happen since form is not displayed/
    // But in case they trick the system...
    if (!user) {
        cachePageState('/');
        window.location.href = '/auth/login';
        return;
    }

    // Extract user submission data
    const formData = new FormData(e.target);
    const reviewRating = formData.get('rating');
    const reviewBody = formData.get('review');

    // Fallback, set URL on HTML form code
    // const path = `/phones/${phone._id}/reviews/${user._id}`;
    const path = e.target['action'];
    const config = {
        url: path,
        method: 'post',
        data: {
            rating: reviewRating,
            body: reviewBody,
        },
    };

    const ticker = document.querySelector('#formTicker');
    ticker.hidden = false;
    axios(config)
        .then((res) => {
            // Reload phone from response, use the REST path so we can
            // populate the user and not just ObjectId
            reloadPhone();

            // Success path, hide the form and display success
            ticker.textContent = 'Review submitted successfully!';
            e.target.hidden = true;

            const loadedReviews = document.querySelectorAll(
                '.review-wrapper .row.my-2'
            );

            // Special case, if no reviews, change heading to show reviews
            if (loadedReviews.length === 0) {
                document.querySelector('.review-wrapper h2').textContent =
                    'Reviews From Buyers';
            }

            if (loadedReviews.length < 3) {
                // Change state of button
                // Path 1: Less than 3 reviews loaded - just append review
                loadMoreReviews();
            } else if (loadedReviews.length === 3) {
                // Path 2: Exactly 3 reviews loaded - add button to allow loading of
                // new review

                // Check if we have more than 3 reviews in DB, if so, we
                // already have a button, so don't add another
                if (activePhone.reviews.length === 3) {
                    const reviewLoader = document.createElement('div');
                    reviewLoader.classList.add(
                        'mt-3',
                        'py-3',
                        'btn',
                        'btn-info',
                        'w-50',
                        'mx-auto'
                    );
                    reviewLoader.setAttribute('id', 'reviewLoader');
                    reviewLoader.textContent = 'Load More Reviews';
                    reviewLoader.addEventListener('click', () => {
                        loadMoreReviews();
                    });

                    const lastRev = loadedReviews[loadedReviews.length - 1];
                    // We are the last element, so we do this trick to append to last
                    lastRev.parentNode.insertBefore(
                        reviewLoader,
                        lastRev.nextSibling
                    );
                }
            } else {
                // Path 3: More than 3 loaded - change button to always allow
                // loading of more reviews
                const reviewLoader = document.querySelector('#reviewLoader');
                reviewLoader.textContent = 'Load More Reviews';
                reviewLoader.disabled = false;
                reviewLoader.classList.add('btn-info');
                reviewLoader.classList.remove('btn-dark', 'disabled');
            }
        })
        .catch((err) => {
            // Failure path, hide the form and display error
            ticker.textContent =
                'Could not submit review, something went wrong!';
            console.error(err);
        });
};

// Helper funtions to show error message below cart
const showMsg = (msg) => {
    let ticker = document.querySelector('#errorTicker');
    ticker.hidden = false;
    ticker.textContent = msg;
};

// Helper funtions to hide error message below cart
const hideMsg = () => {
    document.querySelector('#errorTicker').hidden = true;
};

// Helper function to fetch latest version of phone
const reloadPhone = async () => {
    let res = await axios.get(`/phones/id/${pid}`);
    activePhone = res.data;
};

// Fills out the HTML template from top to bottom by replacing EJS strings
const constructProfile = async (phone) => {
    // Back button state management
    let backBtn = document.getElementById('backBtn');

    backBtn.addEventListener('click', async () => {
        // Can only reach item state from home or search...
        if (searchTerm.length > 0) {
            await initSearch();
            transitionPage('search');
        } else {
            await initHome();
            transitionPage('home');
        }
    });

    // Construction of main profile info
    let brandHeader = document.getElementById('brandHeader');
    brandHeader.textContent = `${phone.brand} Phone`;

    let title = document.getElementById('titleProfile');
    title.textContent = phone.title;

    let img = document.getElementById('imgProfile');
    let imgPath = getImgPath(phone);
    img.setAttribute('src', imgPath);
    img.setAttribute('alt', `${phone.brand} Phone`);

    let brandSpan = document.getElementById('brandProfile');
    brandSpan.textContent = `${phone.brand}`;

    let stockSpan = document.getElementById('stockProfile');
    stockSpan.textContent = `${phone.stock}`;

    let sellerSpan = document.getElementById('sellerProfile');
    sellerSpan.textContent = `${phone.seller.firstname} ${phone.seller.lastname}`;

    let priceSpan = document.getElementById('priceProfile');
    priceSpan.textContent = `\$${phone.price.toFixed(2)}`;

    let reviewHeader = document.getElementById('reviewProfile');
    if (phone.reviews.length === 0) {
        reviewHeader.textContent = 'No Reviews Found';
    } else {
        reviewHeader.textContent = 'Reviews From Buyers';
    }

    // Reset reviews before populating
    if (document.getElementById('reviewLoader')) {
        let reviewParent = reviewHeader.parentElement;
        let reviews = reviewParent.querySelectorAll('div.row');
        let existingBtn = reviewParent.querySelector('#reviewLoader');

        reviews.forEach((review) => {
            reviewParent.removeChild(review);
        });
        reviewParent.removeChild(existingBtn);
    }

    // Populate review section
    let reviewLoader = document.createElement('div');
    reviewLoader.setAttribute('id', 'reviewLoader');
    reviewLoader.className = 'mt-3 py-3 btn btn-info w-50 mx-auto';
    reviewLoader.textContent = 'Load More Reviews';

    // Add button before loading reviews
    reviewHeader.parentElement.appendChild(reviewLoader);

    // Hide the button if reviews don't need loading, but we need DOM
    // element in tree to prepend reviews
    if (activePhone.reviews.length <= 3) {
        reviewLoader.hidden = true;
    }
    loadMoreReviews();

    // Add and show the review submissiom form only if user is logged in
    let form = document.getElementById('reviewForm');

    // Set form defaults
    document.getElementById("rating").value = "1"
    document.getElementById("review").value = ""

    if (user) {
        form.setAttribute('action', `/phones/${phone._id}/reviews/${user._id}`);
        form.hidden = false;
    } else {
        form.hidden = true;
    }
};

// Runs whenever the item state is called
var initItem = async (phoneId) => {
    try {
        let res = await axios.get(`/phones/id/${phoneId}`);
        activePhone = res.data;
    } catch (err) {
        console.error(err);
    }

    pid = activePhone._id;
    await constructProfile(activePhone);

    // Add event handler to loading more reviews
    let reviewLoader = document.querySelector('#reviewLoader');

    if (reviewLoader) {
        reviewLoader.addEventListener('click', () => {
            loadMoreReviews();
        });
    }

    // Add event handler to loading complete singular review
    let commentLoader = document.querySelectorAll('.comment-loader');

    commentLoader.forEach((cmtBtn) => {
        cmtBtn.addEventListener('click', () => {
            loadFullComment(cmtBtn, activePhone);
        });
    });

    // Add event handler to submit user review
    const form = document.querySelector('#reviewForm');
    form.addEventListener('submit', submitReview);

    // Clear old ticker messages and hide
    let errorTicker = document.getElementById('errorTicker');
    let formTicker = document.getElementById('formTicker');

    errorTicker.textContent = '';
    errorTicker.hidden = true;

    formTicker.textContent = '';
    formTicker.hidden = true;

    // Set cart state to default
    cancelCart();

    // Display current cart quantity
    updateCartQty(activePhone);
};

// Move event listeners to onload event since the
// item page is not rebuilt, only with fields modified
// Prevents event listeners being added multiple times
window.onload = () => {
    // Add event handler to cart buttons
    let promptCartBtn = document.querySelector('#cartBtn');
    let confirmCartBtn = document.querySelector('#cartConfirmBtn');
    let cancelCartBtn = document.querySelector('#cartCancelBtn');
    let cartQtyField = document.querySelector('#cartQty');

    promptCartBtn.addEventListener('click', () => {
        promptCart();
    });
    confirmCartBtn.addEventListener('click', () => {
        confirmCart(activePhone);
    });
    cancelCartBtn.addEventListener('click', () => {
        cancelCart();
    });
    cartQtyField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmCart(activePhone);
        }
    });
};
