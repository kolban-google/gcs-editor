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
let tokenClient;
let gapi = window.gapi;
let google = window.google;

/**
 * Initialize the gapi environment.
 */
/*
function gapiInit() {
  return new Promise((resolve, reject) => {
    gapi.client.init({
      // NOTE: OAuth2 'scope' and 'client_id' parameters have moved to initTokenClient().
    })
    .then(function () {  // Load the Calendar API discovery document.
      gapi.client.load('https://storage.googleapis.com/$discovery/rest?version=v1');
      resolve();
    })
    .catch((e) => {
      debugger;
      reject();
    });
  });
} // End of gapiInit
*/

function gisIsReady(client_id) {
  return new Promise((resolve, reject) => {
    google.accounts.oauth2.initTokenClient({
      client_id,
      'scope': 'https://www.googleapis.com/auth/devstorage.full_control',
      'prompt': 'none',
      'callback': () => {
        console.log("InitTokenClient (or maybe access()) returned!");
        resolve()
      }
    });
  })
}
/**
 * Initialize the GIS (Google Identity Services) subsystem.
 * @returns 
 */
function gisInit(client_id) {
  return new Promise((resolve, reject) => {
    if (!client_id) {
      reject(new Error("No client_id supplied"));
      return;
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id,
      'scope': 'https://www.googleapis.com/auth/devstorage.full_control',
      'prompt': 'select_account',
      'callback': () => {
        console.log("InitTokenClient (or maybe access()) returned!");
        resolve()
      }
    });
    //console.log("InitTokenClient called!")
    access();
  });
} // End of gisInit

function access() {
  tokenClient.requestAccessToken();
} // End of access

/**
 * Load the gapi client library.  When that is done, load the discovery document for Cloud Storage.
 * @returns A promise that is resolved when gapi has loaded the client library and the Cloud Storage discovery document.
 */
function gapiLoad() {
  return new Promise((resolve, reject) => {
    //debugger;
    gapi.load('client',
    {
      'callback': () => {
        gapi.client.init({}) // We are assuming gapi.client.init is still needed
        .then(() => {
          return gapi.client.load('https://storage.googleapis.com/$discovery/rest?version=v1')
        })
        .then(resolve)
        .catch((e) => {
          debugger;
          reject(e);
        })
      }, // End callback
      'onerror': (e) => { // Handle an error on loading the client library
        debugger;
        reject(e);
      }, // End onerror
      'timeout': 1000 * 10, // Wait up to 10 seconds for the client library to load.
      'ontimeout': (e) => {
        debugger;
        reject(e);
      } // End ontimeout
    }); 
  });
} // End of gapiLoad

const exports = { gapiLoad, gisInit, access, gisIsReady }
export default exports;