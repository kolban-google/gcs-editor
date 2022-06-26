/*
# Copyright 2022, Google, Inc.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
/**
 * GCS - A wrapper for GCS functions
 * @author: kolban@google.com
 * @date: 2022-04-23
 * 
 * 
 * listBuckets - List the available buckets
 * listObjects - List the objects
 * deleteObject - Delete an object
 * rewrite - Copy the source to the target
 * move
 * getData
 * write
 * toPath
 */

let gapi = window.gapi;

function testGapi() {
  if (!gapi) {
    throw new Error("gapi not loaded!");
  }
  if (!gapi.client) {
    throw new Error("gapi client not loaded!");
  }
  if (!gapi.client.storage) {
    throw new Error("gapi storage not loaded!");
  }
} // End testGapi

/**
 * List the available buckets
 */
function listBuckets(project) {
  return new Promise((resolve, reject) => {
    try { testGapi() }
    catch (e) { reject(e) }

    gapi.client.storage.buckets.list({ project })
      .then(storageAPIResponse => {
        console.dir(storageAPIResponse);
        resolve(storageAPIResponse)
      })
      .catch(err => {
        debugger;
        reject(err);
      });
  });
} // End of listBuckets

/**
 * List the objects in a given bucket.
 * The options is optional.  If present, it can contain:
 * o noDelimiter - BOOL - true means don't use a delimiter listing.
 */
function listObjects(bucket, prefix, options) {
  console.log(`GCS.listObjects(${bucket}, ${prefix})`)

  return new Promise((resolve, reject) => {

    try { testGapi() }
    catch (e) { reject(e) }
    const listOptions = {
      bucket,
      prefix,
      'delimiter': '/'
    }
    if (options) {
      if (options.noDelimiter === true) {
        delete listOptions.delimiter
      }
    }
    gapi.client.storage.objects.list(listOptions)
      .then(response => {
        console.log(JSON.stringify(response))
        console.dir(response)
        resolve(response.result);
      })
      .catch(response => {
        console.log(response)
        reject(response.result.error);
      });
  });
} // End of listObjects


/**
 * Copy the source object to the target object.
 * @param {*} sourceBucket 
 * @param {*} sourceObject 
 * @param {*} destinationBucket 
 * @param {*} destinationObject 
 * @returns 
 */
function rewrite(sourceBucket, sourceObject, destinationBucket, destinationObject) {
  console.log(`GCS.rewrite(${sourceBucket}, ${sourceObject}, ${destinationBucket}, ${destinationObject})`)
  return new Promise((resolve, reject) => {
    try { testGapi() }
    catch (e) { reject(e) }
    gapi.client.storage.objects.rewrite({ sourceBucket, sourceObject, destinationBucket, destinationObject })
      .then(storageAPIResponse => {
        console.log(JSON.stringify(storageAPIResponse))
        console.dir(storageAPIResponse)
        resolve(storageAPIResponse.result);
      })
      .catch(err => {
        console.log(err)
        reject(err.result);
      });
  });
} // end of rewrite

/**
 * Move the source object to the destination object
 * @param {*} sourceBucket 
 * @param {*} sourceObject 
 * @param {*} destinationBucket 
 * @param {*} destinationObject 
 * @returns 
 */
async function move(sourceBucket, sourceObject, destinationBucket, destinationObject) {
  try {
    await this.rewrite(sourceBucket, sourceObject, destinationBucket, destinationObject)
    await this.deleteObject(sourceBucket, sourceObject)
  } catch (err) {
    debugger;
    throw (err)
  }
} // End of move

// https://groups.google.com/g/google-api-javascript-client/c/sK6YFVoDydQ
/**
 * Write data to a GCS object.
 * @param {*} bucket The name of the bucket in which to create the object.
 * @param {*} name The path name to the object to be created.
 * @param {*} data The data to be written.
 * @returns 
 */
function write(bucket, name, data) {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      reject("No bucket supplied");
      return;
    }
    if (!name) {
      reject("No name supplied");
      return;
    }
    try { testGapi() }
    catch (e) { reject(e) }

    /*

    // This has been disabled as an empty string is ok when we want to create a folder.
    if (!data) {
      reject("No data supplied");
      return;
    }
    */
    // We make a gapi client request.  We can't use the discovery documents.
    gapi.client.request({
      'path': `/upload/storage/v1/b/${bucket}/o`,
      'method': 'POST',
      'params': {
        name,
        'uploadType': 'media'
      },
      'body': data
    })
      /*
      gapi.client.storage.objects.insert({
        'name': name,
        'bucket': bucket,
        'uploadType': 'media',
        "request": {
          'body': "Hello"
        }
      })
      */
      .then((result) => {
        resolve(result.result)
      })
      .catch(err => {
        reject(err.result.error);
      })
  });
} // End write

/**
 * Get the content of the object.
 * @param {*} bucket The name of the bucket to read from.
 * @param {*} object The name of the object to read from the bucket.
 * @returns A promise that resolves to the data to be returned.
 */
function getData(bucket, object) {
  return new Promise((resolve, reject) => {
    gapi.client.storage.objects.get({
      bucket,
      object,
      'alt': 'media' // Flag to retrieve the content of the object
    })
      .then(storageAPIResponse => {
        resolve(storageAPIResponse.body); // Return the content
      })
      .catch(err => {
        console.log(err)
        reject(err.result);
      });
  });
} // End of getData

/**
 * Get the metadata of the object.
 * @param {*} bucket The bucket to read from.
 * @param {*} object The object of which we wish to retrieve the metadata.
 */
async function getMetaData(bucket, object) {
  const getResponse = await gapi.client.storage.objects.get({
    bucket,
    object
  })
  return getResponse.result;
} // End of getMetaData

/**
 * Delete the object.
 * https://cloud.google.com/storage/docs/json_api/v1/objects/delete
 * @param {*} bucket 
 * @param {*} object 
 * @returns 
 */
async function deleteObject(bucket, object, recursive) {
  // What should we do if object is a folder?
  testGapi();
  const filesToDelete = [];
  if (recursive === true) {
    const listResults = await listObjects(bucket, object, { 'noDelimiter': true });
    for (let j = 0; j < listResults.items.length; j++) {
      const subFile = toPath(listResults.items[j].id);
      //console.log(`Should delete ${subFile}`)
      filesToDelete.push(subFile);
    }
  } else {
    filesToDelete.push(object);
  }
  try {
    for (let i = 0; i < filesToDelete.length; i++) {
      console.log(`GCS.deleteObject(${bucket}, ${filesToDelete[i]})`);
      await gapi.client.storage.objects.delete({ bucket, object: filesToDelete[i] })
    }
  }
  catch (e) {
    debugger;
    throw e.result.error;
  }
} // End of deleteObject

/**
 * The object name returned from a list is of the form <bucket>/<path>/<generation>  We want JUST the path part
 * @param {*} objectName 
 * @returns 
 */
function toPath(objectName) {
  return objectName.replace(/\/\d*$/, '').replace(/^.*?\//, '') // Strip off last '/' followed by a number (this is the GCS generation), strip off first anything up to and including the first '/' (this is the bucket name).
} // toPath

const exports = { listBuckets, listObjects, deleteObject, rewrite, move, getData, getMetaData, write, toPath }
export default exports;