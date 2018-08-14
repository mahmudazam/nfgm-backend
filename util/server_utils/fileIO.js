
/**
 * Imports:
 */
// Node Standard Modules:
const path = require('path'); // normalize, basename
const fs = require('fs'); // createReadStream, createWriteStream

/**
 * Copy a file from a given source to a destination
 * @param {String} source the path to the source file
 * @param {String} destination the path to the destination file
 * @param {Promise}
 */
function copyFile(source, destination) {
  let promise = new Promise((resolve, reject) => {
    // Stream to read source file:
    let srcStream = fs.createReadStream(source);
    srcStream.on("error", (error) => {
      reject(error);
    })

    // Stream to write destination file:
    let destStream = fs.createWriteStream(destination);
    destStream.on("error", (error) => {
      reject(error);
    })

    // Resolve promise on successfully reading the source file:
    srcStream.on("end", () => {
      resolve({status: 'SUCCESS', source: source, destination: destination});
    });
    srcStream.pipe(destStream);
  });

  return promise;
}

/**
 * Delete a given file
 * @param {String} pathToFile the path to the file to be deleted
 * @param {Promise}
 */
function deleteFile(pathToFile) {
  let promise = new Promise((resolve, reject) => {
    fs.unlink(pathToFile, (error) => {
      if(error) {
        reject(error);
      } else {
        resolve("Deleted " + pathToFile);
      }
    });
  });

  return promise;
}

if("FILE_TEST" === process.argv[2]) {
  copyFile('./fileIO.js', './fileIO_copy.js')
    .then((message) => {
      console.log("copyFile: " + message.status);
      return deleteFile(message.destination);
    })
    .then((message) => {
      console.log(message);
      process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
}

module.exports = {
  copyFile: copyFile,
  deleteFile: deleteFile
};
