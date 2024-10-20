export interface CommentResponse {
    _id: string;
    postId: string;
    author: string;
    content: string;
    createdAt: Date;
    userDetails: {
        _id: string;
        username: string;
        displayName: string;
        profileImage: string | undefined;
    };
}




interface UserDetails {
    _id: string;            
    profileImage?: string;  
    username: string;       
    displayName: string;   
  }
  
export interface CommentListResponse {
    _id: string;           
    postId: string;        
    author: string;        
    content: string;       
    createdAt: Date;      
    userDetails: UserDetails; 
  }
  