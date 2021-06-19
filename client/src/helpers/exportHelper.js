export const forwardToTcgPlayer = async (exportObj) => {
  const config = {
    method: "POST",
    responseType: 'arraybuffer',
    headers: { 
      "Content-Type": "application/json",      
    },
    body: JSON.stringify({ exportObj: exportObj })
  };
  const response = await fetch(
    process.env.REACT_APP_URL + "/api/tcgPlayerMassEntry",
    config
  );   
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  window.open(
    body.tcgMassEntry,
    '_blank'
  );
}

export const processSelections = (cards) => {
  let exportObj = {
    'cards': [],
    'warning': ''
  };
  cards.forEach( card => {
    let warningCheck = runWarningCheck(card);
    if (warningCheck && warningCheck.code === 'notFound') return;
    exportObj.warning = warningCheck.text || null;
    let exportCard = {
      count: card.count,
      displayName: card.displayName,
      version: card.versions[card.selectedVersion]
    };
    exportObj.cards.push(exportCard);
  });
  return exportObj;
}

function runWarningCheck(card) {
  let warning = {};
  if (card.cardFound === false) {
    warning = {
      code: 'notFound',
      text: 'Not all cards found, they will be omitted from the list. Continue?'
    }
  }
  if (card.selected === false) {
    warning = {
      code: 'unselected',
      text: 'Not all cards have selected versions, those cards will have the first version in the list selected. Continue?'
    }
  }
  return warning
};

export const textExport = (exportObj) => {
  const config = {
    method: "POST",
    responseType: 'arraybuffer',
    headers: { 
      "Content-Type": "application/json",      
    },
    body: JSON.stringify({ exportObj: exportObj })
  };
  fetch(process.env.REACT_APP_URL + "/api/exportTextList", config)
  .then(response => response.text())
  .then(text => {
    const element = document.createElement('a');
    const file = new Blob(
      [text],
      {type: 'text/plain;charset=utf-8'}
    );
    element.href = URL.createObjectURL(file);
    element.download = "cardsList.txt";
    document.body.appendChild(element);
    element.click();
  })
  .catch(error => console.log(error));
}