var Client = require("ibmiotf");
var deviceInfo = require("./demo01_demo03.json");     // デバイス定義

// メッセージ件数カウント用配列
var device = new Array();
for (var i=0 ; i<deviceInfo.length ; i++ ){
    device[deviceInfo[i].deviceId] = 0;
}

// メッセージ受信時刻保存用配列
var recTime = new Array();

var stflag = true;
var startTime = null;

// IOTPに接続
var appClientConfig = {
            "org" : 'm7llwg',
            "id" : 'sub01',
            "auth-key" : 'a-m7llwg-muuqrsoctk',
            "auth-token" : '?drGWsWSWv-ZYOMTqO',
            "type" : "shared" // Enables Shared Subscription Mode
    }
    var appClient = new Client.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on("connect", function () {
	console.log("application connected to IOT Platform");
          appClient.subscribeToDeviceEvents("demo01");
          appClient.subscribeToDeviceEvents("demo02");
          appClient.subscribeToDeviceEvents("demo03");
//          appClient.subscribeToDeviceStatus("demo03");
    });


// IOTPからメッセージを受信(サブスクライブ）
//appClient.on("deviceStatus", function (deviceType, deviceId, payload, topic) {
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
     if(stflag){ 
		startTime = new Date(); 
		stflag = false;
		}
     device[deviceId]++;
     recTime[deviceId] = new Date();

// console.log("Message from " + deviceId + " is arrived. payload is: " + payload);
});

appClient.on("error", function (err) {
     console.log("Error : "+err);
});

// 一定間隔で進捗表示
var loop = setInterval(function(){
     var totalCount = 0;
     var lastTime = startTime;
     console.log("\n");
     for ( var i = 0; i < deviceInfo.length ; i++ ) {
          console.log("[" + deviceInfo[i].deviceId + "] 受信件数：" + device[deviceInfo[i].deviceId] + "件.");
	  totalCount = totalCount + device[deviceInfo[i].deviceId];
	  lastTime = ( lastTime > recTime[deviceInfo[i].deviceId] ) ? lastTime : recTime[deviceInfo[i].deviceId] ;
          }
     var elapsedTime = lastTime - startTime;
     var recRate = totalCount / elapsedTime * 1000;
     var thruput = recRate * 2 / 1024 ; // MB/sec
     console.log("総受信件数：" + totalCount + "[件]. 所用時間：" + elapsedTime.toFixed(2) + "[msec]. 受信レート：" + recRate.toFixed(2) + "[件/秒] スループット：" + thruput.toFixed(2) + "[MB/秒]");
		},5000);



// CTRL+Cで終了時の集計処理
process.on("SIGINT", function(){
     var totalCount = 0;
     var lastTime = startTime;
     console.log("\n");
     for ( var i = 0; i < deviceInfo.length ; i++ ) {
          console.log("[" + deviceInfo[i].deviceId + "] 受信件数：" + device[deviceInfo[i].deviceId] + "件.");
	  totalCount = totalCount + device[deviceInfo[i].deviceId];
	  lastTime = ( lastTime > recTime[deviceInfo[i].deviceId] ) ? lastTime : recTime[deviceInfo[i].deviceId] ;
          }
     var elapsedTime = lastTime - startTime;
     var recRate = totalCount / elapsedTime * 1000;
     var thruput = recRate * 2 / 1024 ; // MB/sec
     console.log("総受信件数：" + totalCount + "[件]. 所用時間：" + elapsedTime.toFixed(2) + "[msec]. 受信レート：" + recRate.toFixed(2) + "[件/秒]. スループット：" + thruput.toFixed(2) + "[MB/秒]");
     process.exit(0);
     });