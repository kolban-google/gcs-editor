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
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import PropTypes from 'prop-types';
/**
 * props
 * * open
 * * entity
 * * close
*/

function AboutDialog(props) {

  return (
    <Dialog open={props.open} fullWidth>
      <DialogTitle>About - GCS Editor</DialogTitle>
      <DialogContent dividers>
        <p>Display the contents of a GCS bucket and select a file for editing.
        </p>
        <p>
            The source for this sample can be found at <a href="https://github.com/kolban-google/gcs-editor" target="_blank" rel="noreferrer">github: kolban-google/gcs-editor</a>
        </p>
        <p>This project is merely a sample and is provided <i>as-is</i> with no formal support.
            This is not a Google product or Google offering.
        </p>
        <p>Neil Kolban (kolban@google.com)</p>
        <p>Version: 2022-06-26</p>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={props.close}>Close</Button>
      </DialogActions>
    </Dialog>
  )
} // AboutDialog

AboutDialog.propTypes = {
  'open': PropTypes.bool.isRequired,
  'close': PropTypes.func.isRequired
}

export default AboutDialog