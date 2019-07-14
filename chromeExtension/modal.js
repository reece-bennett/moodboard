const $ = document.querySelector.bind(document);

function changeState(state) {
  console.log(`Change state ${state}`);
  $("#modal-error").hidden = state !== "modal-error";
  $("#modal-form").hidden = state !== "modal-form";
  $("#modal-progress").hidden = state !== "modal-progress";
  $("#modal-done").hidden = state !== "modal-done";
}

function submit() {
  chrome.runtime.sendMessage({
    action: "submit",
    data: {
      description: $("input[name=description]").value,
      imageUrl: $("input[name=imageUrl]").value,
      sourceUrl: $("input[name=sourceUrl]").value
    }
  });
  changeState("modal-progress");
}

// eslint-disable-next-line no-unused-vars
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender, request);
  switch (request.action) {
    case "saveError":
      changeState("modal-error");
      break;
    case "saveSuccess":
      $("#modal-done>.modal-image>img").src = request.data;
      changeState("modal-done");
      break;
  }
});

$("#closeButton").addEventListener("click", event => {
  event.preventDefault();
  chrome.runtime.sendMessage({ action: "closeModal" });
});

$("form").addEventListener("submit", event => {
  event.preventDefault();
  submit();
});

$("#cancelButton").addEventListener("click", event => {
  event.preventDefault();
  chrome.runtime.sendMessage({ action: "closeModal" });
});

$("#retryButton").addEventListener("click", event => {
  event.preventDefault();
  submit();
});

$("#closeButton2").addEventListener("click", event => {
  event.preventDefault();
  chrome.runtime.sendMessage({ action: "closeModal" });
});

// Ask background.js for initial field values
chrome.runtime.sendMessage({ action: "updateFieldsRequest" }, res => {
  $("input[name=description]").value = res.data.description;
  $("input[name=imageUrl]").value = res.data.imageUrl;
  $("input[name=sourceUrl]").value = res.data.sourceUrl;
  $("#modal-form>.modal-image>img").src = res.data.imageUrl;
  changeState("modal-form");
});
