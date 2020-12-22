import * as React from 'react'
import Button from '@material-ui/core/Button'
import { textExport } from "../../helpers/exportHelper";

const ExportButton = (props) => {

  const exportText = async () => {
    const cards = Object.values(props.cardImages);
    const allSelected = cards.filter(card => {
      return card.selected === false;
    });
    if (allSelected.length > 0) {
      let confirm = window.confirm("Not all cards have selected versions, those cards will have the first version in the list selected. Continue?");
      if (confirm === false) {
        return;
      }
    }
    textExport(cards);
  }

  return (
    <Button onClick={exportText}>Export</Button>
  )
}

export default ExportButton