export interface IMessageBroker{
    publishUserCreationMessage(userId: string, userName: string, displayName: string, profileImage: string): Promise<void>
}