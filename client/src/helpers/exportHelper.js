export const forwardToTcgPlayer = async (cards) => {
  const config = {
    method: "POST",
    responseType: 'arraybuffer',
    headers: { 
      "Content-Type": "application/json",      
    },
    body: JSON.stringify({ cards: cards })
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