// background.js

function findTheURL() {
    function parseTimeToSeconds(timeString) {
        const parts = timeString.split(':').map(Number);
        if (parts.length === 3) {
            const [hours, minutes, seconds] = parts;
            return hours * 3600 + minutes * 60 + seconds;
        } else if (parts.length === 2) {
            const [minutes, seconds] = parts;
            return minutes * 60 + seconds;
        }
        throw new Error("Invalid time format. Use 'HH:MM:SS' or 'MM:SS'.");
    }

    const timeStamp = document.querySelector(".ytp-time-current").innerHTML.trim();
    const timeInSeconds = parseTimeToSeconds(timeStamp);
    const parsedUrl = new URL(window.location.href);
    parsedUrl.searchParams.set('t', timeInSeconds);

    return parsedUrl.toString();
}

function alertSuccess() {}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
            const tab = tabs[0];
            const latestGeneratedURL = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: findTheURL,
            }).then((result) => result[0].result);

            const folderTitle = "Volleybal Journal";
            const { newBookmarkTitle, notesForThisPiece } = message;
            const fullTitle = `${newBookmarkTitle} | ${notesForThisPiece}`;

            chrome.bookmarks.getTree((bookmarkTreeNodes) => {
                let folderNode = null;

                function findFolder(nodes) {
                    for (const node of nodes) {
                        if (node.title === folderTitle && !node.url) {
                            folderNode = node;
                            return;
                        }
                        if (node.children) findFolder(node.children);
                        if (folderNode) return;
                    }
                }

                findFolder(bookmarkTreeNodes);

                if (folderNode) {
                    chrome.bookmarks.create({
                        parentId: folderNode.id,
                        title: fullTitle,
                        url: latestGeneratedURL,
                    });
                } else {
                    chrome.bookmarks.create({ parentId: '1', title: folderTitle }, (newFolder) => {
                        chrome.bookmarks.create({
                            parentId: newFolder.id,
                            title: fullTitle,
                            url: latestGeneratedURL,
                        });
                    });
                }
            });
        });
    });
});

// This callback WILL NOT be called for "_execute_action"
chrome.commands.onCommand.addListener((command) => {
    if (command === "open-extension") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.action.openPopup(); // Opens the extension popup
        });
    }
});