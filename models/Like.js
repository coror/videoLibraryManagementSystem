const {
  updateCommentLikeDislikeCounts,
  updateVideoLikeDislikeCounts,
} = require("../utils/likeDislikeUtils");

class Like extends Parse.Object {
  constructor() {
    super("Like");
  }

  static async createLike(req) {
    const { userId, videoId, commentId } = req.params;

    const userQuery = new Parse.Query("_User");
    const user = await userQuery.get(userId, { useMasterKey: true });

    // check if the user has dislike on the same comment (he cannot have both)
    if (commentId) {
      const dislikeQuery = new Parse.Query("Dislike");
      dislikeQuery.equalTo("user", user);
      const commentQuery = new Parse.Query("Comment");
      const comment = await commentQuery.get(commentId, { useMasterKey: true });
      dislikeQuery.equalTo("comment", comment);
      const dislike = await dislikeQuery.first({ useMasterKey: true });

      if (dislike) {
        await dislike.destroy({ useMasterKey: true });
      }
    }

    // check if the user has like on the same video (he cannot have both)
    if (videoId) {
      const dislikeQuery = new Parse.Query("Dislike");
      dislikeQuery.equalTo("user", user);
      const videoQuery = new Parse.Query("Video");
      const video = await videoQuery.get(videoId, { useMasterKey: true });
      dislikeQuery.equalTo("video", video);
      const dislike = await dislikeQuery.first({ useMasterKey: true });

      if (dislike) {
        await dislike.destroy({ useMasterKey: true });
      }
    }

    // Check if the user has already liked the video
    if (videoId) {
      const existingLikeQuery = new Parse.Query("Like");
      existingLikeQuery.equalTo("user", user);
      const videoQuery = new Parse.Query("Video");
      const video = await videoQuery.get(videoId, { useMasterKey: true });
      existingLikeQuery.equalTo("video", video);
      const existingLike = await existingLikeQuery.first({
        useMasterKey: true,
      });

      if (existingLike) {
        throw new Error("This user has already liked this video.");
      }
    }

    // Check if the user has already like the comment
    if (commentId) {
      const existingLikeQuery = new Parse.Query("Like");
      existingLikeQuery.equalTo("user", user);
      const commentQuery = new Parse.Query("Comment");
      const comment = await commentQuery.get(commentId, { useMasterKey: true });
      existingLikeQuery.equalTo("comment", comment);
      const existingLike = await existingLikeQuery.first({
        useMasterKey: true,
      });

      if (existingLike) {
        throw new Error("This user has already liked this comment.");
      }
    }

    // Create new like
    const like = new Like();
    like.set("user", user);

    // The video liked
    if (videoId) {
      const videoQuery = new Parse.Query("Video");
      const video = await videoQuery.get(videoId, { useMasterKey: true });

      like.set("video", video);
      await like.save(null, { useMasterKey: true });
      await updateVideoLikeDislikeCounts(video);
    }

    // The comment liked
    if (commentId) {
      const commentQuery = new Parse.Query("Comment");
      const comment = await commentQuery.get(commentId, { useMasterKey: true });

      like.set("comment", comment);
      await like.save(null, { useMasterKey: true });
      await updateCommentLikeDislikeCounts(comment);
    }
  }

  static async deleteLike(req) {
    const { likeId } = req.params;

    const likeQuery = new Parse.Query("Like");
    const like = await likeQuery.get(likeId, { useMasterKey: true });

    try {
      like.destroy({ useMasterKey: true });

      const comment = like.get("comment");
      const video = like.get("video");

      if (comment) {
        await updateCommentLikeDislikeCounts(comment);
      }

      if (video) {
        await updateVideoLikeDislikeCounts(video);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  static registerClass() {
    Parse.Object.registerSubclass("Like", Like);
  }
}

module.exports = Like;
