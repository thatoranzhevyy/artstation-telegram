const {logger} = require('./logger');
const {telegram} = require('./telegram');

const {initializeApp} = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  setDoc,
  doc,
  limit,
  where
} = require("firebase/firestore");
const axios = require("axios");
const firebaseConfig = {
  apiKey: "AIzaSyAdfYrlyXBgVxWBc4GLUHhFpsolDofBNmI",
  authDomain: "murraya-2f5d7.firebaseapp.com",
  projectId: "murraya-2f5d7",
  storageBucket: "murraya-2f5d7.appspot.com",
  messagingSenderId: "1092792667601",
  appId: "1:1092792667601:web:fabeea632642084a8464f0"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const artworkRef = collection(db, "artwork");
const artwork = {
  async getArtworkFromDB() {
    let artwork;
    try {
      const qu = query(artworkRef, limit(1), where("planned", "==", true));
      const querySnapshot = await getDocs(qu);
      querySnapshot.forEach((doc) => {
        artwork = {id: doc.id, data: doc.data()}
      });
    } catch (error) {
      logger.logError('Error Getting Artwork in getArtworkFromDB: ' + error, "error");
    }
    return artwork;
  },
  async updateArtworkFromDB(hash, data) {
    let statusUpdate = false;
    const artwork = data.data;
    artwork.planned = !data.data.planned
    artwork.posted = !data.data.posted
    const artworkRef = doc(db, "artwork", hash);
    try {
      await updateDoc(artworkRef, artwork);
      statusUpdate = !statusUpdate;
    } catch (error) {
      logger.logError('Error Updating Artwork in updateArtworkFromDB: ' + error, "error");
    }
    return statusUpdate;
  },
  async deleteArtworkFromDB(hash) {
    logger.logError("🔴 при запросе проекта по хэшу " + hash + " произошла ошибка. элемент удален");
    try {
      await deleteDoc(doc(db, "artwork", hash));
    } catch (error) {
      logger.logError('Error Updating Artwork in updateArtworkFromDB: ' + error, "error");
    }
  },
  async getArtworkByHash(hash) {
    let artwork = false;
    const config = {
      headers: {
        accept: 'application/json',
      },
      data: {},
    };
    const url = `https://www.artstation.com/projects/${hash}.json`;
    try {
      await axios.get(url, config)
        .then(res => res.data)
        .then(data => artwork = data)
    } catch (e) {
      logger.logError("🔴 при запросе проекта по хэшу " + hash + " произошла ошибка. элемент удален");
    }
    return artwork;
  },

  postArtworkToTelegramGroup(artworkFromDB, artworkByHash) {
    let postMessageD = this.createPostData(artworkByHash);
    telegram.sendPost(postMessageD).then(() => {
      this.updateArtworkFromDB(artworkFromDB.id, artworkFromDB).then((status) => {
        if (status) {
          logger.logError("🟢 пост " + artworkFromDB.id + " успешно отправлен.")
        }
      })
    })
  },
  createPostData(artworkByHash) {
    let postData = []
    for (const assetsKey in artworkByHash.assets) {
      if (artworkByHash.assets[assetsKey].asset_type !== "cover" && artworkByHash.assets[assetsKey].asset_type !== "video") {
        if (assetsKey <= 9) {
          postData.push({type: "photo", media: artworkByHash.assets[assetsKey].image_url})
        }
      }
    }
    postData = this.createPostCaption(artworkByHash, postData)
    return postData
  },
  createPostCaption(artworkByHash, postData) {

    var msgcategories = ""
    if (artworkByHash.categories) {
      artworkByHash.categories.map((element) => {
        msgcategories += "#" + element.name
          .replaceAll(" ", "")
          .replaceAll("&", "")
          .replaceAll(",", " #")
          .replaceAll("-", "") + " "
      })
    }
    let message = `
<strong>«${artworkByHash.title.trim()}»</strong> by ${artworkByHash.user.full_name.trim()}

<a href="${artworkByHash.permalink}">resource</a>

#${artworkByHash.user.username.replaceAll("-", "")} ${msgcategories}
  `
    postData[0].caption = message
    postData[0].parse_mode = "HTML"
    return postData
  }
}
exports.artwork = artwork;
