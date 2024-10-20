// export type AuthenticatedUser = {
//     accessToken: string;
//     refreshToken: string;
//     user: {
//         id: string;
//         username: string;
//         displayName?: string;
//         email: string;
//         profileImage?: string;
//         titleImage?: string;
//         bio?: string;
//     };
// };

// export type UsernameTakenResponse = {
//     isUsernameTaken: boolean;
// };

// export type AuthResponse = AuthenticatedUser | UsernameTakenResponse;

// export type NonSensitiveUserProps = {
//     id: string;
//     email: string;
//     username: string;
//     displayName?: string;
//     profileImage?: string;
//     titleImage?: string;
//     bio?: string;
//     dateOfBirth?: Date;
// };


// export type UserProps = {
//     id?: string;
//     email: string;
//     username: string;
//     displayName?: string;
//     password: string;
//     profileImage?: string;
//     titleImage?: string;
//     bio?: string;
//     // followers?: string[];
//     // following?: string[];
//     walletBalance?: number;
//     transactions?: string[];
//     createdAt?: Date;
//     updatedAt?: Date;
//     isVerified?: boolean;
//     isGoogleUser?: boolean;
//     dateOfBirth?: Date;
//     isBlocked?: boolean;
// }


export type CommentTypes = {
    _id: string,
    postId: string,
    author: string,
    content: string,
    createdAt: string,
    userDetails: {
      _id: string,
      username: string,
      displayName: string,
      profileImage: string,
    },
}