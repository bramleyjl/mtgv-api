export const forwardToTcgPlayer = (cards) => {
  const config = {
    method: "POST",
    responseType: 'arraybuffer',
    headers: { 
      "Content-Type": "application/json",      
    },
    body: JSON.stringify({ cards: cards })
  };
  fetch(process.env.REACT_APP_URL + "/api/tcgPlayerMassEntry", config)
  .then(response => {
    console.log(response);
  })
  .catch(error => console.log(error));
}

export const textExport = (cards) => {
  const config = {
    method: "POST",
    responseType: 'arraybuffer',
    headers: { 
      "Content-Type": "application/json",      
    },
    body: JSON.stringify({ cards: cards })
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

export const csvExport = (cards) => {
  // const config = {
  //   method: "POST",
  //   responseType: 'arraybuffer',
  //   headers: { 
  //     "Content-Type": "application/json",      
  //   },
  //   body: JSON.stringify({ cards: cards })
  // };
  // fetch(process.env.REACT_APP_URL + "/api/exportCsvList", config)
  // .then(response => {
  //   console.log(response);
  // })
  // .catch(error => console.log(error));
}