import * as React from 'react'
import Button from '@material-ui/core/Button'
import { textExport, processSelections } from "../../helpers/exportHelper";

const ExportButton = (props) => {

  const exportText = async () => {
    const cards = Object.values(props.cardImages);
    let exportObj = processSelections(cards);
    if (exportObj['warning']) {
      let confirm = window.confirm(exportObj['warning']);
      if (confirm === false) {
        return;
      }
    }
    textExport(exportObj);
  }

  return (
    <Button variant="contained" color="secondary" onClick={exportText}>
      Export
    </Button>
  )
}

export default ExportButton