/// <reference path="../typings/tsd.d.ts" />

interface IStorageObject {
	id : string;
	deleted ?: boolean;
}

interface ISmartStorage<T extends IStorageObject> {
	save(obj: T): ng.IPromise<T>;
	query(params: any): ng.IPromise<T[]>;
	get(key: string, allowNewRequest?: boolean): ng.IPromise<T>;
	delete(key: string, obj: T): ng.IPromise<void>;
}

interface IRemoteObjectProvider<T extends IStorageObject> {
	/**
	 * key's and corresponding object's position should be equal
	 */
	get(key: string[]): ng.IPromise<T[]>;
	query(params: any, fields: string[]): ng.IPromise<T[]>;
	save(obj: T): ng.IPromise<T>;
	update(key: string, obj: T): ng.IPromise<T>;
	delete(key: string): ng.IPromise<void>;
}

interface ILocalObjectProvider<T extends IStorageObject> {
	hasKey(key: string) : boolean;
	setItem(key: string, obj: T) : void;
	getItem(key: string) : T;
	removeItem(key: string) : void;
	size() : number;
}
