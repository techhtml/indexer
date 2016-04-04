'use strict';

let fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    _ = require('lodash'),
    Promise = require('promise');

// change this
let dir = "testRoot";

let getHTMLFiles = new Promise((resolve, reject) => {
    glob(dir + "/**/*.html", (err, files) => {
        if(err) reject("error in glob!");
        if(files) resolve(files);
    });
});

let getHTMLTitle = function(file) {
    return new Promise((resolve, reject) => {
        var regExp = /(<title>)(.*)(<\/title>)/;
        fs.readFile(file, 'utf-8', (err, data) => {
            var fileTitle = data.match(regExp);
            if(fileTitle !== null) {
                fileTitle = fileTitle[2];
            } else {
                fileTitle = path.basename(file);
            }
            if(typeof fileTitle === "string") {
                resolve(fileTitle);
            }
        })
    })
};

let writeHTMLFiles = function(fileString) {
    let htmlBody = '<!DOCTYPE html><html><head><title>Index</title><meta charset="UTF-8"></head><body><ul>' + fileString + "</ul></body></html>";
    fs.writeFile('index.html', htmlBody, 'UTF-8', (err) => {})
};

getHTMLFiles.then((files) => {
    let fileString = '';
    _.eachRight(files, (data) => {
        getHTMLTitle(data).then((htmlTitle) => {
            let listAnchorItem = '<li><a href=' + data + '>' + htmlTitle + '</a></li>';
            fileString += listAnchorItem;
            files.pop();
            if(files.length === 0) {
                writeHTMLFiles(fileString);
            }
        });
    })
});