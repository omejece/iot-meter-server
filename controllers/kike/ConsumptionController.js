'use strict';
require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').deviceAlarm;
var DeviceList = require('../../models').deviceList;
const Op = Sequelize.Op;


var AlarmController = require('./AlarmController');

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
     

     SaveConsumption: (data)=>{

          return new Promise((resolve,reject)=>{
              var my_date = new Date();
              var date_taken = my_date.getFullYear()+'-'+(my_date.getMonth() + 1)+'-'+my_date.getDate();
              var time_taken = my_date.getHours()+':'+my_date.getMinutes()+':'+my_date.getSeconds();
              Device.findOne({
                where:{
                   imei:data.imei
                },
                raw: true
              }).then(myDevice=>{
                 if(myDevice){
                    var deviceData = JSON.parse(myDevice.data);
                    var deviceFlags = JSON.parse(myDevice.flags);
                    var deviceSettings = JSON.parse(myDevice.settings);
                    var consumption = (parseFloat(deviceData.total_purchase) - ( parseFloat(data.total_purchase)/1000) ) > 0 ? ( parseFloat(deviceData.total_purchase) - ( parseFloat(data.total_purchase)/1000) ) : 0;
                    
                    var gas_available = (parseFloat(deviceData.available_gas) - parseFloat(consumption) ) > 0 ? ( parseFloat(deviceData.available_gas) - parseFloat(consumption)) : 0;

                    deviceData.cummulative_flow = parseFloat(data.Cumulative_flow)/1000;
                    deviceData.total_purchase = parseFloat(data.total_purchase)/1000;
                    deviceData.available_purchase = ((parseFloat(data.total_purchase) - parseFloat(data.Cumulative_flow)) /1000);
                    deviceData.available_gas = gas_available;
                    deviceData.battery = (data.battery_voltage/100);
                    deviceData.signal_strength = data.signal_strength;
                    deviceData.signal_noise_ratio = data.signal_to_noise_ratio;
                    deviceData.valve = data.valve_status;
                    deviceData.output = data.valve_status;



                    Device.update(
                       {
                         data: JSON.stringify(deviceData),
                         settings: JSON.stringify(deviceSettings),
                         flags: JSON.stringify(deviceFlags)
                       },
                       {
                        where:{
                           id:myDevice.id
                        }
                       }
                    ).then(()=>{
                        
                        Consumption.findOne({
                           where:{
                             date_taken:date_taken,
                             imei: myDevice.imei
                           }
                        }).then(my_cons=>{
                           
                           if(my_cons){
                              var consumptionData = JSON.parse(my_cons.data);
                              var totalcons = (consumptionData.total_consumption/1) + (consumption/1);
                              Consumption.update(
                                {
                                  data: JSON.stringify(consumptionData)
                                },
                                {
                                  where:{id:my_cons.id}
                                }
                              ).then(()=>{
                                 resolve(my_cons.reload());
                              }).catch(err=>{
                                 console.log(err);
                                 reject(err);
                              });
                           }
                           else{
                              var consumptionData = {
                                 total_consumption: consumption
                              };

                              Consumption.create({
                                  imei: data.imei,
                                  merchant_id: myDevice.merchant_id,
                                  source: 2,
                                  data: JSON.stringify(consumptionData),
                                  day: my_date.getDate(),
                                  year_taken: my_date.getFullYear(),
                                  month_taken: my_date.getMonth(),
                                  date_taken: date_taken
                              }).then(()=>{
                                 resolve(my_cons);
                              }).catch(err=>{
                                 console.log(err);
                                 reject(err);
                              });
                           }
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });

                    });

                 }
            }).catch(err=>{
                console.log(err);
                reject(err);
            })


          });
     	  
     }
     
     

}