const REPOSITORY = "https://raw.githubusercontent.com/VK-FWD/Repository/main/fwd-modules.json";
const fetch = require("node-fetch");
const fs = require("fs")
const unzipper = require('unzipper');

module.exports.startUp = (data) =>{
    data.commands.pm = async (message, args) => {
        switch (args[0]) {
            case "remove": {
                if (args.length !== 2) return;

                let packageName = args[1]
                if (data.modules[packageName] === undefined||packageName==="system"
                    ||packageName==="pm") {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не установлен")
                    return;
                }

                data.confirmAction(message.peerId).then(async ()=>{
                    fs.rmdirSync(data.modules[packageName].path, { recursive: true })
                    data.commands.reload()

                    await data.vk.sendMessage(message.peerId,
                        "✔ Модуль " + packageName + " успешно удалён")
                }).catch(reason => console.log(reason))
            }
            break;

            case "info": {
                if (args.length !== 2) return;

                const packageName = args[1]
                if (data.modules[packageName] === undefined) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не установлен")
                    return;
                }

                const module = data.modules[packageName]
                await data.vk.sendMessage(message.peerId,
                    "🎲 Идентификатор: "+module.config['id']+"\n"+
                            "🕹 Название: "+module.config['name']+"\n"+
                            "📃 Описание: "+(module.config['desc']||"отсутствует")+
                            ""
                )
            }
            break;

            case "update": {
                if (args.length !== 2) return;

                let packageName = args[1]
                if (data.modules[packageName] === undefined) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не установлен")
                    return;
                }

                let packages = await fetch(REPOSITORY).then(r => r.json())
                if (packages[packageName] === undefined) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не найден")
                    return;
                }

                let releases = await fetch("https://api.github.com/repos/" +
                    packages[packageName] + "/releases").then(r => r.json())
                if (releases.length === 0) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не был выпущен")
                    return;
                }

                fs.rmdirSync(data.modules[packageName].path, { recursive: true })
                fetch(releases[0]['zipball_url']).then(async r => {
                    await r.body.pipe(unzipper.Extract({path: "./modules/"}))

                    data.commands.reload()
                    await data.vk.sendMessage(message.peerId,
                        "✔ Модуль " + packageName + " успешно обновлён")
                }).catch(async (e) => {
                    console.log(e);
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не был установлен")
                })
            }
            break;

            case "install": {
                if (args.length !== 2) return;

                let packageName = args[1]
                if (data.modules[packageName] !== undefined) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " уже установлен")
                    return;
                }

                let packages = await fetch(REPOSITORY).then(r => r.json())
                if (packages[packageName] === undefined) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не найден")
                    return;
                }

                let releases = await fetch("https://api.github.com/repos/" +
                    packages[packageName] + "/releases").then(r => r.json())
                if (releases.length === 0) {
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не был выпущен")
                    return;
                }

                fetch(releases[0]['zipball_url']).then(async r => {
                    await r.body.pipe(unzipper.Extract({path: "./modules/"}))

                    data.commands.reload()
                    await data.vk.sendMessage(message.peerId,
                        "✔ Модуль " + packageName + " успешно установлен")
                }).catch(async (e) => {
                    console.log(e);
                    await data.vk.sendMessage(message.peerId,
                        "❗ Модуль " + args[1] + " не был установлен")
                })
            }
            break;
        }
    }
}