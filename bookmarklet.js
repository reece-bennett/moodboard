javascript:
/*
URL scraping from:
https://github.com/voussoir/else/blob/master/Javascript/opendir_image.js
*/

const IMAGE_TYPES = ["\\.jpg", "\\.jpeg", "\\.jpg", "\\.bmp", "\\.tiff", "\\.tif", "\\.bmp", "\\.gif", "\\.png", "reddituploads\.com", "\\.webp", "drscdn\\.500px\\.org\\/photo"].join("|");
var seen_urls = new Set();

function normalize_url(url) {
  var protocol = window.location.protocol;
  if (protocol == "file:") {
    protocol = "http:";
  }
  url = url.replace("http:", protocol);
  url = url.replace("https:", protocol);

  console.log(url);
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

  else if (url.indexOf("gfycat.com") >= 0) {
    var gfy_id = url.split("/");
    gfy_id = gfy_id[gfy_id.length - 1];
    gfy_id = gfy_id.split(".")[0];
    if (gfy_id.length > 0) {
      url = get_gfycat_video(gfy_id);
    }
  }
  return [url];
}

function get_all_urls() {
  console.log("Collecting urls");
  var urls = [];

  function include(source, attr) {
    for (var index = 0; index < source.length; index += 1) {
      url = source[index][attr];

      if (url === undefined) { continue; }
      if (seen_urls.has(url)) { continue; }

      console.log(url);

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

function main() {
  const all_urls = get_all_urls();
  const imageURLs = all_urls.filter(url => url.split("?")[0].match(IMAGE_TYPES));
  console.log(imageURLs);
}

main();