const {
  updateCommentLikeDislikeCounts,
  updateVideoLikeDislikeCounts,
} = require("../utils/likeDislikeUtils");

class Dislike extends Parse.Object {
  constructor() {
    super("Dislike");
  }

  static async createDislike(req) {
    const { userId, videoId, commentId } = req.params;

    const userQuery = new Parse.Query("_User");
    const user = await userQuery.get(userId, { useMasterKey: true });

    // check if the user has like on the same comment
    if (commentId) {
      const likeQuery = new Parse.Query("Like");
      likeQuery.equalTo("user", user);
      const commentQuery = new Parse.Query("Comment");
      const comment = await commentQuery.get(commentId, { useMasterKey: true });
      likeQuery.equalTo("comment", comment);
      const like = await likeQuery.first({ useMasterKey: true });

      if (like) {
        await like.destroy({ useMasterKey: true });
      }
    }

    // check if the user has like on the same video
    if (videoId) {
      const likeQuery = new Parse.Query("Like");
      likeQuery.equalTo("user", user);
      const videoQuery = new Parse.Query("Video");
      const video = await videoQuery.get(videoId, { useMasterKey: true });
      likeQuery.equalTo("video", video);
      const like = await likeQuery.first({ useMasterKey: true });

      if (like) {
        await like.destroy({ useMasterKey: true });
      }
    }

    // check if the user has already disliked the video
    if (videoId) {
      const existingDislikeQuery = new Parse.Query("Dislike");
      existingDislikeQuery.equalTo("user", user);
      const videoQuery = new Parse.Query("Video");
      const video = await videoQuery.get(videoId, { useMasterKey: true });
      existingDislikeQuery.equalTo("video", video.toPointer());
      const existingDislike = await existingDislikeQuery.first({
        useMasterKey: true,
      });

      if (existingDislike) {
        throw new Error("This user has already disliked this video");
      }
    }

    // check if the user has already disliked the comment
    if (commentId) {
      const existingDislikeQuery = new Parse.Query("Dislike");
      existingDislikeQuery.equalTo("user", user);
      const commentQuery = new Parse.Query("Comment");
      const comment = await commentQuery.get(commentId, { useMasterKey: true });
      existingDislikeQuery.equalTo("comment", comment.toPointer());
      const existingDislike = await existingDislikeQuery.first({
        useMasterKey: true,
      });

      if (existingDislike) {
        throw new Error("This user has already disliked this comment");
      }
    }

    const dislike = new Dislike();
    dislike.set("user", user.toPointer());

    if (videoId) {
      const videoQuery = new Parse.Query("Video");
      const video = await videoQuery.get(videoId, { useMasterKey: true });

      dislike.set("video", video.toPointer());
      await dislike.save(null, { useMasterKey: true });
      await updateVideoLikeDislikeCounts(video);
    }

    if (commentId) {
      const commentQuery = new Parse.Query("Comment");
      const comment = await commentQuery.get(commentId, { useMasterKey: true });

      dislike.set("comment", comment.toPointer());
      await dislike.save(null, { useMasterKey: true });
      await updateCommentLikeDislikeCounts(comment);
    }
  }

  static async deleteDislike(req) {
    const { dislikeId } = req.params;

    const dislikeQuery = new Parse.Query("Dislike");
    const dislike = await dislikeQuery.get(dislikeId, { useMasterKey: true });

    try {
      await dislike.destroy({ useMasterKey: true });
      const comment = dislike.get("comment");
      const video = dislike.get("video");

      if (comment) {
        await updateCommentLikeDislikeCounts(comment);
      }

      if (video) {
        await updateCommentLikeDislikeCounts(comment);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  static registerClss() {
    Parse.Object.registerSubclass("Dislike", Dislike);
  }
}

module.exports = Dislike;
