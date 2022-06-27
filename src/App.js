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
import SettingsDialog from './SettingsDialog';
import ErrorDialog from './ErrorDialog';


function App(props) {
  const [securityToken, setSecurityToken] = useState(null)
  const [bucketName, setBucketName] = useState(localStorage.getItem("bucket"))
  const [selectBucketDialogOpen, setSelectBucketDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [error, setError] = useState({ "message": "no message" })
  const [selection, setSelection] = useState({ // The selected file to work with
    'bucket': '',
    'folder': '',
    'selection': new Set()
  })
  const [settings, setSettings] = useState({ clientId: localStorage.getItem("clientId") })
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

  let gcsFileBrowserRef = React.createRef();

  // Determine if we should enable/disable the "Load" button.  We should disable Load if:
  // * No bucket name supplied
  // * No client Id supplied
  // * Not signed in
  //
  const allowLoad = bucketName !== null && bucketName.length > 0 && settings.clientId !== null && settings.clientId.length > 0 && securityToken !== null && securityToken.error === undefined

  function showError(err) {
    setError(err)
    setErrorDialogOpen(true)
  } // End of showError

  async function signIn() {
    setMainMenuAnchorEl(null) // Close the menu
    await GCP_SEC.gapiLoad();
    //console.log("< gapiLoad")
    //await GCP_SEC.gisIsReady(client_id);
    try {
      const tokenResponse = await GCP_SEC.gisInit(settings.clientId);
      setSecurityToken(tokenResponse);
    }
    catch (err) {
      showError(err)
    }

    //console.log("< gisInit");
    // gcsFileBrowserRef.current.refresh(); // Once the enviroment is initialized, tell the GCSFileBrowser to refresh.
  } // End of signIn

  function changeSelection(data) {
    //console.log('Selection changed')
    //console.dir(data);
    if (data.selection.size !== 1) {
      setTempSelection(null);
      return;
    }
    if (data.selection.values().next().value.endsWith("/")) {
      setTempSelection(null);
      return;
    }
    setTempSelection(data);
  } // End of changeSelection

  function changeSettings(settings) {
    setSettings(settings)
    localStorage.setItem("clientId", settings.clientId)
    setSettingsDialogOpen(false);
  } // End of changeSettings

  /**
   * Open the file chooser dialog.
   */
  function onLoad() {
    setMainMenuAnchorEl(null) // Close the menu
    setFileBrowserOpen(true)
    setTempSelection(null)
  } // End of onLoad

  /**
   * Open the settings dialog
   */
  function onSettings() {
    setMainMenuAnchorEl(null) // Close the menu
    setSettingsDialogOpen(true)
  } // End of onSettings

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
  } // End of onSelectBucket

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
          <Button color="inherit" disabled={!allowLoad} onClick={onLoad}>Load</Button>
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
      <SelectBucketDialog open={selectBucketDialogOpen} defaultBucketName={bucketName} selected={(bucketName) => {
        setBucketName(bucketName)
        localStorage.setItem("bucket", bucketName)
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
      <AboutDialog open={aboutDialogOpen} close={() => { setAboutDialogOpen(false) }} />
      <SettingsDialog open={settingsDialogOpen} close={() => { setSettingsDialogOpen(false) }} settings={settings} selected={changeSettings} />
      <ErrorDialog open={errorDialogOpen} error={error} close={() => setErrorDialogOpen(false)} />
      <Menu
        anchorEl={mainMenuAnchorEl}
        open={Boolean(mainMenuAnchorEl)}
        onClose={() => { setMainMenuAnchorEl(null) }}>
        <MenuItem onClick={signIn}>Sign In</MenuItem>
        <MenuItem onClick={onSelectBucket}>Select Bucket</MenuItem>
        <MenuItem disabled={!allowLoad} onClick={onLoad}>Load</MenuItem>
        <MenuItem onClick={onSettings}>Settings</MenuItem>
        <MenuItem onClick={onAbout}>About</MenuItem>

      </Menu>
    </Box>
  );
}

export default App;