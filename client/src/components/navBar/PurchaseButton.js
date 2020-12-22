import * as React from 'react'
import Button from '@material-ui/core/Button'
import { forwardToTcgPlayer } from '../../helpers/exportHelper'

const PurchaseButton = (props) => {

  const tcgLink = async () => {
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
    forwardToTcgPlayer(cards);
  }

  return (
      <Button onClick={tcgLink}>Purchase</Button>
  )
}

export default PurchaseButton