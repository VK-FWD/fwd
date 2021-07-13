const VERSION = "1.0.0"
const VERSION_CODE = 1
const CORN = "⠀⡠⡤⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⢿⡢⣁⢄⢫⡲⢤⡀⠀⠀⠀⠀⢀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠘⣧⡁⢔⢑⢄⠙⣬⠳⢄⠀⠀⣾⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠘⢎⣤⠑⣤⠛⢄⠝⠃⡙⢦⣸⣧⡀⠀⢠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠈⢧⡿⣀⠷⣁⠱⢎⠉⣦⡛⢿⣷⣤⣯⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠈⠉⠛⠻⢶⣵⣎⣢⡜⠣⣠⠛⢄⣜⣳⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⣿⣾⣿⣾⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠟⠛⠛⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠋⠀⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⠂⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⠿⠋⠁⠀⠀⠀⠀"
const INFO = "VK FWD \nВерсия: "+VERSION+" ("+VERSION_CODE+")"

module.exports.startUp = function (data) {
    console.log(CORN+"\n\n"+INFO)

    data.commands = {}
    data.outputListeners.push(async (message) => {
        let args = message.text.split(" ")
        if(args.length!==0&&args[0].startsWith("!")) {
            let commandName = args.shift().substr(1)
            if(data.commands[commandName]!==undefined)
                await data.commands[commandName](message, args)
        }
    })

    data.confirmAction = (peerId) => {
        return new Promise(async (resolve, reject) => {
            const messageId = await data.vk.sendMessage(peerId, "❓ Подтвердите действие (да/нет)");

            let attempt = 1;
            let outputListeners = data.outputListeners;
            data.outputListeners = [
                (message) => setTimeout(async () => {
                        console.log(message?.messagePayload)
                        if(message.peerId!==peerId||message.messagePayload!==undefined) return;

                        if(message.text.toLowerCase()==="да"){
                            data.outputListeners = outputListeners
                            resolve()
                        }else if(message.text.toLowerCase()==="нет"||attempt>=3){
                            data.outputListeners = outputListeners
                            reject()
                        }else{
                            attempt++;
                            await data.vk.replaceMessageById(peerId, messageId,
                                "❗ Подтвердите действие (да/нет). " + "Попытка "+attempt+" из 3");
                        }

                        await data.vk.api.messages.delete({
                            message_ids: message.id,
                            peer_id: peerId
                        })
                    }, 0)
            ]
        })
    }

    data.commands.reload = async (message) => {
        data.commands = {}
        data.updateInfo().then(r=>{
            data.scanModules();
            data.load();

            if(message!==undefined) {
                data.vk.replaceMessage(message, "✔ Модули были успешно перезапущены")
            }
        })
    }

    data.commands.fwd = async (message) => data.vk.sendMessage(message.peerId, "🌽 "+INFO)
}