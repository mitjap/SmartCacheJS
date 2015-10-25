/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./interfaces.ts" />

class LocalObjectProvider<T extends IStorageObject> implements ILocalObjectProvider<T> {
	private storage: { [key: string]: T };

	constructor() {
		this.storage = {};
	}

	hasKey(key: string) : boolean {
		return this.storage.hasOwnProperty(key);
	}

	setItem(key: string, obj: T) : void {
		this.storage[key] = obj;
	}

	getItem(key: string) : T {
		return this.storage[key];
	}

	removeItem(key: string) : void {
		delete this.storage[key];
	}

	size() : number {
		return _.size(this.storage);
	}
}
