const axios = require('axios');
const fs = require('fs');
const PDFDocument = require('pdfkit');

module.exports = {
  buildPDF: function (versionObj) {
    var doc = new PDFDocument();
    var fileName = Date.now();
    var filePath = "./assets/pdfs/" + fileName + ".pdf";
    let imageCounts = {};
    let imagePromises = [];
    doc.pipe(fs.createWriteStream(filePath));
    versionObj.forEach(function (obj) {
      var countKey = getCountKey(obj.image);
      imageCounts[countKey] = Number(obj.count);
      imagePromises.push(axios.get(obj.image, { responseType: "arraybuffer" }));
    });
    return Promise.all(imagePromises)
    .then(result => {
      var cardPosition = 1;
      var cardCount = 1;
      var totalCards = Object.values(imageCounts).reduce((a, b) => a + b, 0);
      for (var card of result) {
        var image = Buffer.from(card.data, "base64");
        var countKey = getCountKey(card.config.url);
        for (var copies = imageCounts[countKey]; copies > 0; copies--) {
          var width = calcPictureWidth(cardPosition);
          var height = calcPictureHeight(cardPosition);
          doc.image(image, width, height, { width: 180, height: 252 });
          if (cardPosition === 9 && cardCount != totalCards) {
            doc.addPage();
            cardPosition = 1;
          } else {
            cardCount += 1;
            cardPosition += 1;
          }
        }
      }
      doc.end();
      return fileName;
    });
  }
}

function getCountKey(url) {
  let keyRegEx = /(?<=\?)\d+/;
  return keyRegEx.exec(url)[0];
}

function calcPictureWidth(count) {
  if (count % 3 === 1) {
    return 5;
  } else if (count % 3 === 2) {
    return 190;
  } else {
    return 375;
  }
}

function calcPictureHeight(count) {
  if (count < 4) {
    return 5;
  } else if (count < 7) {
    return 262;
  } else {
    return 519;
  }
}