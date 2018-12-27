const APIURL = "http://localhost:3000/api";
const data = [];

const container = document.getElementById("container");
const grid = document.getElementById("grid");

const lightbox = document.getElementById("lightbox");
const lightboxLink = document.querySelector("#lightbox > a");
const lightboxImage = document.querySelector("#lightbox > img");

const form = document.querySelector("#newForm > form");
const formImage = document.querySelector("#newForm img");
const formImageUrl = document.querySelector("#imageURL");
const formSourceUrl = document.querySelector("#sourceURL");

// Get the data list from the API

// TEMP - add random images to the data list
function random(arr) {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
}
const NUM = 20;
for (let i = 0; i < NUM; i++) {
  const w = 800;
  const h = random([500, 600, 700]);
  data.push({
    source: "https://picsum.photos",
    image: `https://picsum.photos/${w}/${h}/?random&t=${i}`
  })
}

lightbox.addEventListener("click", (ev) => {
  if (ev.target != lightbox) return;
  closeLightbox();
}, false);

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const data = {
    imageURL: formImageUrl.value,
    sourceURL: formSourceUrl.value
  }
  console.log(data);

  // Send data to API
  fetch(APIURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(json => console.log(json));
  // get new item in response, add into data and refresh page
}, false);

formImageUrl.addEventListener("focusout", (ev) => {
  formImage.src = formImageUrl.value;
}, false)

for (let i = 0; i < data.length; i++) {
  
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  gridItem.addEventListener("click", () => openLightbox(i), false);
  
  const gridImg = document.createElement("img");
  gridImg.src = data[i].image;
  gridItem.append(gridImg);
  
  grid.append(gridItem);
}

const masonry = new Masonry(grid, {
  itemSelector: ".grid-item",
  columnWidth: 300,
  fitWidth: true,
  gutter: 5,
  stagger: 20
});

imagesLoaded(grid).on("progress", function() {
  masonry.layout();
  console.log("progress");
});

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
  const sourceURL = data[index].source;
  const imageURL = data[index].image;

  imageIndex = index;

  lightboxLink.innerText = sourceURL;
  lightboxLink.href = sourceURL;
  
  lightboxImage.src = imageURL;
}

function nextImage() {
  if (lightbox.hidden) return;

  imageIndex++;
  changeLightboxImage(imageIndex);
}

function previousImage() {
  if (lightbox.hidden) return;

  imageIndex--;
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