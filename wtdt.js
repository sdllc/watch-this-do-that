/*

MIT No Attribution

Copyright 2018 Structured Data, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const minimatch = require('minimatch');
const child_process = require('child_process');

// default config file, local

let config_file = "wtdt.config.json";
let verbose = false;
let watcher;

// read args

for( let i = 0; i< process.argv.length; i++){
  if( process.argv[i] === "--config" && i< process.argv.length-1){
    config_file = process.argv[++i];
  }
  else if( process.argv[i] === "--verbose") verbose = true;
  else if( process.argv[i] === "--help" || process.argv[i] === "-?"){
    console.info("\nusage: node wtdt.js [--config path-to-config.json] [--verbose]\n");
    process.exit(0);
  }
}

// make an absolute path so we can ===

config_file = path.resolve(config_file);
if(verbose) console.info("config file:", config_file);

/**
 * runs command (via exec).
 * TODO: wd, other options, path substitution? (...)
 * TODO: maybe add node_modules/.bin to path? optionally?
 */
const Do = function(command, obj, file_path){
  console.info("DO:", command);
  return new Promise((resolve, reject) => {
    child_process.exec(command, {}, (err, stdout, stderr) => {
      if(err) {
        console.error( "\nerror running command: " + err + "\n");
      }
      console.info(stdout);
      console.info(stderr);
    });
  });
}

/** 
 * compares changed file against globs, runs commands on match
 */
const Compare = async function(map, file_path){

  // check config file

  if(verbose) console.log(`File ${file_path} has been changed`);
  if(file_path === config_file){
    console.info("config file changed; restarting watches");
    setImmediate(() => Restart());
    return;
  }

  // and globs

  map.forEach(async entry => {
    if(verbose) console.info("checking", entry.watch);
    let match = false; 
    if(Array.isArray(entry.watch)) match = entry.watch.some(s => minimatch(file_path, s));
    else match = minimatch(file_path, entry.watch);
    if(match){
      if(entry.log) console.info("\nWTDT:", entry.log);
      if(entry.do){
        if(Array.isArray(entry.do)) await entry.do.forEach(command => Do(command, entry, file_path));
        else await Do(entry.do, entry, file_path);
      }
    }
  });

}

/**
 * (re)starts watcher. restarts on config file changes.
 */
const Restart = function(){

  if(watcher) watcher.close();
  let map = [];
  let obj = null;

  fs.readFile(config_file, "utf8", (err, data) => {

    if(err){
      console.error("error reading config file, exiting");
      return;
    }

    try {
      obj = JSON.parse(data);
    }
    catch(e){
      console.error("config file JSON error. fix it and we will reload it");
    }

    console.info("starting watcher");
    
    // start with config file

    watcher = chokidar.watch(config_file, {
      persistent: true
    });

    // watch patterns/globs

    if(obj) obj.forEach(entry => {
      if(Array.isArray(entry.wach)) entry.watch.forEach(s => watcher.add(s));
      else watcher.add(entry.watch);
    });

    if(verbose) watcher.on('add', file_path => console.log( "ADD", file_path));
    watcher.on('change', file_path => Compare(obj, file_path));
    watcher.on('unlink', file_path => Compare(obj, file_path));

  });

}

Restart();

