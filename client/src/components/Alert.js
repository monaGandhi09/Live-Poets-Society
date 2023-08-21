import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

export default function AlertDialog(props) {
  const handleClick = (url) => {
    window.open(url, '_self')
  };


  return (
    <div>
      <Dialog
        open={props.show}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            {props.buttonOptions.map((opt) => <Button onClick={handleClick.bind(this, opt.url)}> {opt.text} </Button>)}
        </DialogActions>
      </Dialog>
    </div>
  );
}