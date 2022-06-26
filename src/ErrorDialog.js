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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';

/**
 * Display an error.
 * <ErrorDialog open={} onClose={} error={} />
 * open: A boolean indicating whether or not to show the dialog
 * close: A callback invoked when the dialog is closed
 * error: An error object containing:
 * {
 *   message: The error message
 * }
 * 
 */
function ErrorDialog(props) {
  /**
   * render
   * @returns 
   */

  if (props.open) {
    console.log(`Error logging:`)
    console.dir(props.error);
  }
  return (
    <Dialog open={props.open}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <DialogContentText>
          An error has been detected
          <br />
          {(!props.error && !props.error.message) ? "No Message" : props.error.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={props.close}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ErrorDialog.propTypes = {
  'open': PropTypes.bool.isRequired,
  'close': PropTypes.func.isRequired,
  'error': PropTypes.object.isRequired
}

export default ErrorDialog;