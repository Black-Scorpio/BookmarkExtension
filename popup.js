document.addEventListener("DOMContentLoaded", function () {
  const bookmarkList = document.getElementById("bookmarkList");

  // Load existing bookmarks from storage
  chrome.storage.sync.get("bookmarks", function (data) {
    if (data.bookmarks) {
      data.bookmarks.forEach((bookmark) => {
        appendBookmark(bookmark);
      });
    }
  });

  // Save tab on click
  document.getElementById("saveTab").addEventListener("click", function () {
    saveTab();
  });

  // Inside popup.js
  function saveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];

      // Check if the URL is already saved
      chrome.storage.sync.get("bookmarks", function (data) {
        const bookmarks = data.bookmarks || [];
        const isDuplicate = bookmarks.some((b) => b.url === tab.url);

        if (!isDuplicate) {
          // Save the bookmark
          saveBookmark({ url: tab.url, title: tab.title });
        } else {
          alert("This URL is already saved.");
        }
      });
    });
  }

  // Delete all bookmarks on double-click
  document.getElementById("deleteAll").addEventListener("click", function () {
    showConfirmationDialog();
  });

  function showConfirmationDialog() {
    const confirmation = confirm(
      "Are you sure you want to delete all items from your list?"
    );
    if (confirmation) {
      chrome.storage.sync.set({ bookmarks: [] });
      bookmarkList.innerHTML = "";
    }
  }

  // Save a bookmark
  function saveBookmark(bookmark) {
    chrome.storage.sync.get("bookmarks", function (data) {
      const bookmarks = data.bookmarks || [];

      // Check for duplicate URL
      const isDuplicate = bookmarks.some((b) => b.url === bookmark.url);
      if (!isDuplicate) {
        bookmarks.push(bookmark);
        chrome.storage.sync.set({ bookmarks });
        appendBookmark(bookmark);
      } else {
        alert("This URL is already saved.");
      }
    });
  }

  // Append a bookmark to the list
  function appendBookmark(bookmark) {
    const listItem = document.createElement("li");

    // Check if the bookmark has a valid URL and title
    if (bookmark.url && bookmark.title) {
      listItem.innerHTML = `
        <a href="${bookmark.url}" target="_blank">
          <img src="${getFaviconUrl(
            bookmark.url
          )}" alt="Favicon" width="16" height="16">
          <span>${bookmark.title}</span>
        </a>
        <button class="delete">Delete</button>
      `;
    } else {
      // Handle the case where URL or title is missing
      listItem.innerHTML = `<span>Invalid bookmark</span>`;
    }

    const deleteButton = listItem.querySelector(".delete");
    deleteButton.addEventListener("click", function () {
      deleteBookmark(bookmark);
      listItem.remove();
    });
    bookmarkList.insertBefore(listItem, bookmarkList.firstChild);
  }

  // Helper function to get the favicon URL with a fallback to error.png
  function getFaviconUrl(url) {
    try {
      return "https://www.google.com/s2/favicons?domain=" + url;
    } catch (error) {
      // If fetching the favicon fails, use the default icon
      return "error.png";
    }
  }

  // Delete a bookmark
  function deleteBookmark(bookmark) {
    chrome.storage.sync.get("bookmarks", function (data) {
      const bookmarks = data.bookmarks || [];
      const updatedBookmarks = bookmarks.filter((b) => b.url !== bookmark.url);

      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, function () {
        // After updating the storage, you may want to update the displayed list as well
        displayBookmarks(updatedBookmarks);
      });
    });
  }

  // Function to display bookmarks
  function displayBookmarks(bookmarks) {
    bookmarkList.innerHTML = "";

    bookmarks.forEach((bookmark) => {
      appendBookmark(bookmark);
    });
  }
});
