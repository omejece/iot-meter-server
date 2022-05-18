require('dotenv').config();
var net = require('net');
var io = require('socket.io-client');

var omejeBuffer = require('./my_plugin/OmejeBuffer');
var PrepaidMeterController = require('./controllers/prepaid_meter/PrepaidMeterController');
var DeviceController = require('./controllers/DeviceController');

var bcrypt = require('bcrypt-nodejs');

/*Meter commands*/
  var linkIntDetectection = 0x90; // interface detection Link 
  var readData = 0x11; //Read data
  var readDataResponse = 0xB1;
  var readFData = 0x15; // Read follow-up data(for electricity)
  var deviceControl = 0x12; // device control
  var resetControl = 0x13; // Reset control
  var writeData = 0x14; // write data
  var changePassword = 0x18; //change password
  var activeUplinkReport = 0x9C; // active uplink report
  var readHoldingData = 0x91;
  var transParentTran = 0x1E; // transparent transmission
  var remoteUpgrade = 0x1F; // system remote upgrade
  var normalRelayControlResp = 0x92;
  var frontEndMeterEnable = 0x82;
  var frontEndMeterDisable = 0x83;
  var frontEndOffMeter = 0x84;
  var frontEndOnnMeter = 0x85;
/*End Meter commands*/




var myActiveMeters = [];







var server = net.createServer(function(connection) {

      connection.setKeepAlive(true);
      
        

      console.log("new connection seen");
      
      connection.on('end', function() {
          console.log("connection ended");
          var activeMeter = myActiveMeters.find(x=>x.connection == connection);
          if(activeMeter){
              myActiveMeters.splice(myActiveMeters.indexOf(activeMeter),1);
              console.log('Deleting exited devices');
          }

      });
      


      connection.on('connect_error',function(error){
          console.log(error,' 3333333333333333333333333333333333333333333');
      });


      connection.on('data', function(data) {
           
            var tData = new Buffer(data);
            console.log(tData);
            
            var soi = tData.slice(0,1); // extract the start frame
            var soiA = omejeBuffer.toArray(soi);
            if(tData.length >= 14 && soiA[0] == 0x5a){
               // extract packet head
                var pvar = tData.slice(1,2); // extract protocol version
                var pvarA = omejeBuffer.toArray(pvar); // extract protocol version
                var addr = tData.slice(2,7); // extract address field
                var addrA = omejeBuffer.toArray(addr); // extract address field array
                var deviceType = tData.slice(7,8); // extract device type
                var drviceTypeA = omejeBuffer.toArray(deviceType);
                var command = tData.slice(8,9); // extract command
                var infoLength = tData.slice(9,11); // extract packet length
            
                var infoLengthA = omejeBuffer.toArray(infoLength); // convert the packet information length to array
                var infoLengthN = (infoLengthA[1] << 8) | infoLengthA[0]; // combine the packet length to form a 16 bit integer
                var infoLastIndex = infoLengthN + 11;
                var information = tData.slice(11,infoLastIndex); // get the information

                var crcData = tData.slice(1,infoLastIndex); // get the information

                var crcLastIndex = infoLastIndex + 2;
                var checkSum = tData.slice(infoLastIndex,crcLastIndex);
                var eodLastIndex = crcLastIndex + 1;
                var endOfPacket = tData.slice(crcLastIndex,eodLastIndex);

                console.log(soi,' start frame');

                console.log(pvar,' protocol version');
                 
                console.log(addr,' address field');

                console.log(deviceType,' device type');

                console.log(command,' packet command');

                console.log(infoLengthN,' information length');
                 
                //console.log(information,' information ');

                console.log(checkSum,' checkSum ');

                

                console.log(endOfPacket,' endOfPacket');
                
                var commandN = omejeBuffer.toArray(command)[0]; // convert command to a number
                
                console.log(commandN.toString(16), ' seen command');

                var checkSumA = omejeBuffer.toArray(checkSum);
                var calcCheckSum = omejeBuffer.Lrc(crcData); // calculate the data checksum
                var calcCheckSumA = [calcCheckSum & 0xff,calcCheckSum >> 8];
                
                if( (checkSumA[0] == calcCheckSumA[0]) && (checkSumA[1] == calcCheckSumA[1]) ){
                    console.log('check sum okay');

                    if(commandN == readHoldingData){
                            console.log('  ############################################################################################################## ');
                            console.log(tData,' Received data');
                            console.log(information, '  readHoldingData');
                            console.log('  ############################################################################################################## ');
                            
                            
                            var activeMeter = myActiveMeters.find(x=>x.connection == connection);
                            
                            var voltagea = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(11,13))));
                            var voltageaN = (parseFloat(voltagea.toString('hex'))/10);

                            var voltageb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(13,15))));
                            var voltagebN = (parseFloat(voltageb.toString('hex'))/10);
                         
                            var voltagec = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(15,17))));
                            var voltagecN = (parseFloat(voltagec.toString('hex'))/10);

                            var frequency = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(17,19))));
                            var frequencyN = (parseFloat(frequency.toString('hex'))/100);
                            
                            var currenta = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(19,22))));
                            var currentaN = (parseFloat(currenta.toString('hex'))/100);

                            var currentb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(22,25))));
                            var currentbN = (parseFloat(currentb.toString('hex'))/100);

                            var currentc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(25,28))));
                            var currentcN = (parseFloat(currentc.toString('hex'))/100);
                            
                            
                            var totalPowerFactor = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(28,30))));
                            var totalPowerFactorN = (parseFloat(totalPowerFactor.toString('hex'))/1000);

                            var powerFactora = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(30,32))));
                            var powerFactoraN = (parseFloat(powerFactora.toString('hex'))/1000);

                            var powerFactorb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(32,34))));
                            var powerFactorbN = (parseFloat(powerFactorb.toString('hex'))/1000);

                            var powerFactorc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(34,36))));
                            var powerFactorcN = (parseFloat(powerFactorc.toString('hex'))/1000);
                            
                            
                            var totalActivePower = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(36,39))));
                            var totalActivePowerN = (parseFloat(totalActivePower.toString('hex'))/1000);

                            var activePowera = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(39,42))));
                            var activePoweraN = (parseFloat(activePowera.toString('hex'))/1000);

                            var activePowerb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(42,45))));
                            var activePowerbN = (parseFloat(activePowerb.toString('hex'))/1000);

                            var activePowerc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(45,48))));
                            var activePowercN = (parseFloat(activePowerc.toString('hex'))/1000);
                            
                            
                            var totalReactivePower = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(48,51))));
                            var totalReactivePowerN = (parseFloat(totalReactivePower.toString('hex'))/1000);

                            var reactivePowera = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(51,54))));
                            var reactivePoweraN = (parseFloat(reactivePowera.toString('hex'))/1000);

                            var reactivePowerb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(54,57))));
                            var reactivePowerbN = (parseFloat(reactivePowerb.toString('hex'))/1000);

                            var reactivePowerc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(57,60))));
                            var reactivePowercN = (parseFloat(reactivePowerc.toString('hex'))/1000);
                            
                            
                            var cActiveEnergyTotal = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(60,64))));
                            
                            console.log(cActiveEnergyTotal," active energy in hex");
                            var cActiveEnergyTotalN = (parseFloat(cActiveEnergyTotal.toString('hex'))/100);

                            var cActiveEnergyTop = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(64,68))));
                            var cActiveEnergyTopN = (parseFloat(cActiveEnergyTop.toString('hex'))/100);

                            var cActiveEnergyPeak = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(68,72))));
                            var cActiveEnergyPeakN = (parseFloat(cActiveEnergyPeak.toString('hex'))/100);

                            var cActiveEnergyFlat = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(72,76))));
                            var cActiveEnergyFlatN = (parseFloat(cActiveEnergyFlat.toString('hex'))/100);

                            var cActiveEnergyBottom = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(76,80))));
                            var cActiveEnergyBottomN = (parseFloat(cActiveEnergyBottom.toString('hex'))/100);
                            
                            
                            
                        
                    }
                    
                    else if(commandN == linkIntDetectection){
                        console.log('linkIntDetectection readData response just came in now ###############################################');
                    }
                    else if(commandN == readDataResponse){
                        console.log('readData response just came in now ###############################################');
                    }
                    else if(commandN == readFData){
                        console.log('readFData');
                    }
                    else if(commandN == deviceControl){
                        console.log('deviceControl');
                    }
                    else if(commandN == resetControl){
                        console.log('resetControl');
                    }
                    else if(commandN == writeData){
                        console.log('writeData');
                    }
                    else if(commandN == changePassword){
                        console.log('changePassword');
                    }
                    else if(commandN == normalRelayControlResp){
                        console.log(normalRelayControlResp);
                        console.log(addr.toString('hex'),'meter address');
                        var activeMeter = myActiveMeters.find(x=>x.meteraddress == addr.toString('hex'));// get the meter with the connection object
                        
                        console.log('ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd');
                        if(activeMeter){
                            
                             PrepaidMeterController.ConfirmMeterControl({
                                 imei: activeMeter.imei
                             }).then(mymeter=>{
                                 console.log('gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg');
                                 sendToSocketio({event:'metercontrol',data:mymeter}).then(()=>{ // send meter update to the front end
                                     console.log('Sent to socket');
                                 })
                             })
                        }
                    }
                    else if(commandN == activeUplinkReport){
                        console.log('activeUplinkReport');
                        var fcode = omejeBuffer.toArray(information.slice(0,1));
                        
                        if(fcode[0] == 0x01){
                            console.log("report fault seen");
                        }
                        else if(fcode[0] == 0x02){
                            console.log("report fault seen");
                        }
                        else if(fcode[0] == 0x03){
                            console.log("meter okay");
                            
                            console.log(information, '  information data');
                            
                            var meterNo = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(information.slice(1,7))));
                            var meterNoS = meterNo.toString('hex');

                            var meterData = information.slice(7,76);
                            var voltagea = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(0,2))));
                            var voltageaN = (parseFloat(voltagea.toString('hex'))/10);

                            var voltageb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(2,4))));
                            var voltagebN = (parseFloat(voltageb.toString('hex'))/10);

                            var voltagec = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(4,6))));
                            var voltagecN = (parseFloat(voltagec.toString('hex'))/10);

                            var frequency = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(6,8))));
                            var frequencyN = (parseFloat(frequency.toString('hex'))/100);


                            var currenta = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(8,11))));
                            var currentaN = (parseFloat(currenta.toString('hex'))/1000);

                            var currentb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(11,14))));
                            var currentbN = (parseFloat(currentb.toString('hex'))/1000);
                            

                            var currentc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(14,17))));
                            var currentcN = (parseFloat(currentc.toString('hex'))/1000);

                            var totalPowerFactor = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(17,19))));
                            var totalPowerFactorN = (parseFloat(totalPowerFactor.toString('hex'))/1000);

                            var powerFactora = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(19,21))));
                            var powerFactoraN = (parseFloat(powerFactora.toString('hex'))/1000);

                            var powerFactorb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(21,23))));
                            var powerFactorbN = (parseFloat(powerFactorb.toString('hex'))/1000);

                            var powerFactorc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(23,25))));
                            var powerFactorcN = (parseFloat(powerFactorc.toString('hex'))/1000);


                            var totalActivePower = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(25,28))));
                            var totalActivePowerN = (parseFloat(totalActivePower.toString('hex'))/100000);

                            var activePowera = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(28,31))));
                            var activePoweraN = (parseFloat(activePowera.toString('hex'))/10000);

                            var activePowerb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(31,34))));
                            var activePowerbN = (parseFloat(activePowerb.toString('hex'))/10000);

                            var activePowerc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(34,37))));
                            var activePowercN = (parseFloat(activePowerc.toString('hex'))/1000);


                            var totalReactivePower = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(37,40))));
                            var totalReactivePowerN = (parseFloat(totalReactivePower.toString('hex'))/10000);

                            var reactivePowera = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(40,43))));
                            var reactivePoweraN = (parseFloat(reactivePowera.toString('hex'))/10000);

                            var reactivePowerb = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(43,46))));
                            var reactivePowerbN = (parseFloat(reactivePowerb.toString('hex'))/10000);

                            var reactivePowerc = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(46,49))));
                            var reactivePowercN = (parseFloat(reactivePowerc.toString('hex'))/10000);

                            // combined active energy
                            var cActiveEnergyTotal = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(49,53))));
                            
                            console.log(cActiveEnergyTotal," active energy in hex");
                            var cActiveEnergyTotalN = (parseFloat(cActiveEnergyTotal.toString('hex'))/100);

                            var cActiveEnergyTop = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(53,57))));
                            var cActiveEnergyTopN = (parseFloat(cActiveEnergyTop.toString('hex'))/100);

                            var cActiveEnergyPeak = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(57,61))));
                            var cActiveEnergyPeakN = (parseFloat(cActiveEnergyPeak.toString('hex'))/100);

                            var cActiveEnergyFlat = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(61,65))));
                            var cActiveEnergyFlatN = (parseFloat(cActiveEnergyFlat.toString('hex'))/100);

                            var cActiveEnergyBottom = new Buffer(omejeBuffer.toBigEndian(omejeBuffer.toArray(meterData.slice(65,69))));
                            var cActiveEnergyBottomN = (parseFloat(cActiveEnergyBottom.toString('hex'))/100);

                            var softVers = information.slice(76,108);

                            var upgradeR = information.slice(108,109);

                            var moduleTime = information.slice(109,112);

                            var simCardIccd = information.slice(112,142);

                            var signalStrength = information.slice(142,143);

                            var reserve = information.slice(143,183);

                            var meterdata = {
                               imei: meterNoS,
                               softwareVersion: softVers.toString().split('\0')[0],
                               simcardIccd: simCardIccd.toString().split('\0')[0],
                            };
                            
                            
                            
                            console.log("About to login");
                            PrepaidMeterController.loginMeter(meterdata).then(mymeter=>{
                                 console.log("Meter logged in");
                                 var activeMeter = myActiveMeters.find(x=>x.imei == meterdata.imei);
                                 if(activeMeter){
                                    myActiveMeters.splice(myActiveMeters.indexOf(activeMeter),1);
                                 }

                                 myActiveMeters.push({
                                    imei: meterdata.imei,
                                    address: addrA,
                                    meteraddress: addr.toString('hex'),
                                    pvar: pvarA,
                                    type: drviceTypeA,
                                    connection: connection
                                 });
                                 
                                 
                                 activeMeter = myActiveMeters.find(x=>x.imei == meterdata.imei);
                                 
                                 var meterDataObject = {
                                   imei: activeMeter.imei,
                                   voltagea: voltageaN,
                                   voltageb: voltagebN,
                                   voltagec: voltagecN,
                                   frequency: frequencyN,
                                   currenta: currentaN,
                                   currentb: currentbN,
                                   currentc: currentcN,
                                   totalPowerFactor: totalPowerFactorN,
                                   powerFactora: powerFactoraN,
                                   powerFactorb: powerFactorbN,
                                   powerFactorc: powerFactorcN,
                                   totalActivePower: totalActivePowerN,
                                   activePowera: activePoweraN,
                                   activePowerb: activePowerbN,
                                   activePowerc: activePowercN,
                                   totalReactivePower: totalReactivePowerN,
                                   reactivePowera: reactivePoweraN,
                                   reactivePowerb: reactivePowerbN,
                                   reactivePowerc: reactivePowerbN,
                                   cummulativeActiveTotalEnergy: cActiveEnergyTotalN,
                                   cummulativeTopEnergy: cActiveEnergyTopN,
                                   cummulativePeakEnergy: cActiveEnergyPeakN,
                                   cummulativeFlatEnergy: cActiveEnergyFlatN,
                                   cummulativeBottomEnergy: cActiveEnergyBottomN
                                };
                                
                                
                                
                                PrepaidMeterController.SaveMeterData(meterDataObject).then(myMeter=>{
                                     console.log("saving meter data");
                                     sendToSocketio({event:'meterupdate',data:myMeter}).then(()=>{ // send meter update to the front end
                                         console.log('Sent to socket');
                                     })
                                     console.log("sending to socket");
                                     
                                     var myMeterData = JSON.parse(myMeter.data);
                                     var myMeterFlags = JSON.parse(myMeter.flags);
    
                                     if(myMeterFlags.is_disabled == 1){
                                             
                                             var msoi = [0x5a];
                                             var mpvar = activeMeter.pvar;
                                             var maddress = activeMeter.address;
                                             var mtype = activeMeter.type;
                                             var mcommand = [0x12];
                                             var mlength = [0x07,0x00];
                                             var mfcode = [0x04];
                                             var password = [0x02,0x12,0x34,0x56];
                                             var sn = [1];
                                             var state = [parseInt(myMeterData.disabled)];
                                             var myCrCMainData = mpvar;
                                             myCrCMainData = myCrCMainData.concat(maddress);
                                             myCrCMainData = myCrCMainData.concat(mtype);
                                             myCrCMainData = myCrCMainData.concat(mcommand);
                                             myCrCMainData = myCrCMainData.concat(mlength);
                                             myCrCMainData = myCrCMainData.concat(mfcode);
                                             myCrCMainData = myCrCMainData.concat(password);
                                             myCrCMainData = myCrCMainData.concat(sn);
                                             myCrCMainData = myCrCMainData.concat(state);
        
                                             var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                             var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                             var meod = [0x0d];
        
                                             var outData = msoi;
                                             outData = outData.concat(myCrCMainData);
                                             outData = outData.concat(calcrcA);
                                             outData = outData.concat(meod);
                                             var bufferOut = Buffer.from(outData);
                                             console.log(bufferOut,' control data to meter');
                                             connection.write(bufferOut);
                                         
                                     }
                                     else{
                                         if(myMeterData.disabled == 0){
                                             
                                              if(myMeterFlags.is_control == 1){
                                                     console.log('new meter control command');
                                                     var msoi = [0x5a];
                                                     var mpvar = activeMeter.pvar;
                                                     var maddress = activeMeter.address;
                                                     var mtype = activeMeter.type;
                                                     var mcommand = [0x12];
                                                     var mlength = [0x07,0x00];
                                                     var mfcode = [0x04];
                                                     var password = [0x02,0x12,0x34,0x56];
                                                     var sn = [1];
                                                     var state = [myMeterData.control];
                                                     var myCrCMainData = mpvar;
                                                     myCrCMainData = myCrCMainData.concat(maddress);
                                                     myCrCMainData = myCrCMainData.concat(mtype);
                                                     myCrCMainData = myCrCMainData.concat(mcommand);
                                                     myCrCMainData = myCrCMainData.concat(mlength);
                                                     myCrCMainData = myCrCMainData.concat(mfcode);
                                                     myCrCMainData = myCrCMainData.concat(password);
                                                     myCrCMainData = myCrCMainData.concat(sn);
                                                     myCrCMainData = myCrCMainData.concat(state);
                
                                                     var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                                     var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                                     var meod = [0x0d];
                
                                                     var outData = msoi;
                                                     outData = outData.concat(myCrCMainData);
                                                     outData = outData.concat(calcrcA);
                                                     outData = outData.concat(meod);
                                                     var bufferOut = Buffer.from(outData);
                                                     console.log(bufferOut,' control data to meter');
                                                     connection.write(bufferOut);
                                                    
                                              }
                                                
                                              if(myMeterData.billing_type == 1){
                                                  
                                                   if(myMeterData.available_unit > 0){
                                                        if(myMeterData.output == 1){
                                                             PrepaidMeterController.ControlMeter({
                                                                 imei:meterDataObject.imei,
                                                                 control: 0
                                                             }).then(()=>{
                                                       
                                                                     var msoi = [0x5a];
                                                                     var mpvar = activeMeter.pvar;
                                                                     var maddress = activeMeter.address;
                                                                     var mtype = activeMeter.type;
                                                                     var mcommand = [0x12];
                                                                     var mlength = [0x07,0x00];
                                                                     var mfcode = [0x04];
                                                                     var password = [0x02,0x12,0x34,0x56];
                                                                     var sn = [1];
                                                                     var state = [0x00];
                                                                     var myCrCMainData = mpvar;
                                                                     myCrCMainData = myCrCMainData.concat(maddress);
                                                                     myCrCMainData = myCrCMainData.concat(mtype);
                                                                     myCrCMainData = myCrCMainData.concat(mcommand);
                                                                     myCrCMainData = myCrCMainData.concat(mlength);
                                                                     myCrCMainData = myCrCMainData.concat(mfcode);
                                                                     myCrCMainData = myCrCMainData.concat(password);
                                                                     myCrCMainData = myCrCMainData.concat(sn);
                                                                     myCrCMainData = myCrCMainData.concat(state);
                                
                                                                     var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                                                     var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                                                     var meod = [0x0d];
                                
                                                                     var outData = msoi;
                                                                     outData = outData.concat(myCrCMainData);
                                                                     outData = outData.concat(calcrcA);
                                                                     outData = outData.concat(meod);
                                                                     var bufferOut = Buffer.from(outData);
                                                                     console.log(bufferOut,' control data to meter');
                                                                     connection.write(bufferOut);
                                                                  
                                                              }).catch(err=>{
                                                                   consol.log(err);
                                                               })
                                                             
                                                        }
                                                     }
                                                     else{
                                                         if(myMeterData.output == 0){
                                                             PrepaidMeterController.ControlMeter({
                                                                 meterno:meterDataObject.meterno,
                                                                 control: 1
                                                             }).then(()=>{
                                                       
                                                                     var msoi = [0x5a];
                                                                     var mpvar = activeMeter.pvar;
                                                                     var maddress = activeMeter.address;
                                                                     var mtype = activeMeter.type;
                                                                     var mcommand = [0x12];
                                                                     var mlength = [0x07,0x00];
                                                                     var mfcode = [0x04];
                                                                     var password = [0x02,0x12,0x34,0x56];
                                                                     var sn = [1];
                                                                     var state = [0x01];
                                                                     var myCrCMainData = mpvar;
                                                                     myCrCMainData = myCrCMainData.concat(maddress);
                                                                     myCrCMainData = myCrCMainData.concat(mtype);
                                                                     myCrCMainData = myCrCMainData.concat(mcommand);
                                                                     myCrCMainData = myCrCMainData.concat(mlength);
                                                                     myCrCMainData = myCrCMainData.concat(mfcode);
                                                                     myCrCMainData = myCrCMainData.concat(password);
                                                                     myCrCMainData = myCrCMainData.concat(sn);
                                                                     myCrCMainData = myCrCMainData.concat(state);
                                
                                                                     var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                                                     var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                                                     var meod = [0x0d];
                                
                                                                     var outData = msoi;
                                                                     outData = outData.concat(myCrCMainData);
                                                                     outData = outData.concat(calcrcA);
                                                                     outData = outData.concat(meod);
                                                                     var bufferOut = Buffer.from(outData);
                                                                     console.log(bufferOut,' control data to meter');
                                                                     connection.write(bufferOut);
                                                                  
                                                              }).catch(err=>{
                                                                  consol.log(err);
                                                              })
                                                         }
                                                     }
                                                   
                                              }
                                         }
                                         else{
                                             
                                             
    
                                             
    
                                         }
                                     }
    
    
                                     
                                }).catch(err=>{
                                    console.log(err);
                                })
                                
                                console.log(frequencyN, " Frequency");
                                console.log(voltageaN, " voltagea");
                                console.log(currentaN, " currentaN");
                                console.log(totalPowerFactorN, " totalPowerFactorN");
                                console.log(totalActivePowerN, " totalActivePower");
                                console.log(totalActivePower, " totalActivePower");
                                
                                console.log(totalReactivePowerN, " totalReactivePowerN");
                                console.log(totalReactivePowerN, " totalReactivePowerN");
                                console.log(cActiveEnergyTotalN, " cActiveEnergyTotalN");
                                
                                console.log(cActiveEnergyTotal, " cActiveEnergyTotal");
                                 
                                 
                            }).catch(err=>{
                                console.log(err);
                            })
                            


                        }

                    }
                    
                }
                else{
                   
                }


            }
            else{
                if(tData.length >= 14 && soiA[0] == 0x6a){
                    
                   console.log('front end data');
                    
                   var command = omejeBuffer.toArray(tData.slice(1,2))[0];
                   var infoLength = omejeBuffer.toArray(tData.slice(2,3))[0];
                   
                   if(command == frontEndMeterEnable){
                       console.log('enabling meter');
                       var infoendIndex = parseInt(infoLength) + 3; 
                       var meterno = tData.slice(3,infoendIndex);
                       var meternoS = meterno.toString();
                       PrepaidMeterController.meterDetail({
                             imei: meternoS
                       }).then(mymeter=>{
                           var activeMeter = myActiveMeters.find(x=>x.meterno == meternoS);
                           console.log(meternoS, '  hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
                           var myMeterData = JSON.parse(mymeter.data);
                           if(activeMeter){
                               
                                 var msoi = [0x5a];
                                 var mpvar = activeMeter.pvar;
                                 var maddress = activeMeter.address;
                                 var mtype = activeMeter.type;
                                 var mcommand = [0x12];
                                 var mlength = [0x07,0x00];
                                 var mfcode = [0x04];
                                 var password = [0x02,0x12,0x34,0x56];
                                 var sn = [1];
                                 var state = [0x00];
                                 var myCrCMainData = mpvar;
                                 myCrCMainData = myCrCMainData.concat(maddress);
                                 myCrCMainData = myCrCMainData.concat(mtype);
                                 myCrCMainData = myCrCMainData.concat(mcommand);
                                 myCrCMainData = myCrCMainData.concat(mlength);
                                 myCrCMainData = myCrCMainData.concat(mfcode);
                                 myCrCMainData = myCrCMainData.concat(password);
                                 myCrCMainData = myCrCMainData.concat(sn);
                                 myCrCMainData = myCrCMainData.concat(state);

                                 var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                 var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                 var meod = [0x0d];

                                 var outData = msoi;
                                 outData = outData.concat(myCrCMainData);
                                 outData = outData.concat(calcrcA);
                                 outData = outData.concat(meod);
                                 var bufferOut = Buffer.from(outData);
                                 console.log(bufferOut,' control data to meter');
                                 activeMeter.connection.write(bufferOut);
                           }
                       }).catch(err=>{
                           consol.log(err);
                       })
                   }
                   else if(command == frontEndMeterDisable){
                       var infoendIndex = parseInt(infoLength) + 3; 
                       var meterno = tData.slice(3,infoendIndex);
                       var meternoS = meterno.toString();
                       console.log('disabling meter ',meternoS);
                       PrepaidMeterController.meterDetail({
                          imei: meternoS
                       }).then(mymeter=>{
                           console.log('found meter ',meternoS);
                           var myMeterData = JSON.parse(mymeter.data);
                           if(myMeterData.disabled == 0){
                               var activeMeter = myActiveMeters.find(x=>x.meterno == meternoS);
                               console.log(activeMeter, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
                               if(activeMeter){
                                     var msoi = [0x5a];
                                     var mpvar = activeMeter.pvar;
                                     var maddress = activeMeter.address;
                                     var mtype = activeMeter.type;
                                     var mcommand = [0x12];
                                     var mlength = [0x07,0x00];
                                     var mfcode = [0x04];
                                     var password = [0x02,0x12,0x34,0x56];
                                     var sn = [1];
                                     var state = [0x01];
                                     var myCrCMainData = mpvar;
                                     myCrCMainData = myCrCMainData.concat(maddress);
                                     myCrCMainData = myCrCMainData.concat(mtype);
                                     myCrCMainData = myCrCMainData.concat(mcommand);
                                     myCrCMainData = myCrCMainData.concat(mlength);
                                     myCrCMainData = myCrCMainData.concat(mfcode);
                                     myCrCMainData = myCrCMainData.concat(password);
                                     myCrCMainData = myCrCMainData.concat(sn);
                                     myCrCMainData = myCrCMainData.concat(state);
    
                                     var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                     var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                     var meod = [0x0d];
    
                                     var outData = msoi;
                                     outData = outData.concat(myCrCMainData);
                                     outData = outData.concat(calcrcA);
                                     outData = outData.concat(meod);
                                     var bufferOut = Buffer.from(outData);
                                     console.log(bufferOut,' control data to meter');
                                     activeMeter.connection.write(bufferOut);
                               }
                           }
                           
                       }).catch(err=>{
                           consol.log(err);
                       })
                   }
                   else if(command == frontEndOffMeter){
                       console.log("Front end off command jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
                       var infoendIndex = parseInt(infoLength) + 3; 
                       var meterno = tData.slice(3,infoendIndex);
                       var meternoS = meterno.toString();
                       console.log('turning off meter ');
                       console.log(meternoS,' gggggggggggggggggggghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
                       PrepaidMeterController.meterDetail({
                          imei: meternoS
                       }).then(mymeter=>{
                           console.log('found meter ',meternoS);
                           var activeMeter = myActiveMeters.find(x=>x.meterno == meternoS);

                           var myMeterData = JSON.parse(mymeter.data);
                           
                           if(myMeterData.disabled == 0){
                               console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
                               if(activeMeter){
                                     var msoi = [0x5a];
                                     var mpvar = activeMeter.pvar;
                                     var maddress = activeMeter.address;
                                     var mtype = activeMeter.type;
                                     var mcommand = [0x12];
                                     var mlength = [0x07,0x00];
                                     var mfcode = [0x04];
                                     var password = [0x02,0x12,0x34,0x56];
                                     var sn = [1];
                                     var state = [0x01];
                                     var myCrCMainData = mpvar;
                                     myCrCMainData = myCrCMainData.concat(maddress);
                                     myCrCMainData = myCrCMainData.concat(mtype);
                                     myCrCMainData = myCrCMainData.concat(mcommand);
                                     myCrCMainData = myCrCMainData.concat(mlength);
                                     myCrCMainData = myCrCMainData.concat(mfcode);
                                     myCrCMainData = myCrCMainData.concat(password);
                                     myCrCMainData = myCrCMainData.concat(sn);
                                     myCrCMainData = myCrCMainData.concat(state);
    
                                     var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                     var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                     var meod = [0x0d];
    
                                     var outData = msoi;
                                     outData = outData.concat(myCrCMainData);
                                     outData = outData.concat(calcrcA);
                                     outData = outData.concat(meod);
                                     var bufferOut = Buffer.from(outData);
                                     console.log(bufferOut,' control data to meter');
                                     activeMeter.connection.write(bufferOut);
                               }
                           }
                           
                       }).catch(err=>{
                           consol.log(err);
                       })
                   }
                   else if(command == frontEndOnnMeter){
                       console.log("Front end command jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
                       var infoendIndex = parseInt(infoLength) + 3; 
                       var meterno = tData.slice(3,infoendIndex);
                       var meternoS = meterno.toString();
                       console.log('onn meter ',meternoS);
                       PrepaidMeterController.meterDetail({
                          imei: meternoS
                       }).then(mymeter=>{
                           console.log('found meter ',meternoS);
                           var activeMeter = myActiveMeters.find(x=>x.meterno == meternoS);
                           var myMeterData = JSON.parse(mymeter.data);
                           
                           console.log(activeMeter, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
                           if(activeMeter){
                                 var msoi = [0x5a];
                                 var mpvar = activeMeter.pvar;
                                 var maddress = activeMeter.address;
                                 var mtype = activeMeter.type;
                                 var mcommand = [0x12];
                                 var mlength = [0x07,0x00];
                                 var mfcode = [0x04];
                                 var password = [0x02,0x12,0x34,0x56];
                                 var sn = [1];
                                 var state = [0x00];
                                 var myCrCMainData = mpvar;
                                 myCrCMainData = myCrCMainData.concat(maddress);
                                 myCrCMainData = myCrCMainData.concat(mtype);
                                 myCrCMainData = myCrCMainData.concat(mcommand);
                                 myCrCMainData = myCrCMainData.concat(mlength);
                                 myCrCMainData = myCrCMainData.concat(mfcode);
                                 myCrCMainData = myCrCMainData.concat(password);
                                 myCrCMainData = myCrCMainData.concat(sn);
                                 myCrCMainData = myCrCMainData.concat(state);

                                 var calcrc = omejeBuffer.Lrc(myCrCMainData);
                                 var calcrcA = [(calcrc & 0xff), (calcrc >> 8)];
                                 var meod = [0x0d];

                                 var outData = msoi;
                                 outData = outData.concat(myCrCMainData);
                                 outData = outData.concat(calcrcA);
                                 outData = outData.concat(meod);
                                 var bufferOut = Buffer.from(outData);
                                 console.log(bufferOut,' control data to meter');
                                 activeMeter.connection.write(bufferOut);
                           }
                       }).catch(err=>{
                           consol.log(err);
                       })
                   }
                   
                   
                   
                    
                }
            }
      });

     
      function sendToSocketio(mydata){
          console.log("connecting to socket.io");
            return new Promise((resolve,reject)=>{
                try{
                   var iosocket = io.connect(process.env.SOCKET_END_POINT, {secure: true});
                    iosocket.on('connect', function (socket) {
                        iosocket.emit('data',mydata);
                        
                        iosocket.on('data',(data)=>{
                           resolve(data);
                           iosocket.close();
                        })
                    }); 
                }
                catch(err){
                    console.log(err);
                }
            })
      }
      connection.pipe(connection);

});


server.listen({
    host: "66.29.130.36",
	port: process.env.PREPAID_METER_PORT
}, function() { 
   console.log('server is listening to %j', process.env.PREPAID_METER_PORT);
});