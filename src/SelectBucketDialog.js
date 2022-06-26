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
import { Button, DialogActions, DialogContent, DialogTitle, Dialog, TextField, Box } from '@material-ui/core'
import PropTypes from 'prop-types';

/**
 * Select a bucket.
 * props
 * * open - Set to true to open the dialog
 * * close - Callback when the dialog is closed
 * * selected - Callback when a bucket is selected
*/

function SelectBucketDialog(props) {
  const [bucketName, setBucketName] = useState("")
  const [okDisabled, setOkDisabled] = useState(true)

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
  function handleSelected() {
    if (props.selected) {
      props.selected(bucketName);
    }
  } // End of handleSelected


  /**
   * Called when the bucket text entry field is changed by user entry,
   * @param {*} event 
   * @returns 
   */
  function onChange(event) {
    const newValue = event.target.value
    if (newValue.match(/^[a-z0-9-_\.]*$/) === null) { // Validate that the entered data is correct for a GCS bucket (https://cloud.google.com/storage/docs/naming-buckets)
      return;
    }
    setBucketName(newValue)
    setOkDisabled(newValue.length === 0)
  } // onChange

  return (
    <Dialog open={props.open} fullWidth>
      <DialogTitle>Select Bucket</DialogTitle>
      <DialogContent dividers>
        <Box>
          Enter the name of a GCS bucket that is the container of the files we wish to edit.
        </Box>
        <TextField fullWidth label="Bucket name" value={bucketName} onChange={onChange} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" disabled={okDisabled} onClick={handleSelected}>OK</Button>
        <Button variant="contained" color="primary" onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
} // EntityInfoDialog

SelectBucketDialog.propTypes = {
  'open': PropTypes.bool.isRequired,
  'close': PropTypes.func.isRequired,
  'selected': PropTypes.func.isRequired
}

export default SelectBucketDialog