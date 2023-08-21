export default function processData(data) {
    data.forEach (item => {
        Object.keys(item).forEach(key => {
            if(!item[key]) {
                item[key] = 'n/a';
            }
        })
    })
    return data
}