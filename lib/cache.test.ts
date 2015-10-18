/// <reference path="../typings/tsd.d.ts" />
declare var module: any;
declare var inject: any;


// Testing class
class Obj {
	constructor(public id: string, public prop: string) {	}
}

describe("SmartStorage", () => {
	var $q: ng.IQService;
	var $rootScope: ng.IRootScopeService;
	var smartStorage: ISmartStorage<Obj>;

	var localStorageMock: ILocalObjectProvider<Obj>;
	var remoteStorageMock: IRemoteObjectProvider<Obj>;

	var obj1: Obj;
	var obj2: Obj;
	var obj3: Obj;

	beforeEach(module('SmartCache'));

	beforeEach(() => {
		inject(function (_$q_: ng.IQService, _$rootScope_: ng.IRootScopeService) {
			$q = _$q_;
			$rootScope = _$rootScope_;

			localStorageMock = jasmine.createSpyObj('localStorageMock', ['hasKey', 'setItem', 'getItem', 'removeItem', 'size']);
			remoteStorageMock = jasmine.createSpyObj('remoteStorageMock', ['get', 'save', 'delete', 'queryIds']);
			smartStorage = new SmartStorage<Obj>($q, localStorageMock, remoteStorageMock);
		});
	});

	beforeEach(() => {
		obj1 = new Obj("a", "first object");
		obj2 = new Obj("b", "second object");
		obj3 = new Obj("b", "third object");
	})

	it("Test geting existing object from local storage", () => {
		(<jasmine.Spy>localStorageMock.hasKey).and.returnValue(true);
		(<jasmine.Spy>localStorageMock.getItem).and.returnValue(obj1);

		var resolvedValue: Obj;
		smartStorage.get(obj1.id).then((value: Obj) =>  {
			resolvedValue = value;
		})

		expect(localStorageMock.hasKey).toHaveBeenCalledWith(obj1.id)
		expect(localStorageMock.getItem).toHaveBeenCalledWith(obj1.id);

		expect(resolvedValue).toBeUndefined();

		$rootScope.$apply();

		expect(resolvedValue).toBe(obj1);
	});

	it("Test geting existing object from remote storage", () => {
		var remoteDeferred = $q.defer<Obj[]>();
		(<jasmine.Spy>localStorageMock.hasKey).and.returnValue(false);
		(<jasmine.Spy>remoteStorageMock.get).and.returnValue(remoteDeferred.promise);

		var resolvedValue: Obj;
		smartStorage.get(obj1.id).then((value: Obj) =>  {
			resolvedValue = value;
		})

		expect(localStorageMock.hasKey).toHaveBeenCalledWith(obj1.id);
		expect(localStorageMock.getItem).not.toHaveBeenCalled();
		expect(remoteStorageMock.get).toHaveBeenCalledWith([obj1.id]);

		expect(resolvedValue).toBeUndefined();

		$rootScope.$apply();

		remoteDeferred.resolve([obj1]);
		$rootScope.$apply();

		expect(resolvedValue).toBe(obj1);
	});
});

describe("LocalProvider", () => {

	var localProvider: ILocalObjectProvider<Obj>;
	var obj1: Obj;
	var obj2: Obj;
	var obj3: Obj;

	beforeEach(() => {
		localProvider = new LocalObjectProvider<Obj>();
		obj1 = new Obj("a", "first object");
		obj2 = new Obj("b", "second object");
		obj3 = new Obj("b", "third object");
	});

	it("Provider should be empty at first", () => {
		expect(localProvider.size()).toBe(0);
	})

	it("Adding/removing an item should increase/decrease size", () => {
		localProvider.setItem(obj1.id, obj1);
		expect(localProvider.size()).toBe(1);

		localProvider.setItem(obj2.id, obj2);
		expect(localProvider.size()).toBe(2);

		localProvider.removeItem(obj1.id);
		expect(localProvider.size()).toBe(1);
	})

	it("Check if retreived item is actually the same instance", () => {
		localProvider.setItem(obj1.id, obj1);
		var obj: Obj = localProvider.getItem(obj1.id);

		expect(obj).toBe(obj1);
		expect(obj).not.toBe(obj2);
		expect(obj).not.toBe(obj3);
	})

	it("Retreiving not contained item should return undefined", () => {
		localProvider.setItem(obj2.id, obj2);

		var hasKey: boolean = localProvider.hasKey(obj1.id);
		var obj: Obj = localProvider.getItem(obj1.id);

		expect(hasKey).toBe(false);
		expect(obj).toBe(undefined);
	})

	it("Test overriding key", () => {
		localProvider.setItem(obj2.id, obj2);
		localProvider.setItem(obj3.id, obj3); // note: objects have same id

		var hasKey: boolean = localProvider.hasKey(obj2.id);
		var obj: Obj = localProvider.getItem(obj2.id);

		expect(hasKey).toBe(true);
		expect(obj).not.toBe(obj2);
		expect(obj).toBe(obj3);
		expect(localProvider.size()).toBe(1);
	})

	it("Test removing key", () => {
		localProvider.setItem(obj1.id, obj1);
		localProvider.removeItem(obj1.id);

		var hasKey: boolean = localProvider.hasKey(obj2.id);
		var obj: Obj = localProvider.getItem(obj2.id);

		expect(hasKey).toBe(false);
		expect(obj).toBe(undefined);
		expect(localProvider.size()).toBe(0);
	})
});
