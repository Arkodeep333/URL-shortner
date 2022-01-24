const urlModel = require("../models/urlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')
const baseUrl = 'http://localhost:3000'



const redis = require("redis");//npm i redis@3.1.2

const { promisify } = require("util");

const redisClient = redis.createClient(
   10301,
  "redis-10301.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("wJKbs3twJyJrIioJ17r48eJu23VRxRMy", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});
redisClient.on("error", async function(){
   console.log("connection failed", error)
})



const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);





const isValidRequestBody = function (requestBody) {
   return Object.keys(requestBody).length > 0
}

const isValid = function (value) {
   if (typeof value === 'undefined' || value === null) return false
   if (typeof value === 'string' && value.trim().length === 0) return false
   return true;
}


const createUrl = async function (req, res) {
   let body = req.body
   let longUrl = req.body.longUrl
   if (!isValidRequestBody(body)) {
      res.status(400).send({ status: false, msg: 'Invalid body' })
      return
   }
   if (!isValid(longUrl)) {
      res.status(400).send({ status: false, msg: 'Enter appropriate URL' })
      return
   }
   
   longUrl = longUrl.trim()
   if (!validUrl.isUri(baseUrl)) {
      return res.status(400).send('Invalid base URL')
   }
   if (!validUrl.isUri(longUrl)) {
      return res.status(400).send('Invalid  Long URL')
   }
   if (validUrl.isUri(longUrl)) {

      try {
         const urlCode = shortid.generate().toLowerCase()
         let checkUrl = await urlModel.findOne({ longUrl:longUrl })
         if (checkUrl) {
            res.send({ message: "You have already created shortUrl for the requested URL as given below", data: checkUrl })
         } else {
           
            const shortUrl = baseUrl + '/' + urlCode
            const storedData = { longUrl, shortUrl, urlCode }
            let savedData = await urlModel.create(storedData);
            res.status(201).send({ status: true, data: savedData });
         }
      } catch (err) {
         res.status(500).send({ status: false, data: err.message })
      }
   } else {
      res.status(400).send('Invalid longUrl')
   }
}


const getUrl = async function (req, res) {
   try {
     
      let paramsUrl = req.params.urlCode
      
      let test = paramsUrl.trim().toLowerCase()
      //console.log(paramsUrl)
      if (!isValid(test)) {
         res.status(400).send({ status: false, msg: 'Enter appropriate URLCODE' })
         return
      }
      let cachedUrlData = await GET_ASYNC(`${test}`)
      let data =JSON.parse(cachedUrlData)
      
       
      if(data) {
        
         return res.status(302).redirect(data.longUrl)
       } else {
                   
         const newUrl = await urlModel.findOne({ urlCode: test })
        
         if (!newUrl) {
            return res.status(400).send({ status: false, msg: 'UrlCode does not exist' })   
         }
         await SET_ASYNC(`${test}`, JSON.stringify(newUrl))
         return res.status(302).redirect(newUrl.longUrl)
       }
} catch (err) {
   res.status(500).send({status:false, msg:err.message})
}
}

      
      
module.exports.createUrl = createUrl
module.exports.getUrl = getUrl