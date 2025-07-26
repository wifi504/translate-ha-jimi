/* eslint-disable antfu/consistent-chaining */
/* eslint-disable eqeqeq */
/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable style/semi */
/* eslint-disable style/indent */
/**
 * 哈基米加密
 *
 * @author MoRanYue
 */

import { Err, Ok, type Result } from './result';

export function get_hajimi_words_bin(): string[] {
    // strings must not have the same prefix
    return [
        '哈基米',
        '弄南北绿豆',
        '阿西嘎',
        '哈椰果奶龙',
        '曼波',
        '哦吗基里',
        '达布达布',
        '呦呐呦呐',
    ];
}

export function validate_string_set(string_set: string[]): Result {
    const length = string_set.length;

    if (length != 8) {
        return Err.from_string('String set must have exact 8 strings');
    }

    // if (!(size && !(size & size - 1))) {
    //     return Err.from_string('String set\'s size must be a pow of 2');
    // }

    return new Ok(null);
}

export function human_to_hajimi_bin(original: string, key: string, string_set: string[] = get_hajimi_words_bin()): Result {
    const result = validate_string_set(string_set);
    if (result.is_err()) {
        return result;
    }

    const te = new TextEncoder();

    const original_bytes = te.encode(original);
    const key_bytes = te.encode(key);

    let bin_str = '';
    original_bytes.forEach((b, i) => {
        bin_str += (b ^ key_bytes[i % key_bytes.length])
            .toString(2).padStart(8, '0');
    });

    const padding = (3 - (bin_str.length % 3)) % 3;
    bin_str += '0'.repeat(padding);

    let encrypted_str = '';
    for (let i = 0; i < bin_str.length; i += 3) {
        const bits = bin_str.substring(i, i + 3);
        const index = Number.parseInt(bits, 2);

        encrypted_str += string_set[index];
    }

    encrypted_str += '喵'.repeat(padding);

    return new Ok(encrypted_str);
}

export function hajimi_bin_to_human(cipher: string, key: string, string_set: string[] = get_hajimi_words_bin()): Result {
    const result = validate_string_set(string_set);
    if (result.is_err()) {
        return result;
    }

    const padding_indication_first_index = cipher.indexOf('喵');
    const padding = padding_indication_first_index == -1 ? 0 : cipher.length - padding_indication_first_index;

    cipher = cipher.substring(0, padding_indication_first_index == -1 ? undefined : padding_indication_first_index);

    const key_bytes = new TextEncoder().encode(key);

    let bin_str = '';
    let str = '';
    let i = 0;
    while (i < cipher.length) {
        str += cipher.charAt(i);
        i++;
        // console.log(str);

        const index = string_set.indexOf(str);
        if (index == -1) {
            continue;
        }

        bin_str += index.toString(2).padStart(3, '0');
        str = '';
    }
    if (str) {
        return Err.from_string(`the cipher has invalid mapping '${str}'`);
    }

    bin_str = bin_str.substring(0, bin_str.length - padding);

    const decrypted_bytes = [];
    for (let i = 0; i < bin_str.length; i += 8) {
        const byte_str = bin_str.substring(i, i + 8);
        decrypted_bytes.push(Number.parseInt(byte_str, 2) ^ key_bytes[i / 8 % key_bytes.length]);
    }

    return new Ok(new TextDecoder().decode(new Uint8Array(decrypted_bytes)));
}
