var express = require("express");
var app = express();
const bodyParser = require("body-parser");
const Blob = require('node-blob');
import {Buffer} from 'node:buffer';

var atob = require('atob');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const FormData = require("form-data");

const axios = require("axios");
const Promise = require("bluebird");

const cookie = process.env.COOKIE;
const groupId = process.env.GROUP;

const API = axios.create({
  baseURL: "https://apis.roblox.com/assets",
  timeout: 2000,
  headers: {
    cookie: ".ROBLOSECURITY=" + cookie,
  },
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

function getJpegBytes(canvas) {
  var jpgImg = canvas.toDataURL("image/png");
  jpgImg = jpgImg.replace("data:image/png;base64,", "");

  return _base64ToArrayBuffer(jpgImg);
}

function _base64ToArrayBuffer(base64) {
  var binary_string = Buffer.from(base64, "base64").toString();
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

function _base64ToArrayBuffer2(base64) {
  var binary_string = Buffer.from(base64, "base64").toString();
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {type:mimeString});
}

var pending = 0;
var robux = 0;

app.post("/post", function (request, res) {
  //console.log(JSON.parse(request.body).pixels);

  const { createImageData, createCanvas, Image } = require("canvas");
  const width = 20,
    height = 20;
  const arraySize = width * height * 4;
  var buffer = new Uint8ClampedArray(arraySize);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d", { pixelFormat: "A8" });

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var pos = (y * width + x) * 4; // position in buffer based on x and y
      buffer[pos] = 255; // some R value [0, 255]
      buffer[pos + 1] = 255; // some G value
      buffer[pos + 2] = 255; // some B value
      buffer[pos + 3] = 255; // set alpha channel
    }
  }

  const mydata = createImageData(buffer, width);

  ctx.putImageData(mydata, 0, 0);

  var idata = canvas.toDataURL();
  //console.log(idata);
  
  var file = dataURItoBlob(idata);
  console.log(file);

  var byteArray = getJpegBytes(canvas);
  //console.log(byteArray);
  //console.log(Buffer.from(idata.replace("data:image/png;base64,", "")).toString("utf8"));
  //console.log(Buffer.from(byteArray).toString("base64"));

  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.onerror = (err) => {
    throw err;
  };
  img.src = idata;
  
  var bodyFormData = new FormData();
  //bodyFormData.append('fileContent', file + ";type=image/png");
  bodyFormData.append('fileContent', file);
  
  //bodyFormData.append('request', "{assetType: 'Decal', displayName: 'Name', description: 'test', 'creationContext': {'creator': {'userId': 1655569}}}");
  bodyFormData.append(
    'request',
    JSON.stringify({
      assetType: "Decal",
      displayName: "Name",
      description: "test",
      creationContext: {
        creator: {
          userId: 1655569,
        },
      },
    })
  );

  axios({
    method: "post",
    url: "https://apis.roblox.com/assets/v1/assets",
    data: bodyFormData,
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "J5FTajNT50W0u4lNbYRP5CGlQeBqenSPy8FosDA9yw8U7nKg",
    },
  })
    .then(function (response) {
      //handle success
      console.log(response);
    })
    .catch(function (response) {
      //handle error
      console.log(response);
    });

  res.send((pending + robux).toString());
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
