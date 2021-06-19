import * as React from 'react'
import Button from '@material-ui/core/Button'
import { forwardToTcgPlayer, processSelections } from '../../helpers/exportHelper'

const PurchaseButton = (props) => {

  const tcgLink = async () => {
    const cards = Object.values(props.cardImages);
    let exportObj = processSelections(cards);
    if (exportObj['warning']) {
      let confirm = window.confirm(exportObj['warning']);
      if (confirm === false) {
        return;
      }
    }
    forwardToTcgPlayer(exportObj);
  }

  return (
      <Button variant="contained" color="secondary" onClick={tcgLink}>
        Purchase
      </Button>
  )
}

export default PurchaseButton