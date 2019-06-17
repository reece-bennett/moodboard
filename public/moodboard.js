const APIURL = `${window.location.origin}/api`;

// Element references
function $(selectors) {
  return document.querySelector(selectors);
}
const grid = $("#grid");
const lightbox = $("#lightbox");

let data = [];
let currentIndex = 0;

// Initialise the masonry grid
const masonry = new Masonry(grid, {
  itemSelector: ".grid-item",
  columnWidth: 300,
  fitWidth: true,
  gutter: 5
});


/* ===================== Lightbox controls ================== */
function openLightbox(index) {
  if (!lightbox.hidden) return

  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");

  changeLightboxImage(index);
}

function closeLightbox() {
  if (lightbox.hidden) return;
  
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
}

function changeLightboxImage(index) {
  console.log(`Changing to image #${index}`);

  const sourceURL = data[index].sourceURL;
  const imageURL = data[index].imageURL;

  currentIndex = index;

  // const regexp = /^https?\:\/\/(?:www\.)?([^\/:?#]+)(?:[\/:?#]|$)/i;
  // lightboxLink.innerText = sourceURL.match(regexp)[1];
  // lightboxLink.href = sourceURL;

  $("#source-button").href = sourceURL;
  $("#image-button").href = imageURL;

  $("#source-field").value = sourceURL;
  $("#image-field").value = imageURL;
  
  $("#lightbox img").src = imageURL;
}

function nextImage() {
  if (lightbox.hidden) return;

  currentIndex++;
  currentIndex %= data.length;
  changeLightboxImage(currentIndex);
}

function previousImage() {
  if (lightbox.hidden) return;

  currentIndex--;
  if (currentIndex < 0) currentIndex += data.length;
  changeLightboxImage(currentIndex);
}


/* =============== Adding and removing images =============== */
function createItem(url) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  gridItem.addEventListener("click", event => {
    openLightbox([...grid.children].indexOf(event.target.parentElement));
  }, false);
  
  const gridImg = document.createElement("img");
  gridImg.src = url;
  gridItem.append(gridImg);

  return gridItem;
}

function removeItem(index) {
  grid.removeChild(grid.childNodes[index]);
  masonry.layout();
}

// Updates the masonry layout as images are loaded
// Should be called whenever new images are being added
function imgLoaded() {
  imagesLoaded(grid).on("progress", (instance, image) => {
    masonry.layout();
  });
}


/* ===================== Event Listeners ==================== */
document.addEventListener("keydown", event => {
  switch(event.key) {
    case "Escape":
      // If exiting the lightbox, do not stop a page load
      if (!lightbox.hidden) event.preventDefault();
      closeLightbox();
      break;
    case "ArrowRight":
      // Don't change image if we are typing in a text field
      if (document.activeElement.tagName != "INPUT") nextImage();
      break;
    case "ArrowLeft":
      if (document.activeElement.tagName != "INPUT") previousImage();
      break;
  }
}, false);

lightbox.addEventListener("click", event => {
  if (!(event.target == lightbox || event.target == $("#lightbox-container"))) return;
  closeLightbox();
}, false);


/* ================= Start Loading Moodboard ================ */
// Get the data list from the API
fetch(APIURL)
.then(response => response.json())
.then(json => {
  data = json;
  data.sort((a, b) => new Date(b.created) - new Date(a.created));
  for (let item of data) {
    const gridItem = createItem(item.imageURL);
    grid.append(gridItem);
    masonry.appended(gridItem);
  }
  imgLoaded();
});