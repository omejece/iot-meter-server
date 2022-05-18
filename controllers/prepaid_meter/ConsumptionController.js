require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').deviceAlarm;
var DeviceList = require('../../models').deviceList;
const Op = Sequelize.Op;

module.exports = {
    
     SaveConsunption: (data)=>{
          return new Promise((resolve,reject)=>{
              var stringDate = new Date().toLocaleString('en-us',{timeZone:'Africa/Lagos'})
          	  var mydate = new Date(stringDate);
			        var datetaken = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate();
              var timetaken = (mydate.getHours() + 1)+':'+mydate.getMinutes()+':'+mydate.getSeconds();
              
              console.log(data.consumption," my data to save");

              Device.findOne({
              	 where:{imei: data.imei}
              }).then(mymeter=>{
                  var mydata = JSON.parse(mymeter.data);
                  var costperkws = mydata.cost_per_kw/1;
                  var availableunit = mydata.available_unit/1; 

                  var consumptionCost = costperkws * (data.consumption)/1;

                  var newAvailableBalance =  (availableunit - consumptionCost) < 0 ? 0 : (availableunit - consumptionCost);

                  mydata.available_unit = newAvailableBalance;

                  Device.update(
                   {
                     data: JSON.stringify(mydata)
                   },
                   {
                     where:{imei: data.imei}
                   }
                  ).then(()=>{

                        Consumption.findOne({
                           where:{
                             imei: data.imei,
                             date_taken: datetaken
                           }
                        }).then(myconsumption=>{
                              
                              
                              if(myconsumption){
                                  var consData = JSON.parse(myconsumption.data);
                                  var myData = {
                                    active_energy: (consData.active_energy/1) + (data.consumption/1),
                                    reactive_energy: (data.totalReactivePower/1),
                                    amount: (consData.amount/1) + (consumptionCost/1)
                                  };

                                  Consumption.update(
                                    {
                                      data: JSON.stringify(consData)
                                    },
                                    {
                                       where:{
                                          imei: data.imei,
                                          date_taken: datetaken
                                       }
                                    }
                                  ).then(()=>{
                                      resolve({status:20,message:mymeter.reload()}); 
                                  })
                              }
                              else{
                                 var myData = {
                                    active_energy: data.consumption/1,
                                    reactive_energy: (data.totalReactivePower/1),
                                    amount: consumptionCost
                                 };
                                 Consumption.create({
                                    imei: data.imei,
                                    data: JSON.stringify(myData),
                                    merchant_id:mymeter.merchant_id,
                                    day_taken: mydate.getDate(),
                                    month_taken: (mydate.getMonth() + 1),
                                    year_taken: mydate.getFullYear(),
                                    date_taken: datetaken
                                 }).then(()=>{
                                     resolve({status:20,message:mymeter.reload()});
                                 })
                              }
                        });

                  })

              })
          })
     }

};