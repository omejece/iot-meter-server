require('dotenv').config();
var net = require('net');
var io = require('socket.io-client');

var GatewayController = require('./controllers/gateway/GatewayController.js');
var InverterController = require('./controllers/inverter/InverterController.js');
var GenAutoController = require('./controllers/gen_auto_start/GenAutoController.js');
var omejeBuffer = require('./my_plugin/OmejeBuffer');

//var bcrypt = require('bcrypt-nodejs');


/*Parameters*/
  var head = 0x2a;
  var socketHead = 0x6a; // this variable recognizes the command comming from the socket
/*end parameters*/

/*device commands*/
 var RImei = 0x01;
 var RHeartBeat = 0x02;
 var SHeartBeat = 0x03;
 var RApn = 0x04;
 var SApn = 0x05;
 var RIpAddress = 0x08;
 var SIpAddress = 0x09;
 var RPort = 0x11;
 var SPort = 0x12;
 var RTime = 0x13;
 var STime = 0x14;
 var onnGen = 0x15;
 var offGen = 0x35;
 var Error = 0x16;
 var Login = 0x17;  
 var ackOk = 0x18;
 var resetConnect = 0x19;
 var RNumSlave = 0x20;
 var SNumSlave = 0x21;
 var DeviceInfo = 0x34;
 var SMinBatVoltage = 0x23;
 var SMaxBatVoltage = 0x24;
/*End device commands*/

var myActiveDevices = [];






var server = net.createServer(function(connection) {

      connection.setKeepAlive(true);
      
      connection.on('err', function(data){
           console.log(err);
      });
      
      
      
      connection.on('end',function(){
           var existingDevCon = myActiveDevices.find(x=>x.connection == connection);
           myActiveDevices.splice(myActiveDevices.indexOf(existingDevCon),1);
           console.log("deleting connection data");
      })
      
      connection.on('data', function(data) {
          
          
          if(data.length > 10){
              
              var pHead = data.slice(0,1);
              var pHeadA = omejeBuffer.toArray(pHead);
              console.log(pHead," Packet head");
              
              if(pHeadA[0] == head){
                  console.log(data);
                  var imei = data.slice(1,11);
                  var imeiA = omejeBuffer.toArray(imei);
                  console.log(imei.toString('hex'),'device imei');
                  
                  var command = data.slice(11,12);
                  var commandA = omejeBuffer.toArray(command);
                  console.log(command,'data command');
                  var packetLength = data.slice(12,14);
                  var packetLengthA = omejeBuffer.toArray(packetLength);
                  var packetLengthN = (packetLengthA[0] << 8) | packetLengthA[1];
                  console.log(packetLengthN,'data length');
                  
                  var information = data.slice(14,(14 + packetLengthN));
                  var informationA = omejeBuffer.toArray(information);
                  var informationS = information.toString();
                  console.log(information,'data information');
                  console.log(informationS,'data information string');
                  
                  var crc = data.slice((14 + packetLengthN),(16 + packetLengthN));
                  var crcA = omejeBuffer.toArray(crc);
                  var crcN = (crcA[0] << 8) | crcA[1];
                  console.log(crc,'device crc');
                  
                  var payLoad = data.slice(0,(14 + packetLengthN));
                  var payLoadA = omejeBuffer.toArray(payLoad);
                  console.log(payLoad,'payload');
                  
                  calcCrc = omejeBuffer.checkSum16(payLoad);
                  
                  console.log(crcN,'packet checksum');
                  console.log(calcCrc,'calculated checksum');
                  
                  if(crcN == calcCrc){ // confirm if the integrity of the data received by checking the crc
                      // confirm that the imei of the device is saved in the database
                      GenAutoController.Login({
                          imei:imei.toString('hex')
                      }).then(myDevice=>{
                          var existingDevCon = myActiveDevices.find(x=>x.imei == imei.toString('hex')); // confirm if this device connection has been saved previously and update it if it has
                          if(existingDevCon){
                              var exDevIndex = myActiveDevices.indexOf(existingDevCon); // get the index of the device connection from the connection pool
                              myActiveDevices[exDevIndex].connection = connection;
                              console.log('updating the device connection');
                          }
                          else{
                              myActiveDevices.push({
                                  imei: imei.toString('hex'),
                                  connection: connection
                              })
                          }
                          
                          
                           var deviceData = JSON.parse(myDevice.data);
                           var deviceFlags = JSON.parse(myDevice.flags);
                           var deviceSetting = JSON.parse(myDevice.settings);
                           if(deviceFlags.is_min_voltage == 1){
                                        var voltage = parseFloat(deviceData.min_battery_voltage) * 10;
                                        var voltageData = [((voltage >> 8) & 0xff), (voltage & 0xff)];
                                        var dataToSend = [head];
                                        dataToSend = dataToSend.concat(omejeBuffer.toArray(omejeBuffer.hexToBuffer(device.imei)));
                                        dataToSend = dataToSend.concat([SMinBatVoltage]);
                                        dataToSend = dataToSend.concat([0x00,0x02]);
                                        dataToSend = dataToSend.concat(voltageData);
                                        var checkSum = omejeBuffer.checkSum16(dataToSend);
                                        dataToSend = dataToSend.concat([ ((checkSum >> 8)  & 0xff), (checkSum & 0xff)  ]);
                                        dataToSend = dataToSend.concat([0x0d,0x0a]);
                                        
                                        
                                        var myConnect = myActiveDevices.find(x=>x.imei == device.imei);
                                        if(myConnect){
                                            console.log(" turning onn the generator");
                                            console.log(Buffer.from(dataToSend));
                                            myConnect.connection.write(Buffer.from(dataToSend));
                                        }
                                  
                              }
                              else if(deviceFlags.is_max_voltage == 1){
                                      var voltage = parseFloat(deviceData.max_battery_voltage) * 10;
                                      var voltageData = [((voltage >> 8) & 0xff), (voltage & 0xff)];
                                      var dataToSend = [head];
                                      dataToSend = dataToSend.concat(omejeBuffer.toArray(omejeBuffer.hexToBuffer(device.imei)));
                                      dataToSend = dataToSend.concat([SMaxBatVoltage]);
                                      dataToSend = dataToSend.concat([0x00,0x02]);
                                      dataToSend = dataToSend.concat(voltageData);
                                      var checkSum = omejeBuffer.checkSum16(dataToSend);
                                      dataToSend = dataToSend.concat([ ((checkSum >> 8)  & 0xff), (checkSum & 0xff)  ]);
                                      dataToSend = dataToSend.concat([0x0d,0x0a]);
                                        
                                        
                                      var myConnect = myActiveDevices.find(x=>x.imei == device.imei);
                                      if(myConnect){
                                         console.log(" turning onn the generator");
                                         console.log(Buffer.from(dataToSend));
                                         myConnect.connection.write(Buffer.from(dataToSend));
                                      }
                              }
                              else if(deviceFlags.is_control == 1){
                                    if(deviceData.control == 0){
                                        var dataToSend = [head];
                                        dataToSend = dataToSend.concat(omejeBuffer.toArray(omejeBuffer.hexToBuffer(device.imei)));
                                        dataToSend = dataToSend.concat([onnGen]);
                                        dataToSend = dataToSend.concat([0x00,0x01]);
                                        dataToSend = dataToSend.concat([0x01]);
                                        var checkSum = omejeBuffer.checkSum16(dataToSend);
                                        dataToSend = dataToSend.concat([ ((checkSum >> 8)  & 0xff), (checkSum & 0xff)  ]);
                                        dataToSend = dataToSend.concat([0x0d,0x0a]);
                                        
                                        
                                        var myConnect = myActiveDevices.find(x=>x.imei == device.imei);
                                        if(myConnect){
                                            console.log(" turning onn the generator");
                                            console.log(Buffer.from(dataToSend));
                                            myConnect.connection.write(Buffer.from(dataToSend));
                                        }
                                        
                                    }
                                    else if(deviceData.control == 1){
                                        var dataToSend = [head];
                                        dataToSend = dataToSend.concat(omejeBuffer.toArray(omejeBuffer.hexToBuffer(device.imei)));
                                        dataToSend = dataToSend.concat([offGen]);
                                        dataToSend = dataToSend.concat([0x00,0x01]);
                                        dataToSend = dataToSend.concat([0x01]);
                                        var checkSum = omejeBuffer.checkSum16(dataToSend);
                                        dataToSend = dataToSend.concat([ ((checkSum >> 8)  & 0xff), (checkSum & 0xff)  ]);
                                        dataToSend = dataToSend.concat([0x0d,0x0a]);
                                        
                                        var myConnect = myActiveDevices.find(x=>x.imei == device.imei);
                                        if(myConnect){
                                            console.log(" turning off the generator");
                                            console.log(Buffer.from(dataToSend));
                                            myConnect.connection.write(Buffer.from(dataToSend));
                                        }
                                    }
                          }
                          
                          
                          if(commandA[0] == Login){
                              connection.write(data);
                              console.log(data,"sending login confirmation to device");
                          }
                          else if(commandA[0] == SHeartBeat){
                              GenAutoController.confirmHeartBeat({
                                 imei:imei.toString('hex')
                              }).then(()=>{
                                    
                              }).catch(err=>{
                                    console.log(err);
                              }) 
                          }
                          else if(commandA[0] == SApn){
                              GenAutoController.confirmApn({
                                 imei:imei.toString('hex')
                              }).then(()=>{
                                    
                              }).catch(err=>{
                                    console.log(err);
                              }) 
                          }
                          else if(commandA[0] == SIpAddress){
                              GenAutoController.confirmIpAddress({
                                 imei:imei.toString('hex')
                              }).then(()=>{
                                    
                              }).catch(err=>{
                                    console.log(err);
                              }) 
                          }
                          else if(commandA[0] == SPort){
                              GenAutoController.confirmPort({
                                  imei:imei.toString('hex') 
                              }).then(()=>{
                                    
                              }).catch(err=>{
                                    console.log(err);
                              }) 
                          }
                          else if(commandA[0] == onnGen){
                              
                                GenAutoController.confirmOnnGen({
                                    imei:imei.toString('hex')
                                }).then(()=>{
                                    
                                }).catch(err=>{
                                    console.log(err);
                                })
                              
                          }
                          else if(commandA[0] == offGen){
                              
                                GenAutoController.confirmOffGen({
                                    imei:imei.toString('hex')
                                }).then(()=>{
                                    
                                }).catch(err=>{
                                    console.log(err);
                                })
                              
                          }
                          else if(commandA[0] == SMaxBatVoltage){
                              
                                GenAutoController.confirmMaxVoltage({
                                    imei:imei.toString('hex')
                                }).then(()=>{
                                    
                                }).catch(err=>{
                                    console.log(err);
                                })
                              
                          }
                          else if(commandA[0] == SMinBatVoltage){
                              
                                GenAutoController.confirmMinVoltage({
                                    imei:imei.toString('hex')
                                }).then(()=>{
                                    
                                }).catch(err=>{
                                    console.log(err);
                                })
                              
                          }
                          else if(commandA[0] == DeviceInfo){
                                
                                var myDataArray = information.toString().split('|');
                                
                                var frequency = myDataArray[3];
                                if(((myDataArray[3]/1) <= 0 || (myDataArray[3]/1) >= 65) && (myDataArray[1]/1) > 100 ){
                                    frequency = 50;
                                }
                                
                                var dataToSave = {
                                    imei: imei.toString('hex'),
                                    gen_status: myDataArray[0],
                                    gen_voltage: myDataArray[1],
                                    gen_current: myDataArray[2],
                                    gen_frequency: frequency,
                                    gen_power_factor: myDataArray[4],
                                    max_battery_voltage: myDataArray[5],
                                    min_battery_perc: myDataArray[6],
                                    battery_voltage: myDataArray[7],
                                    battery_current: myDataArray[8],
                                    panel_voltage: myDataArray[9],
                                    panel_current: myDataArray[10].split(' ')[0]
                                }
                              
                                console.log(dataToSave);
                                GenAutoController.saveDeviceData(dataToSave).then(myDevice=>{
                                    
                                    
                                    
                                }).catch(err=>{
                                    console.log(err);
                                })
                              
                          }
                          
                      }).catch(err=>{
                          console.log(err);
                      })
                      
                  }
                  
                  
                  
              }
              else if(pHeadA[0] == socketHead){
                  
                  console.log(data);
                  var imei = data.slice(1,11);
                  var imeiA = omejeBuffer.toArray(imei);
                  console.log(imei.toString('hex'),'device imei');
                  
                  var command = data.slice(11,12);
                  var commandA = omejeBuffer.toArray(command);
                  console.log(command,'data command');
                  var packetLength = data.slice(12,14);
                  var packetLengthA = omejeBuffer.toArray(packetLength);
                  var packetLengthN = (packetLengthA[0] << 8) | packetLengthA[1];
                  console.log(packetLengthN,'data length');
                  
                  var information = data.slice(14,(14 + packetLengthN));
                  var informationA = omejeBuffer.toArray(information);
                  var informationS = information.toString();
                  console.log(information,'data information');
                  console.log(informationS,'data information string');
                  
                  var crc = data.slice((14 + packetLengthN),(16 + packetLengthN));
                  var crcA = omejeBuffer.toArray(crc);
                  var crcN = (crcA[0] << 8) | crcA[1];
                  console.log(crc,'device crc');
                  
                  var payLoad = data.slice(0,(14 + packetLengthN));
                  var payLoadA = omejeBuffer.toArray(payLoad);
                  console.log(payLoad,'payload');
                  
                  calcCrc = omejeBuffer.checkSum16(payLoad);
                  
                  console.log(crcN,'packet checksum');
                  console.log(calcCrc,'calculated checksum');
                  
                  if(crcN == calcCrc){ // confirm if the integrity of the data received by checking the crc
                      if(commandA[0] == RHeartBeat){
                          
                      }
                      else if(commandA[0] == SHeartBeat){
                          
                      }
                      else if(commandA[0] == SApn){
                          
                      }
                      else if(commandA[0] == RApn){
                          
                      }
                      else if(commandA[0] == SIpAddress){
                          
                      }
                      else if(commandA[0] == RIpAddress){
                          
                      }
                      else if(commandA[0] == SPort){
                          
                      }
                      else if(commandA[0] == RPort){
                          
                      }
                      else if(commandA[0] == onnGen){
                          
                          
                      }
                      else if(commandA[0] == offGen){
                       
                      }
                      
                  }
             }
          
          }
          
      });

      console.log("new connection seen");
            
      
            
            


      connection.pipe(connection);

});


server.listen({
  host: process.env.SERVER_IP,
  port: process.env.OBIDDER_PORT
}, function() { 
   console.log('server is listening to %j at address %k', process.env.OBIDDER_PORT, process.env.SERVER_IP);
});