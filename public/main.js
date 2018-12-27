function sel(query) { return document.querySelector(query); } 

const container = sel("#container");
const grid = sel("#grid");
const modalBg = sel("#modal-background");
const modal = sel("#modal");
const modalImg = sel("#modal > img");
const modalUrl = sel("#modal > .url");
const newButton = sel("#new-button");

modalBg.addEventListener("click", closeModal);

const masonry = new Masonry(grid, {
  itemSelector: ".grid-item",
  columnWidth: 200,
  gutter: 10,
  stagger: 30
});

function openModal(imageURL, sourceURL) {
  if (!modalBg.hidden) return
  
  container.classList.add("blur");
  newButton.classList.add("blur");

  modalBg.hidden = false;
  modalImg.src = imageURL;
  const domain = sourceURL.match(/^https?\:\/\/(?:www.?)([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  modalUrl.innerText = domain;
  modalUrl.href = sourceURL;
}

function closeModal() {
  modalBg.hidden = true;
  container.classList.remove("blur");
  newButton.classList.remove("blur");
}

// Load the URLs and display images
fetch("http://localhost:8080/api")
  .then(res => {
    return res.json();
  })
  .then(json => {
    for (let i = 0; i < json.length; i++) {
      const j = json[i];
      const image = document.createElement("img");
      image.src = j.imageURL;
      image.classList.add("grid-item");
      image.addEventListener("click", () => openModal(j.imageURL, j.sourceURL));
      grid.append(image);
      masonry.appended(image);
    }
  });