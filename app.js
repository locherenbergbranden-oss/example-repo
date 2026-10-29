const products = [
    {
        id: 1,
        name: "Water Bottle",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"
    },
    {
        id: 2,
        name: "Headphones",
        price: 499.00,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    },
    {
        id: 3,
        name: "Backpack",
        price: 349.50,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
    },
    {
        id: 4,
        name: "Coffee Mug",
        price: 89.00,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400"
    }
];


const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const clearCartButton = document.getElementById("clearCartButton");

const fontPreference = document.getElementById("fontPreference");
const nameForm = document.getElementById("nameForm");
const usernameInput = document.getElementById("username");
const welcomeMessage = document.getElementById("welcomeMessage");
const shippingPreference = document.getElementById("shippingPreference");
const resetPreferencesButton = document.getElementById("resetPreferencesButton");

const cacheStatus = document.getElementById("cacheStatus");
const cacheDetails = document.getElementById("cacheDetails");


function formatPrice(price) {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR"
    }).format(price);
}



const CART_KEY = "shoppingCart";
const FONT_KEY = "preferredFont";

let cart = [];

try {
    const savedCart = localStorage.getItem(CART_KEY);

    if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
            cart = parsedCart
                .filter(item =>
                    products.some(product => product.id === Number(item.id)) &&
                    Number.isInteger(Number(item.quantity)) &&
                    Number(item.quantity) > 0
                )
                .map(item => ({
                    id: Number(item.id),
                    quantity: Number(item.quantity)
                }));
        }
    }
} catch (error) {
    console.error("Could not load the saved cart:", error);
    cart = [];
}


// Save the cart
function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save the cart:", error);
    }
}


function displayProducts() {
    if (!productGrid) {
        console.error("Could not find productGrid in the HTML.");
        return;
    }

    productGrid.replaceChildren();

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = formatPrice(product.price);

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Add to Cart";

        button.addEventListener("click", function () {
            addToCart(product.id);
        });

        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(button);

        productGrid.appendChild(card);
    });
}


function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
}


function displayCart() {
    if (!cartItems || !cartTotal) {
        console.error("Check that cartItems and cartTotal exist in your HTML.");
        return;
    }

    cartItems.replaceChildren();

    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your cart is empty.";
        cartItems.appendChild(emptyMessage);
    }

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);

        if (!product) {
            return;
        }

        const subtotal = product.price * item.quantity;

        total += subtotal;
        itemCount += item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("span");
        details.textContent =
            `${product.name} × ${item.quantity} — ${formatPrice(subtotal)}`;

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute("aria-label", `Remove one ${product.name}`);

        decreaseButton.addEventListener("click", function () {
            removeFromCart(product.id);
        });

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute("aria-label", `Add one ${product.name}`);

        increaseButton.addEventListener("click", function () {
            addToCart(product.id);
        });

        row.appendChild(details);
        row.appendChild(decreaseButton);
        row.appendChild(increaseButton);

        cartItems.appendChild(row);
    });

    cartTotal.textContent = formatPrice(total);

    if (cartCount) {
        cartCount.textContent = itemCount;
    }

    saveCart();
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);

    if (!item) {
        return;
    }

    item.quantity--;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    displayCart();
}

if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
        cart = [];

        localStorage.removeItem(CART_KEY);

        displayCart();
    });
}

function applyFont(font) {
    document.body.style.fontFamily = font;
}

if (fontPreference) {
    const savedFont = sessionStorage.getItem(FONT_KEY);

    if (savedFont) {
        const optionExists = Array.from(fontPreference.options)
            .some(option => option.value === savedFont);

        if (optionExists) {
            fontPreference.value = savedFont;
            applyFont(savedFont);
        }
    }

    fontPreference.addEventListener("change", function () {
        const selectedFont = fontPreference.value;

        sessionStorage.setItem(FONT_KEY, selectedFont);
        applyFont(selectedFont);
    });
}

function setCookie(name, value, days = 180) {
    const expiry = new Date();

    expiry.setTime(
        expiry.getTime() + days * 24 * 60 * 60 * 1000
    );

    document.cookie =
        encodeURIComponent(name) + "=" +
        encodeURIComponent(value) +
        "; expires=" + expiry.toUTCString() +
        "; path=/; SameSite=Lax";
}


function getCookie(name) {
    const prefix = encodeURIComponent(name) + "=";

    const cookie = document.cookie
        .split("; ")
        .find(item => item.startsWith(prefix));

    if (!cookie) {
        return "";
    }

    return decodeURIComponent(cookie.substring(prefix.length));
}


function deleteCookie(name) {
    document.cookie =
        encodeURIComponent(name) +
        "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
}

function showWelcomeMessage(name) {
    if (!welcomeMessage) {
        return;
    }

    if (name) {
        welcomeMessage.textContent = "Welcome back, " + name + "!";
    } else {
        welcomeMessage.textContent = "Welcome to our store!";
    }
}

const savedUsername = getCookie("username");

if (savedUsername) {
    if (usernameInput) {
        usernameInput.value = savedUsername;
    }

    showWelcomeMessage(savedUsername);
} else {
    showWelcomeMessage("");
}

if (nameForm && usernameInput) {
    nameForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();

        if (username === "") {
            usernameInput.focus();
            return;
        }

        setCookie("username", username);
        showWelcomeMessage(username);
    });
}


if (shippingPreference) {
    const savedShipping = getCookie("shippingMethod");

    if (savedShipping) {
        const optionExists = Array.from(shippingPreference.options)
            .some(option => option.value === savedShipping);

        if (optionExists) {
            shippingPreference.value = savedShipping;
        }
    }

    shippingPreference.addEventListener("change", function () {
        setCookie("shippingMethod", shippingPreference.value);
    });
}


if (resetPreferencesButton) {
    resetPreferencesButton.addEventListener("click", function () {
        deleteCookie("username");
        deleteCookie("shippingMethod");

        sessionStorage.removeItem(FONT_KEY);

        if (usernameInput) {
            usernameInput.value = "";
        }

        if (shippingPreference) {
            shippingPreference.selectedIndex = 0;
        }

        if (fontPreference) {
            fontPreference.selectedIndex = 0;
            applyFont(fontPreference.value);
        } else {
            document.body.style.fontFamily = "";
        }

        showWelcomeMessage("");
    });
}


if (cacheStatus) {
    cacheStatus.textContent =
        "Browser caching is available for supported resources.";
}

if (cacheDetails) {
    cacheDetails.textContent =
        "Your browser may reuse cached images and other static files. " +
        "Actual caching depends on browser and server settings.";
}


displayProducts();
displayCart();

console.log("Everyday Market JavaScript loaded successfully!");