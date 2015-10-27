/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./interfaces.ts" />

class SmartStorage<T extends IStorageObject> implements ISmartStorage<T> {
	$q: ng.IQService;

	localProvider: ILocalObjectProvider<T>;
	remoteProvider: IRemoteObjectProvider<T>;

	pending: { [key: string]: ng.IPromise<T> };

	constructor($q: ng.IQService, localProvider: ILocalObjectProvider<T>, remoteProvider: IRemoteObjectProvider<T>) {
		this.$q = $q;
		this.localProvider = localProvider;
		this.remoteProvider = remoteProvider;

		this.pending = {};
	}

	save(obj: T): ng.IPromise<T> {
		return this.remoteProvider.save(obj)
		.then(function(obj: T) {
			this.localProvider.setItem(obj.id, obj);
			return obj;
		});
	}

	query(params: any): ng.IPromise<T[]> {
		return this.remoteProvider.query(params, ['id'])
		.then(function(data: T[]) {
			var keys = _.pluck(data, 'id');
			// ignore keys already in local storage or pending

			var missingKeys = _.reject(keys, (key) => {
				return this.localProvider.hasKey(key) || this.isPending(key);
			});

			// request only missing keys and add them to pending
			var promise = this.remoteProvider.get(missingKeys);
			this.addMultiplePending(missingKeys, promise);

			// map all promises to one promise
			return this.$q.all(_.map(keys, (key: string) => {
				return this.get(key);
			}));
		});
	}

	get(key: string, allowNewRequest: boolean = true): ng.IPromise<T> {
		// check local provider
		if (this.localProvider.hasKey(key)) {
			return this.$q.resolve(this.localProvider.getItem(key));
		}
		// check pending requests
		else if (this.isPending(key)) {
			return this.pending[key];
		}
		// get from remote provider
		else if (allowNewRequest) {
			var keys = [key];
			var promise = this.remoteProvider.get(keys);
			return this.addMultiplePending(keys, promise)[0];
		} else {
			return this.$q.reject();
		}
	}

	delete(key: string, obj: T): ng.IPromise<void> {
		// if request is pending wait for it to finish and then delete to avoid race condition
		if (this.isPending(key)) {
			return this.pending[key]
			.finally(() : ng.IPromise<void> => {
				return this.delete(key, obj);
			})
			.then(() => { })
		} else {
			return this.remoteProvider.delete(key)
			.then(() => {
				this.deleteInternal(key, obj)
			});
		}
	}

	protected deleteInternal(key: string, obj: T) : void {
		if (this.localProvider.hasKey(key)) {
			this.localProvider.removeItem(key);
		}

		obj.deleted = true;
	}

	/**
	 * Creates a promise for each single key and adds it to pending array
	 */
	private addMultiplePending(keys: string[], promise: ng.IPromise<T[]>) : ng.IPromise<T>[] {
		return _.map(keys, (key: string, index: number) => {
			return this.addPending(key, promise.then((objects: T[]) : T => { return objects[index]; }));
		});
	}

  /**
   * Adds a promise to pending array and removes it when promise is finished.
   * Object is added to local provider on resolved promise.
   */
  private addPending(key: string, promise: ng.IPromise<T>) : ng.IPromise<T> {
    this.pending[key] = promise;

    return promise
    // on resolve add to local storage
    .then((obj: T) => {
      this.localProvider.setItem(key, obj);
      return obj;
    })
    // always delete from pending
    .finally(() => {
      delete this.pending[key];
    });
  }

  private isPending(key: string) : boolean {
    return this.pending.hasOwnProperty(key);
  }
}
