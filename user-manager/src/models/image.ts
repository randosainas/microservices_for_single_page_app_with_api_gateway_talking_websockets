class image {
	constructor(path: string, orientation: string, 
		intendedUse: string, uploaded: Date)
	{
		this.path = path;
		this.orientation = orientation;
		this.intendedUse = intendedUse;
		this.uploaded = uploaded;
	}
	path: string;	
	orientation: string;
	intendedUse: string;
	uploaded: Date;
}
