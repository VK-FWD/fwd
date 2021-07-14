const fs = require("fs")
const data = require('./data.js');
const { VK } = require('vk-io');

let ACCESS_TOKEN = "";
let config = {};
if(!fs.existsSync("./config.json")){
    console.log("Первоначальная настройка!")
    const readlineSync = require('readline-sync');

    process.stdout.write("Введите access token: ");
    config.access_token = readlineSync.question("", {
        charset: "UTF-8"
    });

    process.stdout.write("Нужен ли proxy? [no]: ");
    if(readlineSync.question("", {charset: "UTF-8"}).toLowerCase()==="yes"){
        process.stdout.write("Введите proxy [https://vk-api-proxy.xtrafrancyz.net]: ");
        let proxy = readlineSync.question("", {charset: "UTF-8"})
        if(proxy.length===0) proxy = "https://vk-api-proxy.xtrafrancyz.net/method"
        else proxy += "/method"

        config.apiUrl = proxy
    }

    fs.writeFileSync("./config.json", JSON.stringify(config));
}else{
    config = JSON.parse(fs.readFileSync("./config.json", 'utf8'));
}

const vk = new VK({
    token: config.access_token,
    apiBaseUrl: config.apiUrl||"https://api.vk.com/method"
});

vk.replaceMessage = async (message, text) => {
    return await vk.api.messages.edit({
        message_id: message.id,
        peer_id: message.peerId,
        message: text
    });
}

vk.replaceMessageById = async (peerId, messageId, text) => {
    return await vk.api.messages.edit({
        message_id: messageId,
        peer_id: peerId,
        message: text,
    });
}

vk.sendMessage = async (peerId, text) => {
    await new Promise(resolve => setTimeout(resolve, 5))
    return await vk.api.messages.send({
        peer_id: peerId,
        message: text,
        random_id: 0,
        payload: "{\"fwd\":1}"
    });
}

data.vk = vk
data.updateInfo().then(async () => {
    await data.scanModules()
    await data.load()

    vk.updates.on(['message_new', 'message_reply'], (update) => {
        if(update.isOutbox){
            for(let i in data.outputListeners){
                if (data.outputListeners.hasOwnProperty(i)) {
                    setTimeout(async () => await data.outputListeners[i](update), 0)
                }
            }
        }else{
            for(let i in data.inputListeners) {
                if (data.inputListeners.hasOwnProperty(i)) {
                    setTimeout(async () => await data.inputListeners[i](update), 0)
                }
            }
        }
    }).startPolling().then()
})