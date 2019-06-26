"use strict";

const manifest = chrome.runtime.getManifest();

const clientId = encodeURIComponent(manifest.oauth2.client_id);
const scopes = encodeURIComponent(manifest.oauth2.scopes.join(" "));
const redirectUri = encodeURIComponent(`https://${chrome.runtime.id}.chromiumapp.org`);
const url =
  "https://accounts.google.com/o/oauth2/auth" +
  `?client_id=${clientId}` +
  "&response_type=token id_token" +
  "&access_type=online" +
  `&redirect_uri=${redirectUri}` +
  `&scope=${scopes}`;

function parseJwt(token) {
  // https://stackoverflow.com/a/38552302
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

function getIdToken(interactive, callback) {
  const options = { url: url, interactive: interactive };
  chrome.identity.launchWebAuthFlow(options, redirectedTo => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    } else {
      const response = redirectedTo.split("#", 2)[1];
      let vars = {};
      for (const v of response.split("&")) {
        const pair = v.split("=");
        vars[pair[0]] = pair[1];
      }
      console.log(vars);
      if (vars.id_token) {
        const idToken = vars.id_token;
        const idTokenObj = parseJwt(idToken);
        chrome.storage.local.set({ idToken: idToken, idTokenObj: idTokenObj });
        callback(idToken, idTokenObj);
      } else {
        console.error("There was no id token in the response");
      }
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveImage",
    title: "Save",
    contexts: ["image"]
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    let image = info.srcUrl;
    let source = info.pageUrl;
    let title = tab.title;

    if (info.pageUrl == "https://www.reddit.com/") {
      // If on the front page use the link (to the comments) as the source
      source = info.linkUrl;
    } else if (info.pageUrl.match(/https:\/\/www.reddit.com\/r\/\w+\/comments/)) {
      // If on the comments then use the link (to a hopefully bigger image) as
      // the image and strip the reddit prefix from the title
      image = info.linkUrl;
      title = tab.title.substring(0, tab.title.lastIndexOf(":") - 1);
    }

    if (image.startsWith("https://preview.redd.it/")) {
      // If the image we found is the preview, change the URL to get the original
      const match = image.match(/(?<=https:\/\/preview.redd.it\/)\S+(?=\?)/);
      image = `https://i.redd.it/${match}`;
    }

    console.log(`Saving image:\nImageUrl: ${image}\nSourceUrl: ${source}\nDescription: ${title}`);

    const payload = {
      imageUrl: image,
      sourceUrl: source,
      description: title
    };

    chrome.tabs.sendMessage(tab.id, { action: "openModal" });
    setTimeout(
      () =>
        chrome.tabs.sendMessage(tab.id, {
          action: "updateFields",
          data: payload
        }),
      250
    );
    return;
  });
});

function saveImage(payload, tabId) {
  // Check if we have a valid idToken, if not start the OAuth flow
  chrome.storage.local.get(["idToken", "idTokenObj"], data => {
    const { idToken, idTokenObj } = data;

    if (idToken && idTokenObj.exp > Date.now()) {
      sendRequest(idToken, payload, tabId);
    } else {
      // We don't have a token, or it's out of date
      getIdToken(true, n_idToken => {
        sendRequest(n_idToken, payload, tabId);
      });
    }
  });
}

function sendRequest(idToken, payload, tabId) {
  fetch("http://localhost:8080/images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (response.ok) {
        console.log("Image saved!");
        chrome.tabs.sendMessage(tabId, { action: "closeModal" });
        return response.json();
        // Maybe get the URL of the image and present to the user here?
      } else {
        throw Error(response.json());
      }
    })
    .then(json => console.log(json))
    .catch(json => console.error(json));
}

// eslint-disable-next-line no-unused-vars
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "closeModal":
      // Mirror back the close modal message to the tab that asked for it
      chrome.tabs.sendMessage(sender.tab.id, { action: "closeModal" });
      break;
    case "submit":
      saveImage(request.data, sender.tab.id);
      break;
  }
});
