// popup.js
// Optimize bookmark handling with better performance and maintainability
class BookmarkManager {
    constructor() {
        this.allBookmarks = [];
        this.currentSort = 'Latest';
        this.initializeEventListeners();
        this.loadPreferences();
        this.loadBookmarks();
    }

    async loadPreferences() {
        const { darkMode = true, viewMode = 'list' } = await chrome.storage.sync.get(['darkMode', 'viewMode']);
        this.updateTheme(darkMode);
        this.updateViewMode(viewMode === 'grid');
    }

    async loadBookmarks() {
        const bookmarkTreeNodes = await chrome.bookmarks.getTree();
        this.allBookmarks = this.flattenBookmarksTree(bookmarkTreeNodes);
        this.displayBookmarks(this.allBookmarks);
    }

    flattenBookmarksTree(nodes) {
        return nodes.reduce((acc, node) => {
            if (node.children) {
                return [...acc, ...this.flattenBookmarksTree(node.children)];
            }
            return [...acc, {
                title: node.title,
                url: node.url,
                id: node.id,
                dateAdded: node.dateAdded
            }];
        }, []);
    }

    displayBookmarks(bookmarks) {
        const bookmarkList = document.querySelector(".content");
        const fragment = document.createDocumentFragment();

        bookmarks.forEach(bookmark => {
            const container = this.createBookmarkElement(bookmark);
            fragment.appendChild(container);
        });

        bookmarkList.innerHTML = '';
        bookmarkList.appendChild(fragment);
    }

    createBookmarkElement(bookmark) {
        const container = document.createElement('div');
        const link = document.createElement('a');
        link.href = bookmark.url;
        link.target = "_blank";

        const item = document.createElement('div');
        item.className = 'item';

        const thumbnail = document.createElement('div');
        thumbnail.className = 'item-thumbnail';
        thumbnail.style.backgroundImage = bookmark.url 
            ? `url(https://www.google.com/s2/favicons?domain=${bookmark.url})` 
            : 'url(/assets/logo.png)';

        const text = document.createElement('p');
        text.className = 'item-text';
        text.textContent = bookmark.title;

        item.append(thumbnail, text);
        link.appendChild(item);
        container.appendChild(link);

        return container;
    }

    sortBookmarks(sortBy, bookmarks) {
        const sortFunctions = {
            'Latest': (a, b) => b.dateAdded - a.dateAdded,
            'Oldest': (a, b) => a.dateAdded - b.dateAdded,
            'Title: A to Z': (a, b) => a.title.localeCompare(b.title),
            'Title: Z to A': (a, b) => b.title.localeCompare(a.title),
            'URL: A to Z': (a, b) => a.url.localeCompare(b.url),
            'URL: Z to A': (a, b) => b.url.localeCompare(a.url)
        };

        return [...bookmarks].sort(sortFunctions[sortBy] || sortFunctions['Latest']);
    }

    updateTheme(isDarkMode) {
        const elements = [
            document.body,
            document.querySelector('.header'),
            document.querySelector('.search-sort'),
            document.querySelector('.sort-button'),
            document.querySelector('.dropdown-menu'),
            ...document.querySelectorAll('.dropdown-item')
        ];

        elements.forEach(el => el?.classList.toggle('dark-mode', isDarkMode));

        // Update icons
        document.querySelector("#darkModeToggle img").src = 
            `/assets/${isDarkMode ? 'light' : 'dark'}.png`;
        document.querySelector(".enlarge").src = 
            `/assets/enlarge${isDarkMode ? '2' : ''}.png`;
        
        this.updateViewIcon();
    }

    updateViewMode(isGridView) {
        const content = document.querySelector(".content");
        content.classList.toggle("grid-view", isGridView);
        this.updateViewIcon();
    }

    updateViewIcon() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const isGridView = document.querySelector(".content").classList.contains("grid-view");
        const viewOptionIcon = document.querySelector(".view_option");
        
        viewOptionIcon.src = `/assets/${isGridView ? 'list' : 'gride'}${isDarkMode ? '2' : ''}.png`;
    }

    initializeEventListeners() {
        // Search functionality with debounce
        const searchInput = document.querySelector('.search-box');
        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredBookmarks = this.allBookmarks.filter(
                    bookmark => bookmark.title.toLowerCase().includes(searchTerm)
                );
                this.displayBookmarks(this.sortBookmarks(this.currentSort, filteredBookmarks));
            }, 300);
        });

        // Sort functionality
        const sortButton = document.getElementById("sortButton");
        const dropdownMenu = document.getElementById("dropdownMenu");

        sortButton.addEventListener("click", () => {
            const isVisible = dropdownMenu.style.display === "block";
            dropdownMenu.style.display = isVisible ? "none" : "block";
        });

        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sortBy = item.textContent.trim();
                this.currentSort = sortBy;
                
                const searchTerm = searchInput.value.toLowerCase();
                const bookmarksToSort = searchTerm
                    ? this.allBookmarks.filter(b => b.title.toLowerCase().includes(searchTerm))
                    : this.allBookmarks;

                this.displayBookmarks(this.sortBookmarks(sortBy, bookmarksToSort));
                sortButton.textContent = sortBy;
                dropdownMenu.style.display = "none";
            });
        });

        // Theme toggle
        document.getElementById("darkModeToggle").addEventListener("click", () => {
            const isDarkMode = !document.body.classList.contains('dark-mode');
            this.updateTheme(isDarkMode);
            chrome.storage.sync.set({ darkMode: isDarkMode });
        });

        // View toggle
        document.querySelector(".view_option").addEventListener("click", () => {
            const content = document.querySelector(".content");
            const isGridView = !content.classList.contains("grid-view");
            this.updateViewMode(isGridView);
            chrome.storage.sync.set({ viewMode: isGridView ? 'grid' : 'list' });
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!sortButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.style.display = "none";
            }
        });
    }
}

// Initialize the bookmark manager
document.addEventListener('DOMContentLoaded', () => {
    new BookmarkManager();
});