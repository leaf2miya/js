/*
 Option_page で設定した LocalStorage へ、ContentScriptからアクセスするためのラッパークラス
*/

var LSWrapper ={
  set : function(key, obj){
    console.log(key);
    console.log(obj.char + ":"+ obj.mode);
    localStorage.setItem(key, JSON.stringify(obj));
  },

  get : function(key){
    console.log(JSON.parse(localStorage[key]).check);
    return JSON.parse(localStorage[key]);
  }
};
