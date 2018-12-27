const APIURL = "http://localhost:8080/api";
let data = [];

const container = document.getElementById("container");
const grid = document.getElementById("grid");

const masonry = new Masonry(grid, {
  itemSelector: ".grid-item",
  columnWidth: 300,
  fitWidth: true,
  gutter: 5,
  stagger: 20
});

const lightbox = document.getElementById("lightbox");
const lightboxLink = document.querySelector("#lightbox > a");
const lightboxImage = document.querySelector("#lightbox > img");

const form = document.querySelector("#addForm > form");
const formImage = document.querySelector("#addForm img");
const formImageUrl = document.querySelector("#imageURL");
const formSourceUrl = document.querySelector("#sourceURL");

const addButton = document.querySelector("#addButton");
const addForm = document.querySelector("#addForm");

lightbox.addEventListener("click", (ev) => {
  if (ev.target != lightbox) return;
  closeLightbox();
}, false);

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const body = {
    imageURL: formImageUrl.value,
    sourceURL: formSourceUrl.value
  }
  console.log(body);

  // Send data to API
  fetch(APIURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(json => {
    data.push(json.data);
    addItem(data.length - 1);
    imgLoaded();
    addForm.hidden = true;
  });
}, false);

formImageUrl.addEventListener("focusout", (ev) => {
  formImage.src = formImageUrl.value;
}, false)

addButton.addEventListener("click", (ev) => {
  addForm.hidden = false;
}, false);

let imageIndex = -1;

function openLightbox(index) {
  if (!lightbox.hidden) return

  lightbox.hidden = false;
  container.classList.add("blur");

  changeLightboxImage(index);
}

function closeLightbox() {
  if (lightbox.hidden) return
  
  lightbox.hidden = true;
  container.classList.remove("blur");
}

function changeLightboxImage(index) {
  console.log(`Changing to image #${index}`);

  const sourceURL = data[index].sourceURL;
  const imageURL = data[index].imageURL;

  imageIndex = index;

  const regexp = /^https?\:\/\/(?:www\.)?([^\/:?#]+)(?:[\/:?#]|$)/i;
  lightboxLink.innerText = sourceURL.match(regexp)[1];
  lightboxLink.href = sourceURL;
  
  lightboxImage.src = imageURL;
}

function nextImage() {
  if (lightbox.hidden) return;

  imageIndex++;
  imageIndex %= data.length;
  changeLightboxImage(imageIndex);
}

function previousImage() {
  if (lightbox.hidden) return;

  imageIndex--;
  if (imageIndex < 0) imageIndex += data.length;
  changeLightboxImage(imageIndex);
}

document.addEventListener("keydown", (ev) => {
  switch(ev.key) {
    case "Escape":
      closeLightbox();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "ArrowLeft":
      previousImage();
      break;
  }
}, false);

function addItem(index) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  gridItem.addEventListener("click", () => openLightbox(index), false);
  
  const gridImg = document.createElement("img");
  gridImg.src = data[index].imageURL;
  gridItem.append(gridImg);
  
  grid.append(gridItem);

  masonry.appended(gridItem);
}

function imgLoaded() {
  imagesLoaded(grid).on("progress", (instance, image) => {
    masonry.layout();
  });
}

// Get the data list from the API
fetch(APIURL)
.then(response => response.json())
.then(json => {
  data = json;
  for (let i = 0; i < data.length; i++) {
    addItem(i);
  }
  imgLoaded();
});