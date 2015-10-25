/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./smart_storage.ts"/>
/// <reference path="./test.ts"/>

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
		});

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
