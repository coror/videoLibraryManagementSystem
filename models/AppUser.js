require('dotenv').config()

const CryptoJS = require("crypto-js");
const {
  updateCommentLikeDislikeCounts,
  updateVideoLikeDislikeCounts,
} = require("../utils/likeDislikeUtils");

const secretKey = process.env.CRYPTOJS_SECRET_KEY;

class AppUser extends Parse.User {
  constructor(att) {
    super(att);
  }

  static async createUser(req) {
    const { email, name, surname, password, phoneNumber } = req.params;

    const userData = {
      email,
      username: email,
      password,
      name,
      surname,
      phoneNumber,
    };
    const user = new AppUser(userData);

    try {
      await user.signUp();
    } catch (e) {
      throw new Error(e);
    }
  }

  static async beforeSave(req) {
    const phoneNumber = req.object.get("phoneNumber");
    const encryptedPhoneNumber = CryptoJS.AES.encrypt(
      phoneNumber,
      secretKey
    ).toString();

    req.object.set("phoneNumber", encryptedPhoneNumber);
  }

  static async updateUser(req) {
    const { userId, password, phoneNumber } = req.params;

    const query = new Parse.Query(AppUser);
    const user = await query.get(userId, { useMasterKey: true });

    if (password) {
      user.set("password", password);
    }

    if (phoneNumber) {
      const encryptedPhoneNumber = CryptoJS.AES.encrypt(
        phoneNumber,
        secretKey
      ).toString();
      user.set("phoneNumber", encryptedPhoneNumber);
    }

    try {
      await user.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async deleteUser(req) {
    const { userId } = req.params;

    const userQuery = new Parse.Query(AppUser);
    const user = await userQuery.get(userId, { useMasterKey: true });

    if (!user) {
      throw new Error("User not found");
    }

    const userPointer = user.toPointer();

    try {
      const likeQuery = new Parse.Query("Like");
      likeQuery.equalTo("user", userPointer);
      const likes = await likeQuery.find({ useMasterKey: true });

      const dislikeQuery = new Parse.Query("Dislike");
      dislikeQuery.equalTo("user", userPointer);
      const dislikes = await dislikeQuery.find({ useMasterKey: true });

      // Delete all likes and dislikes associated with the user
      await Parse.Object.destroyAll(likes, { useMasterKey: true });
      await Parse.Object.destroyAll(dislikes, { useMasterKey: true });

      // Update like and dislike counts for videos
      const videoIdsToUpdate = new Set();
      for (const like of likes) {
        const video = like.get("video");
        if (video) {
          videoIdsToUpdate.add(video.id);
        }
      }
      for (const dislike of dislikes) {
        const video = dislike.get("video");
        if (video) {
          videoIdsToUpdate.add(video.id);
        }
      }
      for (const videoId of videoIdsToUpdate) {
        const videoQuery = new Parse.Query("Video");
        const video = await videoQuery.get(videoId, { useMasterKey: true });
        await updateVideoLikeDislikeCounts(video);
      }

      // Update like and dislike counts for comments
      const commentIdsToUpdate = new Set();
      for (const like of likes) {
        const comment = like.get("comment");
        if (comment) {
          commentIdsToUpdate.add(comment.id);
        }
      }
      for (const dislike of dislikes) {
        const comment = dislike.get("comment");
        if (comment) {
          commentIdsToUpdate.add(comment.id);
        }
      }
      for (const commentId of commentIdsToUpdate) {
        const commentQuery = new Parse.Query("Comment");
        const comment = await commentQuery.get(commentId, {
          useMasterKey: true,
        });
        await updateCommentLikeDislikeCounts(comment);
      }

      // Delete the user and other associated data
      const avatar = user.get("avatar");
      const videosRelation = user.relation("videos");

      await user.destroy({ useMasterKey: true });

      if (avatar) {
        await avatar.destroy({ useMasterKey: true });
      }

      const videosQuery = videosRelation.query();
      const videos = await videosQuery.find({ useMasterKey: true });
      await Parse.Object.destroyAll(videos, { useMasterKey: true });
    } catch (e) {
      throw new Error(`Error deleting user: ${e.message}`);
    }
  }

  static async registerClass() {
    Parse.Object.registerSubclass("_User", AppUser);
  }
}

module.exports = AppUser;
