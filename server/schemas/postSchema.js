const { GraphQLError } = require("graphql");
const { ObjectId } = require("mongodb");
const redis = require("../config/redis");

const postTypeDefs = `#graphql
  type Comment {
    content: String!
    username: String!
    createdAt: String 
    updatedAt: String
  }

  type Like {
    username: String!
    createdAt: String
    updatedAt: String
  }

  type Post {
    _id: ID!
    authorId: ID!
    content: String!
    imgUrl: String
    tags: [String]
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
    Author: User
  }

  input GetPostById {
    postId: String!
  }

  input AddPost {
    content: String!
    imgUrl: String
    tags: [String]
  }

  input CommentInput {
    postId: ID!
    content: String!
  }

  input LikeInput {
    postId: ID!
  }

  type Query {
    getPosts: [Post]
    getPostById(input: GetPostById): Post
  }

  type Mutation {
    addPost(input: AddPost): Post
    commentPost(input: CommentInput): String
    likePost(input: LikeInput): String
  }

`;

const postResolvers = {
  Query: {
    getPosts: async (_, __, context) => {
      try {
        await context.auth();

        const cache = await redis.get("posts");

        if (cache) {
          return JSON.parse(cache);
        }

        const { db } = context;

        const stages = [
          {
            $lookup: {
              from: "Users",
              localField: "authorId",
              foreignField: "_id",
              as: "Author",
            },
          },
          {
            $project: {
              "Author.password": 0,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $unwind: {
              path: "$Author",
              preserveNullAndEmptyArrays: true,
            },
          },
        ];

        const posts = await db.collection("Posts").aggregate(stages).toArray();

        await redis.set("posts", JSON.stringify(posts));
        return posts;
      } catch (error) {
        throw error;
      }
    },

    getPostById: async (_, args, context) => {
      try {
        await context.auth();
        const { db } = context;
        const { postId } = args.input;

        const stages = [
          {
            $match: {
              _id: new ObjectId(postId),
            },
          },
          {
            $lookup: {
              from: "Users",
              localField: "authorId",
              foreignField: "_id",
              as: "Author",
            },
          },
          {
            $project: {
              "Author.password": 0,
            },
          },
          {
            $unwind: {
              path: "$Author",
              preserveNullAndEmptyArrays: true,
            },
          },
        ];

        const post = await db.collection("Posts").aggregate(stages).next();

        if (!post) {
          throw new GraphQLError("Post not found", {
            extensions: {
              http: { status: 404 },
            },
          });
        }

        return post;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    addPost: async (_, args, context) => {
      try {
        const userInfo = await context.auth();
        const { db } = context;

        const { content, imgUrl, tags } = args.input;

        const postInput = {
          authorId: new ObjectId(userInfo.userId),
          content,
          imgUrl,
          tags,
          comments: [],
          likes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const addPostReport = await db.collection("Posts").insertOne(postInput);

        const newPost = await db.collection("Posts").findOne({ _id: addPostReport.insertedId });

        await redis.del("posts");
        return newPost;
      } catch (error) {
        throw error;
      }
    },

    commentPost: async (_, args, context) => {
      try {
        const userInfo = await context.auth();
        const { db } = context;
        const { postId, content } = args.input;

        await db.collection("Posts").updateOne(
          {
            _id: new ObjectId(postId),
          },
          {
            $push: {
              comments: {
                content,
                username: userInfo.username,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          }
        );

        await redis.del("posts");

        return "Comment success";
      } catch (error) {
        throw error;
      }
    },

    likePost: async (_, args, context) => {
      try {
        const userInfo = await context.auth();
        const { db } = context;
        const { postId } = args.input;
        const username = userInfo.username;

        const post = await db.collection("Posts").findOne({ _id: new ObjectId(postId) });

        if (!post) {
          throw new Error("Post not found");
        }

        const userLikeIndex = post.likes.findIndex(like => like.username === username);

        if (userLikeIndex !== -1) {
          await db.collection("Posts").updateOne({ _id: new ObjectId(postId) }, { $pull: { likes: { username } } });
          await redis.del("posts");
          return "Unlike success";
        } else {
          await db.collection("Posts").updateOne(
            { _id: new ObjectId(postId) },
            {
              $push: {
                likes: {
                  username,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              },
            }
          );
          await redis.del("posts");
          return "Like success";
        }
      } catch (error) {
        throw error;
      }
    },
  },
};

module.exports = { postTypeDefs, postResolvers };
