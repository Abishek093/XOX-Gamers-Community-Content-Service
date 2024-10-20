export class User {
    constructor(
      public userId: string,
      public username: string,
      public displayName: string,
      public profileImage: string | null | undefined,
      public isBlocked: boolean
    ) {}
}
  