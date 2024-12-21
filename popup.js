// JavaScript to handle bookmarks and sorting logic

let allBookmarks = []; // Store all bookmarks for searching

function loadBookmarks() {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        const bookmarkList = document.querySelector(".content");
        bookmarkList.innerHTML = "";  // Clear any existing items

        // Loop through each bookmark and display it
        allBookmarks = flattenBookmarksTree(bookmarkTreeNodes); // Store bookmarks for searching
        displayBookmarks(allBookmarks); // Display all bookmarks initially
    });
}

// Function to display bookmarks
function displayBookmarks(bookmarks) {
    const bookmarkList = document.querySelector(".content");
    bookmarkList.innerHTML = ""; // Clear existing items

    bookmarks.forEach(bookmark => {
        const container = document.createElement('div');
        const link = document.createElement('a');
        link.href = bookmark.url;
        link.target = "_blank";

        const item = document.createElement('div');
        item.classList.add('item');

        const thumbnail = document.createElement('div');
        thumbnail.classList.add('item-thumbnail');
        thumbnail.style.backgroundImage = bookmark.url 
            ? `url(https://www.google.com/s2/favicons?domain=${bookmark.url})` 
            : 'url(/assets/logo.png)';

        const text = document.createElement('p');
        text.classList.add('item-text');
        text.textContent = bookmark.title;

        item.appendChild(thumbnail);
        item.appendChild(text);
        link.appendChild(item);
        container.appendChild(link);
        bookmarkList.appendChild(container);
    });
}

// Flatten the bookmark tree
function flattenBookmarksTree(bookmarkTreeNodes) {
    let flatList = [];
    for (let node of bookmarkTreeNodes) {
        if (node.children) {
            flatList = flatList.concat(flattenBookmarksTree(node.children));
        } else {
            flatList.push({
                title: node.title,
                url: node.url,
                id: node.id,
                dateAdded: node.dateAdded // Store dateAdded for sorting
            });
        }
    }
    return flatList;
}

// Search functionality
document.querySelector('.search-box').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredBookmarks = allBookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm)
    );
    displayBookmarks(filteredBookmarks); // Display filtered bookmarks
});

// Sort bookmarks based on selected criteria
document.getElementById("sortButton").addEventListener("click", function() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    const isVisible = dropdownMenu.style.display === "block";
    dropdownMenu.style.display = isVisible ? "none" : "block";
});


// Event listener for sort button clicks
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        const sortBy = item.textContent.trim();
        const searchTerm = document.querySelector('.search-box').value.toLowerCase();

        let bookmarksToSort = allBookmarks;

        if (searchTerm) {
            bookmarksToSort = allBookmarks.filter(bookmark =>
                bookmark.title.toLowerCase().includes(searchTerm)
            );
        }

        const sortedBookmarks = sortBookmarks(sortBy, bookmarksToSort);
        displayBookmarks(sortedBookmarks);

        document.getElementById("sortButton").textContent = sortBy; // Update button text
        document.getElementById("dropdownMenu").style.display = "none"; // Hide dropdown
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdownMenu = document.getElementById("dropdownMenu");
    const sortButton = document.getElementById("sortButton");
    if (!sortButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none"; // Hide dropdown if clicked outside
    }
});

/// Function to sort bookmarks
function sortBookmarks(sortBy, bookmarks) {
    const sortedBookmarks = [...bookmarks];

    switch (sortBy) {
        case "Latest":
            sortedBookmarks.sort((a, b) => b.dateAdded - a.dateAdded);
            break;
        case "Oldest":
            sortedBookmarks.sort((a, b) => a.dateAdded - b.dateAdded);
            break;
        case "Title: A to Z":
            sortedBookmarks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "Title: Z to A":
            sortedBookmarks.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "URL: A to Z":
            sortedBookmarks.sort((a, b) => a.url.localeCompare(b.url));
            break;
        case "URL: Z to A":
            sortedBookmarks.sort((a, b) => b.url.localeCompare(a.url));
            break;
        default:
            return bookmarks; // No sorting
    }

    return sortedBookmarks;
}


// Function to update view icon based on current modes
function updateViewIcon(isDarkMode, isGridView) {
    const viewOptionIcon = document.querySelector(".view_option");
    if (isDarkMode) {
        viewOptionIcon.src = isGridView ? "/assets/list2.png" : "/assets/gride2.png";
    } else {
        viewOptionIcon.src = isGridView ? "/assets/list.png" : "/assets/gride.png";
    }
}

// Function to toggle dark mode
document.getElementById("darkModeToggle").addEventListener("click", function() {
    const body = document.body;
    const header = document.querySelector(".header");
    const searchSort = document.querySelector(".search-sort");
    const sortButton = document.querySelector(".sort-button");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    const darkModeIcon = document.querySelector("#darkModeToggle img");
    const enlargeIcon = document.querySelector(".enlarge");

    // Toggle dark mode on the body and other elements
    body.classList.toggle('dark-mode');
    header.classList.toggle('dark-mode');
    searchSort.classList.toggle('dark-mode');
    sortButton.classList.toggle('dark-mode');
    dropdownMenu.classList.toggle('dark-mode');
    dropdownItems.forEach(item => item.classList.toggle('dark-mode'));

    const isDarkMode = body.classList.contains('dark-mode');
    const isGridView = document.querySelector(".content").classList.contains("grid-view");

    // Change the dark mode icon and enlarge icon
    if (isDarkMode) {
        darkModeIcon.src = "/assets/light.png";
        enlargeIcon.src = "/assets/enlarge2.png";
    } else {
        darkModeIcon.src = "/assets/dark.png";
        enlargeIcon.src = "/assets/enlarge.png";
    }

    // Update view icon based on both dark mode and view mode
    updateViewIcon(isDarkMode, isGridView);

    // Save the dark mode preference in chrome.storage
    chrome.storage.sync.set({ darkMode: isDarkMode });
});

// Function to load view preference from chrome.storage
function loadViewPreference() {
    chrome.storage.sync.get(['viewMode'], function(result) {
        const isGridView = result.viewMode === 'grid';
        const content = document.querySelector(".content");
        content.classList.toggle("grid-view", isGridView);

        // Update view icon based on both dark mode and current view
        const isDarkMode = document.body.classList.contains('dark-mode');
        updateViewIcon(isDarkMode, isGridView);
    });
}

// Add event listener for the view option icon
document.querySelector(".view_option").addEventListener("click", function() {
    const content = document.querySelector(".content");
    const isGridView = content.classList.toggle("grid-view");

    // Determine the current mode (dark or light)
    const body = document.body;
    const isDarkMode = body.classList.contains('dark-mode');

    // Change the icon based on the view and current mode
    if (isGridView) {
        this.src = isDarkMode ? "/assets/list2.png" : "/assets/list.png"; // Grid view icon
    } else {
        this.src = isDarkMode ? "/assets/gride2.png" : "/assets/gride.png"; // List view icon
    }

    // Save the view preference in chrome.storage
    chrome.storage.sync.set({ viewMode: isGridView ? 'grid' : 'list' });
});

// Function to load dark mode preference from chrome.storage
function loadDarkMode() {
    chrome.storage.sync.get(['darkMode'], function(result) {
        const isDarkMode = result.darkMode !== undefined ? result.darkMode : true;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.header').classList.add('dark-mode');
            document.querySelector('.search-sort').classList.add('dark-mode');
            document.querySelector('.sort-button').classList.add('dark-mode');
            document.querySelector('.dropdown-menu').classList.add('dark-mode');
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.add('dark-mode');
            });
            
            const darkModeIcon = document.querySelector("#darkModeToggle img");
            darkModeIcon.src = "/assets/light.png";
            document.querySelector(".enlarge").src = "/assets/enlarge2.png";
            
            // Update view icon based on current view mode
            const isGridView = document.querySelector(".content").classList.contains("grid-view");
            updateViewIcon(true, isGridView);
        }
    });
}

// Initialize dark mode on page load
loadDarkMode();

// Load the view preference on page load
loadViewPreference();

// Initialize by loading bookmarks
loadBookmarks();
