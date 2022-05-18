require('dotenv').config(); // this is important!
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const io = require('socket.io-client');
const OmejeBuffer = require('./my_plugin/OmejeBuffer');
const KikeController = require('./controllers/kike/KikeController');
const SettingController = require('./controllers/kike/SettingController');
const AlarmController = require('./controllers/kike/AlarmController');
const ConsumptionController = require('./controllers/kike/ConsumptionController');
const DeviceController = require('./controllers/DeviceController');

var socket = io(process.env.SOCKET_END_POINT);



/* Commands */
  const ACKERR = 0x00;// response error acknowlegement 
  const ACKOK = 0x01; // success response no acknowledgement
  const PAFDS=0x02,QAFDS = 0x02; // report cummulative traffic and device status
  const PHAF=0x03,QHAF = 0x03; // report historic cummulative usage flow (by hour)
  const SVALVE = 0x04; //set valve switch
  const SAFLOW = 0x05; // set cummulative flow
  const PPERID = 0x06,QPERID= 0x06,SPERID=0x06; //reporting cycle
  const PPTIME = 0x07,SPTIME = 0x07,QPTIME=0x07; // report fixed time
  const PBAT = 0x08,QBAT=0x08,SBAT=0x08; // report battery configuration parameter
  const PDEVS = 0x09; // report device status information
  const PALERT = 0x0A; // report device alarm information
  const PFWVER = 0x0B; // report firmware version
  const SBAL = 0x0C,QBAL=0x0C; // set to increase or decrease purchase
  const PTEMP = 0x0D,QTEMP=0x0D; // report temperature value
  const PPRESS = 0X0F; // report pulse coefficient
  const PCFG = 0x10,QCFG=0x10,SCFG=0x10; // report system configuration
  const PREMOTE = 0x11,QREMOTE=0x11,SREMOTE=0x11; // report ip address or domain name
  const SNOWTIME=0x0E,QNOWTIME=0x0E,PNOWTIME = 0x0E;
  const QCV=0x0F,PCV=0x0F,SCV=0x0F;
/* End Commands */


var clientList = []; // stores the list of connected devices

var iosocket = io.connect(process.SOCKET_END_POINT, {secure: true});





function sendToSocketio(mydata){
  console.log("connecting to socket.io");
  if(io.sockets.adapter.rooms.get(mydata.imei)){
      console.log("sending to room "+mydata.imei);
      io.sockets.in(mydata.imei).emit('data', mydata);
  }
  else{
    console.log("creating and sending to room "+mydata.imei);
    io.emit('create_room',mydata.imei);
    setTimeout(()=>{
        socket.join(mydata.imei);
        io.sockets.in(mydata.imei).emit('data', mydata);
    },2000);
      
  }
}





iosocket.on('data',(data)=>{
    
    console.log("data from socket");
    
    console.log(data);
    
    
});

iosocket.on('error',(data)=>{
    
    console.log('socket data')
    
})



function saveDeviceClient(mydata){ // handles login of device and saves the client
      
      return new Promise((resolve,reject)=>{
          
           KikeController.Login(mydata).then(resp=>{ // login the device
               var rinfo = mydata.conInfo;
               var extClient = clientList.find(x=>x.address == rinfo.address && x.port == rinfo.port && mydata.imei == x.imei); // check if the device is already connected

               if(!extClient){// save device info if it exist not
                  var myclient = {
                     address: rinfo.address,
                     port: rinfo.port,
                     imei: mydata.imei,
                     lastcomm: new Date(),
                     last_fid_sent: 0x01
                  };

                  clientList.push(myclient);

                  resolve({device:resp,client:myclient});
               }
               else{
                  // get the index of the device if it exists and update the last time it communicated
                  var index = clientList.indexOf(extClient);
                  clientList[index].lastcomm = new Date();
                  resolve({device:resp,client:extClient});
                  console.log(resp)
               }
               
           }).catch(err=>{
              console.log(err);
              reject('invalid device')
           });         

      });

}



function sendDataToDevice(bufferdata,client){ // this communicates to the device
    console.log(client);
    console.log(bufferdata);
    return new Promise((resolve,reject)=>{
        if(client.address){
            server.send(bufferdata,client.port,client.address, (err) => {
               if(err){
                   reject(err);
               }

               resolve('Data successfully sent');

            });
        }
        else{
            reject("Device is offline");
        }
        
    });
}




 

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  //server.close();
});


server.on('close', (rinfo) => {
    console.log(rinfo);
});

server.on('message', (msg, rinfo) => {

     console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

     var dataLength = msg.length;
     var inDataBuffer = Buffer.from(msg);
     var Imei = inDataBuffer.slice(0,8); // device imei number in buffer format
     var ImeiA = OmejeBuffer.toArray(Imei); // device imei number in array format
     var Fid = inDataBuffer.slice(dataLength-1,dataLength); // get the fid which is the last byte in the packet
     var FidA = OmejeBuffer.toArray(Fid); // convert the fid to array
     var Cmd = inDataBuffer.slice(8,9); // get the command
     var CmdA = OmejeBuffer.toArray(Cmd); // convert the command in array
     var Arg = inDataBuffer.slice(9,dataLength-1); // get the args
     var ArgA = OmejeBuffer.toArray(Arg); // get the args in array

     
     console.log(inDataBuffer,'All Data');

     console.log(Imei,'Imei no');
     console.log(Fid,'fid ');
     console.log(Cmd,'Cmd ');
     console.log(Arg,'Arg ');

     if(FidA[0] <= 0xFF){
         console.log('Data from device');
         console.log(Imei.toString('hex').toString());
         
         if(msg.length <= 10){
             
             var mydata = {
                imei: Imei.toString('hex'),
                rcmd: ArgA[0],
                conInfo: rinfo
             };
             
             
             
        
             saveDeviceClient(mydata).then(myresp=>{
                  var deviceData = JSON.parse(myresp.device.data);
                  var deviceFlag = JSON.parse(myresp.device.flags);
                  
                  console.log(deviceFlag);
                  
                  if(deviceFlag.is_recharged == 1){
                      console.log("77777777777777777777777777777777777777  recharging device   7777777777777777777777777777777777777777777");
                      var rechargeValue = ((deviceData.recharged_data/1) * 1000);
                      var R0 = rechargeValue & 0xFF;
                      var R1 = (rechargeValue >> 8) & 0xFF;
                      var R2 = (rechargeValue >> 16) & 0xFF;
                      var R3 = (rechargeValue >> 24) & 0xFF;

                      var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                      var index = clientList.indexOf(extClient);

                      if(FidA[0] >= 0xff){
                          clientList[index].last_fid_sent = 0x01;
                      }
                      else{
                          clientList[index].last_fid_sent = (FidA[0] + 1);
                      }
                          
                      console.log("executing recharge")
                      var outdata = [SBAL];
                      outdata = outdata.concat([R0,R1,R2,R3]);
                      outdata = outdata.concat([clientList[index].last_fid_sent]);
                      sendDataToDevice(Buffer(outdata),myresp.client).then(myresp=>{
                          console.log(new Buffer(outdata));
                      }).catch(err=>{
                        console.log(err);
                      });
                  }
                  
                  if(deviceFlag.is_control == 1){
                      
                      
                       console.log(deviceData.control,"device data control");
                      if(deviceData.control == 1){
                          console.log("777777777777777777777777777777777777777777777777777777777777777777777777777777777");
                          KikeController.confirmControl({
                              imei: Imei.toString('hex')
                          }).then(()=>{
                              console.log('turnning off');
                              
                              var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                              var index = clientList.indexOf(extClient);

                              if(FidA[0] >= 0xff){
                                  clientList[index].last_fid_sent = 0x01;
                              }
                              else{
                                  clientList[index].last_fid_sent = (FidA[0] + 1);
                              }

                              var outdata = [SVALVE];
                              outdata = outdata.concat([0x99]);
                              outdata = outdata.concat([clientList[index].last_fid_sent]);
                              sendDataToDevice(Buffer(outdata),myresp.client).then(myresp=>{
                                  console.log(new Buffer(outdata));
                              }).catch(err=>{
                                console.log(err);
                              });
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(deviceData.control == 0){
                              KikeController.confirmControl({
                                  imei: Imei.toString('hex')
                              }).then(()=>{
                                  
                                  console.log("3333333333333333333333333333333333333333333333333333333333333333333333333333333333333");
                                  console.log('turnning onn');

                                  var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                                  var index = clientList.indexOf(extClient);

                                  if(FidA[0] >= 0xff){
                                      clientList[index].last_fid_sent = 0x01;
                                  }
                                  else{
                                      clientList[index].last_fid_sent = (FidA[0] + 1);
                                  }

                                  var outdata = [SVALVE];
                                  outdata = outdata.concat([0x55]);
                                  outdata = outdata.concat([clientList[index].last_fid_sent]);
                                  sendDataToDevice(Buffer(outdata),myresp.client).then(myresp=>{
                                      console.log(new Buffer(outdata));
                                  }).catch(err=>{
                                    console.log(err);
                                  });
                                  
                              }).catch(err=>{
                                 console.log(err);
                              });
                          
                      }
                      
                  }
                  else if(deviceFlag.is_device_report == 1){
                      console.log('6666666666666666666666666666 asking for report 66666666666666666666666');
                      
                      var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                      var index = clientList.indexOf(extClient);

                      if(FidA[0] >= 0xff){
                          clientList[index].last_fid_sent = 0x01;
                      }
                      else{
                          clientList[index].last_fid_sent = (FidA[0] + 1);
                      }
                      var outdata = [QAFDS];
                      outdata = outdata.concat(ArgA);
                      outdata = outdata.concat([clientList[index].last_fid_sent]);
                      sendDataToDevice(Buffer(outdata),myresp.client).then(myresp=>{
                        console.log(new Buffer(outdata));
                      }).catch(err=>{
                         console.log(err);
                      });
                  }
                  
                    
             }).catch(err=>{
                 console.log(err);
             });
                 
               
                
         }
         else{
             
                 if(ACKERR === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        rcmd: ArgA[0],
                        conInfo: rinfo
                     };
                     
                     console.log(mydata);
        
                     saveDeviceClient(mydata).then(myresp=>{
                         KikeController.HandleErrCommand(mydata).then(resp2=>{
                             var message = {
                                imei: Imei.toString('hex'),
                                title:'Kiker error alert',
                                body: resp2,
                                event: 'error',
                                device: JSON.stringify(myresp.device)
                             };
        
                             sendToSocketio(message);
                         });
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(ACKOK === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        rcmd: ArgA[0],
                        conInfo: rinfo,
                     };
        
                     saveDeviceClient(mydata).then(myresp=>{
                         var mydata2 = {
                            imei: Imei.toString('hex'),
                            rcmd: ArgA[0],
                            conInfo: rinfo,
                            rfid: FidA[0],
                            device:myresp.device
                         };
                         SettingController.ConfirmSetting(mydata2).then(resp2=>{
                             var message = {
                                imei: Imei.toString('hex'),
                                title:'Lpg control alert',
                                body: resp2,
                                event: 'success',
                                device: JSON.stringify(myresp.device)
                             };
                             
                             sendToSocketio(message);
                         });
        
                     }).catch(err=>{
                         console.log(err);
                     });
        
                 }
                 else if(PAFDS === CmdA[0]){
                    var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                    };
                    
                    
                    saveDeviceClient(mydata).then(myresp=>{
                           var Cumulative_flow =  0;
                           var total_purchase =  0;
                           var device_status = 0;
                           var alarm = 0;
                           var under_voltage = 0;
                           var valve_status = 0;
                           var hall_failure_alarm = 0;
                           var power_switch_alarm = 0;
                           var magnetic_interf_alarm = 0;
                           var valve_failure_alarm = 0;
                           var reverse_flow_alarm = 0;
                           var battery_level_alarm = 0;
                           var battery_voltage =  0;
                           var signal_strength = 0;
                           var signal_to_noise_ratio = 0;
        
                           var deviceData = JSON.parse(myresp.device.data);
                           var deviceFlags = JSON.parse(myresp.device.flags);
                           var deviceSettings = JSON.parse(myresp.device.settings);
                           
                           KikeController.confirmDeviceReport({
                              imei: Imei.toString('hex')
                           }).then(()=>{
                               
                                 if(deviceData.disabled == 1){
                                       console.log(" device disabled");
                            
                                      if(deviceData.valve == 0x00){
                                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                                          var index = clientList.indexOf(extClient);
        
                                          if(FidA[0] >= 0xff){
                                              clientList[index].last_fid_sent = 0x01;
                                          }
                                          else{
                                              clientList[index].last_fid_sent = (FidA[0] + 1);
                                          }
        
                                          var outdata = [SVALVE];
                                          outdata = outdata.concat([0x99]);
                                          outdata = outdata.concat([clientList[index].last_fid_sent]);
                                          sendDataToDevice(Buffer(outdata),myresp.client).then(myresp=>{
                                              console.log(new Buffer(outdata));
                                          }).catch(err=>{
                                            console.log(err);
                                          });
                                      }
                                   }
                                   else{
                                       
                                      console.log(" checking mydevice ", deviceData.total_purchase);
                                       
                                      console.log(Arg.length,'0000000000000000000000000000000000000000000000000 argument length is ');
                                         
                                      if(Arg.length <= 14){
                                         Cumulative_flow =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(0,4)));
                                         total_purchase =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(4,8)));
                                         device_status = ArgA[8];
                                         alarm = ArgA[9];
                                         under_voltage = (device_status >> 2) & 0x01;
                                         valve_status = device_status & 0x03;
                                         hall_failure_alarm = (alarm >> 5) & 0x01;
                                         power_switch_alarm = (alarm >> 4) & 0x01;
                                         magnetic_interf_alarm = (alarm >> 3) & 0x01;
                                         valve_failure_alarm = (alarm >> 2) & 0x01;
                                         reverse_flow_alarm = (alarm >> 1) & 0x01;
                                         battery_level_alarm = alarm & 0x01;
                                         battery_voltage =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(10,12)));
                                         signal_strength = ArgA[12];
                                         signal_to_noise_ratio = ArgA[13];
                                      }
                                      else if(Arg.length == 18){
                                         Cumulative_flow =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(4,8)));
                                         total_purchase =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(8,12)));
                                         device_status = ArgA[12];
                                         alarm = ArgA[13];
                                         under_voltage = (device_status >> 2) & 0x01;
                                         valve_status = device_status & 0x03;
                                         hall_failure_alarm = (alarm >> 5) & 0x01;
                                         power_switch_alarm = (alarm >> 4) & 0x01;
                                         magnetic_interf_alarm = (alarm >> 3) & 0x01;
                                         valve_failure_alarm = (alarm >> 2) & 0x01;
                                         reverse_flow_alarm = (alarm >> 1) & 0x01;
                                         battery_level_alarm = alarm & 0x01;
                                         battery_voltage =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(14,16)));
                                         signal_strength = ArgA[16];
                                         signal_to_noise_ratio = ArgA[17];
                                      }
                                      else if(Arg.length == 22){
                                         Cumulative_flow =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(0,4)));
                                         total_purchase =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(4,8)));
                                         device_status = ArgA[8];
                                         alarm = ArgA[9];
                                         under_voltage = (device_status >> 2) & 0x01;
                                         valve_status = device_status & 0x03;
                                         hall_failure_alarm = (alarm >> 5) & 0x01;
                                         power_switch_alarm = (alarm >> 4) & 0x01;
                                         magnetic_interf_alarm = (alarm >> 3) & 0x01;
                                         valve_failure_alarm = (alarm >> 2) & 0x01;
                                         reverse_flow_alarm = (alarm >> 1) & 0x01;
                                         battery_level_alarm = alarm & 0x01;
                                         battery_voltage =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(10,12)));
                                         signal_strength = ArgA[12];
                                         signal_to_noise_ratio = ArgA[13];
                                      }
                                      else if(Arg.length == 28){
                                         Cumulative_flow =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(0,4)));
                                         total_purchase =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(4,8)));
                                         device_status = ArgA[8];
                                         alarm = ArgA[9];
                                         under_voltage = (device_status >> 2) & 0x01;
                                         valve_status = device_status & 0x03;
                                         hall_failure_alarm = (alarm >> 5) & 0x01;
                                         power_switch_alarm = (alarm >> 4) & 0x01;
                                         magnetic_interf_alarm = (alarm >> 3) & 0x01;
                                         valve_failure_alarm = (alarm >> 2) & 0x01;
                                         reverse_flow_alarm = (alarm >> 1) & 0x01;
                                         battery_level_alarm = alarm & 0x01;
                                         battery_voltage =  OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(10,12)));
                                         signal_strength = ArgA[12];
                                         signal_to_noise_ratio = ArgA[13];
                                      }
            
                                      var myoutdata = {
                                         imei: Imei.toString('hex'),
                                         device: myresp.device,
                                         Cumulative_flow: Cumulative_flow,
                                         total_purchase: total_purchase,
                                         under_voltage: under_voltage,
                                         valve_status: valve_status,
                                         hall_failure_alarm: hall_failure_alarm,
                                         power_switch_alarm: power_switch_alarm,
                                         magnetic_interf_alarm: magnetic_interf_alarm,
                                         valve_failure_alarm: valve_failure_alarm,
                                         reverse_flow_alarm: reverse_flow_alarm,
                                         battery_level_alarm: battery_level_alarm,
                                         battery_voltage:  battery_voltage,
                                         signal_strength: signal_strength,
                                         signal_to_noise_ratio: signal_to_noise_ratio
                                      };
                                      
                                      
                                      console.log(myoutdata,' kike data received 8888888888888888888888')
                                      
                                      sendToSocketio(myoutdata);
            
                                      ConsumptionController.SaveConsumption(myoutdata).then(myresp=>{
                                           AlarmController.SaveAllAlarm(myoutdata).then(myresp=>{
                                               
                                           }).catch(err=>{
                                              console.log(err);
                                           });
                                      }).catch(err=>{
                                          console.log(err);
                                      });
                                       
                                       
                                      if(total_purchase > 0){
                                          if(valve_status == 0x00){
                                            
                                              var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                                              var index = clientList.indexOf(extClient);
        
                                              if(FidA[0] >= 0xff){
                                                  clientList[index].last_fid_sent = 0x01;
                                              }
                                              else{
                                                  clientList[index].last_fid_sent = (FidA[0] + 1);
                                              }
        
                                              console.log("22222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222");
                                              var outdata = [SVALVE];
                                              outdata = outdata.concat([0x99]);
                                              outdata = outdata.concat([myresp.last_fid_sent]);
                                              sendDataToDevice(Buffer(outdata),myresp.client).then(myresp=>{
                                                  console.log(new Buffer(outdata));
                                              }).catch(err=>{
                                                console.log(err);
                                              });
                                              
                                          }
                                      
                                      }
                                       
                                   }
                               
                              
                           }).catch(err=>{
                             console.log(err);
                           });
                           
                           
                           
        
                    }).catch(err=>{
                       console.log(err);
                    });
                    
                 }
                 else if(PHAF === CmdA[0]){

                    var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                    };
                     
                    saveDeviceClient(mydata).then(myresp=>{
                         var reporting_Period = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA));
                         var message = {
                            title:'phar',
                            body: reporting_Period,
                            event: 'reporting_period',
                            device: JSON.stringify(myresp.device)
                         };

                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                     }).catch(err=>{
                         console.log(err);
                     });
                    
                 }
                 else if(PPERID === CmdA[0]){
        
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
                     
        
                     saveDeviceClient(mydata).then(myresp=>{
                         var reporting_Period = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA));
                         var message = {
                            imei: Imei.toString('hex'),
                            title:'Reporting Period',
                            body: reporting_Period,
                            event: 'reporting_period',
                            device: JSON.stringify(myresp.device)
                         };

                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         sendToSocketio(message);
        
                     }).catch(err=>{
                         console.log(err);
                     });
        
                       
                 }
                 else if(PPTIME === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
                     
                     
        
                     saveDeviceClient(mydata).then(myresp=>{
                         var PP_hour = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA[0]));
                         var PP_minute = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA[1]));
                         var message = {
                            imei: Imei.toString('hex'),
                            title:'Reporting time',
                            body: `${PP_hour}:${PP_minute}`,
                            event: 'reporting_time',
                            device: JSON.stringify(myresp.device)
                         };

                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         sendToSocketio(message);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PBAT === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
                     
                     saveDeviceClient(mydata).then(myresp=>{
                         var under_voltage = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(1,3)));
                         var non_under_voltage = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA.slice(3,5)));
                         var message = {
                            imei: Imei.toString('hex'),
                            title:'Battery setting',
                            body: {under_voltage:under_voltage,non_under_voltage:non_under_voltage},
                            event: 'battery_setting',
                            device: JSON.stringify(myresp.device)
                         };

                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         sendToSocketio(message);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PDEVS === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
        
                     saveDeviceClient(mydata).then(myresp=>{
                         var device_status = ArgA[0];
                         var gps_pos_alarm = (device_status >> 4) & 0x01;
                         var battery_undervoltage = (device_status >> 2) & 0x01;
                         var valve = (device_status >> 1) & 0x03;
        
                         var mydevicestatus = {
                            event: 'kike_status',
                            imei: Imei.toString('hex'),
                            conInfo: rinfo,
                            device: myresp.device,
                            gps_pos_alarm: gps_pos_alarm,
                            battery_undervoltage: battery_undervoltage,
                            valve: valve
                         };

                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         AlarmController.SaveAllAlarm(mydevicestatus);
                         sendToSocketio(mydevicestatus);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PALERT === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
                     
                     saveDeviceClient(mydata).then(myresp=>{
                         var alarm = ArgA[0];
                         var hall_failure_alarm = (alarm >> 5) & 0x01;
                         var power_switch_alarm = (alarm >> 4) & 0x01;
                         var magnetic_interf_alarm = (alarm >> 3) & 0x01;
                         var valve_failure_alarm = (alarm >> 2) & 0x01;
                         var reverse_flow_alarm = (alarm >> 1) & 0x01;
                         var battery_level_alarm = alarm & 0x01;
        
                         var mydevicealarm = {
                            event: 'kike_alert',
                            imei: Imei.toString('hex'),
                            conInfo: rinfo,
                            device: myresp.device,
                            hall_failure_alarm: hall_failure_alarm,
                            power_switch_alarm: power_switch_alarm,
                            magnetic_interf_alarm: magnetic_interf_alarm,
                            valve_failure_alarm: valve_failure_alarm,
                            reverse_flow_alarm: reverse_flow_alarm,
                            battery_level_alarm: battery_level_alarm
                         };

                          var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         AlarmController.SaveAllAlarm(mydevicealarm);
                         sendToSocketio(mydevicealarm);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PFWVER === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
        
                     saveDeviceClient(mydata).then(myresp=>{
                         var firmware_version = Arg.toString();
                         var message = {
                            imei: Imei.toString('hex'),
                            title:'Firmware Version',
                            body: firmware_version,
                            event: 'firmware_version',
                            device: JSON.stringify(myresp.device)
                         };

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         sendToSocketio(message);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PTEMP === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
                     
                     saveDeviceClient(mydata).then(myresp=>{
                         var temperature = OmejeBuffer.arrayToSingleNum(OmejeBuffer.toLittleEndian(ArgA));
                         var message = {
                            imei: Imei.toString('hex'),
                            title:'Lpg Temperature',
                            body: temperature,
                            event: 'lpg_temperature',
                            device: JSON.stringify(myresp.device)
                         };


                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         sendToSocketio(message);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PNOWTIME === CmdA[0]){
                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
        
                     saveDeviceClient(mydata).then(myresp=>{
                         var my_year = `20${ArgA[0]}`;
                         var my_month = ArgA[1];
                         var my_day = ArgA[2];
                         var my_hour = ArgA[3];
                         var my_minute = ArgA[4];
                         var my_seconds = ArgA[5];
                         var fulltime = my_year+'-'+my_month+'-'+my_day+' '+my_hour+':'+my_minute+':'+my_seconds;
                         var message = {
                            imei: Imei.toString('hex'),
                            title:'Lpg time',
                            body: fulltime,
                            event: 'lpg_time',
                            device: JSON.stringify(myresp.device)
                         };

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
        
                         sendToSocketio(message);
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(SBAL === CmdA[0]){

                      var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                      };

                      saveDeviceClient(mydata).then(myresp=>{

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }

                          KikeController.confirmRecharge({
                              imei: Imei.toString('hex')
                          }).then(()=>{
                              
                              var message = {
                                imei: Imei.toString('hex'),
                                title:'recharge kike time',
                                event: 'successful_recharge',
                                device: JSON.stringify(myresp.device)
                              };
                              sendToSocketio(message);
                              
                          }).catch(err=>{
                             console.log(err);
                          });
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                     
                      
                      
                 }
                 
                 else if(SVALVE === CmdA[0]){

                      var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                      };

                      saveDeviceClient(mydata).then(myresp=>{

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }

                          KikeController.confirmControl({
                              imei: Imei.toString('hex')
                          }).then(()=>{
                              
                              var message = {
                                imei: Imei.toString('hex'),
                                title:'control valve',
                                event: 'kike_valve_control',
                                device: JSON.stringify(myresp.device)
                              };
                              sendToSocketio(message);
                              
                          }).catch(err=>{
                             console.log(err);
                          });
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                      
                      
                 }
                 else if(PPRESS === CmdA[0]){

                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };

                     saveDeviceClient(mydata).then(myresp=>{

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PCFG === CmdA[0]){
                    var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                    };

                    saveDeviceClient(mydata).then(myresp=>{

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
                         
                     }).catch(err=>{
                         console.log(err);
                     });
                 }
                 else if(PREMOTE === CmdA[0]){
                    
                    var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                    };

                    saveDeviceClient(mydata).then(myresp=>{

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
                         
                     }).catch(err=>{
                         console.log(err);
                     });
        
                 }
                 else if(PCV === CmdA[0]){

                     var mydata = {
                        imei: Imei.toString('hex'),
                        conInfo: rinfo
                     };
                     
                     saveDeviceClient(mydata).then(myresp=>{

                         var extClient = clientList.find(x=>x.imei == Imei.toString('hex'));
                          var index = clientList.indexOf(extClient);

                          if(FidA[0] >= 0xff){
                              clientList[index].last_fid_sent = 0x01;
                          }
                          else{
                              clientList[index].last_fid_sent = (FidA[0] + 1);
                          }
                         
                     }).catch(err=>{
                         console.log(err);
                     });
        
                 }
             
         }
     }
     


});







server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind({
    port:process.env.KIKE_PORT,
    address:process.env.SERVER_IP
});