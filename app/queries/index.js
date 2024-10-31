import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($input: Login) {
    login(input: $input) {
      access_token
      userId
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: Register) {
    register(input: $input)
  }
`;

export const GET_POSTS = gql`
  query GetPosts {
  getPosts {
    _id
    content
    imgUrl
    Author {
      _id
      username
    }
    comments {
      content
      username
    }
    likes {
      username
    }
    createdAt
    tags
    authorId
    updatedAt
  }
}

`;

export const GET_USER_BY_ID = gql`
  query GetUserById($input: GetUserById) {
  getUserById(input: $input) {
    Followers {
      _id
    }
    Followings {
      _id
    }
    _id
    name
    username
    email
    Posts {
      _id
      authorId
      content
      imgUrl
      tags
      comments {
        content
        createdAt
      }
      likes {
        createdAt
        updatedAt
      }
      createdAt
    }
  }
}
`;

export const ADD_POST = gql`
  mutation AddPost($input: AddPost) {
  addPost(input: $input) {
    _id
    authorId
    content
    imgUrl
    createdAt
    updatedAt
    tags
    comments {
      content
      username
      createdAt
      updatedAt
    }
    likes {
      username
      createdAt
      updatedAt
    }
    Author {
      _id
      name
      username
      email
      password
    }
  }
}
`;

export const GET_POST_BY_ID = gql`
  query GetPostById($input: GetPostById) {
  getPostById(input: $input) {
    _id
    authorId
    content
    imgUrl
    tags
    comments {
      content
      username
      createdAt
      updatedAt
    }
    likes {
      username
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
    Author {
      _id
      name
      username
      email
    }
  }
}
`;

export const FOLLOW_N_UNFOLLOW_USER = gql`
  mutation FollowUser($input: FollowInput) {
    followUser(input: $input)
  }
`;

export const LIKE_N_UNLIKE_POST = gql`
  mutation LikePost($input: LikeInput) {
  likePost(input: $input)
}
`;

export const ADD_COMMENT = gql`
  mutation CommentPost($input: CommentInput) {
  commentPost(input: $input)
}
`;

export const SEARCH_USER = gql`
  query SearchUser($input: SearchUser) {
  searchUser(input: $input) {
    _id
    name
    username
    email
    password
  }
}
`;
