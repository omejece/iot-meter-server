

var table = [
          0x0000, 0x1189, 0x2312, 0x329B, 0x4624, 0x57AD,
        0x6536, 0x74BF, 0x8C48, 0x9DC1, 0xAF5A, 0xBED3,
        0xCA6C, 0xDBE5, 0xE97E, 0xF8F7, 0x1081, 0x0108,
        0x3393, 0x221A, 0x56A5, 0x472C, 0x75B7, 0x643E,
        0x9CC9, 0x8D40, 0xBFDB, 0xAE52, 0xDAED, 0xCB64,
        0xF9FF, 0xE876, 0x2102, 0x308B, 0x0210, 0x1399,
        0x6726, 0x76AF, 0x4434, 0x55BD, 0xAD4A, 0xBCC3,
        0x8E58, 0x9FD1, 0xEB6E, 0xFAE7, 0xC87C, 0xD9F5,
        0x3183, 0x200A, 0x1291, 0x0318, 0x77A7, 0x662E,
        0x54B5, 0x453C, 0xBDCB, 0xAC42, 0x9ED9, 0x8F50,
        0xFBEF, 0xEA66, 0xD8FD, 0xC974, 0x4204, 0x538D,
        0x6116, 0x709F, 0x0420, 0x15A9, 0x2732, 0x36BB,
        0xCE4C, 0xDFC5, 0xED5E, 0xFCD7, 0x8868, 0x99E1,
        0xAB7A, 0xBAF3, 0x5285, 0x430C, 0x7197, 0x601E,
        0x14A1, 0x0528, 0x37B3, 0x263A, 0xDECD, 0xCF44,
        0xFDDF, 0xEC56, 0x98E9, 0x8960, 0xBBFB, 0xAA72,
        0x6306, 0x728F, 0x4014, 0x519D, 0x2522, 0x34AB,
        0x0630, 0x17B9, 0xEF4E, 0xFEC7, 0xCC5C, 0xDDD5,
        0xA96A, 0xB8E3, 0x8A78, 0x9BF1, 0x7387, 0x620E,
        0x5095, 0x411C, 0x35A3, 0x242A, 0x16B1, 0x0738,
        0xFFCF, 0xEE46, 0xDCDD, 0xCD54, 0xB9EB, 0xA862,
        0x9AF9, 0x8B70, 0x8408, 0x9581, 0xA71A, 0xB693,
        0xC22C, 0xD3A5, 0xE13E, 0xF0B7, 0x0840, 0x19C9,
        0x2B52, 0x3ADB, 0x4E64, 0x5FED, 0x6D76, 0x7CFF,
        0x9489, 0x8500, 0xB79B, 0xA612, 0xD2AD, 0xC324,
        0xF1BF, 0xE036, 0x18C1, 0x0948, 0x3BD3, 0x2A5A,
        0x5EE5, 0x4F6C, 0x7DF7, 0x6C7E, 0xA50A, 0xB483,
        0x8618, 0x9791, 0xE32E, 0xF2A7, 0xC03C, 0xD1B5,
        0x2942, 0x38CB, 0x0A50, 0x1BD9, 0x6F66, 0x7EEF,
        0x4C74, 0x5DFD, 0xB58B, 0xA402, 0x9699, 0x8710,
        0xF3AF, 0xE226, 0xD0BD, 0xC134, 0x39C3, 0x284A,
        0x1AD1, 0x0B58, 0x7FE7, 0x6E6E, 0x5CF5, 0x4D7C,
        0xC60C, 0xD785, 0xE51E, 0xF497, 0x8028, 0x91A1,
        0xA33A, 0xB2B3, 0x4A44, 0x5BCD, 0x6956, 0x78DF,
        0x0C60, 0x1DE9, 0x2F72, 0x3EFB, 0xD68D, 0xC704,
        0xF59F, 0xE416, 0x90A9, 0x8120, 0xB3BB, 0xA232,
        0x5AC5, 0x4B4C, 0x79D7, 0x685E, 0x1CE1, 0x0D68,
        0x3FF3, 0x2E7A, 0xE70E, 0xF687, 0xC41C, 0xD595,
        0xA12A, 0xB0A3, 0x8238, 0x93B1, 0x6B46, 0x7ACF,
        0x4854, 0x59DD, 0x2D62, 0x3CEB, 0x0E70, 0x1FF9,
        0xF78F, 0xE606, 0xD49D, 0xC514, 0xB1AB, 0xA022,
        0x92B9, 0x8330, 0x7BC7, 0x6A4E, 0x58D5, 0x495C,
        0x3DE3, 0x2C6A, 0x1EF1, 0x0F78,
        ];

class OmejeBuffer{


   static toArray(mybuffer){
      var mystring = JSON.stringify(mybuffer);
      var mydata = JSON.parse(mystring);
      return mydata.data;
   }



   static hexToBuffer(hexstring){
       var s = new Uint8Array(hexstring.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
       var buffer = new Buffer(s);
       return buffer;
   }





   static crc8(hexstring){
      var s = hexstring.match(/../g);
      var sum = 0;

      s.forEach(function(hexbyte){
         var n = 1 * ('0X'+hexbyte);
          sum += n;
      });

      sum = (sum & 255).toString(16);

      if(sum.length % 2){
           sum = '0'+sum;
      }

      return sum;

   }


   static crc16(hexstring){
      var s = hexstring.match(/../g);
      var sum = 0xFFFF;
      s.forEach(function(hexbyte){
         var n = 1 * ('0x'+hexbyte);
          sum = table[(sum ^ n) & 0xFF] ^ (sum >> 8 & 0xFF)
      });
      
      sum = sum ^ 0xFFFF;
        sum = sum & 0xFFFF;

      return Number(sum).toString(16);

   }


   static make16BitHex(hexstring){
      var mydata = hexstring;
      while(mydata.length < 4){
         mydata  = '0'+mydata;
      }

      return mydata;
   }



  


   static crc32(hexstring){
      var s = hexstring.match(/../g);
      var sum = 0;

      s.forEach(function(hexbyte){
         var n = 1 * ('0X'+hexbyte);
         sum += n;
      });

      sum = (sum & 4294967295).toString(16);

      if(sum.length % 2){
           sum = '0'+sum;
      }

      return sum;

   }
   
   
   static reverseArray(data){
        var myLength = data.length;
        var myArray = [];
        if(myLength > 0){
            for(var i = (myLength - 1); i >= 0; --i){
                myArray.push(data[i]);
            }
            return myArray;
        }
        else{
           return myArray;
        }
     }
    
    
    
    
    static ArrayCrc16(myarray){
        var crc = 0xFFFF;
        for (var i=0;i<myarray.length;i++)
        {
          crc ^= myarray[i];
    
        for (var j = 8; j !== 0; j--)
          { 
            if ((crc & 0x0001) !== 0)
            {
              crc >>= 1;    
              crc ^= 0xA001;
            }
            else{
              crc >>= 1; 
            }
    
          }
        }
    
        return crc;
  }


   static Lrc(mydata){
       var sum = 0;
       mydata.forEach(function(x){
           sum = sum + x;
       });

       var mysum = sum & 0xFFFF;
       return mysum;
   }
   



   static ExtractPowerData(mydata){
        var outData = {};
        if(mydata){
            mydata.forEach(function(x){
                var y = x.split(':');
                outData['voltage'+y[0]] = (y[1]/1);
                outData['current'+y[0]] = (y[2]/1);
                outData['power'+y[0]] = (y[3]/1);
            });
            return outData;
        }
        else{
           return {};
        }
   }


   static Lrc8(mydata){
       var sum = 0;
       mydata.forEach(function(x){
           sum = sum + x;
           sum = sum & 0xFF;
       });

       var mysum = sum & 0xFF;
       return mysum;
   }


    static getCrc(data){
         var mycrc = 0;
         for(var i=0;i<data.length;++i){
            mycrc = mycrc + data[i];
         }
         
         return mycrc;
     }
     
     
     static stringToArray(data){
         var outdata = [];
         for (var i = 0; i < data.length; i++){  
            outdata.push(data.charCodeAt(i));
         }
        return outdata;
     }




     static arrayToSingleNum(data){
          var number = 0x00000000;
          if(data.length > 0){
             for(var i=0;i<data.length;++i){
                 number = (number << 8) | data[i];
             }
             return number;
          }
          else{
             return number;
          }
     }


     static byteArrayToIpAddress(data){
        
     }
     


     static singleNumToByteArray(data,bytelength){
          var array = [];
          var length = bytelength - 1; 
          for(var i=length;i>-1;--i){
             if(i != length){
                myData = myData >> 8;
             }
             array[i] = myData & 0xff;
          }

          return array;
     }
     

     static toBigEndian(data){
          var myLength = data.length;
          var myArray = [];
          if(myLength > 0){
              for(var i = (myLength - 1); i >= 0; --i){
                  myArray.push(data[i]);
              }
              return myArray;
          }
          else{
             return myArray;
          }
     }


     static toLittleEndian(data){
        var myLength = data.length;
        var myArray = [];
        if(myLength > 0){
            for(var i = (myLength - 1); i >= 0; --i){
                myArray.push(data[i]);
            }
            return myArray;
        }
        else{
           return myArray;
        }
     }
     
     
     
     static checkSum16(data){
         var mycrc = 0;
         if(data.length > 1){
             for(var i = 0; i< data.length;++i){
                mycrc+= data[i];
             }
             return (mycrc & 0xffff);
         }
         else{
             return (mycrc & 0xffff);
         }
     }
     
     
     
     checkSum16(myArray){
           var mySum = 0x0000;
           for(var i=0;i<myArray.length;++i){
              mySum += myArray[i];
           }
           return (mySum & 0xffff);
     }

     



}

module.exports = OmejeBuffer;