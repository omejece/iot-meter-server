var path = require('path');
var fs = require('fs');
var Block = require('../models').block;
var Merchant = require('../models').merchant;
var Admin = require('../models').admin;
var Consumption = require('../models').consumption;
var Device = require('../models').device;
var DeviceAlarm = require('../models').devicealarm;
var DeviceSetting = require('../models').devicesetting;
var uniqid = require('uniqid');
var Bcrypt = require('bcrypt-nodejs');


module.exports =  AuthMiddleWare = {



    verifyToken: (data)=>{
        return new Promise((resolve,reject)=>{
            Merchant.findOne({
               where:{
                  token: data.token
               }
            }).then(myMerchant=>{
                if(myMerchant){
                   resolve(myMerchant);
                }
                else{
                   reject("Invalid token");
                }
            }).catch(err=>{
                reject(err);
            });
            
        });
   	 },

     

     verifyMerchantDevice: (data)=>{
        return new Promise((resolve,reject)=>{
            Merchant.findOne({
               where:{
                  token: data.token
               }
            }).then(myMerchant=>{
                if(myMerchant){
                    
                    Device.findOne({
                       where:{
                         imei: data.imei,
                         merchant_id: myMerchant.id
                       }
                    }).then(myDevice=>{
                        if(myDevice){
                            resolve(myDevice);
                        }
                        else{
                           reject("You are not permitted to access the device"); 
                        }
                    }).catch(err=>{
                        reject(err);
                    });

                }
                else{
                   reject("Invalid token");
                }
            }).catch(err=>{
                reject(err);
            });
            
        });
     },


     







}