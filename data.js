const fs = require("fs")

class Data {
    user = null
    vk = null
    inputListeners = []
    outputListeners = []
    modules = {}

    updateInfo = async () => {
        this.user = await this.vk.api.users.get({})
        this.user = this.user[0]
    }

    scanModules = async () => {
        this.inputListeners = []
        this.outputListeners = []
        this.modules = {}

        fs.readdirSync("./modules/").forEach(file => {
            if(fs.existsSync("./modules/"+file+"/fwd-module.json")){
                let moduleConfig;
                try {
                    moduleConfig = JSON.parse(fs.readFileSync(
                        "./modules/" + file + "/fwd-module.json", 'utf8'))
                }catch (e) {
                    console.log("Invalid module config: /modules/"+file+"/fwd-module.json")
                    return;
                }

                const module = require("./modules/" + file + "/" + moduleConfig['module']);
                module.config = moduleConfig;
                module.path = "./modules/"+file+"/";

                this.modules[moduleConfig['id']] = module
            }
        });
    }

    load = async () => {
        this.modules['system'].startUp(this)
        for(let moduleName in this.modules)
            if(this.modules.hasOwnProperty(moduleName)&&moduleName!=="system"){
                const module = this.modules[moduleName]
                if(!fs.existsSync("./data/"+moduleName+"/"))
                    fs.mkdirSync("./data/"+moduleName+"")

                if(module.startUp!==undefined)
                    setTimeout(() => module.startUp(this, "./data/"+moduleName+""), 0);
            }
    }
}

module.exports = new Data()