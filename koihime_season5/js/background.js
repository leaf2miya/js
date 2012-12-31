/*
  ContentScript����LocalStorage�փA�N�Z�X���邽�߂̃C�x���g���X�i�[
  LocalStorage�ւ̃A�N�Z�X���Ԃ�LSWrapper���S��
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
