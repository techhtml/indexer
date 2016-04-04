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

let writeHTMLFiles = function(fileTable) {
    let sortedTable = _.sortBy(fileTable, function(o) { return o.directory });
    let htmlString = '';
    _.each(sortedTable, (obj) => {
        let tdDirectory = '<td>' + obj.directory + '</td>';
        let tdTitle = '<td><a href=' + obj.url + '>' + obj.title + '</a></td>';
        let tdfileName = '<td><a href=' + obj.url + '>' + obj.fileName + '</a></td>';
        let tdRow = '<tr>' + tdDirectory + tdTitle + tdfileName + '</tr>';
        htmlString += tdRow;
    });
    let htmlBody = '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>INDEX</title>' +
        '</head>' +
        '<body>' +
        '<table>' +
        '<thead>' +
        '<tr>' +
        '<th>Directory</th>' +
        '<th>Title</th>' +
        '<th>fileName</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' + htmlString + '</tbody>' +
        '</table>' +
        '</body>' +
        '</html>';

    fs.writeFile('index.html', htmlBody);
};

getHTMLFiles.then((files) => {
    let fileTable = [];
    _.eachRight(files, (data) => {
        getHTMLTitle(data).then((htmlTitle) => {
            let parentPath = path.dirname(data).replace(dir, '');

            let pathInfo = {
                directory: parentPath,
                url: data,
                title: htmlTitle,
                fileName: path.basename(data)
            };

            fileTable.push(pathInfo);

            files.pop();
            if(files.length === 0) {
                writeHTMLFiles(fileTable);
            }
        });
    })
});