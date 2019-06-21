"use strict";

console.log("content-script.js");

const iframe = document.createElement("iframe");
iframe.src = chrome.runtime.getURL("modal.html");
iframe.id = "moodboard_frame";
Object.assign(iframe.style, {
  position: "fixed",
  height: "100%",
  width: "100%",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  margin: 0,
  border: 0,
  zIndex: 9223372036854775807
});

function openModal() {
  console.log("Opening modal");
  document.body.appendChild(iframe);
}

function closeModal() {
  console.log("Closing modal");
  document.body.removeChild(iframe);
}

// eslint-disable-next-line no-unused-vars
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  switch (request.action) {
    case "openModal":
      openModal();
      break;
    case "closeModal":
      closeModal();
      break;
  }
});
