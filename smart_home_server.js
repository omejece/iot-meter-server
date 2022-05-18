require('dotenv').config();
var net = require('net');
var io = require('socket.io-client');
var omejeBuffer = require('./my_plugin/OmejeBuffer');
var SmartHomeController = require('./controllers/smart_home/SmartHomeController');

//var bcrypt = require('bcrypt-nodejs');


/* Parts*/
  var packetHead = [0x2a];
  var frontEndHead = [0x6a];
  var eod = [0x0d,0x0a];
/*End parts*/


/* Start Commands*/
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

/*End Commands*/

var myActiveDevices = [];







var server = net.createServer(function(connection) {

      connection.setKeepAlive(true);
      
      var mydata = {
                    control:0,
                    points:{
                       point1:{output:0,voltage:0,current:0,activepower:0},
                       point2:{output:0,voltage:0,current:0,activepower:0},
                       point3:{output:0,voltage:0,current:0,activepower:0},
                       point4:{output:0,voltage:0,current:0,activepower:0},
                       point5:{output:0,voltage:0,current:0,activepower:0},
                       point6:{output:0,voltage:0,current:0,activepower:0},
                       point7:{output:0,voltage:0,current:0,activepower:0},
                       point8:{output:0,voltage:0,current:0,activepower:0}
                    }
                }
      console.log(JSON.stringify(mydata))
        

      console.log("new connection seen");
      
      connection.on('end', function() {
          console.log("connection ended");
          var activeDevice = myActiveDevices.find(x=>x.connection == connection);
          if(activeDevice){
              myActiveDevices.splice(myActiveDevices.indexOf(activeDevice),1);
              console.log('Deleting exited devices');
          }

      });
      


      connection.on('error',function(error){
          console.log(error);
      });


      connection.on('data', function(data) {
           
            var tData = Buffer.from(data);
            console.log(" received ",tData);

            var head = tData.slice(0,1);
            var headA = omejeBuffer.toArray(head);
            var length = tData.slice(1,2);
            var lengthA = omejeBuffer.toArray(length);
            var command = tData.slice(2,3);
            var commandA = omejeBuffer.toArray(command);
            var duid = tData.slice(3,13);
            var duidA = omejeBuffer.toArray(duid);
            
            var infoLength = (lengthA[0]/1) - 13; 
            var info = tData.slice(13,((lengthA[0]/1)));
            var infoA = omejeBuffer.toArray(info);

            var lrc = tData.slice(((lengthA[0]/1)),((lengthA[0]/1) + 1));
            var lrcA = omejeBuffer.toArray(lrc);


            var payLoad = tData.slice(0,((lengthA[0]/1)));
            var payLoadA = omejeBuffer.toArray(payLoad);

            var calcLrc8 = omejeBuffer.Lrc8(payLoadA);

            

            console.log(payLoad,' payload');

            console.log(lrc,' seen lrc');

            console.log(calcLrc8,' calculated lrc');


            console.log(duid.toString('hex'),' device id');


            if(packetHead[0] === headA[0]){
                if(lrcA[0] === calcLrc8){
                     if(commandA[0] == RIMEI[0]){

                          sendToSocketio({
                            event:'readimei',
                            data:info.toString(),
                            imei: duid.toString('hex')
                          }).then(()=>{});
                     }
                     else if(commandA[0] == RHEART_BIT[0]){
                        console.log("            Device heart beat                   ")
                        var deviceStatus = info.slice(0,2);
                        var infoLength = Buffer.byteLength(info); 
                        var powerData = info.slice(2,(infoLength + 2));
                        var myDevStatusInt = ((deviceStatus[0] << 8) & 0xffff) | deviceStatus[1];
                        var powerDataA = powerData.toString().split('-');


                        var pointData = omejeBuffer.ExtractPowerData(powerDataA);

                        var deviceData = {
                            points: pointData,
                            device_status: myDevStatusInt,
                            imei: duid.toString('hex')
                        }


                        console.log(powerData,' 888888888888888888888888888888');

                        SmartHomeController.saveDeviceData(deviceData).then(mydevice=>{
                            if(mydevice.isheartbeat == 1){
                                var myHeartBeat = (mydevice.heartbeat/1);
                                var myHeartBeatA = [((myHeartBeat >> 8) & 0xff),(myHeartBeat & 0xff)];
                                var myOutData = headA;
                                myOutData = myOutData.concat(lengthA);
                                myOutData = myOutData.concat(SHEART_BIT);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(myHeartBeatA);
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting signal to device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }
                            if(mydevice.isssid == 1){
                                var myOutData = headA;
                                myOutData = myOutData.concat(lengthA);
                                myOutData = myOutData.concat(SSSID);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(omejeBuffer.stringToArray(mydevice.ssid));
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting signal to device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }
                            if(mydevice.ispassword == 1){
                                var myOutData = headA;
                                myOutData = myOutData.concat(lengthA);
                                myOutData = myOutData.concat(SPASSWORD);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(omejeBuffer.stringToArray(mydevice.password));
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting signal to device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }
                            if(mydevice.isipaddress == 1){
                                var myOutData = headA;
                                var myDataLength = 13 + mydevice.ipaddress.length;
                                myOutData = myOutData.concat([myDataLength]);
                                myOutData = myOutData.concat(SIPADDRESS);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(omejeBuffer.stringToArray(mydevice.ipaddress));
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting signal to device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }
                            if(mydevice.isport == 1){
                                var myOutData = headA;
                                var myDataLength = 13 + mydevice.port.length;
                                myOutData = myOutData.concat([myDataLength]);
                                myOutData = myOutData.concat(SPORT);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(omejeBuffer.stringToArray(mydevice.port));
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting signal to device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }
                            if(mydevice.ismytime == 1){
                                var myOutData = headA;
                                var myDataLength = 13 + mydevice.mytime.length; 
                                myOutData = myOutData.concat([myDataLength]);
                                myOutData = myOutData.concat(STIME);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(omejeBuffer.stringToArray(mydevice.mytime));
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting signal to device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }
                            if(mydevice.iscontrol == 1){
                                console.log(mydevice.output," control device 99999999999999999999999999999999999999999999999999");
                                var myOutput = (mydevice.output/1);
                                var myOutputA = [((myOutput >> 8) & 0xff),(myOutput & 0xff)];
                                var myDataLength = 15; 

                                var myOutData = headA;
                                myOutData = myOutData.concat([myDataLength]);
                                myOutData = myOutData.concat(CRELAY);
                                myOutData = myOutData.concat(duidA);
                                myOutData = myOutData.concat(myOutputA);
                                var outLrc8 = omejeBuffer.Lrc8(myOutData);
                                myOutData = myOutData.concat([outLrc8]);
                                myOutData = myOutData.concat(eod);
                                console.log("transmitting control device ",Buffer.from(myOutData));
                                connection.write(Buffer.from(myOutData));
                            }

                            sendToSocketio({
                              event:'smarthomedata',
                              data: {device:mydevice,heartbeat:info.toString()},
                              imei: duid.toString('hex')
                            }).then(()=>{});

                        }).catch(err=>{
                          console.log(err);
                        })
                     }
                     else if(commandA[0] == SHEART_BIT[0]){
                        SmartHomeController.confirmSetHeartBeat({
                          imei: duid.toString('hex')
                        }).then(mydevice=>{
                            sendToSocketio({
                              event:'setheartbeat',
                              data: "Heartbeat successfully set",
                              imei: duid.toString('hex')
                            }).then(()=>{});
                        }).catch(err=>{
                           console.log(err);
                        })
                     }
                     else if(commandA[0] == RSSID[0]){
                        sendToSocketio({
                          event:'readssid',
                          data: info.toString(),
                          imei: duid.toString('hex')
                        }).then(()=>{});
                     }
                     else if(commandA[0] == SSSID[0]){
                          SmartHomeController.confirmSetSsid({
                            imei: duid.toString('hex')
                          }).then(mydevice=>{
                              sendToSocketio({
                                event:'setssid',
                                data: "SSID successfully set",
                                imei: duid.toString('hex')
                              }).then(()=>{});
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == RPASSWORD[0]){
                         sendToSocketio({
                           event:'readpassword',
                           data: info.toString(),
                           imei: duid.toString('hex')
                         }).then(()=>{});
                     }
                     else if(commandA[0] == SPASSWORD[0]){
                          SmartHomeController.confirmSetPassword({
                            imei: duid.toString('hex')
                          }).then(mydevice=>{
                              sendToSocketio({
                                event:'setpassword_smarthome',
                                data: "password successfully set",
                                imei: duid.toString('hex')
                              }).then(()=>{});
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == RIPADDRESS[0]){
                          sendToSocketio({
                            event:'readipaddress_smarthome',
                            data: info.toString(),
                            imei: duid.toString('hex')
                          }).then(()=>{});
                     }
                     else if(commandA[0] == SIPADDRESS[0]){
                          SmartHomeController.confirmSetIpAddress({
                            imei: duid.toString('hex')
                          }).then(mydevice=>{
                              sendToSocketio({
                                event:'setpassword_smarthome',
                                data: "password successfully set",
                                imei: duid.toString('hex')
                              }).then(()=>{});
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == RPORT[0]){
                          sendToSocketio({
                            event:'readport_smarthome',
                            data: info.toString(),
                            imei: duid.toString('hex')
                          }).then(()=>{});
                     }
                     else if(commandA[0] == SPORT[0]){
                          SmartHomeController.confirmSetPort({
                             imei: duid.toString('hex')
                          }).then(mydevice=>{
                              sendToSocketio({
                                event:'setport_smarthome',
                                data: "port successfully set",
                                imei: duid.toString('hex')
                              }).then(()=>{});
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == RTIME[0]){
                          sendToSocketio({
                            event:'readtime_smarthome',
                            data: info.toString(),
                            imei: duid.toString('hex')
                          }).then(()=>{});
                     }
                     else if(commandA[0] == STIME[0]){
                          SmartHomeController.confirmSetTime({
                             imei: duid.toString('hex')
                          }).then(mydevice=>{
                              sendToSocketio({
                                event:'settime_smarthome',
                                data: "time successfully set",
                                imei: duid.toString('hex')
                              }).then(()=>{});
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == CRELAY[0]){
                          SmartHomeController.confirmControlDevice({
                             imei: duid.toString('hex')
                          }).then(mydevice=>{
                              sendToSocketio({
                                event:'controldevice_smarthome',
                                data: "device successfully controlled",
                                imei: duid.toString('hex')
                              }).then(()=>{});
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == LOGIN[0]){
                          console.log("Login in device");
                          SmartHomeController.loginDevice({
                             imei: duid.toString('hex')
                          }).then(mydevice=>{
                              var myOutData = headA;
                              myOutData = myOutData.concat(lengthA);
                              myOutData = myOutData.concat(commandA);
                              myOutData = myOutData.concat(duidA);
                              myOutData = myOutData.concat([0x01]);
                              var outLrc8 = omejeBuffer.Lrc8(myOutData);
                              myOutData = myOutData.concat([outLrc8]);
                              myOutData = myOutData.concat(eod);
                              console.log("transmitting signal to device ",Buffer.from(myOutData));
                              
                              var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                              if(activeDevice){
                                  myActiveDevices.splice(myActiveDevices.indexOf(activeDevice),1);
                              }

                              myActiveDevices.push({
                                 duid:duid.toString('hex'),
                                 connection: connection 
                              });

                              connection.write(Buffer.from(myOutData));

                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == RESET_CONNECT[0]){
                          sendToSocketio({
                            event:'reconnect_smarthome',
                            data: "device successfully restarted",
                            imei: duid.toString('hex')
                          }).then(()=>{});
                     }

                }
                else{
                   /* var myOutData = headA;
                    myOutData = myOutData = myOutData.concat([0x0d]);
                    myOutData = myOutData = myOutData.concat(ERROR);
                    myOutData = myOutData = myOutData.concat(duidA);
                    myOutData = myOutData.concat([0x08]);
                    var outLrc8 = omejeBuffer.Lrc8(myOutData);
                    myOutData = myOutData = myOutData.concat([outLrc8]);
                    myOutData = myOutData = myOutData.concat(eod);
                    console.log("transmitting error signal ",Buffer.from(myOutData));
                    connection.write(Buffer.from(myOutData));*/

                }
            }
            else if(frontEndHead[0] === headA[0] ){
                connection.write('seen');
                setTimeout(()=>{ // wait for 3 seconds before ending connection
                   connection.end(); 
                },3000);
                
                if(lrcA[0] === calcLrc8){
                     if(commandA[0] == RIMEI[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting to read device serial no ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == RHEART_BIT[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("command to read heart beat ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == SHEART_BIT[0]){
                          SmartHomeController.setHeartBeat({
                            data: info.toString(),
                            duid: duid.toString('hex')
                          }).then(()=>{
                              var myOutData = headA;
                              myOutData = myOutData.concat(lengthA);
                              myOutData = myOutData.concat(commandA);
                              myOutData = myOutData.concat(duidA);
                              myOutData = myOutData.concat(infoA);
                              var outLrc8 = omejeBuffer.Lrc8(myOutData);
                              myOutData = myOutData.concat([outLrc8]);
                              myOutData = myOutData.concat(eod);
                              console.log(" Command to set heart beat ",Buffer.from(myOutData));
                              
                              var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                              if(activeDevice){
                                  activeDevice.connection.write(Buffer.from(myOutData));
                              }
                          }).catch(err=>{
                             console.log(err);
                          })
                     }
                     else if(commandA[0] == RSSID[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting reading device ssid ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == SSSID[0]){
                        SmartHomeController.setSsid({
                          data: info.toString(),
                          duid: duid.toString('hex')
                        }).then(()=>{
                            var myOutData = headA;
                            myOutData = myOutData.concat(lengthA);
                            myOutData = myOutData.concat(commandA);
                            myOutData = myOutData.concat(duidA);
                            myOutData = myOutData.concat(infoA);
                            var outLrc8 = omejeBuffer.Lrc8(myOutData);
                            myOutData = myOutData.concat([outLrc8]);
                            myOutData = myOutData.concat(eod);
                            console.log(" Command to set ssid ",Buffer.from(myOutData));
                            
                            var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                            if(activeDevice){
                                activeDevice.connection.write(Buffer.from(myOutData));
                            }
                        }).catch(err=>{
                           console.log(err);
                        })
                     }
                     else if(commandA[0] == RPASSWORD[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmittingdevice password ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == SPASSWORD[0]){
                        SmartHomeController.setPassword({
                          data: info.toString(),
                          duid: duid.toString('hex')
                        }).then(()=>{
                            var myOutData = headA;
                            myOutData = myOutData.concat(lengthA);
                            myOutData = myOutData.concat(commandA);
                            myOutData = myOutData.concat(duidA);
                            myOutData = myOutData.concat(infoA);
                            var outLrc8 = omejeBuffer.Lrc8(myOutData);
                            myOutData = myOutData.concat([outLrc8]);
                            myOutData = myOutData.concat(eod);
                            console.log(" Command to set password ",Buffer.from(myOutData));
                            
                            var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                            if(activeDevice){
                                activeDevice.connection.write(Buffer.from(myOutData));
                            }
                        }).catch(err=>{
                           console.log(err);
                        })
                     }
                     else if(commandA[0] == RIPADDRESS[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting device ip address ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == SIPADDRESS[0]){
                        SmartHomeController.setIpAddress({
                          data: info.toString(),
                          duid: duid.toString('hex')
                        }).then(()=>{
                            var myOutData = headA;
                            myOutData = myOutData.concat(lengthA);
                            myOutData = myOutData.concat(commandA);
                            myOutData = myOutData.concat(duidA);
                            myOutData = myOutData.concat(infoA);
                            var outLrc8 = omejeBuffer.Lrc8(myOutData);
                            myOutData = myOutData.concat([outLrc8]);
                            myOutData = myOutData.concat(eod);
                            console.log(" Command to set ip address ",Buffer.from(myOutData));
                            
                            var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                            if(activeDevice){
                                activeDevice.connection.write(Buffer.from(myOutData));
                            }
                        }).catch(err=>{
                           console.log(err);
                        })
                     }
                     else if(commandA[0] == RPORT[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting device port",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == SPORT[0]){
                        SmartHomeController.setPort({
                          data: info.toString(),
                          duid: duid.toString('hex')
                        }).then(()=>{
                            var myOutData = headA;
                            myOutData = myOutData.concat(lengthA);
                            myOutData = myOutData.concat(commandA);
                            myOutData = myOutData.concat(duidA);
                            myOutData = myOutData.concat(infoA);
                            var outLrc8 = omejeBuffer.Lrc8(myOutData);
                            myOutData = myOutData.concat([outLrc8]);
                            myOutData = myOutData.concat(eod);
                            console.log(" Command to set port ",Buffer.from(myOutData));
                            
                            var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                            if(activeDevice){
                                activeDevice.connection.write(Buffer.from(myOutData));
                            }
                        }).catch(err=>{
                           console.log(err);
                        })
                     } 
                     else if(commandA[0] == RTIME[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("transmitting reading device rport time  ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == STIME[0]){
                        SmartHomeController.setTime({
                          data: info.toString(),
                          duid: duid.toString('hex')
                        }).then(()=>{
                            var myOutData = headA;
                            myOutData = myOutData.concat(lengthA);
                            myOutData = myOutData.concat(commandA);
                            myOutData = myOutData.concat(duidA);
                            myOutData = myOutData.concat(infoA);
                            var outLrc8 = omejeBuffer.Lrc8(myOutData);
                            myOutData = myOutData.concat([outLrc8]);
                            myOutData = myOutData.concat(eod);
                            console.log(" Command to set time ",Buffer.from(myOutData));
                            
                            var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                            if(activeDevice){
                                activeDevice.connection.write(Buffer.from(myOutData));
                            }
                        }).catch(err=>{
                           console.log(err);
                        })
                     }
                     else if(commandA[0] == CRELAY[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log(" Command to set heart beat ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     else if(commandA[0] == RESET_CONNECT[0]){
                        var myOutData = headA;
                        myOutData = myOutData.concat(lengthA);
                        myOutData = myOutData.concat(commandA);
                        myOutData = myOutData.concat(duidA);
                        myOutData = myOutData.concat(infoA);
                        var outLrc8 = omejeBuffer.Lrc8(myOutData);
                        myOutData = myOutData.concat([outLrc8]);
                        myOutData = myOutData.concat(eod);
                        console.log("resetting device ",Buffer.from(myOutData));
                        
                        var activeDevice = myActiveDevices.find(x=>x.uid == duid.toString('hex'));
                        if(activeDevice){
                            activeDevice.connection.write(Buffer.from(myOutData));
                        }
                     }
                     
                     
                }
            }

            
      });

     
      function sendToSocketio(mydata){
          console.log("connecting to socket.io");
          return new Promise((resolve,reject)=>{
              var iosocket = io.connect('ws://iotbridge.owattspay.net', {secure: true});
              iosocket.on('connect', function (socket) {
                  iosocket.emit('data',mydata);
                  
                  iosocket.on('data',(data)=>{
                     resolve(data);
                     iosocket.close();
                     resolve('done');
                  })
              });
          })
      }
      connection.pipe(connection);

});


server.listen({
  //host: process.env.SERVER_IP,
  port: process.env.SMARTHOME_PORT
}, function() { 
   console.log('server is listening to %j', process.env.SMARTHOME_PORT);
});