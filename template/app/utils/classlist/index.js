export default function(classObj) {
    if(Array.isArray(classObj)) {
        return classObj.join(' ');
    }
    return Object.keys(classObj).filter(name => !!classObj[name]).join(' ');
}
