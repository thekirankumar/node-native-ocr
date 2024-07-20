const path = require('path')
let bindings

const isElectron = process.versions.hasOwnProperty('electron')
const ocrPackagePath = 'node_modules/@thekirankumar/node-native-ocr'
bindings = require('../build/Release/node-native-ocr.node')

const DEFAULT_LANG = 'eng'
const LANG_DELIMITER = '+'

const handleOptions = (options = {}) => {

  if(!options.lang){
    options.lang = DEFAULT_LANG
  }
  if(!options.tessdataPath){
    if (isElectron) {
      console.log('Electron mode.')
      const electron = require("electron")
      const appPath = (electron.app || electron.remote.app).getAppPath()
      options.tessdataPath = path.resolve(appPath, ocrPackagePath, 'tessdata')
    } else{
      console.log('Node mode.')
      options.tessdataPath = path.resolve(__dirname, "..", "tessdata")
    }
  }
  if(!options.format){
    options.format = 'txt'
  }

  if (Array.isArray(options.lang)) {
    options.lang = options.lang.join(LANG_DELIMITER)
  }

  return options
}

const makePromise = (method) => {

  return (arg, options) => new Promise((resolve, reject) => {
    options = handleOptions(options)
    
    bindings[method](arg, options.lang, options.tessdataPath, options.format !== 'txt', (err, text) => {
      if (err) {
        console.log('error:', err)
        const error = new Error(text)
        error.code = err
        return reject(error)
      } else {
        console.log('success:', text)
      }

      resolve(text.trim())
    })
  })
}

exports.recognize = makePromise('recognize')
