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
import { useEffect, useState } from 'react';
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
  const [bucketName, setBucketName] = useState(props.defaultBucketName)
  const [okDisabled, setOkDisabled] = useState(props.defaultBucketName === null || props.defaultBucketName.length === 0)

  // When the dialog is shown, it will contain the LAST edited value.  This may have been cancelled by the user
  // which thus means it is really junk that is shown.  We use a hook that is triggered when the props.open flag
  // changes.  We set the editor bucket name to the current default bucket.
  useEffect(() => {
    if (props.open) {
      setBucketName(props.defaultBucketName)
    }
  }, [props.open])
  
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
    if (newValue.match(/^[a-z0-9-_.]*$/) === null) { // Validate that the entered data is correct for a GCS bucket (https://cloud.google.com/storage/docs/naming-buckets)
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
          <p>Enter the name of a GCS bucket that is the container of the files we wish to edit.</p>
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
  'selected': PropTypes.func.isRequired,
  'defaultBucketName': PropTypes.string
}

export default SelectBucketDialog