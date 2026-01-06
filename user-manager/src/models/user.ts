export class User {
	constructor(name: string, profilePic: string, created: Date) {
		this.name = name;
		this.profilePicPath = name;
	};
	name: string;
	profilePicPath: string;
}
