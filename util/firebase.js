const {logger} = require('./logger');
const {telegram} = require('./telegram');

const {initializeApp} = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  getDoc,
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
  async getArtworkFromDBByHash(hash) {
    let artwork = false;
    const snap = await getDoc(doc(db, 'artwork', hash))
    if (snap.exists())
      artwork = snap.data();
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
  async getArtworkList() {
    let artworkList = false;
    const url = `https://www.artstation.com/api/v2/community/explore/projects/community.json?page=1&dimension=2d&per_page=9`
    try {
      await axios.get(url)
        .then(res => res.data)
        .then(data => artworkList = data.data)
    } catch (e) {
      logger.logError("🔴 при запросе проектов произошла ошибка");
    }
    return artworkList;
  },

  postArtworkToTelegramUser(artworkByHash) {
    let assetsMedia = this.createPost(artworkByHash);
    for (const media of assetsMedia) {
      telegram.sendPrivatePost(media).then(() => {
      })
    }
  },


  createPost(artwork) {
    let assetsMedia = this.createPostMedia(artwork.assets);


    let textTitle = `<strong>«${artwork.title.trim()}»</strong> by ${artwork.user.full_name.trim()}`;
    let textLink = `<a href="${artwork.permalink}">resource</a>`;
    let textHashtags = "";
    if (artwork.categories) {
      artwork.categories.map((element) => {
        textHashtags += "#" + element.name.replaceAll(" ", "").replaceAll("&", "")
          .replaceAll(",", " #").replaceAll("-", "") + " "
      })
    }
    let textHash = `#${artwork.user.username.replaceAll("-", "")} ${textHashtags}`;


    let assetsMediaArray = [];
    if (assetsMedia.length >= 9) {
      for (var i = 0; i < assetsMedia.length; i += 9) {
        let slicedAssets = assetsMedia.slice(i, i + 9);
        slicedAssets[0].caption = `${textTitle} \n\n${textLink} \n\n${textHash}`
        slicedAssets[0].parse_mode = "HTML"
        assetsMediaArray.push(slicedAssets)
      }
    } else {
      assetsMedia[0].caption = `${textTitle} \n\n${textLink} \n\n${textHash}`
      assetsMedia[0].parse_mode = "HTML"
      assetsMediaArray.push(assetsMedia)
    }
    return assetsMediaArray;
  },
  createPostMedia(assets) {
    let assetsMedia = [];
    for (const asset of assets) {
      if (!['cover', 'video'].includes(asset.asset_type)) {
        assetsMedia.push({type: "photo", media: asset.image_url});
      }
    }
    return assetsMedia;
  },


  postArtworkToTelegramGroup(artworkByHash, artworkFromDB) {
    let assetsMedia = this.createPost(artworkByHash);
    for (const media of assetsMedia) {
      telegram.sendPost(media).then(() => {
        this.updateArtworkFromDB(artworkFromDB.id, artworkFromDB).then((status) => {
          if (status) logger.logError("🟢 пост " + artworkFromDB.id + " успешно отправлен.")
        })
      })
    }
  },
}
exports.artwork = artwork;
