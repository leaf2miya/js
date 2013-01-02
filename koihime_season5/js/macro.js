var homename = ""; //ホーム拠点名
var char_status = ["待機", "進軍中", "回復", "帰還中", "奥義中"]; //キャラの状態。待機状態以外は動かせない
var my_org = "呉"; //自身の所属国

$(document).ready(function(){
  // localStorageからデータ取得
  // コールバックにメイン処理を登録
  chrome.extension.sendMessage({method: "getData", key: "option" }, function(response) {
    console.log(String(response.local["set0"]["ch"]) + ":" + String(response.local["set0"]["sc"]) + ":" + String(response.local["set0"]["sm"]));
    console.log(String(response.local["set1"]["ch"]) + ":" + String(response.local["set1"]["sc"]) + ":" + String(response.local["set1"]["sm"]));
    console.log(String(response.local["set2"]["ch"]) + ":" + String(response.local["set2"]["sc"]) + ":" + String(response.local["set2"]["sm"]));
    console.log(String(response.local["set3"]["ch"]) + ":" + String(response.local["set3"]["sc"]) + ":" + String(response.local["set3"]["sm"]));
    console.log(String(response.local["set4"]["ch"]) + ":" + String(response.local["set4"]["sc"]) + ":" + String(response.local["set4"]["sm"]));
    main(response.local);
  });
});

// メイン処理
// @param data Hash: localStorageから取得したHash
function main(data){
  // urlによる処理分け
  var url = $.url(location.href);
  console.log(url.attr("path"));
  switch(url.attr("path")){
    case '/mura/view':
      // 拠点ホーム
      // キャッシュをクリアしておく
      chrome.extension.sendMessage({method: "setData", data: {} }, function(response) {});

      // 現ホームの拠点名を取得
      console.log($("p#name>span>marquee").text());
      if($("p#name>span>marquee").text().match("拠点名：([^\\s]+)")){
        console.log(RegExp.$1);
        this.homename = RegExp.$1;
      }
      // 操作キャラを決定する
      for(i in data){
        console.log(String(data[i]["ch"]) + ":" + String(data[i]["sm"]));
        if(!data[i]["ch"] || String(data[i]["sm"]) == "待機"){
          continue;
        }
        console.log("Select Char:" + String(data[i]["sc"]) + ":" + String(data[i]["sm"]));
        // 状態を確認する
        var char_ele = $("div#busho-list>div.clearfix>p.character[title*=\"" + data[i]["sc"] + "\"]");
        if(char_ele.size() == 0){ continue; } // 見つからなかったら次のキャラ
        console.log(char_ele.attr("title"));
        var cstatus = "";
        if(char_ele.next().find($("div>p:last-child")).text() == ""){
          // 体力低下時
          cstatus = char_ele.next().find($("div>font>p")).text()
        }else{
          // 標準時
          cstatus = char_ele.next().find($("div>p:last-child")).text();
        }
        //var cstatus = char_ele.next().find($("div>p:last-child")).text();
        console.log(cstatus);
        if(cstatus != "待機" && cstatus != "危険"){
          // 待機以外だったら次のキャラ
          continue; 
        }
        var cposition = char_ele.next().find($("div>p:first-child>a")).text();
        var mid = $.url(char_ele.next().find($("div>p:first-child>a")).attr("href")).param("mid")
        // 現在位置確認
        if(cposition.match("(-*\\d+｜-*\\d+)")){
          // 座標の場合
          // 座標を記憶しつつ、リンク移動
          if(cstatus == "待機"){
            console.log(char_ele.next().find($("div>p:first-child>a")).attr("href"))
            chrome.extension.sendMessage({method: "setData", data: {"char":data[i]["sc"], "mode":data[i]["sm"], "mid": mid} }, function(response) {
              console.log("cache save!");
              console.log(char_ele.next().find($("div>p:first-child>a")).size());
              a_click(char_ele.next().find($("div>p:first-child>a")).attr("href"));
            });
            return;
          }else if(cstatus == "危険"){
            // 指揮舎へ
            chrome.extension.sendMessage({method: "setData", data: {"char":data[i]["sc"], "mode":data[i]["sm"], "mid": mid} }, function(response) {
              console.log("cache save!");
              console.log(char_ele.next().find($("div>p:first-child>a")).size());
              $("area[title*=\"指揮舎\"]").click()
            });
            return;
          }
        }else{
          // 拠点名の場合
          // 現拠点と所属拠点が異なる場合はなにもしない
          if(cposition == homename){
            // 現拠点と所属拠点が一致、かつ小城攻撃モード、かつ進軍中の味方がいない場合
            if(data[i]["sm"] == "小城"){
              // キャッシュした上で地図画面へ
              chrome.extension.sendMessage({method: "setData", data: {"char":data[i]["sc"], "mode":data[i]["sm"], "mid": mid} }, function(response) {
                console.log("cache save!");
                a_click($("li#tizu>a").attr("href"));
              });
            }
          }
        }
      }
      break;
    case '/chizu/detail':
      // 詳細地図画面
      chrome.extension.sendMessage({method: "getData", key: "cache" }, function(response) {
        console.log(response.local["char"] + ":" + response.local["mode"] + ":" + String(response.local["mid"]) + ":" + String(response.local["flag"]))
        //$("a[href*=\"/chizu/view/?id=\"]").trigger("click");
        // javascriptベタでクリックイベントを叩く
        if(response.local["flag"]){
          // 派兵するパターン
          console.log("派兵");
          a_click($("a[href*=\"/dispatch/select?mid=" + response.local["target"] + "\"]").attr("href"));
        }else{
          // 中心に選択するパターン
          a_click($("a[href*=\"/chizu/view?id=\"]").attr("href"));
        }
      });
      break;
    case '/chizu/view':
      // 地図
      // +-1 で左右、+-401 で上下一マスの移動になる
      chrome.extension.sendMessage({method: "getData", key: "cache" }, function(response) {
        console.log(response.local["char"] + ":" + response.local["mode"] + ":" + response.local["mid"]);
        // 領土開拓の場合(無差別攻撃)
        if(response.local["mode"] == "色塗り"){
          // 敵地選択機構
          // <map name="cm"><area>タグのmouseevent系から引っこ抜く
          base_pos = parseInt(response.local["mid"]);
          attack_element = null; // 攻撃目標
          pos_distance = 999999; // 所在地から敵地までの距離
          target_mid = 999999;
          $("a[href*=\"../chizu/detail?mid=\"]").each(function(){
            $(this).mouseover();
            // #m_cname は国の名前が入る
            // #m_pname は土地の名前が入る(ex. 小城)
            if($("#m_cname").text() != my_org){
              if($("#m_pname").text() == "資源地" || $("#m_pname").text() == "空白地"){
                var tmp_pos = $(this).attr("onmouseover").match(/showCityInfo\((\d+)\);/);
                find_pos = parseInt(RegExp.$1);
                console.log($("#m_cname").text());
                console.log(find_pos);

                var pos_diff = Math.abs(base_pos - find_pos);
                var diff_sho = Math.round(pos_diff / 401)
                var diff_amari = Math.abs(pos_diff - diff_sho * 401);
                console.log(diff_sho + diff_amari);

                if((diff_sho + diff_amari) < pos_distance){
                  attack_element = $(this);
                  pos_distance = (diff_sho + diff_amari);
                  target_mid = find_pos;
                }
              }
            }
          });
          if(pos_distance != 999999){
            chrome.extension.sendMessage({method: "setData", data: {"char":response.local["char"], "mode":response.local["mode"], "mid":response.local["mid"], target:target_mid, "flag":true } }, function(response) {
              console.log(attack_element.attr("href"))
              a_click(attack_element.attr("href"));
            });
          }else{
            console.log("攻撃目標見つかりませーん");
            return 0;
          }
        }else if(response.local["mode"] == "小城"){
          base_pos = parseInt(response.local["mid"]);
          attack_element = null; // 攻撃目標
          pos_distance = 999999; // 所在地から敵地までの距離
          target_mid = 999999;
          $("a[href*=\"../chizu/detail?mid=\"]").each(function(){
            $(this).mouseover();
            // #m_cname は国の名前が入る
            // #m_pname は土地の名前が入る(ex. 小城)
            if($("#m_cname").text() != my_org){
              if($("#m_pname").text() == "小城"){
                console.log($.url($(this).find("img").attr("src")).attr("file"))
                if($.url($(this).find("img").attr("src")).attr("file") == "3_1.gif"){

                  var tmp_pos = $(this).attr("onmouseover").match(/showCityInfo\((\d+)\);/);
                  find_pos = parseInt(RegExp.$1);
                  console.log($("#m_cname").text());
                  console.log(find_pos);

                  var pos_diff = Math.abs(base_pos - find_pos);
                  var diff_sho = Math.round(pos_diff / 401)
                  var diff_amari = Math.abs(pos_diff - diff_sho * 401);
                  console.log(diff_sho + diff_amari);

                  if((diff_sho + diff_amari) < pos_distance){
                    attack_element = $(this);
                    pos_distance = (diff_sho + diff_amari);
                    target_mid = find_pos;
                  }
                }
              }
            }
          });
          if(pos_distance != 999999){
            chrome.extension.sendMessage({method: "setData", data: {"char":response.local["char"], "mode":response.local["mode"], "mid":response.local["mid"], target:target_mid, "flag":true } }, function(response) {
              console.log(attack_element.attr("href"))
              a_click(attack_element.attr("href"));
            });
          }else{
            console.log("攻撃目標見つかりませーん");
            return 0;
          }
        }
      });
      break;
    case '/dispatch/select':
      // 派兵画面
      chrome.extension.sendMessage({method: "getData", key: "cache" }, function(response) {
        console.log(response.local["char"] + ":" + response.local["mode"] + ":" + response.local["mid"]);
        var home_soldiers = {}
        $("ul#hei > li[style!=\"display:none;\"]").each(function(){
          home_soldiers[$.url($(this).find("img").attr("src")).attr("file")] = parseInt($(this).find("span").text())
        });
        console.log(home_soldiers)
        // 武将選択
        $("table#hahei-table").find($("th.name")).each(function(){
          if($(this).text().match(response.local["char"])){
            // チェックボックスの有無で処理が別れる
            if($(this).parent().children("th.check").find($("input:checkbox")).size() == 1){
              // チェックボックス有り
              console.log("found checkbox");
              // チェックボックスの既存イベントを呼び、予めボタンを表示させる必要がある
              $(this).parent().children("th.check").find($("input:checkbox")).trigger("click");
              $(this).parent().children("th.check").find($("input:checkbox")).attr("checked",true);
              var hei_max = parseInt($(this).parent().next().find("span[id*=\"sub_soldier\"]").text().split("/")[1])
              console.log(hei_max)
              $("tr.on").each(function(){
                // 色塗り部隊は兵力補充できないので除外
                if($(this).find("td > input[type=\"text\"]").attr("onfocus") == undefined){
                  var hei_type = $.url($(this).find("td > img").attr("src")).attr("file")
                  var hei_cnt =  parseInt($(this).find("td > input[type=\"text\"]").attr("value"))
                  console.log(hei_type)
                  console.log(hei_cnt)
                  console.log(hei_max)
                  if(home_soldiers[hei_type] == undefined || home_soldiers[hei_type] == 0 || hei_cnt == hei_max || hei_max == 0){
                  // no action
                  }else if(home_soldiers[hei_type] + hei_cnt <= hei_max){
                    $(this).find("td > input[type=\"text\"]").attr("value", String(home_soldiers[hei_type] + hei_cnt))
                    hei_max -= (home_soldiers[hei_type] + hei_cnt)
                  }else if(home_soldiers[hei_type] + hei_cnt >= hei_max){
                    $(this).find("td > input[type=\"text\"]").attr("value", String(hei_max))
                    hei_max = 0
                  }
                }
              });

              $("input#type_9").attr("checked",true);
              $("input:image[title=\"確認\"]").trigger("click");
            }else{
              // チェックボックスなし
              console.log("not found checkbox");
              a_click($("a[href*=\"/dispatch/select?mid=" + response.local["target"] + "&from=" + response.local["mid"] + "\"]").attr("href"));
            }
          }
        });
      });
      break;
    case '/dispatch/confirm':
      console.log("進軍");
      $("input:image[title=\"進軍\"]").trigger("click");
      break;
    case '/building/view':
      // 各種建築物の画面
      if($("p#name").text().match(/指揮舎/)){
        //指揮舎
        console.log("指揮舎");
        chrome.extension.sendMessage({method: "getData", key: "cache" }, function(response) {
          console.log(response.local["char"] + ":" + response.local["mode"] + ":" + String(response.local["mid"]) + ":" + String(response.local["flag"]))
          $("table.sj-table").each(function(){
            if($(this).find($("th.cha[title=\""+ response.local["char"] +"\"]")).size() == 1){
              $(this).find($("button")).click()
              return;
            }
          });
        });
        // アクションがない場合はホームに戻る
        a_click($("li#mura>a").attr("href"));
      }
      break;
    case '/error/timeout.html':
      // タイムアウト画面
      // ブラウザバックする
      // 無限ループする危険性あるんだよなぁ
      history.back();
      break;
    default:
      // 不明
      // アクション無し
      break;
  }
}

// aタグのクリックイベント
// jqueryのイベントでは処理できないところがあるので、jsのイベントを発生させる方法を取る
// @param href_text String: クリックするaタグのhref属性値
function a_click(href_text){
  var nodes = document.getElementsByTagName("a");
  for (var j=0; j<nodes.length; j++) {
    var el = nodes.item(j);
    if (el.getAttribute("href") == href_text) {
      el.click();
    }
  }
}

function Mura(){};
Mura.prototype = {
  init : function(){
    // キャッシュをクリアしておく
    chrome.extension.sendMessage({method: "setData", data: {} }, function(response) {});

  }
}

