var express = require('express');
var cors = require('cors')
var app = express();
var path = require('path');
var fs = require('fs');
var net = require('net');
var uniqid = require('uniqid');

const dgram = require('dgram');


var Auth = require('./middleware/AuthMiddleWare.js');

var options = {
  key: fs.readFileSync('../../ssl/keys/bb3f7_5dfb5_011533fdad4444a7fb6dd37b6c820326.key','utf8'),
  cert: fs.readFileSync('../../ssl/certs/iotbridge_owattspay_net_bb3f7_5dfb5_1680606528_f3570f9ad75c88a0e8e34da6554ac739.crt','utf8')
};



var http = require('http').Server(app);
var io2 = require('socket.io')(http,{
    cors:{
        origin: '*',
    }
});

var https = require('https').Server(options,app);
var io = require('socket.io')(https,{
    cors:{
        origin: '*',
    }
});



var client = new net.Socket();



var omejeBuffer = require('./my_plugin/OmejeBuffer');
var DeviceController = require('./controllers/DeviceController');
var BlockController = require('./controllers/BlockController');






/*Meter data*/
   var ServerHead = [0x40,0x40];
   var MeterHead = [0x24,0x24];
   var endData = [0x0d, 0x0a];
/*End meter data*/



/*Meter commands*/
  var LoginDevice = [0x70,0x90];
  var MeterHeartBeat = [0x70,0x91];
  var MeterData = [0x70,0x92];
  var ControlMeter = [0x70,0x94];
  var SetMeterTime = [0x70,0x95];
  var SetMeterData = [0x70,0x96];
  
  var frontEndMeterEnable = 0x82;
  var frontEndMeterDisable = 0x83;
  
  var frontEndOffMeter = 0x84;
  var frontEndOnnMeter = 0x85;
/*End Meter commands*/


/* smart home commands*/
  var smartHomeHead = [0x2a];
  var smartHomeFrontEndHead = [0x6a];
  var eod = [0x0d,0x0a];

  var RIMEI = [0x01];
  var RHEART_BIT = [0x02];
  var SHEART_BIT = [0x03];
  var RSSID = [0x04];
  var SSSID = [0x05];
  var RPASSWORD = [0x06];
  var SPASSWORD = [0x07];
  var RIPADDRESS = [0x08];
  var SIPADDRESS = [0x09];
  var RPORT = [0x11];
  var SPORT = [0x12];
  var RTIME = [0x13];
  var STIME = [0x14];
  var CRELAY = [0x15];
  var ERROR = [0x16];
  var LOGIN = [0x17];
  var RESET_CONNECT = [0x19];
/*end smart home commands*/




function sendToPrepaidMeterTcp(mydata){
   return new Promise((resolve,reject)=>{
       try{
          client.connect(process.env.PREPAID_METER_PORT,process.env.SERVER_IP, ()=>{
                console.log('user send data');
                
                client.on('connect',()=>{
                    client.write(Buffer.from(mydata));
                
                    /*Handles reply coming from the device when a track on demand was made */
                    client.on('data',function(data){
                          resolve(data);
                          
                    });
                })
    
                
            });
            
            
            client.on('error',(err)=>{
                console.log(err);
            })
            
       }
       catch(err){
           console.log(err);
       }
   })
}



function sendToSmartHomeTcp(mydata){
   return new Promise((resolve,reject)=>{
       try{
          client.connect(process.env.SMARTHOME_PORT,process.env.SERVER_IP, ()=>{
                console.log('user send data');
                
                client.on('connect',()=>{
                    client.write(mydata);
                
                    /*Handles reply coming from the device when a track on demand was made */
                    client.on('data',function(data){
                          resolve(data);
                          
                    });
                })
    
                
            });
            
            
            client.on('error',(err)=>{
                console.log(err);
            })
            
       }
       catch(err){
           console.log(err);
       }
   })
}



function sendToInverterTcp(mydata){
   return new Promise((resolve,reject)=>{
       try{
          client.connect(process.env.INVERTER_PORT,process.env.SERVER_IP, ()=>{
                console.log('user send data');
                
                client.on('connect',()=>{
                    client.write(mydata);
                
                    /*Handles reply coming from the device when a track on demand was made */
                    client.on('data',function(data){
                          resolve(data);
                          
                    });
                })
    
                
            });
            
            
            client.on('error',(err)=>{
                console.log(err);
            })
            
       }
       catch(err){
           console.log(err);
       }
   })
}



function sendToKikeTcp(mydata,imei,socket){
    
    if(io.sockets.adapter.rooms.get(imei)){
       console.log(`sending to room ${imei}`);
       io.sockets.in(mydata.imei).emit('data', mydata);
    }
    else{
       console.log(`creating sending to room ${imei}`);
       socket.join(imei);
       io.sockets.in(imei).emit('data', mydata);  
    }
    
}


var clients = [];

io.on('connection',(socket)=>{

      console.log('new connection');

      socket.on('disconnect',()=>{
          console.log('disconnecting socket');
          var disconnectingClient = clients.find(x=>x.socket == socket); //remove client from list

          if(disconnectingClient){
              console.log('seen disconnecting client 000000000000000000000000000000000000000000000000000');
              clients.splice(clients.indexOf(disconnectingClient),1);
          }

      })
      
      
      socket.on('connect_error',(err)=>{
          console.log(err,' 3333333333333333333333333333333333333333333');
      })

      //socket.emit('welcome','Welcome');

      socket.on('data',(mydata)=>{
          //console.log(mydata);
          if(mydata.event == "create_room"){
              socket.join(mydata.imei);
              
          }
          else if(mydata.event == "disable_device"){
                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.disableDevice({
                       imei: mydata.imei
                     }).then(myDevice=>{
                         socket.emit('data',{
                           event:'disable_device',
                           message:"successfully disabled",
                           device:myDevice
                         });

                         if(myDevice.device_type == 1){

                             console.log(mydata);
                             var msoi = [0x6a];
                             var mcommand = [frontEndMeterDisable];
                             var infoLength = [mydata.imei.length];
                             var imeiA = omejeBuffer.stringToArray(mydata.imei);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(imeiA);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' disable device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })


                         }
                         else if(myDevice.device_type == 2){
                             
                              console.log(mydata);
                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x99]);
                              outdata = outdata.concat([0x3F]);
                              sendToKikeTcp(Buffer(outdata),mydata.imei,socket).then(()=>{
                                 console.log('send data');
                              })
                             
                         }
                         else if(mydata.device_type == 3){

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This device is invalid",
                           device:{}
                        });
                     });
                     
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 })

                 
          }
          else if(mydata.event == "enable_device"){

                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.enableDevice({
                        imei: mydata.imei
                     }).then(mymeter=>{
                         socket.emit('data',{
                           event:'enable_device',
                           message:"successfully enabled",
                           device:mymeter
                         });

                         if(mymeter.device_type == 1){

                             console.log(mydata);
                             var msoi = [0x6a];
                             var mcommand = [frontEndMeterEnable];
                             var infoLength = [mydata.meterno.length];
                             var meteruid = omejeBuffer.stringToArray(mydata.meterno);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(meteruid);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' disable device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })
                         
                         }
                         else if(mymeter.device_type == 2){

                         }
                         else if(mydata.device_type == 3){

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalidmeter',
                           message:"This meter is invalid",
                           device:{}
                        });
                     });
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 }) 

          }
          else if(mydata.event == "off_device"){


                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.offDevice({
                        imei: mydata.imei,
                        control: 1
                     }).then(mymeter=>{
                         socket.emit('data',{
                           event:'off_device',
                           message:"successfilly turned off",
                           device:mymeter
                         });
                          
                          console.log(mymeter);

                         if(mymeter.device_type == 1){

                             console.log(mydata);
                             var msoi = [0x6a];
                             var mcommand = [frontEndMeterEnable];
                             var infoLength = [mydata.imei.length];
                             var imeiA = omejeBuffer.stringToArray(mydata.imei);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(imeiA);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' disable device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })
                         
                         }
                         else if(mymeter.device_type == 2){
                              console.log(" sending to kike");
                              console.log(mydata);
                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x99]);
                              outdata = outdata.concat([0x3F]);
                              sendToKikeTcp(Buffer(outdata),mydata.imei,socket);
                              
                              
                         }
                         else if(mymeter.device_type == 3){

                             var deviceData = JSON.parse(myDevice.data);
                             
                             var dataLength = 13 + 2;
                             var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                             var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                             var devStatus = (deviceData.output/1) & (~(1 << ((deviceData.point_no/1)-1 )));
                             var devStatusA = [((devStatus >> 8) & 0xff),(devStatus & 0xff)];
                             
                             DeviceController.onnDevice({
                                 imei: mydata.imei,
                                 control: devStatus
                             }).then((myCurrentSmartHome)=>{
                                 var myOutData = smartHomeFrontEndHead;
                                 myOutData = myOutData.concat([dataLength]);
                                 myOutData = myOutData.concat(CRELAY);
                                 myOutData = myOutData.concat(imeiA);
                                 myOutData = myOutData.concat(devStatusA);
                                 var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                 myOutData = myOutData.concat([outLrc8]);
                                 myOutData = myOutData.concat(eod);
                                 console.log("command to tcp server ",Buffer.from(myOutData));
                                 sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});
                                 
                             });

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This meter is invalid",
                           device:{}
                        });
                     });
                     
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 });

          }
          else if(mydata.event == "onn_device"){

                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.onnDevice({
                        imei: mydata.imei,
                        control: 0
                     }).then(mymeter=>{
                         socket.emit('data',{
                           event:'onn_device',
                           message:"successfilly turmed onn",
                           device:mymeter
                         });


                         if(mymeter.device_type == 1){

                             console.log(mydata);
                             console.log('turnning onn');
                             var msoi = [0x6a];
                             var mcommand = [frontEndOffMeter];
                             var infoLength = [mydata.meterno.length];
                             var imeiA = omejeBuffer.stringToArray(mydata.imei);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(imeiA);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' onn device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })
                         
                         }
                         else if(mymeter.device_type == 2){
                             console.log(mydata);
                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x55]);
                              outdata = outdata.concat([0x3F]);
                              sendToKikeTcp(Buffer(outdata),mydata.imei).then(()=>{
                                 console.log('send data');
                              })
                         }
                         else if(mymeter.device_type == 3){

                             var deviceData = JSON.parse(myDevice.data);

                             var dataLength = 13 + 2;
                             var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                             var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                             var devStatus = (deviceData.output/1) | (1 << ((deviceData.point_no/1)-1 ));
                             var devStatusA = [((devStatus >> 8) & 0xff),(devStatus & 0xff)];
                             
                             DeviceController.onnDevice({
                                 imei: mydata.imei,
                                 control: devStatus
                             }).then((myCurrentDevice)=>{
                                 var myOutData = smartHomeFrontEndHead;
                                 myOutData = myOutData.concat([dataLength]);
                                 myOutData = myOutData.concat(CRELAY);
                                 myOutData = myOutData.concat(imeiA);
                                 myOutData = myOutData.concat(devStatusA);
                                 var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                 myOutData = myOutData.concat([outLrc8]);
                                 myOutData = myOutData.concat(eod);
                                 console.log("command to tcp server ",Buffer.from(myOutData));
                                 sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});
                                 
                             })

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        console.log(err);
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This meter is invalid",
                           device:{}
                        });
                     });
                     
                     
                 }).catch(err=>{
                     console.log(err);
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 });

          }
          else if(mydata.event == "socket_login"){

               //save socket users
               
               console.log('login in user');
               
               Auth.verifyToken(mydata).then(myuser=>{
                   var myclient = clients.find(x=>x.key == mydata.key);
                   if(myclient){
                       console.log("client seen 5555555555555555555555555555555");
                       clients.splice(clients.indexOf(myclient),1);
                   }

                   var key = uniqid();
                   clients.push({key: key, socket:socket});
                   socket.emit('socket_login',{status:process.env.SUCCESS,key:key,message:'successfull'});
               }).catch(err=>{
                   console.log(err);
                   socket.emit('socketloginstatus',{status:process.env.SUCCESS,message:'invalid token'});
               })

          }
          else if(mydata.event == "device_detail"){
              Auth.verifyMerchantDevice(mydata).then(myuser=>{
                     DeviceController.deviceDetail({
                        imei:mydata.imei
                     }).then(myDevice=>{
                        socket.emit('data',{
                           event:'device_detail',
                           device:myDevice,
                           message:"detail",
                        });
                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This meter is invalid",
                        });
                     });
              }).catch(err=>{
                  console.log(err);
              });
          }
          else if(mydata.event == "block_detail"){
              Auth.verifyToken(mydata).then(myuser=>{
                     BlockController.blockDetail({
                        reference:mydata.reference
                     }).then(myblock=>{
                        socket.emit('data',{
                           event:'block_detail',
                           block:myblock,
                           message:"detail",
                        });
                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalidblock',
                           message:"This block is invalid",
                        });
                     });
              }).catch(err=>{
                  console.log(err);
              });
          }
          else if(mydata.event == "set_ip_address"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setIpAddress({
                    imei: mydata.imei,
                    ip_address: data.ip_address
                 }).then(mymeter=>{
                     socket.emit('data',{
                       event:'set_ip_address',
                       message:"Ip address successfully set",
                       device:mymeter
                     });


                     if(mydata.device_type == 1){
                     
                     }
                     else if(mydata.device_type == 2){

                     }
                     else if(mymeter.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                        var myOutData = smartHomeFrontEndHead;
                        var myDataLength = 13 + mydata.ipaddress.length;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SPORT);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.ip_address));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{
                        });

                     }
                     else if(mydata.device_type == 4){

                     }
                     else if(mydata.device_type == 5){

                     }
                     else if(mydata.device_type == 6){

                     }
                     else if(mydata.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });
          }

          else if(mydata.event == "set_remote_port"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setRemotePort({
                    imei: mydata.imei,
                    port: data.port
                 }).then(mymeter=>{
                     socket.emit('data',{
                       event:'set_remote_port',
                       message:"Remote port successfully set",
                       device:mymeter
                     });


                     if(mydata.device_type == 1){
                     
                     }
                     else if(mydata.device_type == 2){

                     }
                     else if(mymeter.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                        var myOutData = smartHomeFrontEndHead;
                        var myDataLength = 13 + mydata.port.length;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SPORT);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.port));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(mydata.device_type == 4){

                     }
                     else if(mydata.device_type == 5){

                     }
                     else if(mydata.device_type == 6){

                     }
                     else if(mydata.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_heart_beat"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setHeartBeat({
                    imei: mydata.imei,
                    heartbeat: data.heartbeat
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_heart_beat',
                       message:"heartbeat successfully set",
                       device:myDevice
                     });


                     if(mydata.device_type == 1){
                     
                     }
                     else if(mydata.device_type == 2){

                     }
                     else if(mymeter.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var heartBeatA =  [(((mydata.heartbeat/1) >> 8) & 0xff),((mydata.heartbeat/1) & 0xff)];
                        var myOutData = smartHomeFrontEndHead;
                        var myDataLength = 13 + 2;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SHEART_BIT);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(heartBeatA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(mydata.device_type == 4){

                     }
                     else if(mydata.device_type == 5){

                     }
                     else if(mydata.device_type == 6){

                     }
                     else if(mydata.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_ssid"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setSsid({
                    imei: mydata.imei,
                    ssid: data.ssid
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_ssid',
                       message:"SSid successfully set",
                       device:myDevice
                     });


                     if(mydata.device_type == 1){
                     
                     }
                     else if(mydata.device_type == 2){

                     }
                     else if(mymeter.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var myDataLength = 13 + mydata.ssid.length;
                        var myOutData = smartHomeFrontEndHead;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SSSID);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.ssid));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(mydata.device_type == 4){

                     }
                     else if(mydata.device_type == 5){

                     }
                     else if(mydata.device_type == 6){

                     }
                     else if(mydata.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_password"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setPassword({
                    imei: mydata.imei,
                    password: data.password
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_password',
                       message:"Password successfully set",
                       device:myDevice
                     });


                     if(mydata.device_type == 1){
                     
                     }
                     else if(mydata.device_type == 2){

                     }
                     else if(myDevice.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var myDataLength = 13 + mydata.password.length;
                        var myOutData = smartHomeFrontEndHead;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SPASSWORD);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.password));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(mydata.device_type == 4){

                     }
                     else if(mydata.device_type == 5){

                     }
                     else if(mydata.device_type == 6){

                     }
                     else if(mydata.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_time"){

             Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setTime({
                    imei: mydata.imei,
                    password: data.password
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_time',
                       message:"time successfully set",
                       device:myDevice
                     });


                     if(mydata.device_type == 1){
                     
                     }
                     else if(mydata.device_type == 2){

                     }
                     else if(myDevice.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var myDataLength = 13 + mydata.time.length;
                        var myOutData = smartHomeFrontEndHead;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(STIME);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.time));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(mydata.device_type == 4){

                     }
                     else if(mydata.device_type == 5){

                     }
                     else if(mydata.device_type == 6){

                     }
                     else if(mydata.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This device is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

         console.log('new connection');

          
      });

      console.log('new connection');

          

});











io2.on('connection',(socket)=>{

      console.log('new connection');

      socket.on('disconnect',()=>{
          console.log('disconnecting socket');
          var disconnectingClient = clients.find(x=>x.socket == socket); //remove client from list

          if(disconnectingClient){
              console.log('seen disconnecting client 000000000000000000000000000000000000000000000000000');
              clients.splice(clients.indexOf(disconnectingClient),1);
          }

      })
      
      
      socket.on('connect_error',(err)=>{
          console.log(err,' 3333333333333333333333333333333333333333333');
      })

      //socket.emit('welcome','Welcome');

      socket.on('data',(mydata)=>{
          //console.log(mydata);
          if(mydata.event == "disable_device"){
                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.disableDevice({
                       imei: mydata.imei
                     }).then(myDevice=>{
                         socket.emit('data',{
                           event:'disable_device',
                           message:"successfully disabled",
                           device:myDevice
                         });

                         if(myDevice.device_type == 1){

                             console.log(mydata);
                             var msoi = [0x6a];
                             var mcommand = [frontEndMeterDisable];
                             var infoLength = [mydata.imei.length];
                             var imeiA = omejeBuffer.stringToArray(mydata.imei);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(imeiA);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' disable device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })


                         }
                         else if(myDevice.device_type == 2){
                             
                             console.log(mydata);
                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x99]);
                              outdata = outdata.concat([0x3F]);
                              sendToKikeTcp(Buffer.from(outdata),mydata.imei,socket);

                         }
                         else if(mydata.device_type == 3){

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This device is invalid",
                           device:{}
                        });
                     });
                     
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 })

                 
          }
          else if(mydata.event == "enable_device"){

                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.enableDevice({
                        imei: mydata.imei
                     }).then(mymeter=>{
                         socket.emit('data',{
                           event:'enable_device',
                           message:"successfully enabled",
                           device:mymeter
                         });

                         if(mymeter.device_type == 1){

                             console.log(mydata);
                             var msoi = [0x6a];
                             var mcommand = [frontEndMeterEnable];
                             var infoLength = [mydata.meterno.length];
                             var meteruid = omejeBuffer.stringToArray(mydata.meterno);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(meteruid);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' disable device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })
                         
                         }
                         else if(mymeter.device_type == 2){

                         }
                         else if(mymeter.device_type == 3){

                         }
                         else if(mymeter.device_type == 4){

                         }
                         else if(mymeter.device_type == 5){

                         }
                         else if(mymeter.device_type == 6){

                         }
                         else if(mymeter.device_type == 7){

                         }
                         else if(mymeter.device_type == 8){

                         }
                         else if(mymeter.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalidmeter',
                           message:"This meter is invalid",
                           device:{}
                        });
                     });
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 }) 

          }
          else if(mydata.event == "off_device"){


                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.offDevice({
                        imei: mydata.imei,
                        control: 1
                     }).then(mymeter=>{
                         socket.emit('data',{
                           event:'off_device',
                           message:"successfilly turned off",
                           device:mymeter
                         });
                         

                         if(mymeter.device_type == 1){

                             console.log(mydata);
                             var msoi = [0x6a];
                             var mcommand = [frontEndMeterEnable];
                             var infoLength = [mydata.imei.length];
                             var imeiA = omejeBuffer.stringToArray(mydata.imei);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(imeiA);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' disable device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })
                         
                         }
                         else if(mymeter.device_type == 2){
                             console.log(" sending to kike2");
                             console.log(mydata);
                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x99]);
                              outdata = outdata.concat([0x3F]);
                              sendToKikeTcp(Buffer.from(outdata),mydata.imei,socket);

                         }
                         else if(mymeter.device_type == 3){

                             var deviceData = JSON.parse(myDevice.data);
                             
                             var dataLength = 13 + 2;
                             var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                             var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                             var devStatus = (deviceData.output/1) & (~(1 << ((deviceData.point_no/1)-1 )));
                             var devStatusA = [((devStatus >> 8) & 0xff),(devStatus & 0xff)];
                             
                             DeviceController.onnDevice({
                                 imei: mydata.imei,
                                 control: devStatus
                             }).then((myCurrentSmartHome)=>{
                                 var myOutData = smartHomeFrontEndHead;
                                 myOutData = myOutData.concat([dataLength]);
                                 myOutData = myOutData.concat(CRELAY);
                                 myOutData = myOutData.concat(imeiA);
                                 myOutData = myOutData.concat(devStatusA);
                                 var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                 myOutData = myOutData.concat([outLrc8]);
                                 myOutData = myOutData.concat(eod);
                                 console.log("command to tcp server ",Buffer.from(myOutData));
                                 sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});
                                 
                             });

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This meter is invalid",
                           device:{}
                        });
                     });
                     
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 });

          }
          else if(mydata.event == "onn_device"){

                 Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                     DeviceController.onnDevice({
                        imei: mydata.imei,
                        control: 0
                     }).then(mymeter=>{
                         socket.emit('data',{
                           event:'onn_device',
                           message:"successfilly turmed onn",
                           device:mymeter
                         });


                         if(mymeter.device_type == 1){

                             console.log(mydata);
                             console.log('turnning onn');
                             var msoi = [0x6a];
                             var mcommand = [frontEndOffMeter];
                             var infoLength = [mydata.meterno.length];
                             var imeiA = omejeBuffer.stringToArray(mydata.imei);
                             
                             var myCrCMainData = mcommand;
                             myCrCMainData = myCrCMainData.concat(infoLength);
                             myCrCMainData = myCrCMainData.concat(imeiA);
                             myCrCMainData = myCrCMainData.concat(mcommand);
                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                             var calcrcA = [calcrc];
                             var meod = [0x0d];
                
                             var outData = msoi;
                             outData = outData.concat(myCrCMainData);
                             outData = outData.concat(calcrcA);
                             outData = outData.concat(meod);
                             var bufferOut = Buffer.from(outData);
                             console.log(bufferOut,' onn device');

                             sendToPrepaidMeterTcp(bufferOut).then(()=>{
                                 console.log('send data');
                             })
                         
                         }
                         else if(mymeter.device_type == 2){
                             
                              console.log(mydata);
                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x55]);
                              outdata = outdata.concat([0x3F]);
                              sendToKikeTcp(Buffer(outdata),mydata.imei,socket).then(()=>{
                                 console.log('send data');
                              })

                         }
                         else if(mymeter.device_type == 3){

                             var deviceData = JSON.parse(mymeter.data);

                             var dataLength = 13 + 2;
                             var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                             var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                             var devStatus = (deviceData.output/1) | (1 << ((deviceData.point_no/1)-1 ));
                             var devStatusA = [((devStatus >> 8) & 0xff),(devStatus & 0xff)];
                             
                             DeviceController.onnDevice({
                                 imei: mydata.imei,
                                 control: devStatus
                             }).then((myCurrentDevice)=>{
                                 var myOutData = smartHomeFrontEndHead;
                                 myOutData = myOutData.concat([dataLength]);
                                 myOutData = myOutData.concat(CRELAY);
                                 myOutData = myOutData.concat(imeiA);
                                 myOutData = myOutData.concat(devStatusA);
                                 var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                 myOutData = myOutData.concat([outLrc8]);
                                 myOutData = myOutData.concat(eod);
                                 console.log("command to tcp server ",Buffer.from(myOutData));
                                 sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});
                                 
                             })

                         }
                         else if(mydata.device_type == 4){

                         }
                         else if(mydata.device_type == 5){

                         }
                         else if(mydata.device_type == 6){

                         }
                         else if(mydata.device_type == 7){

                         }
                         else if(mydata.device_type == 8){

                         }
                         else if(mydata.device_type == 9){

                         }

                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This meter is invalid",
                           device:{}
                        });
                     });
                     
                     
                 }).catch(err=>{
                     socket.emit('data',{
                       event:'invaliduser',
                       message:"Invalid user",
                       device:{}
                     });
                 });

          }
          else if(mydata.event == "socket_login"){

               //save socket users
               
               console.log('login in user');
               
               Auth.verifyToken(mydata).then(myuser=>{
                   var myclient = clients.find(x=>x.key == mydata.key);
                   if(myclient){
                       console.log("client seen 5555555555555555555555555555555");
                       clients.splice(clients.indexOf(myclient),1);
                   }

                   var key = uniqid();
                   clients.push({key: key, socket:socket});
                   socket.emit('socket_login',{status:process.env.SUCCESS,key:key,message:'successfull'});
               }).catch(err=>{
                   console.log(err);
                   socket.emit('socketloginstatus',{status:process.env.SUCCESS,message:'invalid token'});
               })

          }
          else if(mydata.event == "device_detail"){
              Auth.verifyMerchantDevice(mydata).then(myuser=>{
                     DeviceController.deviceDetail({
                        imei:mydata.imei
                     }).then(myDevice=>{
                        socket.emit('data',{
                           event:'device_detail',
                           device:myDevice,
                           message:"detail",
                        });
                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalid device',
                           message:"This meter is invalid",
                        });
                     });
              }).catch(err=>{
                  console.log(err);
              });
          }
          else if(mydata.event == "block_detail"){
              Auth.verifyToken(mydata).then(myuser=>{
                     BlockController.blockDetail({
                        reference:mydata.reference
                     }).then(myblock=>{
                        socket.emit('data',{
                           event:'block_detail',
                           block:myblock,
                           message:"detail",
                        });
                     }).catch(err=>{
                        socket.emit('data',{
                           event:'invalidblock',
                           message:"This block is invalid",
                        });
                     });
              }).catch(err=>{
                  console.log(err);
              });
          }
          else if(mydata.event == "set_ip_address"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setIpAddress({
                    imei: mydata.imei,
                    ip_address: data.ip_address
                 }).then(mymeter=>{
                     socket.emit('data',{
                       event:'set_ip_address',
                       message:"Ip address successfully set",
                       device:mymeter
                     });


                     if(mymeter.device_type == 1){
                     
                     }
                     else if(mymeter.device_type == 2){

                     }
                     else if(mymeter.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                        var myOutData = smartHomeFrontEndHead;
                        var myDataLength = 13 + mydata.ipaddress.length;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SPORT);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.ip_address));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{
                        });

                     }
                     else if(mymeter.device_type == 4){

                     }
                     else if(mymeter.device_type == 5){

                     }
                     else if(mymeter.device_type == 6){

                     }
                     else if(mymeter.device_type == 7){

                     }
                     else if(mymeter.device_type == 8){

                     }
                     else if(mymeter.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });
          }

          else if(mydata.event == "set_remote_port"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setRemotePort({
                    imei: mydata.imei,
                    port: data.port
                 }).then(mymeter=>{
                     socket.emit('data',{
                       event:'set_remote_port',
                       message:"Remote port successfully set",
                       device:mymeter
                     });


                     if(mymeter.device_type == 1){
                     
                     }
                     else if(mymeter.device_type == 2){

                     }
                     else if(mymeter.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array
                        var myOutData = smartHomeFrontEndHead;
                        var myDataLength = 13 + mydata.port.length;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SPORT);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.port));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(mymeter.device_type == 4){

                     }
                     else if(mymeter.device_type == 5){

                     }
                     else if(mymeter.device_type == 6){

                     }
                     else if(mymeter.device_type == 7){

                     }
                     else if(mymeter.device_type == 8){

                     }
                     else if(mymeter.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_heart_beat"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setHeartBeat({
                    imei: mydata.imei,
                    heartbeat: data.heartbeat
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_heart_beat',
                       message:"heartbeat successfully set",
                       device:myDevice
                     });


                     if(myDevice.device_type == 1){
                     
                     }
                     else if(myDevice.device_type == 2){

                     }
                     else if(myDevice.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var heartBeatA =  [(((mydata.heartbeat/1) >> 8) & 0xff),((mydata.heartbeat/1) & 0xff)];
                        var myOutData = smartHomeFrontEndHead;
                        var myDataLength = 13 + 2;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SHEART_BIT);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(heartBeatA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(myDevice.device_type == 4){

                     }
                     else if(myDevice.device_type == 5){

                     }
                     else if(myDevice.device_type == 6){

                     }
                     else if(myDevice.device_type == 7){

                     }
                     else if(myDevice.device_type == 8){

                     }
                     else if(myDevice.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_ssid"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setSsid({
                    imei: mydata.imei,
                    ssid: data.ssid
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_ssid',
                       message:"SSid successfully set",
                       device:myDevice
                     });


                     if(myDevice.device_type == 1){
                     
                     }
                     else if(myDevice.device_type == 2){

                     }
                     else if(myDevice.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var myDataLength = 13 + mydata.ssid.length;
                        var myOutData = smartHomeFrontEndHead;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SSSID);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.ssid));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(myDevice.device_type == 4){

                     }
                     else if(myDevice.device_type == 5){

                     }
                     else if(myDevice.device_type == 6){

                     }
                     else if(myDevice.device_type == 7){

                     }
                     else if(myDevice.device_type == 8){

                     }
                     else if(myDevice.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_password"){

              Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setPassword({
                    imei: mydata.imei,
                    password: data.password
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_password',
                       message:"Password successfully set",
                       device:myDevice
                     });


                     if(myDevice.device_type == 1){
                     
                     }
                     else if(myDevice.device_type == 2){

                     }
                     else if(myDevice.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var myDataLength = 13 + mydata.password.length;
                        var myOutData = smartHomeFrontEndHead;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(SPASSWORD);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.password));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(myDevice.device_type == 4){

                     }
                     else if(myDevice.device_type == 5){

                     }
                     else if(myDevice.device_type == 6){

                     }
                     else if(myDevice.device_type == 7){

                     }
                     else if(myDevice.device_type == 8){

                     }
                     else if(myDevice.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This meter is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

          else if(mydata.event == "set_time"){

             Auth.verifyMerchantDevice(mydata).then(myDevice=>{

                 DeviceController.setTime({
                    imei: mydata.imei,
                    password: data.password
                 }).then(myDevice=>{
                     socket.emit('data',{
                       event:'set_time',
                       message:"time successfully set",
                       device:myDevice
                     });


                     if(myDevice.device_type == 1){
                     
                     }
                     else if(myDevice.device_type == 2){

                     }
                     else if(myDevice.device_type == 3){

                        var imei = omejeBuffer.hexToBuffer(mydata.imei); // convert the string to serial_no to buffer;
                        var imeiA = omejeBuffer.toArray(imei); // buttrer to array

                        var myDataLength = 13 + mydata.time.length;
                        var myOutData = smartHomeFrontEndHead;
                        myOutData = myOutData.concat([myDataLength]);
                        myOutData = myOutData.concat(STIME);
                        myOutData = myOutData.concat(imeiA);
                        myOutData = myOutData.concat(omejeBuffer.stringToArray(mydata.time));
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting signal to device ",Buffer.from(myOutData));
                        sendToSmartHomeTcp(Buffer.from(myOutData)).then(()=>{});

                     }
                     else if(myDevice.device_type == 4){

                     }
                     else if(myDevice.device_type == 5){

                     }
                     else if(myDevice.device_type == 6){

                     }
                     else if(myDevice.device_type == 7){

                     }
                     else if(mydata.device_type == 8){

                     }
                     else if(mydata.device_type == 9){

                     }

                 }).catch(err=>{
                    socket.emit('data',{
                       event:'invalid device',
                       message:"This device is invalid",
                       device:{}
                    });
                 });
                 
                 
             }).catch(err=>{
                 socket.emit('data',{
                   event:'invaliduser',
                   message:"Invalid user",
                   device:{}
                 });
             });

          }

         console.log('new connection');

          
      });

      console.log('new connection');

          

});





http.listen(process.env.HTTP_PORT,function(){
   console.log(`listening at port ${process.env.HTTP_PORT} https`);
});

http.on('error',function(error){
  console.log(error);
});



https.listen(process.env.HTTPS_PORT,function(){
   console.log(`listening at port ${process.env.HTTPS_PORT} https`);
});

https.on('error',function(error){
  console.log(error);
});






