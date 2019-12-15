// Initialize app
var myApp = new Framework7();

//global variable for a open camera
var destinationType;


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    //alert(destinationType);
    //getting the navigator.camera
    destinationType = navigator.camera.DestinationType;
    console.log("Device is ready!");
    
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page


})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        //myApp.alert('Here comes About page');

    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page');
})

//Global Variables
let city;
let lat = null;
let lng = null;
let currency;
let quoteRate = null;
let isoCode = null;
let temperatureDescription;
let temperatureDegree;
let locationTimezone;
let temperatureSection;
let amountInput = null;
var text;
var fileToCreate;
var dataObjWrite;
var dataObjRead;
var fileSystemOptionals = { create: true, exclusive: false };
var convertion;


//this funcion is responsible for starting the app.
window.addEventListener('load', ()=>
{
    navigator.geolocation.getCurrentPosition(geoCallback, onError);
});


//callback fucntion
function geoCallback(position)
{
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    // const latitude = -23.533773;
    // const longitude = -46.625290;

    document.getElementById('myLocPlaceHolder').innerHTML = "Your location is: " + "<br>" + latitude + "<br>" + longitude;

    //initialazing funtions
    openCageApi(latitude, longitude);
    weatherApi(latitude, longitude);
    lat = latitude;
    lng = longitude;
    updateMap(lat, lng);
}

//on error function
function onError(message)
{
    console.log("Url not recognized")
}

// update map
function updateMap(latitude, longitude)
{
    var loc = {lat: latitude, lng: longitude};
    var map = new google.maps.Map(document.getElementById('map'),
    {
        zoom: 12,
        center: loc,
         
    });

    var marker = new google.maps.Marker
    (
        {
            position: loc,
            map: map,
        }
    );

}

// gets API from opencage and collect data from it
function openCageApi(latitude, longitude)
{
    var http = new XMLHttpRequest();
    const url = `https://api.opencagedata.com/geocode/v1/json?q=`+latitude+`+`+longitude+`&key=380c52bfcb864741b497450fec27b1b2&language=en&pretty=1`;
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response); 
        
        //get data from the API
        city = responseJSON.results[0].components.city;
        currency = responseJSON.results[0].annotations.currency.iso_code;

        //display data on the HTLM file
        document.getElementById('cityPlaceHolder').innerHTML = "Welcome to " + city;
        document.getElementById('currencyPlaceHolder').innerHTML = " Currency: " + currency;

        //store the isoCode into the currency variable
        isoCode = currency;  

        //start the fuction getCurrencyApi
        getCurrencyApi(currency);
    }
       
}

// weather code
function weatherApi(latitude, longitude)
{
    temperatureDescription = document.querySelector(".temperature-description");
    temperatureDegree = document.querySelector(".temperature-degree");
    locationTimezone = document.querySelector(".location-timezone");
    temperatureSection = document.querySelector(".temperature"); 
    const temperatureSpan = document.querySelector(".temperature span")

    if(navigator.geolocation)
    {
                const proxy = 'https://cors-anywhere.herokuapp.com/';
                const api =`${proxy}https://api.darksky.net/forecast/fa9a90b0378e05bf1900b2a4481440ae/${latitude},${longitude}`;

                fetch(api)
                    .then(response =>
                    {
                        return response.json();
                    })
                    .then(data =>
                    {
                        // console.log(data);
                        const {temperature, summary} = data.currently;
                        //Set DOM Elements from the API
                        temperatureDegree.textContent = temperature;
                        temperatureDescription.textContent = summary;
                        locationTimezone.textContent = data.timezone;

                        //formula for CELSIUS
                        let celsius = (temperature - 32) * (5 / 9);

                        //Change temperature to Celsius/Farenhet
                        temperatureSection.addEventListener("click", ()=>
                        {
                            if (temperatureSpan.textContent === "F")
                            {
                                temperatureSpan.textContent = "C";
                                temperatureDegree.textContent = Math.floor(celsius);
                            }else
                            {
                                temperatureSpan.textContent = "F";
                                temperatureDegree.textContent = temperature;
                            }
                        })
                    })
                  
            
    } else
    {
        h1.textContent = "Location couldn't be loaded";
    }

}

//currency code
function getCurrencyApi(currency)
{
    const api = 'http://apilayer.net/api/live?access_key=f2f9681af9106fbd1cda1a2c1dc2d6f3&currencies='+currency+'&&format=1';

    fetch(api)
        .then(resp =>
        {
            return resp.json();
        })
        .then(data =>
        {
            console.log(data);
            //get elements from API an display in the HTML file
            document.getElementById("localCurrency").innerHTML = currency;
            amountInput = document.getElementById("amount").value; 
            //get the information from the API and do the convetion
            document.getElementById("result").value = amountInput / data.quotes[`USD${currency}`];           
 
        }); 
}

// //save the file
function saveFile(){

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallbackWrite, onError);
   
}
//read the file
function getFile(){

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallbackRead, onError);
   
}

//callback function write
function fileSystemCallbackWrite(fs){

    // Name of the file I want to create
    fileToCreate = "newPersistentFile.txt";

    // Opening/creating the file
    fs.root.getFile(fileToCreate, fileSystemOptionals, saveFileCallback, onError);

}

//callback function read
function fileSystemCallbackRead(fs){

    fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback, onError);
}

//this function is getting information from the API and filling the text file with data
function saveFileCallback(fileEntry){

    text = "City " + "= " + city + "\n" + "latitude " + "= " + lat + "\n"+"Longitude " + "= " + lng + "\n" + "Currency " + "= " +  currency;
    
    // var recordObj = 
    // {
    //     city: city,
    //     latitude: lat,
    //     longitude: lng,
    //     currency: currency

    // }

    // var responseJSON = JSON.parse(recordObj); 
    // city = responseJSON.file.json;

    dataObjWrite = new Blob([text], { type: 'text/plain' });
    //dataObjWrite = responseJSON.parse(recordObj);
    // Write to the file
    writeFile(fileEntry, dataObjWrite);

    writeFile = dataObjWrite;
}

//get the text file and preparing to read it
function getFileCallback(fileEntry){

    dataObjRead = new Blob([dataObjWrite], { type: 'text/plain' });

    // Or read the file
    readFile(fileEntry, dataObjRead);
    
}

// Let's write some files
function writeFile(fileEntry, dataObj) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        // If data object is not passed in,
        // create a new Blob instead.

        if (!dataObj) {
            dataObj = new Blob(['The file is null'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            alert("SUCCESSFUL");
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
            alert("ERROR TRY AGAIN");
        };

    });
}

// Let's read some files
function readFile(fileEntry) {

    // Get the file from the file entry
    fileEntry.file(function (file) {
        
        // Create the reader
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onloadend = function() {

            console.log("Successful file read: " + this.result);
            console.log("file path: " + fileEntry.fullPath);
            document.getElementById("filePlaceholder").innerHTML = this.result;
            
            
        };

    }, onError);
}

function onError(msg){
    console.log(msg);
}

//opem camera and take picture code
var pics = function()
{ 
    navigator.camera.getPicture(cameraCallBack, onError,
        {destinationType: destinationType.FILE_URI, saveToPhotoAlbum: true});
    
}

function cameraCallBack(imageData)
{
    alert("Saved");
}

function onError(err)
{
    console.error("There was an error reading the file!"+ err);
    alert(err);
}