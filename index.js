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
                <h3 class="text-lg font-bold mb-2 truncate">${game.name}</h3>
                <p class="text-sm text-gray-400">Released: ${game.released || "N/A"}</p>
                <p class="text-sm text-gray-400">Rating: ${game.rating || "N/A"}/5</p>
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
    modalDetails.innerHTML = ` 
        <img src="${game.background_image}" alt="${game.name}" class="rounded-lg mb-4 w-full object-cover">
        <h2 class="text-3xl font-bold mb-4">${game.name}</h2>
        <p><strong>Release Date:</strong> ${game.released || "N/A"}</p>
        <p><strong>Rating:</strong> ${game.rating || "N/A"}/5</p>
        <p><strong>Stores:</strong> ${game.stores ? game.stores.map(store => store.store.name).join(", ") : "N/A"}</p>
        <p><strong>Platforms:</strong> ${game.platforms ? game.platforms.map(p => p.platform.name).join(", ") : "N/A"}</p>
        <p><strong>Genres:</strong> ${game.genres ? game.genres.map(g => g.name).join(", ") : "N/A"}</p>
    `;
}

function closeModal() {
    const modal = document.getElementById("game-modal");
    modal.classList.remove("show");
    const modalDetails = document.getElementById("modal-details");
    modalDetails.innerHTML = "";
}

function Refresh(){
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
    displayGames(data.results);
    } catch (error) {
    console.error("Error searching games:", error);
    }
} else if (query === "") {
    fetchFeaturedGames();
}
});


fetchFeaturedGames();