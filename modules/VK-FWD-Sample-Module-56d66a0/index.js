module.exports.startUp = (data) => {
    data.commands.sample = (message, args) => {
        data.vk.sendMessage(message.peerId, "This is simple command in simple module")
    }
}