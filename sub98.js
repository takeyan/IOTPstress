var Client = require("ibmiotf");

var org = "bf8dsi";				//IOTP組織ID
var apikey = "a-bf8dsi-klpbvn9ant";     // API Key
var apiauth =  "wZAkUucqxklGaCStuZ";    // 認証トークン
var deviceInfo = require("./dev101_110.json");     // デバイス定義

var stflag = true;
var startTime = new Date();
var size = 2048; // payloadのサイズのデフォルト値（スループット計算用）


// メッセージ件数カウント用配列および受信時刻保存用配列の初期化
var device = new Array();
var recTime = new Array();
for (var i=0 ; i<deviceInfo.length ; i++ ){
    device[deviceInfo[i].deviceId] = 0;
    recTime[deviceInfo[i].deviceId] = new Date();
}

// IOTPに接続
var appClientConfig = {
            "org" : org,
            "id" : 'sub01',
            "auth-key" : apikey,
            "auth-token" : apiauth,
            "type" : "shared" // Enables Shared Subscription Mode
    }
    var appClient = new Client.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on("connect", function () {
	console.log("application connected to IOT Platform");
          appClient.subscribeToDeviceEvents("demo01");
//          appClient.subscribeToDeviceEvents("demo02");
//          appClient.subscribeToDeviceEvents("demo03");
//          appClient.subscribeToDeviceStatus("demo03");
    });


// IOTPからメッセージを受信(サブスクライブ）
//appClient.on("deviceStatus", function (deviceType, deviceId, payload, topic) {
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
     if(stflag){ 
		startTime = new Date(); 
		size = payload.length;
		stflag = false;
		}
     device[deviceId]++;
     recTime[deviceId] = new Date();
});

appClient.on("error", function (err) {
     console.log("Error : "+err);
});

// 一定間隔で進捗表示
var loop = setInterval(function(){statMon(null)},5000);

// CTRL+Cで終了時の集計処理
process.on("SIGINT", function(){statMon("SIGINT")});

     
// 進捗集計用コールバック関数     
var statMon = function(ev){
     var totalCount = 0;
     var lastTime = startTime;
     console.log("\n");
     for ( var i = 0; i < deviceInfo.length ; i++ ) {
          console.log("[" + deviceInfo[i].deviceId + "] 受信件数：" + device[deviceInfo[i].deviceId] + "件.");
	  totalCount = totalCount + device[deviceInfo[i].deviceId];
	  lastTime = ( lastTime >= recTime[deviceInfo[i].deviceId] ) ? lastTime : recTime[deviceInfo[i].deviceId] ;
          }
     var elapsedTime = lastTime - startTime;
     var recRate = (elapsedTime === 0) ? 0 : totalCount / elapsedTime * 1000;
     var thruput = recRate * size / 1024 / 1024 ; // MB/sec
     console.log("開始時刻：" + dateFmt(startTime) + " 最終時刻：" + dateFmt(lastTime) );
     console.log("総受信件数：" + totalCount + "[件]. 経過時間：" + elapsedTime.toFixed(2) + "[msec]. 受信レート：" + recRate.toFixed(2) + "[件/秒] スループット：" + thruput.toFixed(2) + "[MB/秒]");

    if (ev === "SIGINT") {
        process.exit(0);
    }
}


// 日付フォーマット用関数
function dateFmt(dt){
    return dt.toISOString().replace(/T/," ").replace(/Z/,"");
}