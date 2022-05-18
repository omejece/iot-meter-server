'use strict';
require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').devicealarm;
var DeviceList = require('../../models').devicelist;
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
     
      
      Login: (data)=>{
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
                   	  reject("invalid device");
                   }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });
      	   });
      },
      
      
      
      
      confirmControl: (data)=>{
      	   return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                       
                       var deviceFlag = JSON.parse(myDevice.flags);
                       var deviceData = JSON.parse(myDevice.data);
                       deviceData.output = deviceData.control;
                       deviceData.valve = deviceData.control;
                       deviceFlag.is_control = 0;
                       
                       console.log(deviceFlag);
                       
                      Device.update(
                         {
                            flags: JSON.stringify(deviceFlag),
                            data: JSON.stringify(deviceData)
                         },
                         {
                           where:{
                              imei: data.imei 
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
      
      
      
      confirmDeviceReport: (data)=>{
      	   return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                       
                       var deviceFlag = JSON.parse(myDevice.flags);
                       var deviceData = JSON.parse(myDevice.data);
                       deviceData.output = deviceData.control;
                       deviceData.valve = deviceData.control;
                       deviceFlag.is_device_report = 0;
                       
                       console.log(deviceFlag);
                       
                      Device.update(
                         {
                            flags: JSON.stringify(deviceFlag),
                            data: JSON.stringify(deviceData)
                         },
                         {
                           where:{
                              imei: data.imei 
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
      
      
      confirmRecharge: (data)=>{
      	   return new Promise((resolve,reject)=>{
               Device.findOne({
               	  where:{
               	  	imei: data.imei
               	  },
               	  raw: true
               }).then(myDevice=>{
                   if(myDevice){
                       
                       var deviceFlag = JSON.parse(myDevice.flags);
                       var deviceData = JSON.parse(myDevice.data);
                       deviceData.output = deviceData.control;
                       deviceData.valve = deviceData.control;
                       deviceFlag.is_recharged = 0;
                       deviceData.recharged_data = 0;
                       
                       console.log(deviceFlag);
                       
                      Device.update(
                         {
                            flags: JSON.stringify(deviceFlag),
                            data: JSON.stringify(deviceData)
                         },
                         {
                           where:{
                              imei: data.imei 
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


      HandleErrCommand: (data)=>{// this handles the errors from the device to give users a nices experience
      	  // rcmd is the response command, the command issues which the device is reporting the error on
          return new Promise((resolve,reject)=>{
              if(data.rcmd == PAFDS){
              	  resolve('report cummulative traffic and device status failed');
              }
              else if(data.rcmd == PHAF){
              	  resolve('report historic cummulative usage flow (by hour) failed');
              }
              else if(data.rcmd == SVALVE){
              	  resolve('set valve switch failed');
              }
              else if(data.rcmd == SAFLOW){
              	  resolve('set cummulative flow failed');
              }
              else if(data.rcmd == PPERIOD){
              	  resolve('set reporting cycle failed');
              }
              else if(data.rcmd == PPTIME){
              	  resolve('set report fixed time failed');
              }
              else if(data.rcmd == PBAT){
              	  resolve('report battery configuration parameter failed');
              }
              else if(data.rcmd == PDEVS){
              	  resolve('report device status information failed');
              }
              else if(data.rcmd == PALERT){
              	  resolve('report device alarm information failed');
              }
              else if(data.rcmd == PFWVER){
              	  resolve('report firmware version failed');
              }
              else if(data.rcmd == SBAL){
              	  resolve('set to increase or decrease purchase failed');
              }
              else if(data.rcmd == PTEMP){
              	  resolve('report temperature value failed');
              }
              else if(data.rcmd == PNOWTIME){
              	  resolve('report the current time failed');
              }
              else if(data.rcmd == PPRESS){
              	  resolve('report pulse coefficient failed');
              }
              else if(data.rcmd == PCFG){
              	  resolve('report system configuration failed');
              }
              else if(data.rcmd == PREMOTE){
              	  resolve('report ip address or domain name failed');
              }

          });
      },
      
      
      checkDeviceControl: ()=>{
          return new Promise((resolve,reject)=>{
              Device.findAll({
                  where:{
                      device_type: 2
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