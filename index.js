'use strict'

const fs = require('fs')
const url = require('url')
const http = require('http')

const apiKey = ''
const artistSearchUri = `http://api.songkick.com/api/3.0/search/artists.json?apikey=${apiKey}&query=`

// noinspection JSCheckFunctionSignatures
let data = JSON.parse(fs.readFileSync('./enrichedsavelastfmrecenttracks.json'))
const artists = {}
data.forEach(el => {
  if (!artists[el.artist['#text']]) {
    artists[el.artist['#text']] = [el.name]
  }
})

console.log(Object.keys(artists).length)

// noinspection JSCheckFunctionSignatures
data = JSON.parse(fs.readFileSync('./savelastfmrecenttracks.json'))
const otherArtists = {}
data.forEach(el => {
  if (!otherArtists[el.artist['#text']] && !artists[el.artist['#text']]) {
    otherArtists[el.artist['#text']] = [el.name]
  }
})

// noinspection JSCheckFunctionSignatures
data = JSON.parse(fs.readFileSync('./newlastfmrecenttracks.json'))
const newArtists = {}
data.forEach(el => {
  if (!newArtists[el.artist['#text']] && !artists[el.artist['#text']] && !otherArtists[el.artist['#text']]) {
    newArtists[el.artist['#text']] = [el.name]
  }
})


function awaitFor(begin, stop, fn, cb) {
  if (begin > stop) return cb()
  fn(begin, (err) => {
    if (err) return cb(err)
    setImmediate(() => {
      awaitFor(begin + 1, stop, fn, cb)
    })
  })
}

function optProxy(baseOpt) {
  return {
    host: "",
    port: 0,
    path: baseOpt.completeUrl,
    method: baseOpt.method,
  }
}

function req(uri, method, isBehindProxy, cb) {
  if (isBehindProxy === undefined) isBehindProxy = true
  let errorCbCalled = false
  function errorCb(err) {
    if (!errorCbCalled) {
      errorCbCalled = true
      cb(err)
    }
  }
  let { protocol, hostname, path } = url.parse(uri)
  path = encodeURIComponent(path)
  let opt = {
    protocol,
    hostname,
    path,
    method: method,
    completeUrl: encodeURI(uri)
  }
  if (isBehindProxy) {
    opt = optProxy(opt)
  }
  let req = http.request(opt, res => {
    if (res.statusCode !== 200) {
      console.log(`${uri}: ${res.statusCode}`);
    }
    res.setEncoding('utf8')
    let data = ''
    res.on('data', chunk => {
      data += chunk
    })
    res.on('end', () => {
      if (res.statusCode !== 200)
        return cb(data, null)
      return cb(null, data)
    })
    res.on('error', (err) => errorCb(err))
  })
  req.setHeader('User-Agent', '')
  req.on('error', (err) => errorCb(err))
  req.end()
}

function verboseCallback(artist, i, cb) {
  return (err) => {
    console.log(artist, i, 'error?', err !== undefined && err !== null)
    cb(err)
  }
}

const arts = Object.keys(newArtists)

awaitFor(0, arts.length - 1, (i, cb) => {
  req(artistSearchUri + arts[i], 'GET', true, (err, data) => {
    cb = verboseCallback(arts[i], i, cb)
    if (err) return cb(err)
    try { data = JSON.parse(data) } catch (e) { return cb(e) }
    if (data.resultsPage && data.resultsPage.results && Array.isArray(data.resultsPage.results.artist)) {
      let res = data.resultsPage.results.artist
      if (res.length === 0) {
        fs.appendFile('res.txt', '\nno results for: ' + arts[i], (err) => cb(err))
      } else {
        res = res.filter(el => el.displayName.toLowerCase() === arts[i].toLowerCase())
        if (res.length === 0) {
          fs.appendFile('res.txt', '\nno precise equals results for: ' + arts[i], (err) => cb(err))
        } else {
          fs.appendFile('res.txt', '\n' + res[0].uri.substring(0, res[0].uri.indexOf('-')) + ' ' + arts[i], (err) => cb(err))
        }
      }
    } else {
      fs.appendFile('res.txt', '\nno results for: ' + arts[i], (err) => cb(err))
    }
  })
}, (err) => {
  if (err) {
    console.error(err)
  }
})

