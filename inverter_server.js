require('dotenv').config();
var net = require('net');
var io = require('socket.io-client');

var GatewayController = require('./controllers/gateway/GatewayController.js');
var InverterController = require('./controllers/inverter/InverterController.js');
var omejeBuffer = require('./my_plugin/OmejeBuffer');

//var bcrypt = require('bcrypt-nodejs');


/*Parameters*/
  var head = 0x24;

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
 var CRelay = 0x15;
 var Error = 0x16;
 var Login = 0x17;  
 var ackOk = 0x18;
 var resetConnect = 0x19;
 var RNumSlave = 0x20;
 var SNumSlave = 0x21;
/*End device commands*/

var myActiveDevices = [];







var server = net.createServer(function(connection) {

      connection.setKeepAlive(true);
      
        

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
            
            var pHead = tData.slice(0,1);
            var pHeadA = omejeBuffer.toArray(pHead);
            
            if(pHeadA[0] == head){ // if the first data received is equal to phead the is the gate way packet else inverter packet
               var pLength = tData.slice(1,2);
               var pLengthA = omejeBuffer.toArray(pLength);
               
               var pCmd = tData.slice(2,3);
               var pCmdA = omejeBuffer.toArray(pCmd);
               
               var pImei = tData.slice(3,13);
               var pImeiA = omejeBuffer.toArray(pImei);
               
               console.log(pImei.toString('hex'),'imei');
               
               if(pCmdA[0] == Login){
                    GatewayController.login({
                        imei: pImei.toString('hex')
                    }).then(mresp=>{
                        
                        var activeDevice = myActiveDevices.find(x=>x.imei == mresp.imei);
                        if(activeDevice){
                            myActiveDevices.splice(myActiveDevices.indexOf(activeDevice),1);
                        }
                        
                        myActiveDevices.push({
                           connection: connection,
                           imei: mresp.imei
                        });
                        
                        var startData = [0x7b];
                        var myOutData = [head];
                        var dataLength = 13 + 1;
                        myOutData = myOutData.concat([dataLength]);
                        myOutData = myOutData.concat([pCmdA[0]]);
                        myOutData = myOutData.concat(pImeiA);
                        myOutData = myOutData.concat([0x01]);
                        myOutData = myOutData.concat([omejeBuffer.Lrc8(myOutData)]);
                        myOutData = myOutData.concat([0x0d,0x0a,0x7d]);
                        startData = startData.concat(myOutData);
                        var outData = Buffer.from(startData);
                        setTimeout(()=>{
                            console.log("transmit ",outData);
                            connection.write(outData);
                        },2000);
                        
                    }).catch(err=>{
                        console.log(err);
                    })
               }
               
            }
            else{
                
                var address = tData.slice(0,1);
                var addressA = omejeBuffer.toArray(address);
                
                var funcCode = tData.slice(1,2);
                var funcCodeA = omejeBuffer.toArray(funcCode);
                
                var funcCode = tData.slice(1,2);
                var funcCodeA = omejeBuffer.toArray(funcCode);
                
                var imei = tData.slice(2,12);
                var imeiA = omejeBuffer.toArray(imei);
                
                var startAddress = tData.slice(12,14);
                var startAddressA = omejeBuffer.toArray(startAddress);
                
                var dataLength = tData.slice(14,15);
                var dataLengthA = omejeBuffer.toArray(dataLength);
                
                console.log(startAddressA,' start address');
                console.log(dataLengthA,' data length');
                
                var startAddreesN = (( (startAddressA[1]/1) << 8) & 0xff00) | ((startAddressA[0]/1) & 0xff); // convert the start address to single 16 bit number
                
                console.log(startAddreesN,' start address number');
                
                
                ///*
                InverterController.checkInverter({
                    imei: imei.toString()
                }).then(myinverter=>{
                    
                    var activeDevice = myActiveDevices.find(x=>x.imei == myinverter.gateway.imei);
                    if(activeDevice){
                        myActiveDevices.splice(myActiveDevices.indexOf(activeDevice),1);
                    }
                    
                    myActiveDevices.push({
                       connection: connection,
                       imei: myinverter.gateway.imei
                    });
                    
                    var mainData = tData.slice(15,(15 + (dataLengthA[0]/1)));
                    if(funcCodeA[0] == 0x04){
                        if(startAddreesN == 0){
                            console.log(mainData,' main adata');
                            var state = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(0,2)));
                            var vpv1 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(2,4)));
                            var vpv2 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(4,6)));
                            var vpv3 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(6,8)));
                            var vbat = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(8,10)));
                            var soc = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(10,11)));
                            var soh = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(11,12)));
                            var reserve = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(12,14)));
                            var ppv1 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(14,16)));
                            var ppv2 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(16,18)));
                            var ppv3 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(18,20)));
                            var pcharge = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(20,22)));
                            var pdischarge = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(22,24)));
                            var vacr = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(24,26)));
                            var vacs = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(26,28)));
                            var vact = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(28,30)));
                            var fac = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(30,32)));
                            var pinv = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(32,34)));
                            var prec = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(34,36)));
                            var linvRms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(36,38)));
                            var pf = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(38,40)));
                            var vepsr = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(40,42)));
                            var vepss = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(42,44)));
                            var vepst = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(44,48)));
                            var feps = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(48,50)));
                            var peps = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(50,52)));
                            var seps = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(52,54)));
                            var ptogrid = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(56,58)));
                            var ptouser = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(58,60)));
                            var epv1_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(60,62)));
                            var epv2_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(62,64)));
                            var epv3_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(64,66)));
                            var einv_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(66,68)));
                            var erec_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(68,70)));
                            var echg_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(70,72)));
                            var edischg_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(72,74)));
                            var eeps_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(74,76)));
                            var etogrid_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(76,78)));
                            var etouser_day = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(78,80)));
                            var vbus1 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(80,82)));
                            var vbus2 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(82,84)));

                            
                            var inverterData = {
                                imei: imei.toString(),
                                gatewayImei: myinverter.gateway.imei,
                                state: (((state[0] << 8) | state[1])/1),
                                vpv1: (((vpv1[0] << 8) | vpv1[1])/10),
                                vpv2: (((vpv2[0] << 8) | vpv2[1])/10),
                                vpv3: (((vpv3[0] << 8) | vpv3[1])/10),
                                vbat: (((vbat[0] << 8) | vbat[1])/10),
                                soc: (soc[0]/1),
                                soh: (soh[0]/1),
                                reserve: (((reserve[0] << 8) | reserve[1])/1),
                                ppv1: (((ppv1[0] << 8) | ppv1[1])/1),
                                ppv2: (((ppv2[0] << 8) | ppv2[1])/1),
                                ppv3: (((ppv3[0] << 8) | ppv3[1])/1),
                                pcharge: (((pcharge[0] << 8) | pcharge[1])/1),
                                pdischarge: (((pdischarge[0] << 8) | pdischarge[1])/1),
                                vacr: (((vacr[0] << 8) | vacr[1])/10),
                                vacs: (((vacs[0] << 8) | vacs[1])/10),
                                vact: (((vact[0] << 8) | vact[1])/10),
                                fac: (((fac[0] << 8) | fac[1])/100),
                                pinv: (((pinv[0] << 8) | pinv[1])/1),
                                prec: (((prec[0] << 8) | prec[1])/1),
                                linvRms: (((linvRms[0] << 8) | linvRms[1])/100),
                                pf: (((pf[0] << 8) | pf[1])/1000),
                                vepsr: (((vepsr[0] << 8) | vepsr[1])/10),
                                vepss: (((vepss[0] << 8) | vepss[1])/10),
                                vepst: (((vepst[0] << 8) | vepst[1])/10),
                                feps: (((feps[0] << 8) | feps[1])/100),
                                peps: (((peps[0] << 8) | peps[1])/1),
                                seps: (((seps[0] << 8) | seps[1])/1),
                                ptogrid: (((ptogrid[0] << 8) | ptogrid[1])/1),
                                ptouser: (((ptouser[0] << 8) | ptouser[1])/1),
                                epv1_day: (((epv1_day[0] << 8) | epv1_day[1])/10),
                                epv2_day: (((epv2_day[0] << 8) | epv2_day[1])/10),
                                epv3_day: (((epv3_day[0] << 8) | epv3_day[1])/10),
                                einv_day: (((einv_day[0] << 8) | einv_day[1])/10),
                                erec_day: (((erec_day[0] << 8) | erec_day[1])/10),
                                echg_day: (((echg_day[0] << 8) | echg_day[1])/10),
                                edischg_day: (((edischg_day[0] << 8) | edischg_day[1])/10),
                                eeps_day: (((eeps_day[0] << 8) | eeps_day[1])/10),
                                etogrid_day: (((etogrid_day[0] << 8) | etogrid_day[1])/10),
                                etouser_day: (((etouser_day[0] << 8) | etouser_day[1])/10),
                                vbus1: (((vbus1[0] << 8) | vbus1[1])/10),
                                vbus2: (((vbus2[0] << 8) | vbus2[1])/10)
                            };
                            
                            InverterController.saveInverterData1(inverterData).then(myresp=>{
                                
                                setTimeout(()=>{
                                    var startData = [0x7b];
                                    var myOutData = [address[0]];
                                    myOutData = myOutData.concat([0x03]);
                                    myOutData = myOutData.concat([0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
                                    myOutData = myOutData.concat([0x00,0x00]);
                                    myOutData = myOutData.concat([39,0x00]);
                                    var myCrc = omejeBuffer.ArrayCrc16(myOutData);
                                    myOutData = myOutData.concat([(myCrc & 0xff),((myCrc >> 8) & 0xff)]);
                                    myOutData = myOutData.concat([0x0d,0x0a,0x7d]);
                                    startData = startData.concat(myOutData);
                                    var outData = Buffer.from(startData);
                                    console.log("transmit ",outData);
                                    connection.write(outData);
                                },2000);
                            }).catch(err=>{
                                console.log(err);
                            });

                        }
                        else if(startAddreesN == 40){
                            console.log(mainData,' main adata');
                            var epv1_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(0,2)));
                            var epv1_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(2,4)));
                            var epv2_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(4,6)));
                            var epv2_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(6,8)));
                            var epv3_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(8,10)));
                            var epv3_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(10,12)));
                            var einv_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(12,14)));
                            var einv_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(14,16)));
                            var erec_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(16,18)));
                            var erec_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(18,20)));
                            var echg_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(20,22)));
                            var echg_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(22,24)));
                            var edischg_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(24,26)));
                            var edischg_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(26,28)));
                            var eeps_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(28,30)));
                            var eeps_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(30,32)));
                            var etogrid_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(32,34)));
                            var etogrid_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(34,36)));
                            var etouser_all_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(36,38)));
                            var etouser_all_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(38,40)));
                            var fault_code_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(40,42)));
                            var fault_code_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(42,44)));
                            var warning_code_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(44,46)));
                            var warning_code_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(46,48)));
                            var tinner = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(48,50)));
                            var tradiator1 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(50,52)));
                            var tradiator2 = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(52,54)));
                            var tbat = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(54,56)));
                            var reserved = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(56,58)));
                            var running_time_l = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(58,60)));
                            var running_time_h = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(60,62)));
                            var auto_test_start = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(62,64)));
                            var wauto_test_limit = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(64,66)));
                            var uw_auto_test_default_time = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(66,68)));
                            var uw_auto_test_trip_value = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(68,70)));
                            var uw_auto_test_trip_time = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(70,72)));

                            var inverterData = {
                                imei: imei.toString(),
                                gatewayImei: myinverter.gateway.imei,
                                epv1_all: (((( (epv1_all_h[0] << 8) | epv1_all_h[1] ) << 16) & 0xffff) | ( (epv1_all_l[0] << 8) | epv1_all_l[1] )),
                                epv2_all: (((( (epv2_all_h[0] << 8) | epv2_all_h[1] ) << 16) & 0xffff) | ( (epv2_all_l[0] << 8) | epv2_all_l[1] )),
                                epv3_all: (((( (epv3_all_h[0] << 8) | epv3_all_h[1] ) << 16) & 0xffff) | ( (epv3_all_l[0] << 8) | epv3_all_l[1] )),
                                einv_all: (((( (einv_all_h[0] << 8) | einv_all_h[1] ) << 16) & 0xffff) | ( (einv_all_l[0] << 8) | einv_all_l[1] )),
                                erec_all: (((( (erec_all_h[0] << 8) | erec_all_h[1] ) << 16) & 0xffff) | ( (erec_all_l[0] << 8) | erec_all_l[1] )),
                                echg_all: (((( (echg_all_h[0] << 8) | echg_all_h[1] ) << 16) & 0xffff) | ( (echg_all_l[0] << 8) | echg_all_l[1] )),
                                edischg_all: (((( (edischg_all_h[0] << 8) | edischg_all_h[1] ) << 16) & 0xffff) | ( (edischg_all_l[0] << 8) | edischg_all_l[1] )),
                                eeps_all: (((( (eeps_all_h[0] << 8) | eeps_all_h[1] ) << 16) & 0xffff) | ( (eeps_all_l[0] << 8) | eeps_all_l[1] )),
                                etogrid_all: (((( (etogrid_all_h[0] << 8) | etogrid_all_h[1] ) << 16) & 0xffff) | ( (etogrid_all_l[0] << 8) | etogrid_all_l[1] )),
                                etouser_all: (((( (etouser_all_h[0] << 8) | etouser_all_h[1] ) << 16) & 0xffff) | ( (etouser_all_l[0] << 8) | etouser_all_l[1] )),
                                fault_code: (((( (fault_code_h[0] << 8) | fault_code_h[1] ) << 16) & 0xffff) | ( (fault_code_l[0] << 8) | fault_code_l[1] )),
                                warning_code: (((( (warning_code_h[0] << 8) | warning_code_h[1] ) << 16) & 0xffff) | ( (warning_code_l[0] << 8) | warning_code_l[1] )),
                                tinner: ( (tinner[0] << 8) | tinner[1] ),
                                tradiator1: ( (tradiator1[0] << 8) | tradiator1[1] ),
                                tradiator2: ( (tradiator2[0] << 8) | tradiator2[1] ),
                                tbat: ( (tbat[0] << 8) | tbat[1] ),
                                reserved: ( (reserved[0] << 8) | reserved[1] ),
                                running_time: (((( (running_time_h[0] << 8) | running_time_h[1] ) << 16) & 0xffff) | ( (running_time_l[0] << 8) | running_time_l[1] )),
                                auto_test_start: ( (auto_test_start[0] << 8) | auto_test_start[1] ),
                                wauto_test_limit: ( (wauto_test_limit[0] << 8) | wauto_test_limit[1] ),
                                uw_auto_test_default_time: ( (uw_auto_test_default_time[0] << 8) | uw_auto_test_default_time[1] ),
                                uw_auto_test_trip_value: ( (uw_auto_test_trip_value[0] << 8) | uw_auto_test_trip_value[1] ),
                                uw_auto_test_trip_time: ( (uw_auto_test_trip_time[0] << 8) | uw_auto_test_trip_time[1] )
                            };
                            
                            InverterController.saveInverterData2(inverterData).then(myresp=>{
                                setTimeout(()=>{
                                    var startData = [0x7b];
                                    var myOutData = [address[0]];
                                    myOutData = myOutData.concat([0x03]);
                                    myOutData = myOutData.concat([0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
                                    myOutData = myOutData.concat([40,0x00]);
                                    myOutData = myOutData.concat([39,0x00]);
                                    var myCrc = omejeBuffer.ArrayCrc16(myOutData);
                                    myOutData = myOutData.concat([(myCrc & 0xff),((myCrc >> 8) & 0xff)]);
                                    myOutData = myOutData.concat([0x0d,0x0a,0x7d]);
                                    startData = startData.concat(myOutData);
                                    var outData = Buffer.from(startData);
                                    console.log("transmit ",outData);
                                    connection.write(outData);
                                },2000);
                            }).catch(err=>{
                                console.log(err);
                            });
                            

                        }
                        else if(startAddreesN == 80){
                            console.log(mainData,' main adata');
                            var bat_detail = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(0,2)));
                            var max_chg_curr = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(2,4)));
                            var max_dischg_curr = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(4,6)));
                            var charge_volt_ref = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(6,8)));
                            var dischg_cut_volt = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(8,10)));
                            var bat_status0_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(10,12)));
                            var bat_status1_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(12,14)));
                            var bat_status2_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(14,16)));
                            var bat_status3_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(16,18)));
                            var bat_status4_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(18,20)));
                            var bat_status5_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(20,22)));
                            var bat_status6_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(22,24)));
                            var bat_status7_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(24,26)));
                            var bat_status8_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(26,28)));
                            var bat_status9_bms = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(28,30)));
                            var bat_status_inv = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(30,32)));
                            var bat_parallel_num = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(32,34)));
                            var bat_capacity = omejeBuffer.reverseArray(omejeBuffer.toArray(mainData.slice(34,36)));
                            
                            var inverterData = {
                                imei: imei.toString(),
                                gatewayImei: myinverter.gateway.imei,
                                bat_detail: ( (bat_detail[0] << 8) | bat_detail[1] ),
                                max_chg_curr: ( (max_chg_curr[0] << 8) | max_chg_curr[1] ),
                                max_dischg_curr: ( (max_dischg_curr[0] << 8) | max_dischg_curr[1] ),
                                charge_volt_ref: ( (charge_volt_ref[0] << 8) | charge_volt_ref[1] ),
                                dischg_cut_volt: ( (dischg_cut_volt[0] << 8) | dischg_cut_volt[1] ),
                                bat_status0_bms: ( (bat_status0_bms[0] << 8) | bat_status0_bms[1] ),
                                bat_status1_bms: ( (bat_status1_bms[0] << 8) | bat_status1_bms[1] ),
                                bat_status2_bms: ( (bat_status2_bms[0] << 8) | bat_status2_bms[1] ),
                                bat_status3_bms: ( (bat_status3_bms[0] << 8) | bat_status3_bms[1] ),
                                bat_status4_bms: ( (bat_status4_bms[0] << 8) | bat_status4_bms[1] ),
                                bat_status5_bms: ( (bat_status5_bms[0] << 8) | bat_status5_bms[1] ),
                                bat_status6_bms: ( (bat_status6_bms[0] << 8) | bat_status6_bms[1] ),
                                bat_status7_bms: ( (bat_status7_bms[0] << 8) | bat_status7_bms[1] ),
                                bat_status8_bms: ( (bat_status8_bms[0] << 8) | bat_status8_bms[1] ),
                                bat_status9_bms: ( (bat_status9_bms[0] << 8) | bat_status9_bms[1] ),
                                bat_status_inv: ( (bat_status_inv[0] << 8) | bat_status_inv[1] ),
                                bat_parallel_num: ( (bat_parallel_num[0] << 8) | bat_parallel_num[1] ),
                                bat_capacity: ( (bat_capacity[0] << 8) | bat_capacity[1] )
                            };
                            
                            InverterController.saveInverterData3(inverterData).then(myresp=>{
                                setTimeout(()=>{
                                    var startData = [0x7b];
                                    var myOutData = [address[0]];
                                    myOutData = myOutData.concat([0x03]);
                                    myOutData = myOutData.concat([0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
                                    myOutData = myOutData.concat([80,0x00]);
                                    myOutData = myOutData.concat([39,0x00]);
                                    var myCrc = omejeBuffer.ArrayCrc16(myOutData);
                                    myOutData = myOutData.concat([(myCrc & 0xff),((myCrc >> 8) & 0xff)]);
                                    myOutData = myOutData.concat([0x0d,0x0a,0x7d]);
                                    startData = startData.concat(myOutData);
                                    var outData = Buffer.from(startData);
                                    console.log("transmit ",outData);
                                    connection.write(outData);
                                },2000);
                            }).catch(err=>{
                                console.log(err);
                            });
                        }
                    }
                    else if(funcCodeA[0] == 0x03){
                        if(startAddreesN == 0){
                           console.log(mainData,' main data from inverter');   
                        }
                        else if(startAddreesN == 40){
                            console.log(mainData,' main data from inverter'); 
                        }
                        else if(startAddreesN == 80){
                            console.log(mainData,' main data from inverter'); 
                        }
                    }
                    else if(funcCodeA[0] == 0x06){
                        console.log(" command executed successfully");
                    }
                }).catch(err=>{
                   console.log(err); 
                });//*/
            }
            
            
            
            //var outData = Buffer.from([0x7b,0x01,0x06,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x15,0x00,0xA3,0xFA,0x05,0xDD,0x0d,0x0a,0x07d]);
            
            //var outData = Buffer.from([0x7b,0x01,0x06,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x15,0x00,0x00,0x00,0xFD,0x6E,0x0d,0x0a,0x07d]);
            
            //var outData = Buffer.from([0x7b,0x01,0x04,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x27,0x00,0x60,0x93,0x0d,0x0a,0x07d]);
            
            
            
            
            

            
      });

     
      function sendToSocketio(mydata){
          console.log("connecting to socket.io");
          return new Promise((resolve,reject)=>{
              var iosocket = io.connect('https://devicechat2.onewattsolar.org', {secure: true});
              iosocket.on('connect', function (socket) {
                  iosocket.emit('data',mydata);
                  
                  iosocket.on('data',(data)=>{
                     resolve(data);
                     iosocket.close();
                  })
              });
          })
      }
      connection.pipe(connection);

});


server.listen({
  host: process.env.SERVER_IP,
  port: process.env.INVERTER_PORT
}, function() { 
   console.log('server is listening to %j at address %k', process.env.INVERTER_PORT, process.env.SERVER_IP);
});