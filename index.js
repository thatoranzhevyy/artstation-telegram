const {util} = require('./util');
const {artwork} = require('./util/firebase');

/**
 * Запускаем скрипт
 *  */
util.setRandomInterval(() => init());

// init()

function init() {
  artwork.getArtworkFromDB().then((artworkFromDB) => {
    if (artworkFromDB) {
      artwork.getArtworkByHash(artworkFromDB.id).then((artworkByHash) => {
        if (Object.keys(artworkByHash).length !== 0) {
          artwork.postArtworkToTelegramGroup(artworkByHash, artworkFromDB);
        } else {
          artwork.deleteArtworkFromDB(artworkFromDB.id).then(() => init());
        }
      });
    } else {
      init();
    }
  });
}


// artwork.getArtworkList().then((artworkList) => {
//   for (const artworkListElement of artworkList) {
//     artwork.getArtworkFromDBByHash(artworkListElement.hash_id).then((artworkFromDB) => {
//       if (!artworkFromDB) {
//         artwork.getArtworkByHash(artworkListElement.id).then((artworkByHash) => {
//           artwork.postArtworkToTelegramUser(artworkByHash)
//         })
//       }
//     })
//   }
// })
