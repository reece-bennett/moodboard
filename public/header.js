const header = document.querySelector("header");

// Show and hide the header after scrolling this many px
const HIDEMARGIN = 100;
const SHOWMARGIN = 50;

let scrollPos = scrollTop = scrollBottom = 0;

function headerHidden() {
  return header.classList.contains("hide");
}

window.addEventListener("scroll", () => {
  if (window.scrollY < scrollPos) {
    scrollTop = window.scrollY;
  } else if (window.scrollY > scrollPos) {
    scrollBottom = window.scrollY;
  }
  
  if (!headerHidden() && window.scrollY - scrollTop > HIDEMARGIN) {
    header.classList.add("hide");
  } else if (headerHidden() && scrollBottom - window.scrollY > SHOWMARGIN) {
    header.classList.remove("hide");
  }
  
  // console.log(`Delta: ${window.scrollY - scrollPos} Pos: ${window.scrollY}, Top: ${scrollTop} Bot: ${scrollBottom}`);
  scrollPos = window.scrollY;
});