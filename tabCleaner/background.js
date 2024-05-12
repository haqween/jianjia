
chrome.runtime.onInstalled.addListener(() => {

});

chrome.windows.getCurrent({ populate: true }, function(window) {
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if (activeInfo.windowId === window.id) {
            let key = "tabs"+activeInfo.tabId
            chrome.storage.sync.set({
                [key]: Date.now()
            })
            chrome.tabs.query({ currentWindow: true }, function(tabs) {
                if (tabs.length > 10) {
                    tabs.sort((a,b) => b.lastAccessed-a.lastAccessed)
                    for (let tab of tabs) {
                        if (tab.id === activeInfo.tabId) { continue; }
                        if (tab.lastAccessed < (Date.now()-(60*60*1000))) {
                            chrome.tabs.remove(tab.id, function() {
                              if (chrome.runtime.lastError) {
                                console.error("Error closing tab from content script.");
                              } else {
                                console.log("Tab closed by content script.");
                              }
                            });
                        } else {
                            console.log('当前窗口的标签页:', tab);
                            console.log('当前窗口的标签页时间:', tab.lastAccessed);
                        }
                    }
                }
            });
        }
    });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toPreTab") {
    toPreTab()
  }
});

function toPreTab() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        if (tabs.length > 1) {
            tabs.sort((a,b) => b.lastAccessed-a.lastAccessed)
            var i = 1;
            while (i<tabs.length-1 && tabs[i].lastAccessed > (tabs[0].lastAccessed-1500)) {
                i++
            }
            chrome.tabs.update(tabs[i].id, {"active":true})
        }
    });
}



