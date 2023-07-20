async function updateVideoLikeDislikeCounts(video) {
  const likeQuery = new Parse.Query("Like");
  likeQuery.equalTo("video", video);
  const likeCount = await likeQuery.count({ useMasterKey: true });

  const dislikeQuery = new Parse.Query("Dislike");
  dislikeQuery.equalTo("video", video);
  const dislikeCount = await dislikeQuery.count({ useMasterKey: true });

  video.set("likeCount", likeCount);
  video.set("dislikeCount", dislikeCount);
  await video.save(null, { useMasterKey: true });
}

async function updateCommentLikeDislikeCounts(comment) {
  const likeQuery = new Parse.Query("Like");
  likeQuery.equalTo("comment", comment);
  const likeCount = await likeQuery.count({ useMasterKey: true });

  const dislikeQuery = new Parse.Query("Dislike");
  dislikeQuery.equalTo("comment", comment);
  const dislikeCount = await dislikeQuery.count({ useMasterKey: true });

  comment.set("likeCount", likeCount);
  comment.set("dislikeCount", dislikeCount);
  await comment.save(null, { useMasterKey: true });
}

module.exports = {
  updateCommentLikeDislikeCounts,
  updateVideoLikeDislikeCounts,
};
