// Retrieve tabs from matching URLs
const tabs = await chrome.tabs.query({
  url: [
    "https://developer.chrome.com/docs/webstore/*",
    "https://developer.chrome.com/docs/extensions/*",
  ],
});

// Sort tabs array alphabetically by tab name
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

// Get template to use for each tab
const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  // Clone template and populate with tab title and pathname
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split("-")[0].trim();
  const pathname = new URL(tab.url).pathname.slice("/docs".length);

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;

  // When user clicks tab list item, focus on that tab and window
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  // Add new element to elements Set
  elements.add(element);
}

// Add tabs to list
document.querySelector("ul").append(...elements);

// Button groups all tabs and moves them into current window
const button = document.querySelector("button");
button.addEventListener("click", async () => {
  const tabIds = tabs.map(({ id }) => id);
  const group = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(group, { title: "DOCS" });
});