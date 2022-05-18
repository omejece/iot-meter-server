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

       SaveAllAlarm: (data)=>{

           return new Promise((resolve,reject)=>{

               Device.findOne({
                  where:{
                    imei: data.imei
                  }
               }).then(myDevice=>{
                  if(myDevice){

                       var my_date = new Date();
                       var date_only = my_date.getFullYear()+'-'+(my_date.getMonth + 1)+'-'+my_date.getDate();
                       var time_only = my_date.getHours()+':'+my_date.getMinutes()+':'+my_date.getSeconds();
                       if(data.under_voltage ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.under_voltage,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.valve_status==  0x03){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.valve_status_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.hall_failure_alarm ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.hall_failure_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.power_switch_alarm ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.power_switch_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.magnetic_interf_alarm ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.magnetic_interf_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.valve_failure_alarm ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.valve_failure_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.reverse_flow_alarm  ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.reverse_flow_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                       if(data.battery_level_alarm ==  0x01){
                           DeviceAlarm.create({
                               imei: myDevice.imei,
                               merchant_id: myDevice.merchant_id,
                               device_id: myDevice.id,
                               status: 0,
                               type: process.env.battery_level_alarm,
                               data: JSON.stringify({}),
                               date_taken: date_only,
                               time_taken: time_only
                           }).then(resp=>{
                               resolve(resp);
                           }).catch(err=>{
                               console.log(err);
                               reject(err);
                           });
                       }
                    
                  }
                  else{
                     console.log("invalid device");
                     reject("invalid device");
                  }
               }).catch(err=>{
                   console.log(err);
                   reject(err);
               });

           })
       	   
       },


     

}