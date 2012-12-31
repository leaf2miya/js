/*
  ContentScriptからLocalStorageへアクセスするためのイベントリスナー
  LocalStorageへのアクセス実態はLSWrapperが担う
*/

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "getData"){
    sendResponse({local : LSWrapper.get(request.key)});
  }else if(request.method == "setData"){
    LSWrapper.set("cache", request.data)
    sendResponse({});
  }else{
    sendResponse({});
  }
});
