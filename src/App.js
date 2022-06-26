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
import { GCSFileBrowser, GCP_SEC } from './GCSFileBrowser';
import React from 'react';
import { useState } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import FileEditor from './FileEditor';
import { AppBar, Toolbar, Button, IconButton, Typography, Menu, MenuItem, Dialog, DialogActions, Box } from '@material-ui/core';
import SelectBucketDialog from './SelectBucketDialog';
import HelpIcon from '@material-ui/icons/Help';
import AboutDialog from './About';

// Somewhere in your `index.ts`:

let gcsFileBrowserRef = React.createRef();

async function signIn() {
  //const client_id = '604474120566-f1esonn8rpkcl8mckam6bk9gdsgsl88s.apps.googleusercontent.com';
  const client_id = '38423913065-6qllh56uln0vc8r7qldubh34sbs32c7h.apps.googleusercontent.com'
  await GCP_SEC.gapiLoad();
  console.log("< gapiLoad")
  //await GCP_SEC.gisIsReady(client_id);
  await GCP_SEC.gisInit(client_id);
  console.log("< gisInit");
  // gcsFileBrowserRef.current.refresh(); // Once the enviroment is initialized, tell the GCSFileBrowser to refresh.
} // End of signIn

function App(props) {
  const [bucketName, setBucketName] = useState('kolban-fb1')
  const [selectBucketDialogOpen, setSelectBucketDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [selection, setSelection] = useState({ // The selected file to work with
    'bucket': '',
    'folder': '',
    'selection': new Set()
  })
  const [tempSelection, setTempSelection] = useState(null)
  const [mainMenuAnchorEl, setMainMenuAnchorEl] = useState(null)
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false)
  const [noContextMenu, setNoContextMenu] = useState(false)
  const [noToolBar, setNoToolBar] = useState(false)
  const [noDelete, setNoDelete] = useState(false)
  const [noRename, setNoRename] = useState(false)
  const [noUpload, setNoUpload] = useState(false)
  const [noDownload, setNoDownload] = useState(false)
  const [noCreateFolder, setNoCreateFolder] = useState(false)
  const [noNavBar, setNoNavBar] = useState(false)


  function changeSelection(data) {
    console.log('Selection changed')
    console.dir(data);
    if (data.selection.size !== 1) {
      setTempSelection(null);
      return;
    }
    if (data.selection.values().next().value.endsWith("/")) {
      setTempSelection(null);
      return;
    }
    setTempSelection(data);
  }

  /**
   * Open the file chooser dialog.
   */
  function onLoad() {
    setMainMenuAnchorEl(null) // Close the menu
    setFileBrowserOpen(true)
    setTempSelection(null)
  } // End of onLoad

  /**
   * Open the about dialog.
   */
  function onAbout() {
    setMainMenuAnchorEl(null) // Close the menu
    setAboutDialogOpen(true);
  } // End of onAbout

  /**
   * Open the bucket selection dialog
   */
  function onSelectBucket() {
    setMainMenuAnchorEl(null) // Close the menu
    setSelectBucketDialogOpen(true); // Open the select bucket dialog
  }

  const selections = Array.from(selection.selection).map((item) => { return <span>{item};</span>; })

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/*
      //
      //  APPBAR
      //
      */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={(evt) => {
            setMainMenuAnchorEl(evt.currentTarget)
          }} >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
            GCS Editor
          </Typography>
          <Button color="inherit" onClick={signIn}>Sign In</Button>
          <Button color="inherit" onClick={onSelectBucket}>Select Bucket</Button>
          <Button color="inherit" onClick={onLoad}>Load</Button>
          <IconButton color="inherit" onClick={onAbout}>
            <HelpIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/*
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={noNavBar} onChange={(event) => { setNoNavBar(event.target.checked) }} />}
          label="NoNavBar" />
        <FormControlLabel
          control={<Checkbox checked={noToolBar} onChange={(event) => { setNoToolBar(event.target.checked) }} />}
          label="noToolBar" />
        <FormControlLabel
          control={<Checkbox checked={noContextMenu} onChange={(event) => { setNoContextMenu(event.target.checked) }} />}
          label="noContextMenu" />
        <FormControlLabel
          control={<Checkbox checked={noDelete} onChange={(event) => { setNoDelete(event.target.checked) }} />}
          label="noDelete" />
        <FormControlLabel
          control={<Checkbox checked={noRename} onChange={(event) => { setNoRename(event.target.checked) }} />}
          label="noRename" />
        <FormControlLabel
          control={<Checkbox checked={noUpload} onChange={(event) => { setNoUpload(event.target.checked) }} />}
          label="noUpload" />
        <FormControlLabel
          control={<Checkbox checked={noDownload} onChange={(event) => { setNoDownload(event.target.checked) }} />}
          label="noDownload" />
        <FormControlLabel
          control={<Checkbox checked={noCreateFolder} onChange={(event) => { setNoCreateFolder(event.target.checked) }} />}
          label="noCreateFolder" />
      </FormGroup>
       
      <Box>
        Bucket: {selection.bucket}, Folder: {selection.folder}, Selections: {selections}
      </Box>
       */}
      <Box style={{ flexGrow: 1 }}>
        <FileEditor selection={selection} />
      </Box>
      <SelectBucketDialog open={selectBucketDialogOpen} selected={(bucketName) => {
        setBucketName(bucketName)
        setSelectBucketDialogOpen(false)
      }}
        close={() => { setSelectBucketDialogOpen(false) }} />
      <Dialog open={fileBrowserOpen}>
        <Box style={{ height: "600px", backgroundColor: 'lightgray', padding: '10px' }}>
          <GCSFileBrowser ref={gcsFileBrowserRef} bucket={bucketName} onChangeSelection={changeSelection}
            noToolBar={noToolBar}
            noContextMenu={noContextMenu}
            noDelete={noDelete}
            noRename={noRename}
            noUpload={noUpload}
            noDownload={noDownload}
            noCreateFolder={noCreateFolder}
            noNavBar={noNavBar} initialView="list" />
        </Box>
        <DialogActions>
          <Button variant="contained" color="primary" disabled={tempSelection === null || tempSelection.selection.size === 0} onClick={() => {
            setFileBrowserOpen(false)
            setSelection(tempSelection)
          }}>
            Load
          </Button>
          <Button variant="contained" color="primary" onClick={() => {
            setFileBrowserOpen(false)
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <AboutDialog open={aboutDialogOpen} close={() => {setAboutDialogOpen(false)}}/>
      <Menu
        anchorEl={mainMenuAnchorEl}
        open={Boolean(mainMenuAnchorEl)}
        onClose={() => { setMainMenuAnchorEl(null) }}>
                  <MenuItem onClick={signIn}>Sign In</MenuItem>
        <MenuItem onClick={onSelectBucket}>Select Bucket</MenuItem>
        <MenuItem onClick={onLoad}>Load</MenuItem>
        <MenuItem onClick={onAbout}>About</MenuItem>

      </Menu>
    </Box>
  );
}

export default App;
