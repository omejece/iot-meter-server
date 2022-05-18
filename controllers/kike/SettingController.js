'use strict';
require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').deviceAlarm;
var DeviceList = require('../../models').deviceList;
const Op = Sequelize.Op;

const ACKERR = 0x00;// response error acknowlegement 
const ACKOK = 0x01; // success response no acknowledgement
const PAFDS = 0x02; // report cummulative traffic and device status
const PHAF = 0x03; // report historic cummulative usage flow (by hour)
const SVALVE = 0x04; //set valve switch
const SAFLOW = 0x05; // set cummulative flow
const PPERIOD = 0x06,SPERID = 0x06; //reporting cycle
const PPTIME = 0x07,SPTIME = 0x07; // report fixed time
const PBAT = 0x08,SBAT = 0x08; // report battery configuration parameter
const PDEVS = 0x09; // report device status information
const PALERT = 0x0A; // report device alarm information
const PFWVER = 0x0B; // report firmware version
const SBAL = 0x0C; // set to increase or decrease purchase
const PTEMP = 0x0D; // report temperature value
const PNOWTIME = 0x0E,SNOWTIME = 0x0E; // report the current time
const PCV = 0X0F,SCV = 0X0F; // report pulse coefficient
const PCFG = 0x10,SCFG = 0x10; // report system configuration
const PREMOTE = 0x11,SREMOTE = 0x11; // report ip address or domain name
const DISABLE = 0x2F;

module.exports =  {
     

      ConfirmSetting: (data)=>{ // confirms that settings has been successfully picked by device
          return new Promise((resolve,reject)=>{
              
              Device.findOne({
                where:{
                  imei: data.imei
                }
              }).then(myDevice=>{
                 if(myDevice){
                    
                     if(data.rcmd == SVALVE){
                          if(data.rfid  < 0x2F){
                            
                            var deviceData = JSON.parse(myDevice.data);
                            var deviceFlags = JSON.parse(myDevice.flags);
                            var deviceSettings = JSON.parse(myDevice.settings);

                            deviceFlags.is_control = 0;
                            deviceData.valve = deviceData.control;
                            deviceSettings.valve = deviceData.control;

                            Device.update(
                              {
                                data: JSON.stringify(deviceData),
                                settings: JSON.stringify(deviceSettings),
                                flags: JSON.stringify(deviceFlags)
                              },
                              {
                                where:{
                                  imei:data.imei
                                }
                              }
                            ).then(resp=>{
                               resolve('set valve switch successfull');
                            }).catch(err=>{
                               console.log(err);
                            });

                          }
                          else if(data.rfid  > 0x2F){

                              var deviceData = JSON.parse(myDevice.data);
                              var deviceFlags = JSON.parse(myDevice.flags);
                              var deviceSettings = JSON.parse(myDevice.settings);

                              deviceFlags.is_disabled = 0;

                              Device.update(
                              {
                                data: JSON.stringify(deviceData),
                                settings: JSON.stringify(deviceSettings),
                                flags: JSON.stringify(deviceFlags)
                              },
                              {
                                where:{
                                  imei:data.imei
                                }
                              }
                            ).then(resp=>{
                               resolve('Device successfully enabled successfull');
                            }).catch(err=>{
                               console.log(err);
                            });
                          }
                      }
                      else if(data.rcmd == SAFLOW){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);

                          deviceFlags.is_cflow = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Cummulative flow successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SPERID){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);

                          deviceFlags.is_rperiod = 0;
                          
                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Reporting period successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SPTIME){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);

                          deviceFlags.is_fprtime = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Fixed point reporting time successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SBAT){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);


                          deviceFlags.is_undervoltage = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Battery under voltage and non-under voltage successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SBAL){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);

                          deviceFlags.is_totalpurchase = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Total purchased value successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SNOWTIME){
                         var deviceData = JSON.parse(myDevice.data);
                         var deviceFlags = JSON.parse(myDevice.flags);
                         var deviceSettings = JSON.parse(myDevice.settings);
                          resolve('time successfully set');
                      }
                      else if(data.rcmd == SCV){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);
                          

                          deviceFlags.is_pulsecoefficient = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Pulse coefficint successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SCFG){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);

                          deviceFlags.is_configuration = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Report system configuration successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }
                      else if(data.rcmd == SREMOTE){
                          var deviceData = JSON.parse(myDevice.data);
                          var deviceFlags = JSON.parse(myDevice.flags);
                          var deviceSettings = JSON.parse(myDevice.settings);

                          deviceFlags.is_ipaddress = 0;

                          Device.update(
                            {
                              data: JSON.stringify(deviceData),
                              settings: JSON.stringify(deviceSettings),
                              flags: JSON.stringify(deviceFlags)
                            },
                            {
                              where:{
                                imei:data.imei
                              }
                            }
                          ).then(resp=>{
                             resolve('Remote ipaddress and port successfully set');
                          }).catch(err=>{
                             console.log(err);
                          });
                      }

                 }
                 else{
                    resolve("invalid device");
                 }
              }).catch(err=>{
                 console.log(err);
                 resolve(err);
              });

          });
      },



      MakeSetting: (data)=>{ // saves the setting made on the device if the device is still offline to pick the setting when online

           return new Promise((resolve,reject)=>{
              
              Device.findOne({
                where:{
                  imei: data.imei
                }
              }).then(myDevice=>{
                 if(myDevice){
                     
                    if(data.cmd == SVALVE){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);


                        deviceFlags.is_control = 1;
                        deviceData.control = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('set valve switch successfull');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SAFLOW){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);


                        deviceFlags.is_cflow = 1;
                        deviceSettings.cflow = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Cummulative flow successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SPERID){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);

                        deviceFlags.is_rperiod = 1;
                        deviceSettings.rperiod = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Reporting period successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SPTIME){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);

                        deviceFlags.is_fprtime = 1;
                        deviceSettings.fprtime = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Fixed point reporting time successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SBAT){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);

                        deviceFlags.is_undervoltage = 1;
                        deviceSettings.undervoltage = data.control1;
                        deviceSettings.non_undervoltage = data.control2;

                        Device.update(
                          {//undervoltage takes the control 1 while the over voltage takes the control 2
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Battery under voltage and non-under voltage successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SBAL){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);


                        deviceFlags.is_totalpurchase = 1;
                        deviceSettings.total_purchase = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Total purchased value successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SCV){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);

                        deviceFlags.is_pulsecoefficient = 1;
                        deviceSettings.pulse_coefficient = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Pulse coefficint successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SCFG){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);

                        deviceFlags.is_configuration = 1;
                        deviceSettings.configuration = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Report system configuration successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == SREMOTE){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);

                        deviceFlags.is_ipaddress = 1;
                        deviceSettings.ipaddress = data.control1;
                        deviceSettings.port = data.control2;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Remote ipaddress and port successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                    else if(data.cmd == DISABLE){
                        var deviceData = JSON.parse(myDevice.data);
                        var deviceFlags = JSON.parse(myDevice.flags);
                        var deviceSettings = JSON.parse(myDevice.settings);


                        deviceFlags.is_disabled = 1;
                        deviceSettings.disabled = data.control;

                        Device.update(
                          {
                            data: JSON.stringify(deviceData),
                            settings: JSON.stringify(deviceSettings),
                            flags: JSON.stringify(deviceFlags)
                          },
                          {
                            where:{
                              imei:data.imei
                            }
                          }
                        ).then(resp=>{
                           resolve('Device disabled and port successfully set');
                        }).catch(err=>{
                           console.log(err);
                        });
                    }
                            
                 }
                 else{
                    resolve("invalid device");
                 }
              }).catch(err=>{
                 console.log(err);
                 resolve(err);
              });

          });
          

      }
     

}