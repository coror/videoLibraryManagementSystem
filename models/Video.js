const { decryptPhoneNumber } = require("../utils/decryptPhone");
const twilio = require("../utils/twilio");

class Video extends Parse.Object {
  constructor() {
    super("Video");
  }

  static async uploadVideo(req) {
    const { userId, data, title, description, category } = req.params;

    const userQuery = new Parse.Query("_User");
    const user = await userQuery.get(userId, { useMasterKey: true });

    if (!user) {
      return "User was not found!";
    }

    const video = new Parse.File("video.mp4", { base64: data });
    await video.save(null, { useMasterKey: true });

    const file = new Video();
    file.set("video", video);
    file.set("title", title);
    file.set("description", description);
    file.set("category", category);
    file.set("viewCount", 0);
    file.set("likeCount", 0);
    file.set("dislikeCount", 0);

    await file.save(null, { useMasterKey: true });

    const relation = user.relation("videos");
    relation.add(file);

    try {
      await user.save(null, { useMasterKey: true });

      // Send WhatsApp message to subscribers
      const subscriberQuery = new Parse.Query("Subscription");
      subscriberQuery.equalTo("subscribedTo", user);
      subscriberQuery.include("subscriber");

      try {
        const subscriptions = await subscriberQuery.find({
          useMasterKey: true,
        });
        const subscribers = subscriptions.map((subscription) =>
          subscription.get("subscriber")
        );

        for (const subscriber of subscribers) {
          const phoneNumber = subscriber.get("phoneNumber");
          if (phoneNumber) {
            // Decrypt the phone number
            const decryptedPhoneNumber = decryptPhoneNumber(phoneNumber);
            // Send WhatsApp message to subscriber
            await twilio.sendWhatsAppMessage(
              decryptedPhoneNumber,
              `New video uploaded: ${title}`
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  static async searchVideos(req) {
    const { title, description, category } = req.params;

    const query = new Parse.Query(Video);

    if (title) {
      query.matches("title", ".*" + title + ".*", "i");
    }

    if (description) {
      query.equalTo("description", description);
    }

    if (category) {
      query.equalTo("category", category);
    }

    try {
      const videos = await query.find({ useMasterKey: true });
      return videos;
    } catch (e) {
      throw new Error(e);
    }
  }

  static async updateVideo(req) {
    const { videoId, title, description, category } = req.params;

    const query = new Parse.Query(Video);
    const video = await query.get(videoId, { useMasterKey: true });

    if (title) {
      video.set("title", title);
    }

    if (description) {
      video.set("description", description);
    }

    if (category) {
      video.set("category", category);
    }
    try {
      await video.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async deleteVideo(req) {
    const { videoId } = req.params;

    const query = new Parse.Query(Video);
    const video = await query.get(videoId, { useMasterKey: true });

    try {
      const commentQuery = new Parse.Query("Comment");
      commentQuery.equalTo("video", video.toPointer());
      const comments = await commentQuery.find({ useMasterKey: true });
      await Parse.Object.destroyAll(comments, { useMasterKey: true });

      const likeQuery = new Parse.Query("Like");
      likeQuery.equalTo("video", video.toPointer());
      const likes = await likeQuery.find({ useMasterKey: true });
      await Parse.Object.destroyAll(likes, { useMasterKey: true });

      const dislikeQuery = new Parse.Query("Dislike");
      dislikeQuery.equalTo("video", video.toPointer());
      const dislikes = await dislikeQuery.find({ useMasterKey: true });
      await Parse.Object.destroyAll(dislikes, { useMasterKey: true });

      await video.destroy({ useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async trendingVideos() {
    const videoQuery = new Parse.Query("Video");
    videoQuery.descending("likeCount");
    videoQuery.limit(10);

    try {
      const trendingVideos = await videoQuery.find({ useMasterKey: true });
      return trendingVideos;
    } catch (e) {
      throw new Error(e);
    }
  }

  static async registerClass() {
    Parse.Object.registerSubclass("Video", Video);
  }
}

module.exports = Video;
