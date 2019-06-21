const form = document.querySelector("form");
const closeButton = document.querySelector("#closeButton");
const description = document.querySelector("input[name=description]");
const imageUrl = document.querySelector("input[name=imageUrl]");
const sourceUrl = document.querySelector("input[name=sourceUrl]");
const previewImage = document.querySelector("#modal-image img");

// eslint-disable-next-line no-unused-vars
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  switch (request.action) {
    case "updateFields":
      description.value = request.data.description;
      imageUrl.value = request.data.imageUrl;
      sourceUrl.value = request.data.sourceUrl;
      previewImage.src = request.data.imageUrl;
      break;
  }
});

closeButton.addEventListener("click", event => {
  event.preventDefault();
  chrome.runtime.sendMessage({ action: "closeModal" });
});

form.addEventListener("submit", event => {
  event.preventDefault();
  chrome.runtime.sendMessage({
    action: "submit",
    data: {
      description: description.value,
      imageUrl: imageUrl.value,
      sourceUrl: sourceUrl.value
    }
  });
});
