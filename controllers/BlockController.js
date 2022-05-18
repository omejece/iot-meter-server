
var Block = require('../models').block;
var Point = require('../models').point;
var SmartHome = require('../models').smarthome;
var User = require('../models').user;

module.exports = {
   
     blockDetail: (data)=>{
         return new Promise((resolve,reject)=>{
             Block.findOne({
                where:{
                  reference: data.reference
                }
             }).then(myblock=>{
                 if(myblock){
                    resolve(myblock);
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


};