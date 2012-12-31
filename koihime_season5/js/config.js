var characters = {
 "蜀" : ["劉備","関羽","張飛","諸葛亮","趙雲","馬超","黄忠","璃々","厳顔","魏延","鳳統","馬岱"],
 "魏" : ["曹操","夏侯惇","夏侯淵","荀彧","許緒","典韋","郭嘉","程昱","楽進","李典","于禁"],
 "呉" : ["孫策","孫権","孫尚香","黄蓋","周瑜","陸遜","甘寧","呂蒙","周泰"],
 "董" : ["董卓","賈駆","呂布","陳宮","張遼"],
 "他" : ["張角","張宝","張梁","袁紹","文醜","顔良","袁術","張勲","公孫賛","貂蝉"]
};
var mode = ["待機","小城","色塗り"];

window.onload = function(){
  // 描画
  restore_options();
  // イベント登録
  var sb = document.getElementById("save");
  sb.addEventListener("click", save_options, false);
}

// localStorageにオプションを保存
function save_options() {
  var select = document.getElementById("color");

  // オプション保存。JSON形式で保存する
  var dt = {}
  for(var i=0;i < 5;i++){
    var key = "set" + i;
    var ch = document.getElementById("chk_" + key).checked;
    var sc = document.getElementById("csel_" + key).options[document.getElementById("csel_" + key).selectedIndex].value;
    var sm = document.getElementById("msel_" + key).options[document.getElementById("msel_" + key).selectedIndex].value;
    console.log(sc);
    var data = {
      "ch" : ch,
      "sc" : sc,
      "sm" : sm
    };
    dt[key] = data;
  }
  localStorage["option"] = JSON.stringify(dt);

  // 保存メッセージ表示。1000ミリ秒
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 1000);
}

function restore_options() {
  // コンフィグ内容生成
  create_form("set0");
  create_form("set1");
  create_form("set2");
  create_form("set3");
  create_form("set4");
}

function create_form(parent) {
  // 自動化選択チェックボックス
  // 自動モード選択チェックボックス
  var chk = document.createElement("input");
  chk.id = "chk_" + parent;
  chk.type = "checkbox";
  document.getElementById(parent).appendChild(chk);
  
  // キャラ設定フォーム
  var sel = document.createElement("select");
  sel.id = "csel_" + parent;
  for(var i in characters){
    var optg = document.createElement("optgroup");
    optg.label = i;
    sel.appendChild(optg);
    for(var j=0; j<characters[i].length; j++){
      var op = document.createElement("option");
      op.value = characters[i][j];
      var str = document.createTextNode(characters[i][j]);
      op.appendChild(str);
      optg.appendChild(op);
    }
  }
  document.getElementById(parent).appendChild(sel);
  
  // モード選択フォーム
  var sel2 = document.createElement("select");
  sel2.id = "msel_" + parent;
  for(var i=0;i < mode.length; i++){
    var op = document.createElement("option");
    op.value = mode[i];
    var str = document.createTextNode(mode[i]);
    op.appendChild(str);
    sel2.appendChild(op);
  }
  document.getElementById(parent).appendChild(sel2);

  // フォームの初期値設定
  init_form(parent);
}

function init_form(target){
  // targetについてlocalStorageのオプション値の初期化を行う
  if(localStorage["option"] == undefined){
    return;
  }
  var arc = JSON.parse(localStorage["option"]);
  console.log(target);
  console.log(String(arc[target]["ch"]) + ":" + String(arc[target]["sc"]) + ":" + String(arc[target]["sm"]));
  if (!arc) {
    // 取得できないならば何もしない
    return;
  }
  // チェックボックスのセット
  document.getElementById("chk_" + target).checked = arc[target]["ch"];
  // キャラクタのセット
  var cnode = document.evaluate("//*[@id=\"csel_" + target + "\"]",document,null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  cnode.singleNodeValue.options[getCharIndex(arc[target]["sc"])].selected = true;
  // モードのセット
  var mnode = document.evaluate("//*[@id=\"msel_" + target + "\"]",document,null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  mnode.singleNodeValue.options[getModeIndex(arc[target]["sm"])].selected = true;
}

function getCharIndex(str){
  var n = 0;
  for(i in characters){ 
    for(var j=0; j<characters[i].length; j++){ 
       if(characters[i][j] == str){
         return n;
       }
       n += 1;
    }
  }
  // わからなかったらとりあえず0で
  return 0;
}

function getModeIndex(str){
 for(var i=0; i<mode.length; i++){
   if(mode[i] == str){
     return i;
   }
 }
 return 0;
}

