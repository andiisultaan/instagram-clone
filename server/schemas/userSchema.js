const { ObjectId } = require("mongodb");
const { hashPassword, comparePassword } = require("../helpers/bcryptjs");
const { signToken } = require("../helpers/jwt");
const { GraphQLError } = require("graphql");

const userTypeDefs = `#graphql
    type User {
        _id: ID!
        name: String!
        username: String!
        email: String!
        password: String!
    }

    input SearchUser {
        keyword: String!
    }

    input GetUserById {
        userId: String!
    }

    type GetUserByIdResponse {
        _id: ID!
        name: String
        username: String!
        email: String!
        Followings: [User]
        Followers: [User]
        Posts: [Post]
    }

    input Register {
        name: String
        username: String!
        email: String!
        password: String!
    }

    input Login {
        username: String!
        password: String!
    }

    type LoginResponse {
        access_token: String!
        userId: String
    }

    type Query {
        searchUser(input: SearchUser) : [User]
        getUserById(input: GetUserById) : GetUserByIdResponse
    }

    type Mutation {
        register(input: Register) : String
        login(input: Login) : LoginResponse
    }
`;

const userResolvers = {
  Query: {
    searchUser: async (_, args, context) => {
      try {
        const { db } = context;
        const { keyword } = args.input;
        const query = {
          $or: [{ name: { $regex: keyword, $options: "i" } }, { username: { $regex: keyword, $options: "i" } }],
        };

        const users = await db.collection("Users").find(query).toArray();

        return users;
      } catch (error) {
        throw error;
      }
    },

    getUserById: async (_, args, context) => {
      try {
        await context.auth();
        const { db } = context;
        const { userId } = args.input;

        const stages = [
          {
            $match: {
              _id: new ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: "Follows",
              localField: "_id",
              foreignField: "followerId",
              as: "Followings",
            },
          },
          {
            $lookup: {
              from: "Users",
              localField: "Followings.followingId",
              foreignField: "_id",
              as: "Followings",
            },
          },
          {
            $lookup: {
              from: "Follows",
              localField: "_id",
              foreignField: "followingId",
              as: "Followers",
            },
          },
          {
            $lookup: {
              from: "Users",
              localField: "Followers.followerId",
              foreignField: "_id",
              as: "Followers",
            },
          },
          {
            $lookup: {
              from: "Posts", // Ensure this matches the name of your posts collection
              localField: "_id", // The user ID
              foreignField: "authorId", // The field in Posts that references the user
              as: "Posts", // The key under which posts will be stored
            },
          },
          {
            $project: {
              password: 0,
              "Followings.password": 0,
              "Followers.password": 0,
            },
          },
        ];

        const user = await db.collection("Users").aggregate(stages).next();

        return user;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    register: async (_, args, context) => {
      try {
        const { db } = context;
        const { name, username, email, password } = args.input;

        // unique username
        const findUserByUsername = await db.collection("Users").findOne({ username });

        if (findUserByUsername) {
          throw new GraphQLError("Username has already been taken", {
            extensions: {
              http: { status: 400 },
            },
          });
        }

        // unique email

        const findUserByEmail = await db.collection("Users").findOne({ email });

        if (findUserByEmail) {
          throw new GraphQLError("Email has already been taken", {
            extensions: {
              http: { status: 400 },
            },
          });
        }

        // email format
        const validateEmailFormat = email => {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(String(email).toLowerCase());
        };

        if (!validateEmailFormat(email)) {
          throw new GraphQLError("Invalid email format", {
            extensions: {
              http: { status: 400 },
            },
          });
        }

        // password length
        if (password.length < 5) {
          throw new GraphQLError("Password must at least has 5 characters", {
            extensions: {
              http: { status: 400 },
            },
          });
        }

        // valid
        const registerInput = {
          name,
          username,
          email,
          password: hashPassword(password),
        };

        await db.collection("Users").insertOne(registerInput);

        return "Register Success";
      } catch (error) {
        throw error;
      }
    },

    login: async (_, args, context) => {
      try {
        const { db } = context;
        const { username, password } = args.input;

        const user = await db.collection("Users").findOne({ username });

        if (!user) {
          throw new GraphQLError("Invalid Username and Password", {
            extensions: {
              http: { status: 401 },
            },
          });
        }

        if (!comparePassword(password, user.password)) {
          throw new GraphQLError("Invalid Username and Password", {
            extensions: {
              http: { status: 401 },
            },
          });
        }

        const payload = {
          userId: user["_id"],
          name: user.name,
          username: user.username,
          email: user.email,
        };

        const access_token = signToken(payload);

        return {
          access_token,
          userId: payload.userId,
        };
      } catch (error) {
        throw error;
      }
    },
  },
};

module.exports = { userTypeDefs, userResolvers };
