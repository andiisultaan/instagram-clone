const { ObjectId } = require("mongodb");

const followTypeDefs = `#graphql
    type Follow {
        _id: ID!
        followingId: ID!
        followerId: ID!
        createdAt: String
        updatedAt: String
    }

    input FollowInput {
        followingId: String
    }

    type Mutation {
        followUser(input: FollowInput) : String
    }
`;

const followResolvers = {
  Mutation: {
    followUser: async (_, args, context) => {
      try {
        const user = await context.auth();
        const { followingId } = args.input;
        const { db } = context;

        const followerId = new ObjectId(user.userId);
        const followInput = {
          followingId: new ObjectId(followingId),
          followerId,
        };

        // check if already following
        const existingFollow = await db.collection("Follows").findOne(followInput);

        if (existingFollow) {
          await db.collection("Follows").deleteOne(followInput);
          return "Unfollow Success";
        } else {
          const follow = {
            ...followInput,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const followReport = await db.collection("Follows").insertOne(follow);

          await db.collection("Follows").findOne({ _id: new ObjectId(followReport.insertedId) });

          return "Follow Success";
        }
      } catch (error) {
        throw error;
      }
    },
  },
};

module.exports = { followTypeDefs, followResolvers };
