const storage = (typeof browser !== 'undefined' ? browser : chrome);

storage.runtime.onInstalled.addListener(function(details) {
  console.log('TAU Moodle Autofiller installed');
});

storage.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'test') {
    storage.tabs.query({active: true, currentWindow: true}, function(tabs) {
      storage.tabs.sendMessage(tabs[0].id, {action: 'test'});
    });
  }
});

storage.contextMenus?.create({
  id: "fillTauForm",
  title: "Fill TAU Form",
  contexts: ["page"],
  documentUrlPatterns: ["*://*.tau.ac.il/*"]
});

storage.contextMenus?.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "fillTauForm") {
    storage.tabs.sendMessage(tab.id, {action: 'fill'});
  }
});