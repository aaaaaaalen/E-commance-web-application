// Sets the redirect field in the page state cache in localStorage
// so when the SPA loads it recognises the previous state properly
// Without this change in the redirected attribute the main page
// does not recognise the cache as valid and will not restore the state
var redirectBack = function () {
    let cached = localStorage.getItem('lastPage');

    if (cached) {
        cached = JSON.parse(cached);
        cached.redirected = true;
        localStorage.setItem('lastPage', JSON.stringify(cached));
    }

    return true;
};

// In the event the register/login failed, we need to set redirect back to false
// This does not affect checkout since we assume it always works, but as a
// failsafe this would also exhibit similar behaviour
window.addEventListener('load', (e) => {
    let cached = localStorage.getItem('lastPage');

    if (cached) {
        cached = JSON.parse(cached);
        cached.redirected = false;
        localStorage.setItem('lastPage', JSON.stringify(cached));
    }
});
