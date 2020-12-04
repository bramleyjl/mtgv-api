const fs = require("fs");
const pdfs = require('../models/pdfs');

module.exports = {
  preparePdf: function (req, res) {
    let downloadList = [];
    req.body.versions.forEach(function (card) {
      var editionObject = Object.values(card)[0];
      for (var j = 0; j < editionObject.image.length; j++) {
        var downloadObject = Object.create(editionObject);
        downloadObject.name = editionObject.name[j];
        downloadObject.image = editionObject.image[j]
        .replace("small", "png")
        .replace("jpg", "png");
        downloadObject.transform = j === 0 ? false : true;
        if (downloadObject.transform === false) {
          downloadObject.tcgId = editionObject.tcgId;
          downloadObject.tcgPurchase = editionObject.tcgPurchase;
          downloadObject.normalPrice = editionObject.normalPrice;
          downloadObject.foilPrice = editionObject.foilPrice;
        }
        downloadObject.count = card.count;
        downloadList.push(downloadObject);
      }
    });
    pdfs.buildPDF(downloadList).then(function (pdfFileName) {
      res.json({
        pdfLink: pdfFileName,
      });
    });
  },
  packageDownload: function (req, res) {
    let fileName = req.params.pdf + ".pdf";
    let filePath = "./assets/pdfs/" + fileName;
    fs.exists(filePath, function (exists) {
      if (exists) {
        res.writeHead(200, {
          "Content-Type": "text/pdf",
          "Content-Disposition": "attachment; filename=" + fileName,
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("ERROR File does not exist");
      }
    });
  }
};
