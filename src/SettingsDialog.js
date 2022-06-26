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
import React from 'react';
import { useState } from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, Dialog, TextField } from '@material-ui/core'
import PropTypes from 'prop-types';

/**
 * Configure the settings
 * props
 * * open - Set to true to open the dialog
 * * close - Callback when the dialog is closed
 * * selected - Callback when a bucket is selected
 * 
 * Settings:
 * * clientId
*/

function SettingsDialog(props) {
  const [clientId, setClientId] = useState(props.settings.clientId)

  /**
   * Called to close the dialog but with no selection.
   */
  function handleClose() {
    if (props.close) {
      props.close();
    }
  } // end of handleClose

  /**
   * Called to close the dialog but when a selection has been made.
   */
  function handleOK() {
    if (props.selected) {

      props.selected({
        clientId
      });
    }
  } // End of handleSelected


  /**
   * Called when the bucket text entry field is changed by user entry,
   * @param {*} event 
   * @returns 
   */
  function changeClientId(event) {
    const newValue = event.target.value
    setClientId(newValue)
  } // onChange

  return (
    <Dialog open={props.open} fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth label="Client Id" value={clientId} onChange={changeClientId} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleOK}>OK</Button>
        <Button variant="contained" color="primary" onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
} // EntityInfoDialog

SettingsDialog.propTypes = {
  'open': PropTypes.bool.isRequired,
  'close': PropTypes.func.isRequired,
  'selected': PropTypes.func.isRequired,
  'settings': PropTypes.object
}

export default SettingsDialog