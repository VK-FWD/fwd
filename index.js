const fs = require("fs")
const data = require('./data.js');
const { VK } = require('vk-io');

let ACCESS_TOKEN = "";
if(!fs.existsSync("./config.json")){
    console.log("Первоначальная настройка!")
    const readlineSync = require('readline-sync');
    console.log("Введите access token: ")
    ACCESS_TOKEN = readlineSync.question("", {
        charset: "UTF-8"
    });

    fs.writeFileSync("./config.json", JSON.stringify({
        access_token: ACCESS_TOKEN
    }));
}else{
    let config = JSON.parse(fs.readFileSync("./config.json", 'utf8'));
    ACCESS_TOKEN = config.access_token;
}

const vk = new VK({
    token: ACCESS_TOKEN
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