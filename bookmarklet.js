javascript:

/*
URL scraping adapted from:
https://github.com/voussoir/else/blob/master/Javascript/opendir_image.js
*/

var API_URL = "http://localhost:8080/api";
var IMAGE_TYPES = ["\\.jpg", "\\.jpeg", "\\.jpg", "\\.bmp", "\\.tiff", "\\.tif", "\\.bmp", "\\.gif", "\\.png", "reddituploads\.com", "\\.webp", "drscdn\\.500px\\.org\\/photo"].join("|");

function normalize_url(url) {
  var protocol = window.location.protocol;
  if (protocol == "file:") {
    protocol = "http:";
  }
  url = url.replace("http:", protocol);
  url = url.replace("https:", protocol);

  /* console.log(url); */
  url = url.replace("imgur.com/gallery/", "imgur.com/a/");

  if (url.indexOf("vidble") >= 0) {
    url = url.replace("_med", "");
    url = url.replace("_sqr", "");
  }

  else if (url.indexOf("imgur.com/a/") != -1) {
    var urls = [];
    var id = url.split("imgur.com/a/")[1];
    id = id.split("#")[0].split("?")[0];
    console.log("imgur album: " + id);
    var url = "https://api.imgur.com/3/album/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState == 4 && request.status == 200) {
        var text = request.responseText;
        var images = JSON.parse(request.responseText);
        images = images['data']['images'];
        for (var index = 0; index < images.length; index += 1) {
          var image = images[index];
          var image_url = image["mp4"] || image["link"];
          if (!image_url) { continue; }
          image_url = normalize_url(image_url)[0];
          console.log("+" + image_url);
          urls.push(image_url);
        }
      }
    };
    var asynchronous = false;
    request.open("GET", url, asynchronous);
    request.setRequestHeader("Authorization", "Client-ID 1d8d9b36339e0e2");
    request.send(null);
    return urls;
  }

  else if (url.indexOf("imgur.com") >= 0) {
    var url_parts = url.split("/");
    var image_id = url_parts[url_parts.length - 1];
    var extension = ".jpg";
    if (image_id.indexOf(".") != -1) {
      image_id = image_id.split(".");
      extension = "." + image_id[1];
      image_id = image_id[0];
    }
    extension = extension.replace(".gifv", ".mp4");
    extension = extension.replace(".gif", ".mp4");

    if (image_id.length % 2 == 0) {
      image_id = image_id.split("");
      image_id[image_id.length - 1] = "";
      image_id = image_id.join("");
    }
    url = protocol + "//i.imgur.com/" + image_id + extension;
  }

  return [url];
}

function get_all_urls(seen_urls) {
  console.log("Collecting urls");
  var urls = [];

  function include(source, attr) {
    for (var index = 0; index < source.length; index += 1) {
      url = source[index][attr];

      if (url === undefined) { continue; }
      if (seen_urls.has(url)) { continue; }

      /* console.log(url); */

      if (url.indexOf("thumbs.redditmedia") != -1) { console.log("Rejecting reddit thumb"); continue; }
      if (url.indexOf("pixel.reddit") != -1 || url.indexOf("reddit.com/static/pixel") != -1) { console.log("Rejecting reddit pixel"); continue }
      if (url.indexOf("/thumb/") != -1) { console.log("Rejecting /thumb/"); continue; }
      if (url.indexOf("/loaders/") != -1) { console.log("Rejecting loader"); continue; }
      if (url.indexOf("memegen") != -1) { console.log("Rejecting retardation"); continue; }
      if (url.indexOf("4cdn") != -1 && url.indexOf("s.jpg") != -1) { console.log("Rejecting 4chan thumb"); continue; }

      sub_urls = normalize_url(url);
      if (sub_urls == null) { continue; }

      for (var url_index = 0; url_index < sub_urls.length; url_index += 1) {
        sub_url = sub_urls[url_index];
        if (seen_urls.has(sub_url)) { continue; }

        urls.push(sub_url);
        seen_urls.add(sub_url);
      }
      seen_urls.add(url);
    }
  }

  var docs = [];
  docs.push(document);
  while (docs.length > 0) {
    var d = docs.pop();
    include(d.links, "href");
    include(d.images, "src");
    include(d.getElementsByTagName("source"), "src");
  }
  console.log("collected " + urls.length + " urls.");
  return urls;
}



/*
  DOM Manipulation
*/

function setupGallery() {
  gallery.id = "mb_gallery";
  document.body.append(gallery);

  const closeButton = document.createElement("div");
  closeButton.id = "mb_closeButton";
  closeButton.innerText = "X";
  closeButton.onclick = cleanup;
  gallery.append(closeButton);
}

function setupForm() {
  formContainer.id = "mb_form";
  formContainer.hidden = true;
  document.body.append(formContainer);
  
  const form = document.createElement("form");
  form.onsubmit = submitForm;
  formContainer.append(form);

  const titleLabel = document.createElement("label");
  const titleSpan = document.createElement("span");
  titleSpan.innerText = "Title:";
  titleLabel.append(titleSpan);
  const titleInput = document.createElement("input");
  titleInput.id = "titleInput";
  titleInput.autocomplete = "off";
  titleLabel.append(titleInput);
  form.append(titleLabel);

  const imageLabel = document.createElement("label");
  const imageSpan = document.createElement("span");
  imageSpan.innerText = "Image URL:";
  imageLabel.append(imageSpan);
  const imageInput = document.createElement("input");
  imageInput.id = "imageInput";
  imageInput.type = "url";
  imageInput.autocomplete = "off";
  imageLabel.append(imageInput);
  form.append(imageLabel);

  const sourceLabel = document.createElement("label");
  const sourceSpan = document.createElement("span");
  sourceSpan.innerText = "Source URL:";
  sourceLabel.append(sourceSpan);
  const sourceInput = document.createElement("input");
  sourceInput.id = "sourceInput";
  sourceInput.type = "url";
  sourceInput.autocomplete = "off";
  sourceLabel.append(sourceInput);
  form.append(sourceLabel);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.innerText = "Submit";
  form.append(submitButton);

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.type = "button";
  cancelButton.onclick = hideForm;
  form.append(cancelButton);
}

function submitForm(event) {
  event.preventDefault();
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: document.querySelector("#titleInput").value,
      imageURL: document.querySelector("#imageInput").value,
      sourceURL: document.querySelector("#sourceInput").value
    })
  })
  .then(res => {
    if (res.ok) {
      cleanup();
    }
  });
}

function showForm(event) {
  formContainer.hidden = false;
  document.querySelector("#titleInput").value = document.title;
  document.querySelector("#imageInput").value = event.target.src;
  document.querySelector("#sourceInput").value = window.location.href;
  if (selected) selected.classList.remove("selected");
  selected = event.target.parentElement;
  selected.classList.add("selected");
}

function hideForm() {
  formContainer.hidden = true;
  selected.classList.remove("selected");
}

function injectCSS() {
  styleTag.innerText = `
    [hidden] {
      display: none !important;
    }

    body {
      overflow: hidden;
    }

    #mb_gallery {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      padding: 20px;
      box-sizing: border-box;
      z-index: 100;
      font-family: sans-serif;
      overflow: auto;
    }

    #mb_gallery a {
      cursor: pointer;
      display: inline-block;
      height: 200px;
      position: relative;
      margin: 0 10px 10px 0;
      border: 1px solid #555;
      transition: border 0.2s;
    }

    #mb_gallery a:hover {
      border-color: #aaa;
    }

    #mb_gallery a.selected {
      border-color: #fff;
    }

    #mb_gallery img {
      height: 200px;
    }

    #mb_gallery span {
      position: absolute;
      bottom: 0;
      right: 0;
      color: white;
      background: black;
      opacity: 0.8;
    }

    #mb_closeButton {
      position: absolute;
      top: 5px;
      right: 5px;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    #mb_form {
      z-index: 101;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    #mb_form form {
      color: #212529;
      background: #f8f9fa;
      max-width: 1000px;
      width: 100%;
      pointer-events: initial;
      padding: 16px;
    }

    #mb_form label { 
      display: flex;
      margin-bottom: 8px;
    }

    #mb_form span {
      width: 6rem;
      line-height: 2.1875;
    }

    #mb_form input {
      flex: 1 1 auto;
      border: 1px solid #ced4da;
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
    }

    #mb_form button {
      text-align: center;
      vertical-align: middle;
      user-select: none;
      border: 1px solid #6c757d;
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
      background: #6c757d;
      color: #fff;
      margin-right: 0.5rem;
    }

    #mb_form button[type=submit] {
      background: #007bff;
      border: 1px solid #007bff;
    }
  `;
  document.head.append(styleTag);
}

function cleanup() {
  gallery.remove();
  formContainer.remove();
  styleTag.remove();
}

function createImage(url) {
  const container = document.createElement("a");
  container.onclick = showForm;

  const image = document.createElement("img");
  image.src = url;
  container.append(image);
  
  const promise = new Promise(resolve => {
    image.onload = () => resolve(container);
  });

  const sizeLabel = document.createElement("span");
  container.append(sizeLabel);

  return promise;
}

function totalSize(container) {
  return container.children[0].naturalWidth + container.children[0].naturalHeight;
}

function main() {
  const seen_urls = new Set();
  const all_urls = get_all_urls(seen_urls);
  const imageURLs = all_urls.filter(url => url.split("?")[0].match(IMAGE_TYPES));

  setupGallery();
  setupForm();
  injectCSS();

  for (let url of imageURLs) {
    createImage(url).then(container => {
      const containers = document.querySelectorAll("#mb_gallery a"); 
      container.children[1].innerText = `${container.children[0].naturalWidth}x${container.children[0].naturalHeight}`;
      if (containers.length == 0) {
        gallery.append(container);
      } else {
        const before = Array.prototype.slice.call(containers).find(el => totalSize(el) < totalSize(container));
        gallery.insertBefore(container, before);
      }
    });
  }
}

if (document.querySelector("#mb_gallery") == undefined) {
  var gallery = document.createElement("div");
  var formContainer = document.createElement("div");
  var styleTag = document.createElement("style");
  var selected;

  main();
}