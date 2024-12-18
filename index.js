const API_URL = "https://api.rawg.io/api/games";
const API_KEY = "984255fceb114b05b5e746dc24a8520a";

let allGames = [];
const multiplayerCarousel = document.getElementById("multiplayer-carousel");
const actionCarousel = document.getElementById("action-carousel");
const ps5Carousel = document.getElementById("ps5-carousel");
const gamesGrid = document.getElementById("games-grid");
const searchInput = document.getElementById("search-input");

async function fetchFeaturedGames() {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}&page_size=15`);
        if (!response.ok) throw new Error("Failed to fetch games");

        const data = await response.json();
        allGames = data.results;
        displayFeaturedGames();
        displayFilteredGames();
    } catch (error) {
        console.error("Error fetching featured games:", error);
    }
}

function displayFeaturedGames(filteredGames = allGames) {
    gamesGrid.innerHTML = "";
    filteredGames.forEach((game) => {
        const gameCard = document.createElement("div");
        gameCard.className =
            "game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer";
        gameCard.onclick = () => showGameDetails(game);


        gameCard.innerHTML = ` 
            <img src="${game.background_image}" alt="${game.name}" class="game-image">
            <div class="game-details">
                <div> 
                <h3 class="text-lg font-bold mb-2 truncate">${game.name}</h3>
                <p class="text-sm text-gray-400">Released: ${game.released || "N/A"}</p>
                <p class="text-sm text-gray-400">Rating: ${game.rating || "N/A"}/5</p>
                </div>
                <div class="left"> <button class="add-to-wishlist" onclick="toggleStar(event, '${game.name}')"> <span id="star-${game.name}" class="star">&#9734;</span> </button></div>
            
            </div>
        `;
        gamesGrid.appendChild(gameCard);
    });
}

function displayFilteredGames() {
    const multiplayerGames = allGames.filter(game => game.tags && game.tags.some(tag => tag.name.toLowerCase().includes('multiplayer')));
    const actionGames = allGames.filter(game => game.genres && game.genres.some(genre => genre.name.toLowerCase().includes('action')));

    // PS5 games
    fetchPS5Games();

    createCarousel(multiplayerGames, multiplayerCarousel);
    createCarousel(actionGames, actionCarousel);

    setTimeout(() => {
        createCarousel(actionGames, actionCarousel);          // Delay one sec
    }, 100);
}

async function fetchPS5Games() {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}&page_size=8&platforms=18`);
        if (!response.ok) throw new Error("Failed to fetch PS5 games");

        const data = await response.json();
        const ps5Games = data.results;
        createCarousel(ps5Games, ps5Carousel);
    } catch (error) {
        console.error("Error fetching PS5 games:", error);
    }
}

function createCarousel(games, carouselElement) {
    const carousel = carouselElement.querySelector('.carousel');
    carousel.innerHTML = '';
    const totalItems = games.length;

    // Loop
    const gamesToShow = [...games, ...games];

    gamesToShow.forEach(game => {
        const gameCard = document.createElement("div");
        gameCard.className = "game-card carousel-item";
        gameCard.onclick = () => showGameDetails(game);

        gameCard.innerHTML = `
    <img src="${game.background_image}" alt="${game.name}" class="game-image">
    <div class="game-details">
        <h3 class="text-lg font-bold mb-2">${game.name}</h3>
        <p class="text-sm text-gray-400">Released: ${game.released || "N/A"}</p>
        <p class="text-sm text-gray-400">Rating: ${game.rating || "N/A"}/5</p>
    </div>
`;
        carousel.appendChild(gameCard);
    });

    rotateCarousel(carousel);
}

function rotateCarousel(carousel) {
    const totalItems = carousel.children.length;
    let currentIndex = 0;

    // Smooth 
    const intervalTime = 3000; // Rotate every 3 seconds

    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalItems;
        gsap.to(carousel, {
            x: -currentIndex * 240,
            duration: 1.5,
            ease: "power2.inOut",
            overwrite: true
        });
    }, intervalTime); // Rotate every 3 seconds
}

async function showGameDetails(game) {
    const modal = document.getElementById("game-modal");
    const modalDetails = document.getElementById("modal-details");
    modal.classList.add("show");

    const requirements = game.platforms && game.platforms.length > 0
        ? game.platforms.map(platform => {
            const requirements = platform.requirements_en || {};
            return requirements.minimum ? `<li>${platform.platform.name}: ${requirements.minimum}</li>` : null;
        }).filter(Boolean).join("")
        : "<li>N/A</li>";

    modalDetails.innerHTML = ` 
<img src="${game.background_image}" alt="${game.name}" class="rounded-lg mb-4 w-full object-cover">
<h2 class="text-3xl font-bold mb-4">${game.name}</h2>
<p><strong>Release Date:</strong> ${game.released || "N/A"}</p>
<p><strong>Rating:</strong> ${game.rating || "N/A"}/5</p>
<p><strong>Stores:</strong> ${game.stores ? game.stores.map(store => store.store.name).join(", ") : "N/A"}</p>
<p><strong>Platforms:</strong> ${game.platforms ? game.platforms.map(p => p.platform.name).join(", ") : "N/A"}</p>
<div class="row"> <p><strong>Genres:</strong> <div id="tag"> ${game.tags ? game.tags.map(g => g.name).join(", ") : "N/A"}</div></p></div>
  <div class="collapsible">
  <div class="collapsible-header" onclick="toggleRequirements(this)">
    <strong>Minimum Requirements</strong> <span class="arrow">&#x25BC;</span>
  </div>
  <ul class="collapsible-content hidden scrollable-requirements">
    ${requirements}
  </ul>
</div>
`;
}

function toggleRequirements(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        arrow.innerHTML = "&#x25B2;"; // Up arrow
    } else {
        content.classList.add("hidden");
        arrow.innerHTML = "&#x25BC;"; // Down arrow
    }
}

function closeModal() {
    const modal = document.getElementById("game-modal");
    modal.classList.remove("show");
    const modalDetails = document.getElementById("modal-details");
    modalDetails.innerHTML = "";
}

function Refresh() {
    location.reload();
}

// search 
function handleSearch() {
    const searchQuery = document.getElementById("search-input").value.toLowerCase();
    const filteredGames = allGames.filter(game =>
        game.name.toLowerCase().includes(searchQuery)
    );
    displayFeaturedGames(filteredGames);

}
document.getElementById("search-input").addEventListener("input", handleSearch);

searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (query.length > 2) {
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}&search=${query}&page_size=8`);
            if (!response.ok) throw new Error("Failed to fetch search results");

            const data = await response.json();
            allGames = data.results;
            displayFeaturedGames(allGames);
        } catch (error) {
            console.error("Error searching games:", error);
        }
    } else if (query == "") {
        fetchFeaturedGames();
    }
});

// add

let wishlist = [];
const wishlistDiv = document.getElementById("wishlist");
const wishlistModal = document.getElementById("wishlist-modal");
const toggleWishlistButton = document.getElementById("toggle-wishlist");
const closeWishlistButton = document.getElementById("close-wishlist");

// Fav
function updateWishlist() {
    wishlistDiv.innerHTML = "";  // Clear current list
    if (wishlist.length === 0) {
        wishlistDiv.innerHTML = "<p>Your wishlist is empty.</p>";
    } else {
        wishlist.forEach((game, index) => {
            const wishlistItem = document.createElement("div");
            wishlistItem.className = "wishlist-item p-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer";
            wishlistItem.innerText = game;

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.className = "delete-button float-right text-red-500 font-bold ml-4 cursor-pointer";
            deleteButton.onclick = (event) => {
                event.stopPropagation();
                deleteFromWishlist(index);
            };

            wishlistItem.appendChild(deleteButton);

            wishlistItem.onclick = () => showWishlistGameDetails(game);
            wishlistDiv.appendChild(wishlistItem);
        });
    }
}

function deleteFromWishlist(index) {
    wishlist.splice(index, 1);
    updateWishlist();
}

// Toggle star
function toggleStar(event, gameName) {
    event.stopPropagation();
    const starElement = event.target;
    const isFilled = starElement.innerHTML === "&#9733;"; // Check if the star is filled

    if (isFilled) {
        starElement.innerHTML = "&#9734;"; // Empty star
        wishlist = wishlist.filter(game => game !== gameName); // Remove from wishlist
    } else {
        starElement.innerHTML = "&#9733;"; // Filled star
        if (!wishlist.includes(gameName)) {
            wishlist.push(gameName); 
        }
    }
    updateWishlist(); // Update the wishlist 
}

function showWishlistGameDetails(gameName) {
    const game = allGames.find(g => g.name === gameName);
    if (game) {
        showGameDetails(game);
    }
}

function toggleWishlistModal() {
    wishlistModal.classList.toggle("hidden");
}

toggleWishlistButton.addEventListener("click", toggleWishlistModal);

closeWishlistButton.addEventListener("click", toggleWishlistModal);


document.addEventListener("DOMContentLoaded", () => {
    const storesGrid = document.getElementById("stores-grid");
    const gameSearchInput = document.getElementById("search-input");
    const gameSearchBtn = document.getElementById("game-search-btn");
    const gameResults = document.getElementById("games-grid-prices");
    const priceSlider = document.getElementById("price-slider");
    const sliderValue = document.getElementById("slider-value");

    const allowedStores = [
        "Steam",
        "GamersGate",
        "Epic Games Store",
        "Gog",
        "Origin",
        "Direct2Drive"
    ];

    async function fetchStores() {
        try {
            const response = await fetch("https://www.cheapshark.com/api/1.0/stores");
            const stores = await response.json();
            stores
                .filter(store => allowedStores.includes(store.storeName)) // Filter allowed stores
                .forEach(store => {
                    const storeCard = document.createElement("div");
                    storeCard.classList.add("store-card");
                    storeCard.innerHTML = `
                <img src="https://www.cheapshark.com${store.images.logo}" alt="${store.storeName}" class="w-full h-auto rounded-md mb-2">
                <h3 class="text-lg font-semibold text-center">${store.storeName}</h3>
            `;
                    storesGrid.appendChild(storeCard);
                });
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    }

    async function searchGames(query, maxPrice) {
        try {
            const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${query}`);
            const games = await response.json();
            gameResults.innerHTML = ""; // Clear previous results

            const pricesSection = document.createElement("div");
            pricesSection.classList.add("prices-section");

            const lineBreak = document.createElement("br");
            pricesSection.appendChild(lineBreak);

            // Add the title "Prices:"
            const pricesTitle = document.createElement("h2");
            pricesTitle.classList.add("text-2xl", "font-semibold", "mb-4");
            pricesTitle.textContent = "Prices:";
            pricesSection.appendChild(pricesTitle);

            if (games.length === 0) {
                gameResults.innerHTML = `
            <h2>Prices:</h2> <br>
            <p>Unfortunately, I can't find this game! <br> Sorry for the inconvenience...</p>
        `;
                return;
            }

            const pricesGrid = document.createElement("div");
            pricesGrid.classList.add("grid", "gap-6", "prices-grid");

            const filteredGames = games.filter(game => {
                return parseFloat(game.cheapest) <= parseFloat(maxPrice);
            });

            filteredGames.forEach(game => {
                const gameCard = document.createElement("div");
                gameCard.classList.add("game-card");

                const gameImage = game.thumb ? game.thumb : `https://via.placeholder.com/200x250?text=${encodeURIComponent(game.external)}`;
                gameCard.innerHTML = `
           
                <img src="${gameImage}" alt="${game.external}" class="w-full h-auto rounded-md mb-2">
                <h3 class="text-xl font-bold mb-2">${game.external}</h3>
                <p class="price">Best Price: $${game.cheapest}</p>
                <a href="https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}" target="_blank" class="text-blue-500 underline">View Deal</a>
            
        `;

                pricesGrid.appendChild(gameCard);
            });

            pricesSection.appendChild(pricesGrid);
            gameResults.appendChild(pricesSection);

        } catch (error) {
            console.error("Error fetching games:", error);
        }
    }


    priceSlider.addEventListener("input", (event) => {
        const maxPrice = event.target.value;  
        sliderValue.textContent = maxPrice;  
        const query = gameSearchInput.value.trim();
        if (query.length > 2) {
            searchGames(query, maxPrice);  
        }
    });

   
    gameSearchInput.addEventListener("input", async (event) => {
        const query = event.target.value.trim();
        const maxPrice = priceSlider.value;  
        if (query.length > 2) {
            searchGames(query, maxPrice);  
        } else {
            gameResults.innerHTML = '';  
        }
    });

    // Initialize
    fetchStores();
});

async function fetchStores() {
    const response = await fetch('https://www.cheapshark.com/api/1.0/stores');
    const stores = await response.json();

    const dropdown = document.getElementById('stores-dropdown');

    // Urls
    stores.forEach(store => {
        const link = document.createElement('a');
        link.textContent = store.storeName;

        if (store.storeName.toLowerCase() == 'steam') {
            link.href = 'https://store.steampowered.com/';
        } 
        else if (store.storeName.toLowerCase() == 'getgamez') {
            link.href = 'https://getgamez.net/';
        } 
        else if (store.storeName.toLowerCase() == 'playfield') {
            link.href = 'https://www.playitstore.hu/';
        } 
        else if (store.storeName.toLowerCase() == 'imperial games') {
            link.href = 'https://imperial.games/';
        } 
        else if (store.storeName.toLowerCase() == 'funstockdigital') {
            link.href = 'https://funstock.eu';
        } 
        else if (store.storeName.toLowerCase() == 'razer game store') {
            link.href = 'https://www.razer.com/eu-en/store';
        } 
        else {
            link.href = `https://${store.storeName.toLowerCase().replace(/\s+/g, '')}.com`; 
        }

        link.target = '_blank'; 
        dropdown.appendChild(link);
    });
}

function openProfilePage() {
    window.location.href = "login.html";
}

fetchStores();

fetchFeaturedGames();
