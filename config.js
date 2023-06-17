import 核心api from "./util/kernelApi.js"
const path = require("path")
const fs = require("fs-extra")

export default {
    首页:"20200812220555-lj3enxa",
    templatePath:path.join(workspaceDir,'data','servicies','noob-service-publisher','pipeRender','templates'),
    发布主题:"daylight",
    网站图标:path.join(workspaceDir,'data','storage','berry','noob-service-publisher','favicon.png'),
}
let langs  ={
    en_US:{},
    es_ES:{},
    fr_FR:{},
    zh_CHT:{},
    zh_CN:{},
}
for (  let lang in langs ){
    langs[lang] = fs.readJSONSync(path.join(workspaceDir,"conf","appearance","langs",`${lang}.json`))
}
let conf = await 核心api.getConf({},"")
let i18n = langs[conf.lang||"zh_CN"]

export {i18n as i18n}