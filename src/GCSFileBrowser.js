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
import {
  ChonkyActions, ChonkyIconName, FileBrowser,
  FileContextMenu, FileList, FileNavbar, FileToolbar, setChonkyDefaults
} from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import React from 'react';
import GCS from './gcs';
import GCP_SEC from './gcp_sec';
import ErrorDialog from './ErrorDialog';
import FileSaver from 'file-saver';

import PropTypes from 'prop-types';
import { faRecycle } from '@fortawesome/free-solid-svg-icons/faRecycle';
import { Card, CardContent, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';


/**
 * What is folderChain?
 * --------------------
 * THe folderChain is a state variable that is an array of objects.  Each object contains:
 * * id    - Unique identity of the current entry
 * * name  - Name of the current entity
 * * isDir - Is this a directory or an object?
 * * icon  - What icon to use to show it
 */
const BUCKET_ID = "#bucket"

/**
 * Is the given Chonky file a directory?
 * @param {*} file 
 * @returns True if the file is marked as a directory
 */
function isDir(file) {
  return file.isDir === true;
} // End of isDir

class GCSFileBrowser extends React.Component {
  /**
   * Constructor
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      'folderChain': [ // The folder chain from the root down.
        {
          'id': BUCKET_ID,
          'name': props.bucket,
          'isDir': true,
          'icon': ChonkyIconName.database
        }
      ],
      'files': [], // The files that should be shown in the file list.
      'openRenameDialog': false,
      'targetFileName': "",
      'openCreateFolderDialog': false,
      'createFolderName': "",
      'openError': false,
      'errorMessage': {},
      'gcsError': false,
    }

    this.uploadRef = React.createRef();


    //ChonkyActions.OpenParentFolder.button.contextMenu = true; // Add the OpenParentFolder into the context menu.  The default is not to be there.
    //ChonkyActions.OpenSelection.button = null; // Remove the OpenSelection action
    setChonkyDefaults({
      'iconComponent': ChonkyIconFA,
      'clearSelectionOnOutsideClick': false // By default, selection is cleared when clicked outside of Chonky
    });
  } // End of constructor

  static getDerivedStateFromProps(props, state) {
    if (props.bucket !== state.folderChain[0].name) {
      debugger;
      //Change in props

      const newFolderChain = [...state.folderChain];
      let el0 = { ...newFolderChain[0] }
      el0.name = props.bucket;
      newFolderChain[0] = el0;
      return { 'folderChain': newFolderChain }
    }
    return null; // No change to state
  } // End of getDerivedStateFromProps

  /**
   * Refresh the files.
   */
  refresh() {
    this.#updateObjects();
  } // End of refresh

  /**
   * Get the prefix of a file.  For example, "a/b/c.txt" => "a/b/"
   * @param {*} fileName 
   * @returns The prefix of a file path.
   */
  #getPrefix(fileName) {
    // Return the prefix of the file.  The prefix is everything up to the last "/"
    const result = fileName.match(/^.*\//);
    if (result === null) {
      return "";
    }
    return result[0];
  } // End of #getPrefix

  /**
   * Get the name of the current bucket.
   * @returns The name of the current bucket
   */
  #getBucket() {
    return this.state.folderChain[0].name
  } // End of #getBucket

  #showErrorDialog(err) {
    this.setState({ 'openError': true, 'errorMessage': err });
  }

  /**
   * fileAction
   * 
   * This is the core handler for user initiated actions.  This is a callback function registered with Chonky.  The data passed in includes
   * a property called `id` that is the identity of "what" function the user is requesting.
   * 
   * @param {*} data 
   * @returns 
   */
  async #fileAction(data) {
    try {
      console.log(`fileAction: id: ${data.id}`)
      console.dir(data);
      //
      // OpenFiles
      //
      // In this section, we are wanting to navigate to a specific folder and show the files in that folder.
      // Mechanically, we need to contemplate how chonky knows which directory we are in and allows us to
      // navigate up and down.  Chonky maintains an array called folderChain.  Think of this an an ordered
      // array of folders where each folder is a file entry.
      // Imagine a GCS object called a/b/c/d.txt.  This would be a file called d.txt that lives in folder c owned by folder
      // b owned by folder a.  The folderChain would thus be:
      //
      // * file: a/
      // * file: a/b/
      // * file: a/b/c/
      //
      // When we get an OpenFiles request, a single file in the view has been double clicked to drill down into it.
      // We check to see if it is flagged as a folder.  If it is not, we are done.
      // Our goal now is to build a new folderChain array.  We copy from the original folderChain to the new folderChain 
      // until we detect that the have a match to the file selected.

      if (data.id === ChonkyActions.OpenFiles.id) {
        if (data.payload.targetFile && isDir(data.payload.targetFile)) { // Test that we are working with a folder.
          // Here we now know we are working with a folder and data.payload.targetFile is the folder we wish to open.
          const newFolderChain = [];
          let stop = false;
          this.state.folderChain.forEach((entry) => {
            if (stop) {
              return;
            }
            newFolderChain.push(entry);
            if (entry.id === data.payload.targetFile.id) {
              stop = true;
            }
          });
          if (!stop) {
            newFolderChain.push(data.payload.targetFile)
          }
          this.setState({ 'folderChain': newFolderChain }, async function () {
            await this.#updateObjects();
            // We have now changed folder ... this should mean that nothing has been selected however this doesn't necessarily fire
            // a selection changed event.
            if (this.props.onChangeSelection) {
              this.props.onChangeSelection({
                bucket: this.#getBucket(),
                folder: this.#buildPath(),
                selection: new Set()
              });
            }
          })
        } // End of working with a folder.
      } // End OpenFIles
      //
      // DeleteFiles
      //
      else if (data.id === ChonkyActions.DeleteFiles.id) {
        const bucket = this.#getBucket();
        try {
          for (let i = 0; i < data.state.selectedFilesForAction.length; i++) {
            await GCS.deleteObject(bucket, data.state.selectedFilesForAction[i].id, true /* Recursive = true */)
          }

          this.#updateObjects()
        } catch (e) {
          this.#showErrorDialog(e);
        }
      } // End DeleteFiles
      //
      // EndDragNDrop
      //
      else if (data.id === ChonkyActions.EndDragNDrop.id) {
        // data.payload.destination - Target of drag and drop.  A file object.
        // data.payload.draggedFile - The source of the the drag and drop.  A file object.
        const sourceFile = data.payload.draggedFile;
        const targetFile = data.payload.destination;
        if (isDir(sourceFile)) {
          console.log(`The source file is a folder, we don't support dragging folders`);
          return;
        }
        GCS.move(this.#getBucket(), sourceFile.id, this.#getBucket(), targetFile.id + sourceFile.name).then(this.#updateObjects);
      } // End EndDragNDrop
      //
      // UploadFiles
      //
      else if (data.id === ChonkyActions.UploadFiles.id) {
        this.uploadRef.current.click(); // Fire the file upload dialog
      } // end UploadFiles
      //
      // DownloadFiles
      //
      else if (data.id === ChonkyActions.DownloadFiles.id) {
        if (data.state.selectedFilesForAction.length !== 1) {
          console.log("Must be ONE file selected");
          return;
        }

        const selectedFile = data.state.selectedFilesForAction[0];
        if (isDir(selectedFile)) {
          console.log(`Not downloading a directory: ${selectedFile.id}`)
          return;
        }
        const bucket = this.#getBucket();
        GCS.getData(bucket, selectedFile.id).then((fileData) => {
          const blobData = new Blob([fileData]);
          const fileName = `${bucket}_${selectedFile.name}`
          FileSaver.saveAs(blobData, fileName);
        })
      } // End DownloadFiles
      //
      // CreateFolder
      //
      else if (data.id === ChonkyActions.CreateFolder.id) {
        this.setState({ 'openCreateFolderDialog': true });
      } // End of CreateFolder
      //
      // Refresh
      //
      else if (data.id === 'refresh') {
        this.#updateObjects();
      } // End of refresh
      //
      // ChangeSelection
      //
      else if (data.id === ChonkyActions.ChangeSelection.id) {
        if (this.props.onChangeSelection) {
          this.props.onChangeSelection({
            'bucket': this.#getBucket(),
            'folder': this.#buildPath(),
            'selection': data.payload.selection
          })
        }
      } // End of ChangeSelection
      //
      // Rename file
      //
      else if (data.id === "rename_file") {
        if (data.state.selectedFilesForAction.length > 1) {
          console.log("Only one file can be renamed")
          return;
        }
        this.sourceFile = data.state.selectedFilesForAction[0];
        this.setState(
          {
            'openRenameDialog': true,
            'targetFileName': this.sourceFile.name
          }
        );
      } // End Rename file
    }
    catch (e) {
      debugger;
    }
  } // End of #fileAction

  /**
   * Build a path to the current folder.
   * @returns The path to the current folder.
   */
  #buildPath() {
    // folderChain is an array of folders.  The first (index = 0) is the current bucket.
    let path = "";
    for (let i = 1; i < this.state.folderChain.length; i++) {
      path = `${path}${this.state.folderChain[i].name}/`
    }
    return path;
  } // End of buildPath

  /**
   * Update the objects in the file list.
   */
  async #updateObjects() {
    try {
      const path = this.#buildPath()
      const listResults = await GCS.listObjects(this.#getBucket(), path);

      console.dir(listResults);
      const newFiles = []; // This will contain the complete set of files to show in Chonky.

      // The results from listObjects contains two types of data:
      // * .items - An array of GCS Objects contained in the named folder.
      // * .prefixes - An array of names of prefixes of other folders contained in this folder.
      // Either of these may not be present in a return.
      if (listResults.items) {
        listResults.items.forEach((gcsObject) => {
          if (gcsObject.name !== path) {
            newFiles.push(
              {
                'id': GCS.toPath(gcsObject.id),
                'name': gcsObject.name.replace(/\/$/, '').replace(/^.*\//, ''), // Strip off trailing '/', strip of anything up to and including the first '/'
                'size': Number(gcsObject.size),
                'modDate': new Date(gcsObject.updated),
                'isDir': gcsObject.name.endsWith('/'), // Handle the case where the folder contains a folder place holder.
                'ext': gcsObject.name.includes('.') ? null : '' // This is patch for https://github.com/TimboKZ/Chonky/issues/142
              }
            );
          }
        });
      }
      if (listResults.prefixes) {
        listResults.prefixes.forEach((folder) => {
          newFiles.push(
            {
              'id': folder,
              'name': folder.replace(/\/$/, '').replace(/^.*\//, ''), // Strip off trailing '/', strip of anything up to and including the first '/'
              'size': 0,
              'isDir': true
            });
        });
      }
      this.setState({ 'files': newFiles, 'gcsError': false });
    }
    catch (e) {
      this.#showErrorDialog(e)
      console.dir(e)
      this.setState({ 'gcsError': true });
      //StackTrace.fromError(e).then(console.log)
    }
  } // updateObjects

  /**
   * 
   * @param {*} e 
   */
  #uploadOnChange(e) {
    // Called when the upload hidden <input> is triggered because the user
    // has selected a file.
    const file = this.uploadRef.current.files[0]; // This is a JavaScript File object
    this.uploadRef.current.value = ''; // Clear the file so that it can be opened again.  If not cleared, onchange isn't fired again until another file is selected.

    // file.name = name of file
    // file.type = mime type  
    const path = `${this.#buildPath()}${file.name}`;
    const bucket = this.#getBucket();

    // Create a file reader to read the file from the local file system.  Read the file as a binary string.
    // We have registered an onload() call back to be called when the file has been loaded.
    const fileReader = new FileReader();
    fileReader.onload = () => {
      console.dir(fileReader)
      GCS.write(bucket, path, fileReader.result).then(this.#updateObjects.bind(this)).catch((err) => { this.#showErrorDialog(err) });
    }
    fileReader.readAsBinaryString(file); // When the file has been read, the onload() will be invoked.
  } // uploadOnChange

  /**
   * 
   * @returns 
   */
  #renameFile() {
    console.log(`Renaming file ${this.sourceFile.id} to ${this.state.targetFileName}`)
    this.setState({ 'openRenameDialog': false })
    if (this.state.targetFileName === this.sourceFile.name) {
      console.log("Not renaming.  Source and target the same");
      return;
    }
    const targetFile = this.#getPrefix(this.sourceFile.id) + this.state.targetFileName;
    console.log(`Final: Renaming file ${this.sourceFile.id} to ${targetFile}`)
    // Step 1 copy the source file to the target file
    const bucket = this.#getBucket()
    GCS.move(bucket, this.sourceFile.id, bucket, targetFile).then(this.#updateObjects.bind(this)).catch((err) => { this.#showErrorDialog(err) });
    //GCS.rewrite(bucket, this.sourceFile.id, bucket, targetFile).then(GCS.deleteObject(bucket, this.sourceFile.id)).then(this.#updateObjects);
    // Step 2 delete the target file
  } // End of renameFile

  /**
   * 
   */
  #createFolder() {
    this.setState({ openCreateFolderDialog: false });
    if (this.state.createFolderName.length === 0) {
      console.log('Folder must have a name');
      return;
    }
    const pathName = `${this.#buildPath()}${this.state.createFolderName}/`;
    // Create an empty file that ends with a "/" that is zero bytes.
    GCS.write(this.#getBucket(), pathName, "").then(this.#updateObjects.bind(this));
    this.setState({ 'createFolderName': '' }); // Clear the name of the folder so that when we show the dialog again, it is empty.
    //debugger;
  } // End of createFolder

  /**
   * Called when the DOM is ready.  We can now call GCS to update the objects.
   */
  componentDidMount() {
    this.#updateObjects();
  } // componentDidMount

  /**
   * 
   * @returns 
   */
  render() {
    let view = ChonkyActions.EnableListView.id; // Set the view type ... this will be either list or grid with the default being list.
    if (this.props.initialView && this.props.initialView === "grid") {
      view = ChonkyActions.EnableGridView.id;
    }
    const RenameFile = {
      'id': 'rename_file',
      'requiresSelection': true,
      'hotkeys': ['ctrl+r'],
      'button': {
        'name': 'Rename file',
        'toolbar': true,
        'contextMenu': true,
        'group': 'Actions',
        'icon': ChonkyIconName.placeholder,
      }
    }
    const Refresh = {
      'id': 'refresh',
      'requiresSelection': false,
      'button': {
        'name': 'Refresh',
        'toolbar': true,
        'contextMenu': true,
        'group': 'Actions',
        'icon': faRecycle
      }
    }
    this.gcsFileBrowserFileActions = [
      Refresh
    ];
    if (this.props.noUpload !== true) {
      this.gcsFileBrowserFileActions.push(ChonkyActions.UploadFiles)
    }
    if (this.props.noDownload !== true) {
      this.gcsFileBrowserFileActions.push(ChonkyActions.DownloadFiles)
    }
    if (this.props.noCreateFolder !== true) {
      this.gcsFileBrowserFileActions.push(ChonkyActions.CreateFolder)
    }
    if (this.props.noDelete !== true) {
      this.gcsFileBrowserFileActions.push(ChonkyActions.DeleteFiles)
    }
    if (this.props.noRename !== true) {
      this.gcsFileBrowserFileActions.push(RenameFile)
    }
    return (
      <div style={{ height: "100%" }}>
        {this.state.gcsError ?
          <Card>
            <CardContent>
              Unable to show content of Google Cloud Storage bucket '{this.#getBucket()}'.
            </CardContent>
          </Card> :
          <FileBrowser files={this.state.files}
            onFileAction={this.#fileAction.bind(this)}
            folderChain={this.state.folderChain}
            fileActions={this.gcsFileBrowserFileActions}
            defaultFileViewActionId={view}
          >
            {this.props.noNavBar === true ? null : <FileNavbar />}
            {this.props.noToolBar === true ? null : <FileToolbar />}
            {this.props.noContextMenu === true ? null : <FileContextMenu />}
            <FileList />
          </FileBrowser>
        }
        <Dialog open={this.state.openRenameDialog}>
          <DialogTitle id="form-dialog-title">Rename</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the new name for the file.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Filename"
              type="text"
              value={this.state.targetFileName}
              fullWidth
              onChange={(e) => this.setState({ 'targetFileName': e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => this.setState({ 'openRenameDialog': false })}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={this.#renameFile.bind(this)}>
              Rename
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.openCreateFolderDialog}>
          <DialogTitle id="form-dialog-title">Create folder</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the new name for the folder.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Filename"
              type="text"
              value={this.state.createFolderName}
              fullWidth
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  console.log('Enter Pressed')
                  this.#createFolder()
                }
              }}
              onChange={(e) => this.setState({ 'createFolderName': e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => this.setState({ 'openCreateFolderDialog': false })}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={this.#createFolder.bind(this)}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <ErrorDialog open={this.state.openError} error={this.state.errorMessage} close={() => { this.setState({ 'openError': false }) }}></ErrorDialog>
        <input
          hidden
          type="file"
          onChange={this.#uploadOnChange.bind(this)}
          ref={this.uploadRef}
        />
      </div>
    );
  }
}

GCSFileBrowser.propTypes = {
  'onChangeSelection': PropTypes.func,
  'bucket': PropTypes.string,
  'noNavBar': PropTypes.bool,
  'noToolBar': PropTypes.bool,
  'noContextMenu': PropTypes.bool,
  'noDelete': PropTypes.bool,
  'noRename': PropTypes.bool,
  'noDownload': PropTypes.bool,
  'noUpload': PropTypes.bool,
  'noCreateFolder': PropTypes.bool,
  'initialView': PropTypes.string,
}

export { GCSFileBrowser, GCP_SEC };