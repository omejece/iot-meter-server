require('dotenv').config();
var Sequelize = require('sequelize');
var Block = require('../../models').block;
var Merchant = require('../../models').merchant;
var Admin = require('../../models').admin;
var Consumption = require('../../models').consumption;
var Device = require('../../models').device;
var DeviceAlarm = require('../../models').devicealarm;
var DeviceSetting = require('../../models').devicesetting;

var ConsumptionController = require('./ConsumptionController');
const Op = Sequelize.Op;

module.exports = {

     meterDetail: (data)=>{
         
         return new Promise((resolve,reject)=>{
           Device.findOne({
              where:{
                imei:data.imeil
              }
           }).then(mymeter=>{
               if(mymeter){
                  resolve(mymeter);
               }
               else{
                  reject("invalid meter");
               }

           })
         })

     },
     

     ConfirmMeterControl: (data)=>{
     	 return new Promise((resolve,reject)=>{

     	 	     var mydate = new Date();
                 var mydatetime = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' '+mydate.getHours()+':'+mydate.getMinutes()+':'+mydate.getSeconds();
               
                 Device.findOne({
                     where:{
                         imei: data.imei
                     }
                 }).then(mymeter=>{
                     if(mymeter){
                         var myMeterData = JSON.parse(mymeter.data);
                         var myMeterFlags = JSON.parse(mymeter.flags);
                         if(myMeterFlags.is_disabled == 1){
                                 
                                 myMeterData.last_active = mydatetime;
                                 myMeterFlags.is_disabled = 0;
                                 myMeterFlags.is_control = 0;
                                 myMeterData.output = myMeterData.disabled; 

                                 Device.update(
                     	 	 	  {
                     	 	 	  	data: JSON.stringify(myMeterData),
                                    flags: JSON.stringify(myMeterFlags)
                     	 	 	  },
                     	 	 	  {
                     	 	 	  	where:{
                     	 	 	  	  imei: data.imei
                     	 	 	  	}
                     	 	 	  }
                     	 	 	 ).then(()=>{
                     	 	 	 	 Device.findOne({
                     	 	 	 	 	 where:{imei: data.imei}
                     	 	 	 	 }).then(upmeter=>{
                     	 	 	 	 	 resolve(upmeter);
                     	 	 	 	 }).catch(err=>{
                	     	 	 	     reject(err);
                	     	 	 	 })
                     	 	 	 	 
                     	 	 	 }).catch(err=>{
            	     	 	 	     reject(err);
            	     	 	 	 })
                             
                         }
                         else{
                                myMeterData.last_active = mydatetime;
                                myMeterFlags.is_control = 0;
                                myMeterData.output = myMeterData.control;
                                Device.update(
                     	 	 	  {
                     	 	 	  	data: JSON.stringify(myMeterData),
                                    flags: JSON.stringify(myMeterFlags)
                     	 	 	  },
                     	 	 	  {
                     	 	 	  	where:{
                     	 	 	  	  imei: data.imei
                     	 	 	  	}
                     	 	 	  }
                     	 	 	 ).then(()=>{
                     	 	 	 	 Device.findOne({
                     	 	 	 	 	 where:{imei: data.imei}
                     	 	 	 	 }).then(upmeter=>{
                     	 	 	 	 	 resolve(upmeter);
                     	 	 	 	 }).catch(err=>{
                	     	 	 	     reject(err);
                	     	 	 	 })
                     	 	 	 	 
                     	 	 	 }).catch(err=>{
            	     	 	 	     reject(err);
            	     	 	 	 })
                         }
                     }
                 })

     	 	 	 
     	 	 
     	 })
     },





     SaveMeterData: (data)=>{
     	 return new Promise((resolve,reject)=>{
     	 	 var mydate = new Date();
             var mydatetime = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' '+mydate.getHours()+':'+mydate.getMinutes()+':'+mydate.getSeconds();
             
             Device.findOne({
                 where:{
                    imei: data.imei 
                 }
             }).then(mymeter=>{ 
                 
                  if(mymeter){
                       var myMeterData = JSON.parse(mymeter.data);
                       var previousCons = (data.cummulativeActiveTotalEnergy/1) - (myMeterData.cummulative_total_energy/1);// this captures the previously saved energy consumption;
                       previousCons = previousCons < 0 ? (myMeterData.cummulativetotalenergy/1) : previousCons;

                       myMeterData.frequency = data.frequency;
                       myMeterData.total_powerfactor = data.totalPowerFactor;
                       myMeterData.powerfactora = data.powerfactora;
                       myMeterData.powerfactorb = data.powerfactorb;
                       myMeterData.powerfactorc = data.powerfactorc;
                       myMeterData.voltagea = data.voltagea;
                       myMeterData.voltageb = data.voltageb;
                       myMeterData.voltagec = data.voltagec;
                       myMeterData.currenta = data.currenta;
                       myMeterData.currentb = data.currentb;
                       myMeterData.currentc = data.currentc;
                       myMeterData.total_active_power = data.totalActivePower;
                       myMeterData.active_powera = data.reactivePowera;
                       myMeterData.active_powerb = data.reactivePowerb;
                       myMeterData.active_powerc = data.reactivePowerc;
                       myMeterData.cummulative_total_energy = data.cummulativeActiveTotalEnergy;
                       myMeterData.cummulative_top_energy = data.cummulativeTopEnergy;
                       myMeterData.cummulative_peak_energy = data.cummulativePeakEnergy;
                       myMeterData.cummulative_flat_energy = data.cummulativeFlatEnergy;
                       myMeterData.cummulative_bottom_energy = data.cummulativeBottomEnergy;
                       myMeterData.last_active = data.mydatetime;
                       
                       Device.update(
               	 	 	   {
                            data: JSON.stringify(myMeterData) 
               	 	 	   },
               	 	 	   {
               	 	 	  	where:{
               	 	 	  	  imei: data.imei
               	 	 	  	}
               	 	 	   }
               	 	    ).then(()=>{
               	 	          data.consumption = (previousCons/1);
                   	 	 	  ConsumptionController.SaveConsunption(data).then(()=>{
                                 Device.findOne({
                                    where:{
                                    	imei: data.imei
                                    }
                                 }).then((mymeter)=>{
                                     resolve(mymeter);
                                 }).catch(err=>{
                                    reject(0);
                       	 	     });
                   	 	 	  }).catch(err=>{
                                reject(err);
                   	 	      });
               	 	   }).catch(err=>{
	     	 	 	     reject(err);
	     	 	 	  })
                      
                  }
                  else{
                      reject("not found");
                  }
                  
             }).catch(err=>{
 	 	 	     reject(err);
 	 	 	 })
              
     	 })
     },

     
     
     loginMeter: (data)=>{
          return new Promise((resolve,reject)=>{
     	 	 var mydate = new Date();
             var mydatetime = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' '+mydate.getHours()+':'+mydate.getMinutes()+':'+mydate.getSeconds();
             Device.findOne({
                 where:{
                    imei: data.imei 
                 }
             }).then(mymeter=>{ 
                 if(mymeter){
                     var myMeterData = JSON.parse(mymeter.data);
                     myMeterData.software_version = data.softwareVersion;
                     myMeterData.simcard_iccd = data.simcardIccd;
                     Device.update(
                        {
                          data: JSON.stringify(myMeterData)
                        },
                        {
                           where:{
                               imei: data.imei 
                           } 
                        }
                     ).then(()=>{
                         resolve(mymeter);
                     });
                 }
                 else{
                    reject("Invalid meter"); 
                 }
                 
             }).catch(err=>{
                 reject(err);
             })
              
     	 })
     }

     
    




};