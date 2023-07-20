const sharp = require("sharp");

class Avatar extends Parse.Object {
  constructor() {
    super("Avatar");
  }

  static async uploadAvatar(req) {
    const { userId, data } = req.params;

    const userQuery = new Parse.Query("_User");
    const user = await userQuery.get(userId, { useMasterKey: true });

    if (!user) {
      return "User was not found!";
    }

    // Check if the user already has an avatar
    const existingAvatar = user.get("avatar");
    if (existingAvatar) {
      try {
        await existingAvatar.destroy({ useMasterKey: true });
      } catch (e) {
        throw new Error("Failed to delete existing avatar.");
      }
    }

    const resizedAvatar = await sharp(Buffer.from(data, "base64"))
      .resize(320, 420)
      .toBuffer();
    const resizedFile = new Parse.File("resized-photo.jpg", {
      base64: resizedAvatar.toString("base64"),
    });

    const avatar = new Avatar();
    avatar.set("avatar", resizedFile);
    user.set("avatar", resizedFile);

    await avatar.save(null, { useMasterKey: true });
    user.set("avatar", avatar.toPointer());

    try {
      await user.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async registerClass() {
    Parse.Object.registerSubclass("Avatar", Avatar);
  }
}

module.exports = Avatar;
