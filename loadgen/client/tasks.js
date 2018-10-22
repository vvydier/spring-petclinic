const { Chromeless } = require('chromeless')

var baseUrl = process.env.PETCLINIC_BASE_URL || 'http://localhost:3000';
var url = baseUrl
var NUM_IPS = 1000;
var RANDOM_IPS = loadRandomIPs();

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function run() {
    const chromeless = new Chromeless({
        launchChrome: true
    });

    for(;;){
        url = await chromeless
            .goto(url)
            .setExtraHTTPHeaders({
                'X-Forwarded-For': selectRandomIP()
            })
            .evaluate((baseUrl) => {
            var links = document.querySelectorAll('a[href^="/"]');
        if (links && links.length) {
            var i = Math.floor(Math.random()*links.length)
            return links[i].href
        } else {
            return baseUrl
        }
    }, baseUrl);
        console.log(url)
        await sleep(6000 + Math.floor(Math.random()*10000))
    }
}

function selectRandomIP() {
    return RANDOM_IPS[Math.floor(Math.random() * RANDOM_IPS.length)];
}

function loadRandomIPs() {
    var IPs = [];
    while (IPs.length < NUM_IPS) {
        var randomIP = randomIp();
        if (IPs.indexOf(randomIP) === -1) {
            IPs.push(randomIP);
        }
    }
    return IPs;
}


function randomByte () {
    return Math.round(Math.random()*256);
}

function isPrivate(ip) {
    return /^10\.|^192\.168\.|^172\.16\.|^172\.17\.|^172\.18\.|^172\.19\.|^172\.20\.|^172\.21\.|^172\.22\.|^172\.23\.|^172\.24\.|^172\.25\.|^172\.26\.|^172\.27\.|^172\.28\.|^172\.29\.|^172\.30\.|^172\.31\./.test(ip);
}

function randomIp() {
    var ip = randomByte() +'.' +
        randomByte() +'.' +
        randomByte() +'.' +
        randomByte();
    if (isPrivate(ip)) { return randomIp(); }
    return ip;
}

run().catch(console.error.bind(console))
