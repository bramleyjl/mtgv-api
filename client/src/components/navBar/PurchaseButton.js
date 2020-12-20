import * as React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { forwardToTcgPlayer } from '../../helpers/exportHelper'

const PurchaseButton = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const tcgLink = async (method) => {
    handleClose();
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
    <div>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        Buy
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem name="text" onClick={tcgLink}>TCGPlayer</MenuItem>
      </Menu>
    </div>
  )
}

export default PurchaseButton