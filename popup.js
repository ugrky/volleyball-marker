// popup.js

function dumpBookmarks() {
  const folderTitle = "Volleybal Journal";
  const newBookmarkTitle = $('#bookmark-title').val().trim();
  const notesForThisPiece = $('#notes-for-this-piece').val().trim();

  if (!folderTitle || !newBookmarkTitle) {
    alert('Please provide valid folder and title!');
    return;
  }

  // seperate newBookmarkTitle string by space
  const newBookmarkTitleArr = newBookmarkTitle.split(' ');

  // append "#" to each word in the array
  const newBookmarkTitleArrWithHash = newBookmarkTitleArr.map((word) => {
    return `#${word}`;
  });

  // convert array to string
  const newBookmarkTitleWithHash = newBookmarkTitleArrWithHash.join(' ');

  const port = chrome.runtime.connect();
  port.postMessage({ newBookmarkTitle: newBookmarkTitleWithHash, notesForThisPiece });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-bookmark-btn').addEventListener('click', dumpBookmarks);
});