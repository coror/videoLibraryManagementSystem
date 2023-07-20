const AppUser = require("./models/AppUser");
const Avatar = require("./models/Avatar");
const Video = require("./models/Video");
const Comment = require("./models/Comment");
const Like = require("./models/Like");
const Dislike = require("./models/Dislike");
const Subscription = require("./models/Subscription");
const {
  createUserValidator,
  // uploadAvatarValidator,
  createCommentValidator,
  uploadVideoValidator,
  updateUserValidator,
  updateVideoValidator,
  editCommentValidator,
} = require("./utils/validator");

// User
Parse.Cloud.define("createUser", AppUser.createUser, createUserValidator);

Parse.Cloud.beforeSave(AppUser, AppUser.beforeSave);

Parse.Cloud.define("updateUser", AppUser.updateUser, updateUserValidator);

Parse.Cloud.define("deleteUser", AppUser.deleteUser);

// Avatar
Parse.Cloud.define("uploadAvatar", Avatar.uploadAvatar); // , uploadAvatarValidator

// Video
Parse.Cloud.define("uploadVideo", Video.uploadVideo, uploadVideoValidator); //

Parse.Cloud.define("searchVideos", Video.searchVideos);

Parse.Cloud.define("updateVideo", Video.updateVideo, updateVideoValidator);

Parse.Cloud.define("deleteVideo", Video.deleteVideo);

Parse.Cloud.define("trendingVideos", Video.trendingVideos);

// Comment
Parse.Cloud.define(
  "createComment",
  Comment.createComment,
  createCommentValidator
);

Parse.Cloud.define("deleteComment", Comment.deleteComment);

Parse.Cloud.define("editComment", Comment.editComment, editCommentValidator);

Parse.Cloud.define("getAllCommentsForVideo", Comment.getAllCommentsForVideo);

Parse.Cloud.define("trendingComments", Comment.trendingComments);

// Like
Parse.Cloud.define("createLike", Like.createLike);

Parse.Cloud.define("deleteLike", Like.deleteLike);

// Dislike

Parse.Cloud.define("createDislike", Dislike.createDislike);

Parse.Cloud.define("deleteDislike", Dislike.deleteDislike);

// Subscription

Parse.Cloud.define("createSub", Subscription.createSub);

Parse.Cloud.define("removeSub", Subscription.removeSub);

Parse.Cloud.define("extendSub", Subscription.extendSub);
