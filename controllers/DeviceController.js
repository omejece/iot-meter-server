
var Block = require('../models').block;
var Merchant = require('../models').merchant;
var Admin = require('../models').admin;
var Consumption = require('../models').consumption;
var Device = require('../models').device;
var DeviceAlarm = require('../models').devicealarm;
var DeviceSetting = require('../models').devicesetting;

module.exports = {
    
    
    loginDevice: (data)=>{
         return new Promise((resolve,reject)=>{
             Device.findOne({
                where:{
                  imei: data.imei
                },
                raw: true
             }).then(myDevice=>{
                 if(myDevice){
                    resolve(myDevice);
                 }
                 else{
                   reject("Not authorized");
                 }
             }).catch(err=>{
                 console.log(err);
                 reject(err);
             });
         });
     },


     deviceDetail: (data)=>{
         return new Promise((resolve,reject)=>{
             Device.findOne({
                where:{
                  imei: data.imei
                },
                raw: true
             }).then(myDevice=>{
                 if(myDevice){
                    if(myDevice.device_type == 1){
                        
                        Block.findOne({
                           where:{
                              id: myDevice.block_id
                           },
                           raw: true
                        }).then(myBlock=>{
                            myDevice.block = myBlock;
                            Device.findOne({
                                where:{
                                    device_type: 7,
                                    block_id: myDevice.block_id
                                }
                            }).then((myInverter)=>{
                                myDevice.inverter = myInverter;
                                resolve(myDevice);
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
                        resolve(myDevice);
                    }
                 }
                 else{
                   reject("Not authorized");
                 }
             }).catch(err=>{
                 console.log(err);
                 reject(err);
             });
         });
     },
     
     
     
     
     
   
     disableDevice: (data)=>{
         return new Promise((resolve,reject)=>{
             Device.findOne({
                where:{
                  imei: data.imei
                },
                raw: true
             }).then(myDevice=>{
                 if(myDevice){
                    var myDeviceData = JSON.parse(myDevice.data);
                    var myDeviceFlags= JSON.parse(myDevice.flags);
                    myDeviceFlags.is_disabled = 1;
                    myDeviceData.disabled = 1;
                    Device.update(
                      {
                        data: JSON.stringify(myDeviceData),
                        flags: JSON.stringify(myDeviceFlags)
                      },
                      {
                        where:{
                           id: myDevice.id
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
                   reject("Not authorized");
                 }
             }).catch(err=>{
                 console.log(err);
                 reject(err);
             });
         });
     },




     enableDevice: (data)=>{
         return new Promise((resolve,reject)=>{
             Device.findOne({
                where:{
                  imei: data.imei
                },
                raw: true
             }).then(myDevice=>{
                 if(myDevice){
                    var myDeviceData = JSON.parse(myDevice.data);
                    var myDeviceFlags = JSON.parse(myDevice.flags);
                    myDeviceFlags.is_disabled = 1;
                    myDeviceData.disabled = 0;
                    
                    console.log(myDeviceFlags);
                    Device.update(
                      {
                        data: JSON.stringify(myDeviceData),
                        flags: JSON.stringify(myDeviceFlags)
                      },
                      {
                        where:{
                           id: myDevice.id
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
                   reject("Not authorized");
                 }
             }).catch(err=>{
                 console.log(err);
                 reject(err);
             });
         });
     },



     





     onnDevice: (data)=>{
        return new Promise((resolve,reject)=>{

           Device.findOne({
             where:{
                imei: data.imei
             },
             raw: true
           }).then(myDevice=>{
               
               var deviceData = JSON.parse(myDevice.data);
               var myDeviceFlags = JSON.parse(myDevice.flags);
               deviceData.control = data.control;
               myDeviceFlags.is_control = 1;

               Device.update(
                 {
                   data: JSON.stringify(deviceData),
                   flags: JSON.stringify(myDeviceFlags),
                   data: JSON.stringify(deviceData)
                 },
                 {
                   where:{
                     id: myDevice.id
                   }
                 }
               ).then(()=>{
                  resolve(myDevice);
               }).catch(err=>{
                  console.log(err);
                  reject(err);
               });


           }).catch(err=>{
              console.log(err);
              reject(err);
           });

        })
     },
     
     
     readDeviceData: (data)=>{
        return new Promise((resolve,reject)=>{

           Device.findOne({
             where:{
                imei: data.imei
             },
             raw: true
           }).then(myDevice=>{
               
               var deviceData = JSON.parse(myDevice.data);
               var myDeviceFlags = JSON.parse(myDevice.flags);
               deviceData.control = data.control;
               myDeviceFlags.is_device_report = 1;

               Device.update(
                 {
                   data: JSON.stringify(deviceData),
                   flags: JSON.stringify(myDeviceFlags),
                   data: JSON.stringify(deviceData)
                 },
                 {
                   where:{
                     id: myDevice.id
                   }
                 }
               ).then(()=>{
                  resolve(myDevice);
               }).catch(err=>{
                  console.log(err);
                  reject(err);
               });


           }).catch(err=>{
              console.log(err);
              reject(err);
           });

        })
     },
     
     offDevice: (data)=>{
        return new Promise((resolve,reject)=>{

           Device.findOne({
             where:{
                imei: data.imei
             },
             raw: true
           }).then(myDevice=>{
               
               var deviceData = JSON.parse(myDevice.data);
               var myDeviceFlags = JSON.parse(myDevice.flags);
               deviceData.control = data.control;
               myDeviceFlags.is_control = 1;

               Device.update(
                 {
                   data: JSON.stringify(deviceData),
                   flags: JSON.stringify(myDeviceFlags),
                   data: JSON.stringify(deviceData)
                 },
                 {
                   where:{
                     id: myDevice.id
                   }
                 }
               ).then(()=>{
                  resolve(myDevice);
               }).catch(err=>{
                  console.log(err);
                  reject(err);
               });


           }).catch(err=>{
              console.log(err);
              reject(err);
           });
           
        })
     },


     confirmControlDevice: (data)=>{
        return new Promise((resolve,reject)=>{

           Device.findOne({
             where:{
                imei: data.imei
             },
             raw: true
           }).then(myDevice=>{
               
               var deviceData = JSON.parse(myDevice.data);
               var myDeviceFlags = JSON.parse(myDevice.flags);
               deviceData.output = deviceData.control ;
               deviceData.valve = deviceData.control ;
               myDeviceFlags.is_control = 0;

               Device.update(
                 {
                   data: JSON.stringify(deviceData),
                   flags: JSON.stringify(myDeviceFlags),
                 },
                 {
                   where:{
                     id: myDevice.id
                   }
                 }
               ).then(()=>{
                  resolve(myDevice);
               }).catch(err=>{
                  console.log(err);
                  reject(err);
               });


           }).catch(err=>{
              console.log(err);
              reject(err);
           });
           
        })
     },


     setHeartBeat: (data)=>{
        return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);

                  myDeviceSettings.heartbeat = data.heartbeat; // this flag confirms the execution of the setting 
                  myDeviceFlags.is_heartbeat = 1;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     confirmSetHeartBeat: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);
                  myDeviceFlags.is_heartbeat = 0;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     setSsid: (data)=>{
        return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);

                  myDeviceSettings.ssid = data.ssid; // this flag confirms the execution of the setting 
                  myDeviceFlags.is_ssid = 1;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     confirmSetSsid: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);
                  myDeviceFlags.is_ssid = 0;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     setPassword: (data)=>{
        return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);

                  myDeviceSettings.password = data.password; // this flag confirms the execution of the setting 
                  myDeviceFlags.is_password = 1;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     confirmSetPassword: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);
                  myDeviceFlags.is_password = 0;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     setIpAddress: (data)=>{
        return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);

                  myDeviceSettings.ip_address = data.ip_address; // this flag confirms the execution of the setting 
                  myDeviceFlags.is_ip_address = 1;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     confirmSetIpAddress: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);
                  myDeviceFlags.is_ip_address = 0;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     setRemotePort: (data)=>{
        return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);

                  myDeviceSettings.port = data.port; // this flag confirms the execution of the setting 
                  myDeviceFlags.is_port = 1;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     confirmSetSetPort: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);
                  myDeviceFlags.is_port = 0;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


    


     setTime: (data)=>{
        return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);

                  myDeviceSettings.device_time = data.device_time; // this flag confirms the execution of the setting 
                  myDeviceFlags.is_device_time = 1;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },


     confirmSetTime: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei
               },
               raw: true
           }).then(myDevice=>{
               if(myDevice){
                  var deviceData = JSON.parse(myDevice.data);
                  var myDeviceFlags = JSON.parse(myDevice.flags);
                  var myDeviceSettings = JSON.parse(myDevice.settings);
                  myDeviceFlags.is_device_time = 0;

                  Device.update(
                     {
                       data: JSON.stringify(deviceData),
                       flags: JSON.stringify(myDeviceFlags),
                       settings: JSON.stringify(myDeviceSettings)
                     },
                     {
                       where:{
                         id: myDevice.id
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
                  reject('error')
               }
           }).catch(err=>{
              console.log(err);
              reject(err);
           });
        });
     },

};