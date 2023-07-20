const Video = require("./Video");

class Comment extends Parse.Object {
  constructor() {
    super("Comment");
  }

  static async createComment(req) {
    const { content, userId, videoId } = req.params;

    const userQuery = new Parse.Query("_User");
    const user = await userQuery.get(userId, { useMasterKey: true });

    const videoQuery = new Parse.Query(Video);
    const video = await videoQuery.get(videoId, { useMasterKey: true });

    if (!user || !video) {
      return "User or video was not found.";
    }

    const comment = new Comment();
    comment.set("content", content);
    comment.set("user", user.toPointer());
    comment.set("video", video.toPointer());
    comment.set("likeCount", 0);
    comment.set("dislikeCount", 0);

    try {
      comment.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async editComment(req) {
    const { commentId, content } = req.params;

    const commentQuery = new Parse.Query(Comment);
    const comment = await commentQuery.get(commentId, { useMasterKey: true });

    comment.set("content", content);

    try {
      comment.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async deleteComment(req) {
    const { commentId } = req.params;

    const commentQuery = new Parse.Query(Comment);
    const comment = await commentQuery.get(commentId, { useMasterKey: true });

    try {
      const likeQuery = new Parse.Query("Like");
      likeQuery.equalTo("comment", comment.toPointer());
      const likes = await likeQuery.find({ useMasterKey: true });
      await Parse.Object.destroyAll(likes, { useMasterKey: true });

      const dislikeQuery = new Parse.Query("Dislike");
      dislikeQuery.equalTo("comment", comment.toPointer());
      const dislikes = await dislikeQuery.find({ useMasterKey: true });
      await Parse.Object.destroyAll(dislikes, { useMasterKey: true });

      await comment.destroy({ useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async getAllCommentsForVideo(req) {
    const { videoId } = req.params;

    const videoQuery = new Parse.Query("Video");
    const video = await videoQuery.get(videoId, { useMasterKey: true });

    const commentQuery = new Parse.Query("Comment");
    commentQuery.equalTo("video", video);

    try {
      const comments = await commentQuery.find({ useMasterKey: true });
      return comments;
    } catch (e) {
      throw new Error(e);
    }
  }

  static async trendingComments() {
    const commentQuery = new Parse.Query("Comment");
    commentQuery.descending("likeCount");
    commentQuery.limit(10);

    try {
      const trendingComments = await commentQuery.find({ useMasterKey: true });
      return trendingComments;
    } catch (e) {
      throw new Error(e);
    }
  }

  static registerClass() {
    Parse.Object.registerSubclass("Comment", Comment);
  }
}

module.exports = Comment;
