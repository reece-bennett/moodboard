const APIURL = `${window.location.origin}/api`;
let data = [];

const container = document.getElementById("container");
const grid = document.getElementById("grid");

const masonry = new Masonry(grid, {
  itemSelector: ".grid-item",
  columnWidth: 300,
  fitWidth: true,
  gutter: 5
});

const lightbox = document.getElementById("lightbox");
const lightboxLink = document.querySelector("#lightbox > a");
const lightboxImage = document.querySelector("#lightbox > img");
const lightboxEdit = document.querySelector("#editPopup");
const editImageURL = document.querySelector("#editImageURL");
const editSourceURL = document.querySelector("#editSourceURL");

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

  // Send data to API
  fetch(APIURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(json => {
    data.push(json.data);
    data.sort((a, b) => new Date(b.created) - new Date(a.created));
    const gridItem = createItem(0);
    grid.insertBefore(gridItem, grid.firstChild);
    masonry.prepended(gridItem);
    imgLoaded();
    closeForm();
  });
}, false);

formImageUrl.addEventListener("focusout", () => {
  formImage.src = formImageUrl.value;
}, false);

formImageUrl.addEventListener("paste", () => {
  // Timeout required because paste happens before the value is updated!
  setTimeout(() => {
    formImage.src = formImageUrl.value;
  }, 10);
}, false);

let currentIndex = -1;

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

  currentIndex = index;

  const regexp = /^https?\:\/\/(?:www\.)?([^\/:?#]+)(?:[\/:?#]|$)/i;
  lightboxLink.innerText = sourceURL.match(regexp)[1];
  lightboxLink.href = sourceURL;
  
  lightboxImage.src = imageURL;

  closeEditBox();
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

function _openLightbox(event) {
  openLightbox([...grid.children].indexOf(event.target.parentElement));
}

function createItem(index) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  gridItem.addEventListener("click", _openLightbox, false);
  
  const gridImg = document.createElement("img");
  gridImg.src = data[index].imageURL;
  gridItem.append(gridImg);

  return gridItem;
}

function removeItem(index) {
  grid.removeChild(grid.childNodes[index]);
  masonry.layout();
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
  data.sort((a, b) => new Date(b.created) - new Date(a.created));
  for (let i = 0; i < data.length; i++) {
    const gridItem = createItem(i);
    grid.append(gridItem);
    masonry.appended(gridItem);
  }
  imgLoaded();
});

function openForm() {
  addForm.hidden = false;
  container.classList.add("blur");
}

function closeForm() {
  addForm.hidden = true;
  container.classList.remove("blur");
}

function openEditBox() {
  lightboxEdit.hidden = false;
  editImageURL.value = data[currentIndex].imageURL;
  editSourceURL.value = data[currentIndex].sourceURL;
}

function closeEditBox() {
  lightboxEdit.hidden = true;
}

function toggleEditBox() {
  if (lightboxEdit.hidden) {
    openEditBox();
  } else {
    closeEditBox();
  }
}

lightboxEdit.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const id = data[currentIndex]._id;
  const body = {
    imageURL: editImageURL.value,
    sourceURL: editSourceURL.value
  }
  console.dir(body);

  // Send data to API
  fetch(`${APIURL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(json => {
    data[currentIndex].imageURL = json.imageURL;
    data[currentIndex].sourceURL = json.sourceURL;
    closeEditBox();
  });
}, false);

editImageURL.addEventListener("focusout", () => {
  lightboxImage.src = editImageURL.value;
}, false);

editImageURL.addEventListener("paste", () => {
  // Timeout required because paste happens before the value is updated!
  setTimeout(() => {
    lightboxImage.src = editImageURL.value;
  }, 10);
}, false);

function deleteImage(index) {
  const id = data[index]._id;

  fetch(`${APIURL}/${id}`, {
    method: "DELETE"
  })
  .then(res => {
    data.splice(currentIndex, 1);
    removeItem(currentIndex);
    // previousImage();
    changeLightboxImage(currentIndex);
  });
} 