

'use strict';

var Device = require('../../models').device;
var Block = require('../../models').block;
var DataProfile = require('../../models').dataprofile;

module.exports = {
    
    checkInverter: (data)=>{
        return new Promise((resolve,reject)=>{
            Device.findOne({
                where:{
                    imei: data.imei,
                    device_type: 7
                }
            }).then(myInverter=>{
                if(myInverter){
                    Device.findOne({
                        where:{
                            imei: myInverter.device_link_imei,
                            device_type: 6
                        }
                    }).then(myGateWay=>{
                        if(myGateWay){
                            var Inverter = myInverter.get({plain:true});
                            Inverter.gateway = myGateWay.get({plain:true});
                            resolve(Inverter);
                        }
                        else{
                           reject('Invalid inverter or no gateway attached to it'); 
                        }
                    }).catch(err=>{
                        reject(err);
                    })
                }
                else{
                    reject('Invalid inverter or no gateway attached to it');
                }
            }).catch(err=>{
                reject(err);
            }) 
        });
    },
    
    
    
    saveInverterData1: (data)=>{
        return new Promise((resolve,reject)=>{
            Device.findOne({
                where:{
                    imei: data.imei
                }
            }).then(myInverter=>{
                if(myInverter){
                    var myInverterData = JSON.parse(myInverter.data);
                    myInverterData.state =  data.state;
                    myInverterData.vpv1 =  data.vpv1;
                    myInverterData.vpv2 =  data.vpv2;
                    myInverterData.vpv3 =  data.vpv3;
                    myInverterData.vbat =  data.vbat;
                    myInverterData.soc =  data.soc;
                    myInverterData.soh =  data.soh;
                    myInverterData.ppv1 =  data.ppv1;
                    myInverterData.ppv2 =  data.ppv2;
                    myInverterData.ppv3 =  data.ppv3;
                    myInverterData.pcharge =  data.pcharge;
                    myInverterData.pdischarge =  data.pdischarge;
                    myInverterData.vacr =  data.vacr;
                    myInverterData.vacs =  data.vacs;
                    myInverterData.vact =  data.vact;
                    myInverterData.fac =  data.fac;
                    myInverterData.pinv =  data.pinv;
                    myInverterData.prec =  data.prec;
                    myInverterData.linvrms =  data.linvrms;
                    myInverterData.pf =  data.pf;
                    myInverterData.vepsr =  data.vepsr;
                    myInverterData.vepss =  data.vepss;
                    myInverterData.vepst =  data.vepst;
                    myInverterData.feps =  data.feps;
                    myInverterData.peps =  data.peps;
                    myInverterData.seps =  data.seps;
                    myInverterData.ptogrid =  data.ptogrid;
                    myInverterData.ptouser =  data.ptouser;
                    myInverterData.epv1_day =  data.epv1_day;
                    myInverterData.epv2_day =  data.epv2_day;
                    myInverterData.epv3_day =  data.epv3_day;
                    myInverterData.einv_day =  data.einv_day;
                    myInverterData.erec_day =  data.erec_day;
                    myInverterData.echg_day =  data.echg_day;
                    myInverterData.edischg_day =  data.edischg_day;
                    myInverterData.eeps_day =  data.eeps_day;
                    myInverterData.etogrid_day =  data.etogrid_day;
                    myInverterData.etouser_day =  data.etouser_day;
                    myInverterData.vbus1 =  data.vbus1;
                    myInverterData.vbus2 =  data.vbus2;
                    
                    console.log(myInverterData);
                    
                    Device.update({
                      data: JSON.stringify(myInverterData)
                    },
                    {
                      where:{
                          id: myInverter.id
                      }   
                    }).then(()=>{
                        
                        Block.findOne({
                            where:{
                               id: myInverter.block_id
                            }
                        }).then((myBlock)=>{
                            if(myBlock){
                                var blockData = JSON.parse(myBlock.data);
                                blockData.state = data.state;
                                blockData.vpv1 = data.vpv1;
                                blockData.vpv2 = data.vpv2;
                                blockData.vpv3 = data.vpv3;
                                blockData.vbat = data.vbat;
                                blockData.ppv1 = data.ppv1;
                                blockData.ppv2 = data.ppv2;
                                blockData.ppv3 = data.ppv3;
                                
                                Block.update({
                                   data: JSON.stringify(blockData)
                                },
                                {
                                  where:{
                                      id: myBlock.id
                                  }   
                                }).then(()=>{
                                    resolve(myInverter.reload());
                                }).catch(err=>{
                                    console.log(err);
                                    reject(err);
                                });
                            }
                            else{
                               resolve(myInverter.reload()); 
                            }
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });
                        
                    }).catch(err=>{
                        console.log(err);
                        reject(err);
                    });
                   
                }
                else{
                    reject('Invalid inverter or no gateway attached to it');
                }
            }).catch(err=>{
                reject(err);
            }); 
        });
    },
    
    
    saveInverterData2: (data)=>{
        return new Promise((resolve,reject)=>{
            Device.findOne({
                where:{
                    imei: data.imei
                }
            }).then(myInverter=>{
                if(myInverter){
                    var myInverterData = JSON.parse(myInverter.data);
                    myInverterData.epv1_all =  data.epv1_all;
                    myInverterData.epv2_all =  data.epv2_all;
                    myInverterData.epv3_all =  data.epv3_all;
                    myInverterData.einv_all =  data.einv_all;
                    myInverterData.erec_all =  data.erec_all;
                    myInverterData.echg_all =  data.echg_all;
                    myInverterData.edischg_all =  data.edischg_all;
                    myInverterData.eeps_all =  data.eeps_all;
                    myInverterData.etogrid_all =  data.etogrid_all;
                    myInverterData.etouser_all =  data.etouser_all;
                    myInverterData.fault_code =  data.fault_code;
                    myInverterData.warning_code =  data.warning_code;
                    myInverterData.tinner =  data.tinner;
                    myInverterData.tradiator1 =  data.tradiator1;
                    myInverterData.tradiator2 =  data.tradiator2;
                    myInverterData.tbat =  data.tbat;
                    myInverterData.running_time =  data.running_time;
                    myInverterData.auto_test_start =  data.auto_test_start;
                    myInverterData.wauto_test_limit =  data.wauto_test_limit;
                    myInverterData.uw_auto_test_default_time =  data.uw_auto_test_default_time;
                    myInverterData.uw_auto_test_trip_value =  data.uw_auto_test_trip_value;
                    myInverterData.uw_auto_test_trip_time =  data.uw_auto_test_trip_time;
                    Device.update({
                      data: JSON.stringify(myInverterData)
                    },
                    {
                      where:{
                          id: myInverter.id
                      }   
                    }).then(()=>{
                        resolve(myInverter.reload());
                    }).catch(err=>{
                        console.log(err);
                        reject(err);
                    });
                   
                }
                else{
                    reject('Invalid inverter or no gateway attached to it');
                }
            }).catch(err=>{
                reject(err);
            }); 
        });
    },
    
    
    saveInverterData3: (data)=>{
        return new Promise((resolve,reject)=>{
            Device.findOne({
                where:{
                    imei: data.imei
                }
            }).then(myInverter=>{
                if(myInverter){
                    var myInverterData = JSON.parse(myInverter.data);
                    myInverterData.batbrand =  data.bat_detail;
                    myInverterData.batcomtype =  data.bat_detail;
                    myInverterData.max_chg_curr =  data.max_chg_curr;
                    myInverterData.max_dsch_curr =  data.max_dischg_curr;
                    myInverterData.charge_volt_ref =  data.charge_volt_ref;
                    myInverterData.disch_cut_volt =  data.dischg_cut_volt;
                    myInverterData.bat_status0_bms =  data.bat_status0_bms;
                    myInverterData.bat_status1_bms =  data.bat_status1_bms;
                    myInverterData.bat_status2_bms =  data.bat_status2_bms;
                    myInverterData.bat_status3_bms =  data.bat_status3_bms;
                    myInverterData.bat_status4_bms =  data.bat_status4_bms;
                    myInverterData.bat_status5_bms =  data.bat_status5_bms;
                    myInverterData.bat_status6_bms =  data.bat_status6_bms;
                    myInverterData.bat_status7_bms =  data.bat_status7_bms;
                    myInverterData.bat_status8_bms =  data.bat_status8_bms;
                    myInverterData.bat_status9_bms =  data.bat_status9_bms;
                    myInverterData.bat_status_inv =  data.bat_status_inv;
                    myInverterData.bat_parallel_num =  data.bat_parallel_num;
                    myInverterData.bat_capacity =  data.bat_capacity;
                    Device.update({
                      data: JSON.stringify(myInverterData)
                    },
                    {
                      where:{
                          id: myInverter.id
                      }   
                    }).then(()=>{
                        
                        DataProfile.findAll({
                           limit: 1,
                           where: {
                             imei: data.imei
                           },
                           order: [ [ 'createdAt', 'DESC' ]],
                           raw: true
                        }).then(function(myDataProfiles){
                            if(myDataProfiles.length > 0){
                                var lastTimeRecord = new Date(myDataProfiles[0].createdAt);
                                var currenttime = new Date();
                                if( ((currenttime.getTime() - lastTimeRecord.getTime())/60000) > 1 ){
                                    
                                    DataProfile.create({
                                        imei: myInverter.imei,
                                        merchant_id: myInverter.merchant_id,
                                        data: JSON.stringify(myInverterData),
                                        status: 0,
                                        date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                        time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                    }).then(()=>{
                                        resolve(myInverter.reload());
                                    }).catch(err=>{
                                       console.log(err);
                                       reject(err);
                                    });
                                    
                                }
                            }
                            else{
                                var currenttime = new Date();
                                DataProfile.create({
                                    imei: myInverter.imei,
                                    merchant_id: myInverter.merchant_id,
                                    data: JSON.stringify(myInverterData),
                                    status: 0,
                                    date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                    time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                }).then(()=>{
                                    resolve(myInverter.reload());
                                }).catch(err=>{
                                   console.log(err);
                                   reject(err);
                                });
                            }
                        }).catch(err=>{
                           console.log(err);
                           reject(err);
                        });
                            
                        
                    }).catch(err=>{
                        console.log(err);
                        reject(err);
                    });
                   
                }
                else{
                    reject('Invalid inverter or no gateway attached to it');
                }
            }).catch(err=>{
                reject(err);
            });
            
        });
    },
    
    
    

};