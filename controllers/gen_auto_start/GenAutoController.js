'use strict';
require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').devicealarm;
var DeviceList = require('../../models').devicelist;
var DataProfile = require('../../models').dataprofile;
var GenLog = require('../../models').genlog;
var Runtime = require('../../models').runtime;


const Op = Sequelize.Op;


module.exports =  {
     
      
      Login: (data)=>{
      	   return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                   	  resolve(myDevice);
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      
      confirmOnnGen: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceData.output = 0;
                      deviceFlags.is_control = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      confirmOffGen: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceData.output = 1;
                      deviceFlags.is_control = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      confirmMaxVoltage: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceData.output = 1;
                      deviceFlags.is_max_voltage = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      
      
      confirmMinVoltage: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceData.output = 1;
                      deviceFlags.is_min_voltage = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      confirmHeartBeat: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceFlags.isheartbeat = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      confirmApn: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceFlags.isapn = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      confirmIpAddress: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceData.isipaddress = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      confirmPort: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);
                      
                      deviceFlags.isport = 0;
                      
                      Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            flags: JSON.stringify(deviceFlags),
                            settings: JSON.stringify(deviceSetting)
                          },
                          {
                            where:{
                           	   imei: data.imei,
                           	   device_type: 8
                            }   
                          }
                      ).then(()=>{
                          resolve(myDevice);
                      }).catch(err=>{
                           console.log(err);
                           reject(err);
                      });
                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      
      
      saveDeviceData: (data)=>{
          return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei,
               	  	device_type: 8
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){

                      var myDate = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                      var dateonly = myDate.getFullYear()+'-'+(myDate.getMonth()+1)+'-'+myDate.getDate();
                      var timeonly = myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds();

                      var deviceData = JSON.parse(myDevice.data);
                      var deviceFlags = JSON.parse(myDevice.flags);
                      var deviceSetting = JSON.parse(myDevice.settings);

                      var genStatus = data.gen_voltage < 100 ? 1 : 0;
                      var formerStatus = deviceData.output;

                      deviceData.output = data.gen_voltage < 100 ? 1 : 0;
                      deviceData.gen_voltage = data.gen_voltage;
                      deviceData.gen_current = data.gen_current;
                      deviceData.gen_frequency = data.gen_frequency;
                      deviceData.gen_power_factor = data.gen_power_factor;
                      deviceData.max_battery_voltage = data.max_battery_voltage;
                      deviceData.min_battery_perc = data.min_battery_perc;
                      deviceData.min_battery_voltage = data.min_battery_perc;
                      deviceData.battery_voltage = data.battery_voltage;
                      deviceData.battery_current = data.battery_current;
                      deviceData.panel_voltage = data.panel_voltage;
                      deviceData.panel_current = data.panel_current;
                      deviceData.last_online = `${dateonly} ${timeonly}`;
                      deviceData.soc =  ((((data.battery_voltage/1) - (data.min_battery_perc/1))/((data.max_battery_voltage/1) - (data.min_battery_perc/1))) * 100);
                      

                      if(formerStatus !=  genStatus){

                          if(genStatus == 0){
                              deviceData.last_onn_time = timeonly;
                              deviceData.last_onn_date = dateonly;
                          }

                          GenLog.create({
                             block_id: myDevice.block_id,
                             merchant_id: myDevice.block_id,
                             imei: data.imei,
                             status: genStatus == 1 ? 0 : 1,
                             date_taken: dateonly,
                             time_taken: timeonly
                          }).then(()=>{

                                  Device.update(
                                      {
                                        data: JSON.stringify(deviceData),
                                        flags: JSON.stringify(deviceFlags),
                                        settings: JSON.stringify(deviceSetting)
                                      },
                                      {
                                        where:{
                                           imei: data.imei,
                                           device_type: 8
                                        }   
                                      }
                                  ).then(()=>{
                                      
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
                                                var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                                if( ((currenttime.getTime() - lastTimeRecord.getTime())/60000) > 1 ){
                                                    
                                                    DataProfile.create({
                                                        imei: myDevice.imei,
                                                        merchant_id: myDevice.merchant_id,
                                                        data: JSON.stringify(deviceData),
                                                        status: 0,
                                                        date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                        time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                    }).then(()=>{
                                                        resolve(myDevice);
                                                    }).catch(err=>{
                                                       console.log(err);
                                                       reject(err);
                                                    });
                                                    
                                                }
                                            }
                                            else{
                                                var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                                DataProfile.create({
                                                    imei: myDevice.imei,
                                                    merchant_id: myDevice.merchant_id,
                                                    data: JSON.stringify(deviceData),
                                                    status: 0,
                                                    date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                    time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                }).then(()=>{
                                                    resolve(myDevice);
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


                          }).catch(err=>{
                             console.log(err);
                             reject(err);
                          });


                      }
                      else{

                          if(deviceData.output == 0){ // if generator is onn
                              
                                Runtime.findOne({
                                    where:{
                                        imei: data.imei,
                                        date_taken: dateonly
                                    },
                                    raw: true
                                }).then(myruntime=>{
                                   
                                    if(myruntime){
                                       
                                        var elapsed_time = 0;
                                        if(deviceData.last_onn_date == dateonly){
                                            var prevDate = new Date( deviceData.last_onn_date+' '+deviceData.last_onn_time);
                                            var currentDate = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                            elapsed_time = (currentDate.getTime() - prevDate.getTime());
                                            
                                        }
                                        else{
                                            deviceData.last_onn_date = dateonly;
                                            deviceData.last_onn_time = timeonly;
                                        }
                                        
                                        var myRuntime = ((myruntime.duration/1) + ((elapsed_time/1) - (myruntime.last_elapsed_time/1)));
                                        console.log(myruntime.duration,' run time');
                                        console.log(elapsed_time,' elapsed time');
                                        console.log(myruntime.last_elapsed_time,' last elapsed time');

                                        Runtime.update(
                                         {
                                           duration: myRuntime,
                                           last_elapsed_time: (elapsed_time/1)
                                         },
                                         {
                                            where:{
                                               id: myruntime.id
                                            }
                                         }
                                        ).then(()=>{

                                             Device.update(
                                                  {
                                                    data: JSON.stringify(deviceData),
                                                    flags: JSON.stringify(deviceFlags),
                                                    settings: JSON.stringify(deviceSetting)
                                                  },
                                                  {
                                                    where:{
                                                       imei: data.imei,
                                                       device_type: 8
                                                    }   
                                                  }
                                              ).then(()=>{
                                                  
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
                                                            var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                                            if( ((currenttime.getTime() - lastTimeRecord.getTime())/60000) > 1 ){
                                                                
                                                                DataProfile.create({
                                                                    imei: myDevice.imei,
                                                                    merchant_id: myDevice.merchant_id,
                                                                    data: JSON.stringify(deviceData),
                                                                    status: 0,
                                                                    date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                                    time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                                }).then(()=>{
                                                                    resolve(myDevice);
                                                                }).catch(err=>{
                                                                   console.log(err);
                                                                   reject(err);
                                                                });
                                                                
                                                            }
                                                        }
                                                        else{
                                                            var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                                            DataProfile.create({
                                                                imei: myDevice.imei,
                                                                merchant_id: myDevice.merchant_id,
                                                                data: JSON.stringify(deviceData),
                                                                status: 0,
                                                                date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                                time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                            }).then(()=>{
                                                                resolve(myDevice);
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

                                        }).catch(err=>{
                                           console.log(err);
                                           reject(err);
                                        });


                                    }
                                    else{

                                        var elapsed_time = 0;
                                        if(deviceData.last_onn_date == dateonly){
                                            var prevDate = new Date( deviceData.last_onn_date+' '+deviceData.last_onn_time);
                                            var currentDate = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                            elapsed_time = (currentDate.getTime() - prevDate.getTime());
                                            
                                        }
                                        else{
                                            deviceData.last_onn_date = dateonly;
                                            deviceData.last_onn_time = timeonly;
                                        }
                                        
                                        

                                        
                                        Runtime.create({
                                           block_id: myDevice.block_id,
                                           merchant_id: myDevice.block_id,
                                           imei: data.imei,
                                           duration: elapsed_time,
                                           last_elapsed_time: elapsed_time,
                                           date_taken: dateonly,
                                           time_taken: timeonly
                                        }).then(()=>{

                                             Device.update(
                                                  {
                                                    data: JSON.stringify(deviceData),
                                                    flags: JSON.stringify(deviceFlags),
                                                    settings: JSON.stringify(deviceSetting)
                                                  },
                                                  {
                                                    where:{
                                                       imei: data.imei,
                                                       device_type: 8
                                                    }   
                                                  }
                                              ).then(()=>{
                                                  
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
                                                            var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                                            if( ((currenttime.getTime() - lastTimeRecord.getTime())/60000) > 1 ){
                                                                
                                                                DataProfile.create({
                                                                    imei: myDevice.imei,
                                                                    merchant_id: myDevice.merchant_id,
                                                                    data: JSON.stringify(deviceData),
                                                                    status: 0,
                                                                    date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                                    time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                                }).then(()=>{
                                                                    resolve(myDevice);
                                                                }).catch(err=>{
                                                                   console.log(err);
                                                                   reject(err);
                                                                });
                                                                
                                                            }
                                                        }
                                                        else{
                                                            var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                                            DataProfile.create({
                                                                imei: myDevice.imei,
                                                                merchant_id: myDevice.merchant_id,
                                                                data: JSON.stringify(deviceData),
                                                                status: 0,
                                                                date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                                time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                            }).then(()=>{
                                                                resolve(myDevice);
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

                                        }).catch(err=>{
                                           console.log(err);
                                           reject(err);
                                        });


                                    }

                                }).catch(err=>{
                                   console.log(err);
                                   reject(err);
                                });


                          }
                          else{

                              Device.update(
                                  {
                                    data: JSON.stringify(deviceData),
                                    flags: JSON.stringify(deviceFlags),
                                    settings: JSON.stringify(deviceSetting)
                                  },
                                  {
                                    where:{
                                       imei: data.imei,
                                       device_type: 8
                                    }   
                                  }
                              ).then(()=>{
                                  
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
                                            var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                            if( ((currenttime.getTime() - lastTimeRecord.getTime())/60000) > 1 ){
                                                
                                                DataProfile.create({
                                                    imei: myDevice.imei,
                                                    merchant_id: myDevice.merchant_id,
                                                    data: JSON.stringify(deviceData),
                                                    status: 0,
                                                    date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                    time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                                }).then(()=>{
                                                    resolve(myDevice);
                                                }).catch(err=>{
                                                   console.log(err);
                                                   reject(err);
                                                });
                                                
                                            }
                                        }
                                        else{
                                            var currenttime = new Date(new Date().toLocaleString("en-US", {timeZone:"Africa/Lagos"}));
                                            DataProfile.create({
                                                imei: myDevice.imei,
                                                merchant_id: myDevice.merchant_id,
                                                data: JSON.stringify(deviceData),
                                                status: 0,
                                                date_taken: currenttime.getFullYear()+'-'+(currenttime.getMonth()+1)+'-'+currenttime.getDate(),
                                                time_taken: currenttime.getHours()+':'+currenttime.getMinutes()+':'+currenttime.getSeconds()
                                            }).then(()=>{
                                                resolve(myDevice);
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


                      }

                   	  
                   }
                   else{
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      
      
      
      checkDeviceControl: ()=>{
          return new Promise((resolve,reject)=>{
              Device.findAll({
                  where:{
                      device_type: 8
                  },
                  raw: true
              }).then(mydata=>{
                  if(mydata.length > 0){
                     resolve(mydata); 
                  }
                  else{
                      resolve([]);
                  }
              }).catch(err=>{
                   console.log(err);
                   reject(err);
              });
          })
          
      },
      
      
      


}