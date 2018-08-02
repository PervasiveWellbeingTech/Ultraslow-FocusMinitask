// check for update when page is focused
window.addEventListener('load', update);
// window.addEventListener('focus', update);
// window.addEventListener('blur', unfocus);

// custom style for color changes
var sheet = document.createElement('style');
document.body.appendChild(sheet);

let score = 0;
var moleOnScreen = true;

var reactionTimes = {
    click: [],
    hover: []
}

var startTime = 0;

// process update message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.todo == "update") {
        update();
    }
});

function getRandomTime() {
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomLocation() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    var x_pos = (Math.random() * Math.max(0, width - 200)).toFixed();
    var y_pos = (Math.random() * Math.max(0, height - 200)).toFixed();

    var location = {
        x: x_pos,
        y: y_pos
    };

    return location;
}

function addMole(location) {
    // console.log(location);
    var main_divs = document.body.querySelectorAll("#game"); // check if there's already a box
    console.log(main_divs);
    if (main_divs.length > 0) {
        var hole_div = document.createElement("div"); 
        hole_div.setAttribute("id", "hole");
        hole_div.setAttribute('style',
          // "background: url(" + chrome.extension.getURL('img/dirt.svg') + ") bottom center no-repeat; \n" +
          "left: " + location.x + "px; \n" +
          "top: " + location.y + "px;");

        sheet.innerHTML = sheet.innerHTML +
                          "#hole:after { \n" +
                          "display: block; \n" +
                          "background: url(" + chrome.extension.getURL('img/dirt.svg') + ") bottom center no-repeat; \n" +
                          "background-size: contain; \n" +
                          "content: ''; \n" +
                          "width: 100%; \n" +
                          "height: 70px; \n" +
                          "position: absolute; \n" +
                          "z-index: 2; \n" +
                          "bottom: -30px; \n" +
                          "} \n";

        document.getElementById("game").appendChild(hole_div);

        var mole_div = document.createElement("div");
        mole_div.setAttribute("id", "mole");
        mole_div.setAttribute('style',
          "background: url(" + chrome.extension.getURL('img/mole.svg') + ") bottom center no-repeat; \n" +
          "background-size: 60%;"
        );
        // mole_div.addEventListener('click', moleClicked);
        document.getElementById("hole").appendChild(mole_div);

        document.getElementById("hole").addEventListener("mouseover", mouseReachedMole);
        document.getElementById("hole").addEventListener("click", moleClicked);
    }
}

function mouseReachedMole() {
    var eventTime = new Date().getTime();
    reactionTimes.hover.push(eventTime - startTime);
    startTime = eventTime;
}

function moleClicked() {
    var eventTime = new Date().getTime();
    reactionTimes.click.push(eventTime - startTime);
    startTime = eventTime;

    score++;
    console.log("Clicked! Score now is " + score);
    removeMole();
}

function nextMole() {
    moleOnScreen = true;
    var location = getRandomLocation();
    console.log(location);
    addMole(location);
}

function removeMole() {
    moleOnScreen = false;
    var hole_div = document.getElementById("hole");
    var mole_div = document.getElementById("mole");
    hole_div.removeChild(mole_div);
    hole_div.parentNode.removeChild(hole_div);
}

function gamePlay(time) {
    // var i = 0;
    // setTimeout(() => {
    //     setTimeout(() => {
    //         var location = getRandomLocation();
    //         console.log(location);
    //         addMole(location);    
    //         setTimeout(removeMole, time);
    //     }, time + 2000);
    // }, 60 * 1000);

    // var interval = setInterval(() => {
    //     if (score === 5) {
    //         clearInterval(interval);
    //     }
    //     nextMole();
    //     setTimeout(() => {
    //       if (moleOnScreen) {
    //         removeMole();
    //       }
    //     }, time);
    // }, time + 2000);

    var interval = setInterval(singleCycle, time + 2000);

    function singleCycle() {
        nextMole();
        startTime = new Date().getTime();

        setTimeout(() => {
          if (moleOnScreen) {
            removeMole();
          }
        }, time);

        if (score === 5) {
            clearInterval(interval);
        }
    }
}

// update all options
function update() {
    // alert("in update");
    chrome.storage.sync.get({
        enabled: false,
        color: "",
        opacity: 1.0,
        interval: -1
    }, function(items) {
        var divs = document.body.querySelectorAll("#game"); // check if there's already a box
        if (divs.length < 1 && items.enabled) {
            var div = document.createElement("div"); 
            div.setAttribute("id", "game"); 
            document.body.insertBefore(div, document.body.firstChild);
        } else if (divs.length > 0 && !items.enabled) {
            var div = document.getElementById("game"); 
            div.remove();
        }

        // sheet.innerHTML = sheet.innerHTML +
        //                   "#hole:after { \n" +
        //                   "display: block; \n" +
        //                   "background: url(" + chrome.extension.getURL('dirt.svg'); + ") bottom center no-repeat; \n" +
        //                   "background-size: contain; \n" +
        //                   "content: ''; \n" +
        //                   "position: absolute; \n" +
        //                   "z-index: 2; \n" +
        //                   "}";

        // var location = getRandomLocation();
        // console.log(location);
        // addMole(location);

        gamePlay(2000);
    });
}

// remove box if tab unfocused
function unfocus()
{
    var divs = document.body.querySelectorAll("#game");
    if (divs.length > 0)
    {
        var div = document.getElementById("game"); 
        div.remove();
    }
}

// helper function for updating color and opacity
function hex_to_rgba(hex_val, opacity) 
{
    var r = parseInt(hex_val.slice(1, 3), 16);
    var g = parseInt(hex_val.slice(3, 5), 16);
    var b = parseInt(hex_val.slice(5, 7), 16);

    return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
}