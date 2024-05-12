let urlKey = document.getElementById("urlKey");
let tabList = document.getElementById("tabList");
let millisecondsPerDay = 1000 * 60 * 60 * 24;

let openTabs = [];
initOpenTabs();
let historyTabs = [];
initHistoryTabs();
let bookmarks = [];
initBookmarks();

urlKey.focus();

urlKey.addEventListener("input", async (event) => {
  var query = event.target.value.trim()
  let historyItems = await chrome.history.search(
    {
      text: query,
      startTime: new Date().getTime() - millisecondsPerDay,
      maxResults: 10
    }
  );
  historyTabs = createTabForHistoryTabs(historyItems)
  reFreshTabs(query)
});

function reFreshTabs(query) {
    console.log("openTabs", openTabs)
    console.log("historyTabs", historyTabs)
    console.log("bookmarks", bookmarks)
  let tabs = []
  for (let tab of openTabs) {
      addIfNotExist(tab, tabs)
    }
  for (let tab of historyTabs) {
        addIfNotExist(tab, tabs)
      }
  for (let tab of bookmarks) {
      addIfNotExist(tab, tabs)
    }
  while(tabList.firstChild) {
    tabList.removeChild(tabList.firstChild);
  }
  if (query) {
      for (let tab of tabs) {
        if (tab.title.includes(query) || tab.url.includes(query)) {
            addTabOption(tab, query)
        }
      }
  } else {
    for (let tab of tabs) {
        addTabOption(tab, query)
      }
  }
}

function initOpenTabs() {
    chrome.tabs.query({ active:false, currentWindow: true }, function(tabs){
        openTabs = createTabForOpenTabs(tabs)
        openTabs.sort((a,b) => b.lastAccessed-a.lastAccessed)
        reFreshTabs()
      }
    );
}
function initBookmarks() {
    chrome.bookmarks.getTree(function(bookmarkTree) {
      bookmarks = createTabForBookMarks(bookmarkTree[0])
      bookmarks.sort((a,b) => b.lastAccessed-a.lastAccessed)
      reFreshTabs()
    });
}
function initHistoryTabs() {
    chrome.history.search(
      {
        text: '',
        startTime: new Date().getTime() - millisecondsPerDay,
        maxResults: 10
      },
      function(historyItems) {
        historyTabs = createTabForHistoryTabs(historyItems)
        historyTabs.sort((a,b) => b.lastAccessed-a.lastAccessed)
        reFreshTabs()
      }
    );
}
function createTabForBookMarks(bookMarkNode) {
    let bookMarkTabs = []
    if (bookMarkNode.children) {
        for (let item of bookMarkNode.children) {
            bookMarkTabs = bookMarkTabs.concat(createTabForBookMarks(item))
        }
    } else {
        if (bookMarkNode.url) {
            bookMarkTabs.push({
                id: "bm"+bookMarkNode.id,
                title: bookMarkNode.title,
                url: bookMarkNode.url,
                lastAccessed: bookMarkNode.bookMarkNode,
                onClick: () => openNewTab(bookMarkNode.url)
            })
        }
    }
    return bookMarkTabs
}

function createTabForOpenTabs(openTabs) {
    let tabs = [];
    for (let t of openTabs) {
        tabs.push({
            id: "tb"+t.id,
            title: t.title,
            url: t.url,
            lastAccessed: t.lastAccessed,
            favIconUrl: t.favIconUrl,
            onClick: () => chrome.tabs.update(t.id, { active: true })
        })
    }
    return tabs
}

function createTabForHistoryTabs(historyItems) {
    let tabs = [];
    for (let t of historyItems) {
        tabs.push({
            id: "hist"+t.id,
            title: t.title,
            url: t.url,
            lastAccessed: t.lastVisitTime,
            onClick: () => openNewTab(t.url)
        })
    }
    return tabs
}

function addTabOption(tab, query) {
      // 创建新的<li>元素
      var li = document.createElement('li');
      li.id = tab.id
      li.setAttribute('tabindex', '0');

      // 设置新<li>元素的内容
      var tabHtml = ""
      if (tab.favIconUrl) {
        tabHtml += "<img src='" + tab.favIconUrl + "'/>"
      }
      tabHtml = tabHtml + colorText(tab.title, query) + "-" + colorText(tab.url,query)
      li.innerHTML = tabHtml;

       li.addEventListener('click', tab.onClick);
       li.addEventListener('keydown', function(event) {
         if (event.key === 'Enter' || event.keyCode === 13) {
           event.preventDefault(); // 阻止任何其他默认行为
           tab.onClick();
         }
         if (event.key === 'ArrowDown' || event.keyCode === 40) {
            event.preventDefault();
            // 获取当前聚焦的<li>元素
            var focusedItem = document.activeElement;
              var nextItem = focusedItem.nextElementSibling;
              // 如果存在，将焦点移动到下一个<li>元素
              if (nextItem) {
                nextItem.focus();
              }
         }
         if (event.key === 'ArrowUp') {
             event.preventDefault();
             // 获取当前聚焦的<li>元素
             var focusedItem = document.activeElement;
               var nextItem = focusedItem.previousElementSibling;
               // 如果存在，将焦点移动到下一个<li>元素
               if (nextItem) {
                 nextItem.focus();
               }
          }
       });
      // 将新的<li>元素添加到<ul>元素中
      tabList.appendChild(li);
}

function removeTabOpt(tab) {
    var tabOpt = document.getElementById(tab.id);
    document.getElementById('tabList').removeChild(tabOpt);

}
function openNewTab(url) {
    chrome.tabs.create({
     url: url,
     active: true
   }, function(tab) {});
}

function colorText(text, searchString) {
   if (searchString === undefined || searchString === null || searchString.length === 0) {
     return text;
   }
   return text.replaceAll(searchString, '<span style="color: red;">'+searchString+'</span>');
}

function addIfNotExist(tab, toArr) {
    for (let t of toArr) {
        if (t.title === tab.title) {
            return
        }
    }
    toArr.push(tab)

}



