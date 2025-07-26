/**
 * Result
 *
 * @author MoRanYue
 */

/* eslint-disable style/semi */
/* eslint-disable style/indent */

class BaseResult {
    constructor() {}

    unwrap(): any | never {
        if (this instanceof Ok) {
            return this.ok();
        }
        else if (this instanceof Err) {
            throw this.err();
        }

        throw new Error('Result must be used with Ok or Err');
    }

    is_ok(): boolean {
        return this instanceof Ok;
    }

    is_err(): boolean {
        return this instanceof Err;
    }

    unwrap_or<T, E>(f: (err: E) => T): T {
        if (this instanceof Ok) {
            return this.ok();
        }
        else if (this instanceof Err) {
            return f(this.err());
        }

        throw new Error('Result must be used with Ok or Err');
    }

    unwrap_or_else<T>(value: T): T {
        if (this instanceof Ok) {
            return this.ok();
        }
        else if (this instanceof Err) {
            return value;
        }

        throw new Error('Result must be used with Ok or Err');
    }
}

export type Result = Ok | Err;

export class Ok extends BaseResult {
    protected value: any;

    constructor(value: any) {
        super();

        this.value = value;
    }

    ok(): any {
        return this.value;
    }
}
export class Err extends BaseResult {
    protected value: any;

    constructor(value: any) {
        super();

        this.value = value;
    }

    err(): any {
        return this.value;
    }

    static from_string(err: string): Err {
        return new Err(new Error(err));
    }
}
