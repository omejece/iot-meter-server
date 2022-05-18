
require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').deviceAlarm;
var DeviceList = require('../../models').deviceList;

module.exports = {
   
     loginDevice: (data)=>{
          return new Promise((resolve,reject)=>{
              Device.findOne({
                 where:{
                    imei: data.imei
                 }
              }).then(myDevice=>{
                  if(myDevice){
                      console.log('device found');
                      resolve(myDevice);
                  }
                  else{
                    console.log('no device found');
                    reject('no device found');
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
                   imei: data.imei
               }
           }).then(myDevice=>{
               if(myDevice){

                  var deviceData = JSON.parse(myDevice.data);
                  deviceData.points = data.points;
                  var deviceFlags = JSON.parse(myDevice.flags);
                  var deviceSettings = JSON.parse(myDevice.settings);

                  deviceData.device_status = data.device_status;

                  Device.update(
                   {
                     data: JSON.stringify(deviceData),
                     flags: JSON.stringify(deviceFlags),
                     settings: JSON.stringify(deviceSettings)
                   },
                   {
                    where:{
                       id:myDevice.id 
                    }
                   }
                  ).then(()=>{

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
        })
     },



};