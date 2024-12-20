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
        // Create a link for the entire item
        const link = document.createElement('a');
        link.href = bookmark.url; // Set the URL
        link.target = "_blank"; // Open in a new tab
        link.style.color = 'inherit'; // Inherit color from parent
        link.style.textDecoration = 'none'; // Remove underline

        const item = document.createElement('div');
        item.classList.add('item');

        const thumbnail = document.createElement('div');
        thumbnail.classList.add('item-thumbnail');

        // Set the background image for the thumbnail
        if (bookmark.url) {
            thumbnail.style.backgroundImage = `url(https://www.google.com/s2/favicons?domain=${bookmark.url})`;
        } else {
            thumbnail.style.backgroundImage = 'url(/assets/logo.png)'; // Optional: Set a default icon if no URL
        }
        
        item.appendChild(thumbnail);

        const text = document.createElement('p');
        text.classList.add('item-text');
        text.textContent = bookmark.title; // Set the text

        // Append text to the item
        item.appendChild(text);
        link.appendChild(item); // Append the item to the link

        bookmarkList.appendChild(link); // Append the link to the bookmark list
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

// Sort the bookmarks array based on selected option
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        const sortBy = item.textContent.trim();
        sortBookmarks(sortBy);
        document.getElementById("dropdownMenu").style.display = "none"; // Hide dropdown after selection
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

// Sort bookmarks function
function sortBookmarks(sortBy) {
    let sortedBookmarks = [...allBookmarks]; // Create a copy of the bookmarks array

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
            sortedBookmarks = allBookmarks; // Default to original order
    }

    // Display sorted bookmarks
    displayBookmarks(sortedBookmarks);
}

// Function to load dark mode preference from chrome.storage
function loadDarkMode() {
    chrome.storage.sync.get(['darkMode'], function(result) {
        // Set dark mode to true by default
        const isDarkMode = result.darkMode !== undefined ? result.darkMode : true; // Default to true if not set
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.header').classList.add('dark-mode');
            document.querySelector('.search-sort').classList.add('dark-mode');
            document.querySelector('.sort-button').classList.add('dark-mode');
            document.querySelector('.dropdown-menu').classList.add('dark-mode');
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.add('dark-mode');
            });
            // Set the light mode icon as default
            const darkModeIcon = document.querySelector("#darkModeToggle img");
            darkModeIcon.src = "/assets/light.png"; // Set light mode icon
            document.querySelector(".view_option").src = "/assets/gride2.png"; // Set view option icon for dark mode
            document.querySelector(".enlarge").src = "/assets/enlarge2.png"; // Set enlarge icon for dark mode
        }
    });
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
    const viewOptionIcon = document.querySelector(".view_option");
    const enlargeIcon = document.querySelector(".enlarge");

    // Toggle dark mode on the body and other elements
    body.classList.toggle('dark-mode');
    header.classList.toggle('dark-mode');
    searchSort.classList.toggle('dark-mode');
    sortButton.classList.toggle('dark-mode');
    dropdownMenu.classList.toggle('dark-mode');
    dropdownItems.forEach(item => item.classList.toggle('dark-mode'));

    // Change the dark mode icon based on the current mode
    if (body.classList.contains('dark-mode')) {
        darkModeIcon.src = "/assets/light.png"; // Set light mode icon
        viewOptionIcon.src = "/assets/gride2.png"; // Set view option icon for dark mode
        enlargeIcon.src = "/assets/enlarge2.png"; // Set enlarge icon for dark mode
    } else {
        darkModeIcon.src = "/assets/dark.png"; // Set dark mode icon
        viewOptionIcon.src = "/assets/gride.png"; // Set view option icon for light mode
        enlargeIcon.src = "/assets/enlarge.png"; // Set enlarge icon for light mode
    }

    // Save the dark mode preference in chrome.storage
    const darkModeEnabled = body.classList.contains('dark-mode');
    chrome.storage.sync.set({ darkMode: darkModeEnabled });
});

// Initialize dark mode on page load
loadDarkMode();

// Initialize by loading bookmarks
loadBookmarks();
