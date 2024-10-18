Utils = {
    formatDate(date) {
        let d = date.getDate();
        let m = date.getMonth() + 1;
        let y = date.getFullYear();
        return (d < 10 ? '0' : '') + d + '.' + (m < 10 ? '0' : '') + m + '.' + y;
    },
    transliterate(source) {
        alfabet = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'й': 'y','к': 'k','л': 'l','м': 'm','н': 'n','о': 'o','п': 'p','р': 'r','с': 's','т': 't','у': 'u',
            'ф': 'f','х': 'kh','ц': 'ts','ч': 'ch','ш': 'sh','щ': 'shch','ы': 'y','э': 'e','ю': 'yu','я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YE', 'Ж': 'ZH', 'З': 'Z', 'И': 'I',
            'Й': 'Y','К': 'K','Л': 'L','М': 'M','Н': 'N','О': 'O','П': 'P','Р': 'R','С': 'S','Т': 'T','У': 'U',
            'Ф': 'F','Х': 'KH','Ц': 'TS','Ч': 'CH','Ш': 'SH','Щ': 'SHCH','Ы': 'Y','Э': 'E','Ю': 'YU','Я': 'YA',
            '-': '-',
        }
        let result = '';
        for (let i = 0; i < source.length; i++) {
            let char = source[i]
            if (typeof alfabet[char] == "undefined") {
                continue;
            }
            result += alfabet[char];
        }
        return result;
    },
    formatSeconds(s) {
        let m = Math.trunc(s / 60) + ''
        s = (s % 60) + ''
        return m.padStart(2, 0) + ':' + s.padStart(2, 0)
    }
}