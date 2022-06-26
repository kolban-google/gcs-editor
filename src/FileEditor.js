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
/*
https://www.npmjs.com/package/react-ace
https://ace.c9.io/
*/
import React from 'react';
import PropTypes from 'prop-types';
import AceEditor from "react-ace";
import { useEffect, useState } from 'react';
import GCS from './gcs';
import { Box, Button, Paper } from '@material-ui/core';
import ReactResizeDetector from 'react-resize-detector'

function FileEditor(props) {
  // props.selection {
  //   bucket: bucketName
  //   selection: set of strings 
  // }
  const [text, setText] = useState("");
  const [editorHeight, setEditorHeight] = useState("10px")
  const [editorWidth, setEditorWidth] = useState("400px")

  useEffect(() => {
    async function run() {
      //GCS.getData(bucket, selectedFile.id)
      // If we have no, selection, nothing to do.
      if (props.selection === null) {
        return;
      }
      // If we have more than 1 selection, nothing to do
      if (props.selection.selection.size !== 1) {
        return;
      }
      const fileName = props.selection.selection.values().next().value;

      //debugger;
      // Get the metadata of the object
      const metaData = await GCS.getMetaData(props.selection.bucket, fileName);

      // If the size of the object is too big, don't load
      const size = Number(metaData.size)
      if (size > 1024 * 1024 * 5) {
        console.log("File too big")
        setText("<TOO BIG>")
        return;
      }

      // Load the object
      console.log(`Reading file ${props.selection.bucket} - ${fileName}`)
      // We now know the file to load in the editor.  Let us now load the data
      const content = await GCS.getData(props.selection.bucket, fileName)
      setText(content)

    } // End of run
    run();
  }, [props.selection.bucket, props.selection.selection]);

  function onChange(newValue) {
    //console.log("Changed!")
    setText(newValue);
  } // End of onChange

  async function onSave() {
    if (props.selection === null) {
      return;
    }
    // If we have more than 1 selection, nothing to do
    if (props.selection.selection.size !== 1) {
      console.log(`Error: props.selection = ${props.selection.selection.size}`)
      return;
    }
    console.log(`Saving ${text}`)
    const fileName = props.selection.selection.values().next().value;
    await GCS.write(props.selection.bucket, fileName, text)
  } // End of onSave

  function haveFile() {
    if (props.selection === null) {
      return false
    }
    // If we have more than 1 selection, nothing to do
    if (props.selection.selection.size !== 1) {
      return false
    }
    return true
  }

  function getFileName() {
    if (!haveFile()) {
      return "none"
    }
    const fileName = props.selection.selection.values().next().value;
    return `gs://${props.selection.bucket}/${fileName}`
  }

  /**
   * render
   * @returns 
   */
  return (<Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>

    <Box style={{ flexGrow: 1, marginTop: "8px" }}>
      <ReactResizeDetector handleWidth handleHeight onResize={(w, h) => {
        setEditorHeight(`${h}px`);
        setEditorWidth(`${w}px`)
        console.log(`${w} x ${h}`)
      }} />
      <AceEditor width={editorWidth} height={editorHeight} value={text} onChange={onChange} showPrintMargin={false} />
    </Box>
    <Paper variant='outlined' style={{ margin: '4px' }}>
      <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        <Box style={{ marginLeft: '4px', flexGrow: 1, }}>
          File: {getFileName()}
        </Box>
        <Button variant="contained" color="primary" disabled={!haveFile()} onClick={onSave}>Save</Button>
      </Box>
    </Paper>
  </Box>)

}
/*
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import AceEditor from "react-ace";
import ReactResizeDetector from 'react-resize-detector'
import { useEffect, useState } from 'react';
function App() {

  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(10)
  function onResize(w, h) {
    setWidth(w);
    setHeight(h)
  }
  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Button>Hello Button</Button>
      <Box style={{ backgroundColor: "grey", flexGrow: 1 }}>
        <ReactResizeDetector handleWidth handleHeight onResize={onResize} />
        <AceEditor width={width} height={height}></AceEditor>
      </Box>
      <Button>Bottom Button</Button>
    </Box>
  );
}

export default App;
*/

FileEditor.propTypes = {
  selection: PropTypes.object
}

export default FileEditor;