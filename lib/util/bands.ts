/*
 * Copyright © 2019 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as _ from "lodash";

export interface UpTo {
    upTo: number;
}

export interface Exactly {
    exactly: number;
}

export const Default = "default";

export type Band = UpTo | Exactly | typeof Default;

export type Bands<B extends string> = Record<B, Band>;

function isExactly(b: Band): b is Exactly {
    const maybe = b as Exactly;
    return !!maybe && maybe.exactly !== undefined;
}

function isUpTo(b: Band): b is UpTo {
    const maybe = b as UpTo;
    return !!maybe && maybe.upTo !== undefined;
}

/**
 * Return the band for the given value
 * @param {Bands} bands
 * @param {number} value
 * @return {string}
 */
export function bandFor<B extends string = string>(bands: Bands<B>, value: number, includeNumber: boolean = false): string {
    const bandNames = Object.getOwnPropertyNames(bands);
    for (const bandName of bandNames) {
        const band = bands[bandName];
        if (isExactly(band) && band.exactly === value) {
            return format(value, bandName, band, includeNumber);
        }
    }
    const upToBands: Array<{ name: string, band: UpTo }> = _.sortBy(
        bandNames
            .map(name => ({ name, band: bands[name] }))
            .filter(nb => isUpTo(nb.band)) as any,
        b => b.band.upTo);
    for (const upTo of upToBands) {
        if (upTo.band.upTo > value) {
            return format(value, upTo.name, upTo.band, includeNumber);
        }
    }
    return bandNames.find(n => bands[n] === Default);
}

function format(value: number, name: string, band: Band, includeNumber: boolean): string {
    if (includeNumber && isExactly(band)) {
        return `${name} (=${band.exactly})`;
    }
    if (includeNumber && isUpTo(band)) {
        return `${name} (<${band.upTo})`;
    }
    return name;
}