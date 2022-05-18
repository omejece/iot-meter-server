
'use strict';

var Device = require('../../models').device;
var Block = require('../../models').block;

module.exports = {
   
   login: (data)=>{
       return new Promise((resolve,reject)=>{
           Device.findOne({
               where:{
                   imei: data.imei,
                   device_type: 6
               }
           }).then(myDevice=>{
               if(myDevice){
                   resolve(myDevice.get({plain:true}));
               }
               else{
                  reject('invalid gateway'); 
               }
           }).catch(err=>{
               reject(err);
           })
       })
   }
};