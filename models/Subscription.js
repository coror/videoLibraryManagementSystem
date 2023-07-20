class Subscription extends Parse.Object {
  constructor() {
    super("Subscription");
  }

  static async createSub(req) {
    const { subscriberId, subscribedToId, subMonths } = req.params;

    const query = new Parse.Query("_User");
    const subscriber = await query.get(subscriberId, { useMasterKey: true });
    const subscribedTo = await query.get(subscribedToId, {
      useMasterKey: true,
    });

    const existingSubscriptionQuery = new Parse.Query("Subscription");
    existingSubscriptionQuery.equalTo("subscriber", subscriber.toPointer());
    existingSubscriptionQuery.equalTo("subscribedTo", subscribedTo.toPointer());

    const existingSubscription = await existingSubscriptionQuery.first({
      useMasterKey: true,
    });

    if (existingSubscription) {
      throw new Error("Subscriber is already subscribed to the user.");
    }

    const subscription = new Subscription();
    subscription.set("subscriber", subscriber.toPointer());
    subscription.set("subscribedTo", subscribedTo.toPointer());
    subscription.set("subMonths", subMonths);

    try {
      await subscription.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async removeSub(req) {
    const { subId } = req.params;

    const query = new Parse.Query("Subscription");
    const sub = await query.get(subId, { useMasterKey: true });

    try {
      await sub.destroy({ useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static async extendSub(req) {
    const { subId, addMonths } = req.params;

    const subQuery = new Parse.Query("Subscription");
    const sub = await subQuery.get(subId, { useMasterKey: true });
    const currentMonth = await sub.get("subMonths");

    const editedSub = currentMonth + addMonths;
    sub.set("subMonths", editedSub);

    try {
      await sub.save(null, { useMasterKey: true });
    } catch (e) {
      throw new Error(e);
    }
  }

  static registerClass() {
    Parse.Object.registerSubclass("Subscription", Subscription);
  }
}

module.exports = Subscription;
