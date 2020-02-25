/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* JavaScript runtime for core operators */

/* Utilities */
function mustBeArray(obj) {
    if (Array.isArray(obj)) {
        return;
    }
    throw new Error('Expected an array but got: ' + JSON.stringify(obj));
}
function boxNat(v) {
    return { '$nat': v };
}
function unboxNat(v) {
    return v['$nat'];
}
function isNat(v) {
    return Object.prototype.hasOwnProperty.call(v,'$nat');
}
function boxLeft(v) {
    return { '$left' : v };
}
function unboxLeft(v) {
    return v['$left'];
}
function isLeft(v) {
    return Object.prototype.hasOwnProperty.call(v,'$left');
}
function boxRight(v) {
    return { '$right' : v };
}
function unboxRight(v) {
    return v['$right'];
}
function isRight(v) {
    return Object.prototype.hasOwnProperty.call(v,'$right');
}
function sub_brand(b1,b2) {
    var bsub=null;
    var bsup=null;
    for (var i=0; i<inheritance.length; i=i+1) {
        bsub = inheritance[i].sub;
        bsup = inheritance[i].sup;
        if ((b1 === bsub) && (b2 === bsup)) { return true; }
    }
    return false;
}
// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions
function escapeRegExp(string){
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

/* Generic */
function equal(v1, v2) {
    return compare(v1, v2) === 0;
}
function compare(v1, v2) {
    var t1 = typeof v1, t2 = typeof v2;
    if (t1 === 'object' && v1 !== null) {
        if (isNat(v1)) { t1 = 'number'; v1 = unboxNat(v1); }
    };
    if (t2 === 'object' && v2 !== null) {
        if (isNat(v2)) { t2 = 'number'; v2 = unboxNat(v2); }
    };
    if (t1 != t2) {
        return t1 < t2 ? -1 : +1;
    }
    var a1 = {}.toString.apply(v1), a2 = {}.toString.apply(v2);
    if (a1 != a2) {
        return a1 < a2 ? -1 : +1;
    }
    if (a1 === '[object Array]') {
        v1 = v1.slice(); /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
        v2 = v2.slice(); /* So we do the sort/compare on a clone of the original array */
        v1.sort(compare);
        v2.sort(compare);
    }
    if (t1 === 'object') {
        var fields1 = [];
        var fields2 = [];
        for (var f1 in v1) { fields1.push(f1); }
        for (var f2 in v2) { fields2.push(f2); }
        fields1 = fields1.sort(compare);
        fields2 = fields2.sort(compare);
        for (var i = 0; i < fields1.length; i=i+1) {
            if (!(Object.prototype.hasOwnProperty.call(v2,fields1[i]))) {
                return -1;
            }
            var fc = compare(v1[fields1[i]], v2[fields1[i]]);
            if (fc != 0) {
                return fc;
            }
        }
        for (var i = 0; i < fields2.length; i=i+1) {
            if (!(Object.prototype.hasOwnProperty.call(v1,fields2[i]))) {
                return +1;
            }
        }
        return 0;
    }
    if (v1 != v2) {
        return v1 < v2 ? -1 : +1;
    }
    return 0;
}

/* Record */
function recConcat(r1, r2) {
    var result = { };
    for (var key2 in r2) {
        result[key2] = r2[key2];
    }
    for (var key1 in r1) {
        if (!(Object.prototype.hasOwnProperty.call(r2,key1))) {
            result[key1] = r1[key1];
        }
    }
    return result;
}
function recMerge(r1, r2) {
    var result = { };
    for (var key1 in r1) {
        result[key1] = r1[key1];
    }
    for (var key2 in r2) {
        if (Object.prototype.hasOwnProperty.call(r1,key2)) {
            if (!equal(r1[key2], r2[key2])) {
                return [ ];
            }
        } else {
            result[key2] = r2[key2];
        }
    }
    return [ result ];
}
function recRemove(r, f) {
    var result = { };
    for (var key in r) {
        if (key != f) {
            result[key] = r[key];
        }
    }
    return result;
}
function recProject(r1, p2) {
    var result = { };
    for (var key1 in r1) {
        if (!(p2.indexOf(key1) === -1)) {
            result[key1] = r1[key1];
        }
    }
    return result;
}
function recDot(receiver, member) {
    if (typeof receiver === 'object' && Object.prototype.hasOwnProperty.call(receiver,member)) {
        return receiver[member];
    }
    throw new Error('TypeError: recDot called on non-record');
}

/* Array */
function array(...args) {
    return Array.of(...args);
}
function arrayLength(v) {
    return boxNat(v.length);
}
function arrayPush(v1,v2) {
    return union(v1,[v2]);
}
function arrayAccess(v1,v2) {
    return v1[unboxNat(v2)];
}

/* Sum */
function either(v) {
    if (typeof v === 'object') {
        if (isLeft(v)) {
            return true;
        } else if (isRight(v)) {
            return false;
        } else {
            throw new Error('TypeError: either called on non-sum');
        }
    }
    throw new Error('TypeError: either called on non-sum');
}
function toLeft(v) {
    if (typeof v === 'object' && isLeft(v)) {
        return unboxLeft(v);
    }
    throw new Error('TypeError: toLeft called on non-sum');
}
function toRight(v) {
    if (typeof v === 'object' && isRight(v)) {
        return unboxRight(v);
    }
    throw new Error('TypeError: toRight called on non-sum');
}

/* Brand */
function brand(b,v) {
    return { '$class' : b, '$data' : v };
}
function unbrand(v) {
    if (typeof v === 'object' && Object.prototype.hasOwnProperty.call(v,'$class') && Object.prototype.hasOwnProperty.call(v,'$data')) {
        return v.$data;
    }
    throw new Error('TypeError: unbrand called on non-object');
}
function cast(brands,v) {
    mustBeArray(brands);
    var type = v.$class;
    mustBeArray(type);
    if (brands.length === 1 && brands[0] === 'Any') { /* cast to top of inheritance is built-in */
        return boxLeft(v);
    }
    brands:
    for (var i in brands) {
        var b = brands[i];
        for (var j in type) {
            var t = type[j];
            if (equal(t,b) || sub_brand(t,b)) {
                continue brands;
            }
        }
        /* the brand b does not appear in the type, so the cast fails */
        return boxRight(null);
    }
    /* All brands appear in the type, so the cast succeeds */
    return boxLeft(v);
}

/* Collection */
function iterColl(b, f) {
    for (let i = 0; i < b.length; i++) {
	f(b[i]);
    }
}
function distinct(b) {
    var result = [ ];
    for (var i=0; i<b.length; i=i+1) {
        var v = b[i];
        var dup = false;
        for (var j=i+1; j<b.length; j=j+1) {
            if (equal(v,b[j])) { dup = true; break; }
        }
        if (!(dup)) { result.push(v); } else { dup = false; }
    }
    return result;
}
function singleton(v) {
    if (v.length === 1) {
        return boxLeft(v[0]);
    } else {
        return boxRight(null); /* Not a singleton */
    }
}
function flatten(aOuter) {
    var result = [ ];
    for (var iOuter=0, nOuter=aOuter.length; iOuter<nOuter; iOuter = iOuter+1) {
        var aInner = aOuter[iOuter];
        for (var iInner=0, nInner=aInner.length; iInner<nInner; iInner = iInner+1) {
            result.push(aInner[iInner]);
        }
    }
    return result;
}
function union(b1, b2) {
    var result = [ ];
    for (var i1=0; i1<b1.length; i1=i1+1) {
        result.push(b1[i1]);
    }
    for (var i2=0; i2<b2.length; i2=i2+1) {
        result.push(b2[i2]);
    }
    return result;
}
function minus(b1, b2) {
    var result = [ ];
    var v1 = b1.slice();
    var v2 = b2.slice();
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1=i1+1) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) === 1)) i2=i2+1;
        if (i2 < length2) {
            if (compare(v1[i1],v2[i2]) === (-1)) { result.push(v1[i1]); } else { i2=i2+1; }
        } else {
            result.push(v1[i1]);
        }
    }
    return result;
}
function min(b1, b2) {
    var result = [ ];
    var v1 = b1.slice();
    var v2 = b2.slice();
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1=i1+1) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) === 1)) i2=i2+1;
        if (i2 < length2) {
            if (compare(v1[i1],v2[i2]) === 0) result.push(v1[i1]);
        }
    }
    return result;
}
function max(b1, b2) {
    var result = [ ];
    var v1 = b1.slice();
    var v2 = b2.slice();
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1=i1+1) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) === 1)) { result.push(v2[i2]); i2=i2+1; }
        if (i2 < length2) {
            if (compare(v1[i1],v2[i2]) === 0) i2=i2+1;
        }
        result.push(v1[i1]);
    }
    while (i2 < length2) { result.push(v2[i2]); i2=i2+1; }
    return result;
}
function nth(b1, n) {
    var index = n;
    if (isNat(n)){
        index = unboxNat(n);
    }
    if (b1[index]) {
        return boxLeft(b1[index]);
    } else {
        return boxRight(null);
    }
}
function count(v) {
    return boxNat(v.length);
}
function contains(v, b) {
    for (var i=0; i<b.length; i=i+1) {
        if (equal(v, b[i])) {
            return true;
        }
    }
    return false;
}
function compareOfMultipleCriterias(scl) {
    return function(a,b) {
        var current_compare = 0;
        for (var i=0; i<scl.length; i=i+1) {
            var sc = scl[i];
            if (Object.prototype.hasOwnProperty.call(sc,'asc')) { current_compare = compare(recDot(a,sc['asc']), recDot(b,sc['asc'])); }
            else if (Object.prototype.hasOwnProperty.call(sc,'desc')) { current_compare = -(compare(recDot(a,sc['asc']), recDot(b,sc['asc']))); }

            if (current_compare === -1) { return -1; }
            else if (current_compare === 1) { return 1; }
        }
        return current_compare;
    }
    
}
function sort(b,scl) {
    var result = [ ];
    if (scl.length === 0) { return b; } // Check for no sorting criteria
    var compareFun = compareOfMultipleCriterias(scl);
    result = b.slice(); /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
    result.sort(compareFun);
    return result;
}
function groupByOfKey(l,k,keysf) {
    result = [ ];
    l.forEach((x) => {
        if (equal(keysf(x),k)) {
            result.push(x);
        }
    });
    return result;
}
function groupByNested(l,keysf) {
    var keys = distinct(l.map(keysf));
    var result = [ ];
    keys.forEach((k) => {
        result.push({ 'keys': k, 'group' : groupByOfKey(l,k,keysf) });
    });
    return result;
}
function groupBy(g,kl,l) {
    // g is partition name
    // kl is key list
    // l is input collection of records
    var keysf = function (j) {
        return recProject(j,kl);
    };
    var grouped = groupByNested(l,keysf);
    var result = [ ];
    grouped.forEach((x) => {
        var gRec = {};
        gRec[g] = x.group;
        result.push(recConcat(x.keys, gRec));
    });
    return result;
}

/* String */
function length(v) {
    return boxNat(v.length);
}
function substring(v, start, len) {
    return v.substring(unboxNat(start),unboxNat(len));
}
function substringEnd(v, start) {
    return v.substring(unboxNat(start));
}
function stringJoin(sep, v) {
    return v.join(sep);
}
function like(pat, s) {
    var reg1 = escapeRegExp(pat);
    var reg2 = reg1.replace(/_/g, '.').replace(/%/g, '.*');
    var reg3 = new RegExp(reg2);
    return reg3.test(s);
}

/* Integer */
function natLt(v1, v2) {
    return unboxNat(v1) < unboxNat(v2);
}
function natLe(v1, v2) {
    return unboxNat(v1) <= unboxNat(v2);
}
function natPlus(v1, v2) {
    return boxNat(unboxNat(v1) + unboxNat(v2));
}
function natMinus(v1, v2) {
    return boxNat(unboxNat(v1) - unboxNat(v2));
}
function natMult(v1, v2) {
    return boxNat(unboxNat(v1) * unboxNat(v2));
}
function natDiv(v1, v2) {
    return boxNat(Math.floor(unboxNat(v1) / unboxNat(v2)));
}
function natRem(v1, v2) {
    return boxNat(Math.floor(unboxNat(v1) % unboxNat(v2)));
}
function natAbs(v) {
    return boxNat(Math.abs(unboxNat(v1),unboxNat(v2)));
}
function natLog2(v) {
    return boxNat(Math.floor(Math.log2(unboxNat(v)))); // Default Z.log2 is log_inf, biggest integer lower than log2
}
function natSqrt(v) {
    return boxNat(Math.floor(Math.sqrt(unboxNat(v)))); // See Z.sqrt biggest integer lower than sqrt
}
function natMinPair(v1, v2) {
    return boxNat(Math.min(unboxNat(v1),unboxNat(v2)));
}
function natMaxPair(v1, v2) {
    return boxNat(Math.max(unboxNat(v1),unboxNat(v2)));
}
function natSum(b) {
    var result = 0;
    for (var i=0; i<b.length; i=i+1) {
        result += unboxNat(b[i]);
    }
    return boxNat(result);
}
function natMin(b) {
    var numbers = [ ];
    for (var i=0; i<b.length; i=i+1) {
        numbers.push(unboxNat(b[i]));
    }
    return boxNat(Math.min.apply(Math,numbers));
}
function natMax(b) {
    var numbers = [ ];
    for (var i=0; i<b.length; i=i+1) {
        numbers.push(unboxNat(b[i]));
    }
    return boxNat(Math.max.apply(Math,numbers));
}
function natArithMean(b) {
    var len = b.length;
    if (len === 0) {
        return boxNat(0);
    } else {
        return boxNat(Math.floor(natSum(b)/len));
    }
}
function floatOfNat(v) {
    return unboxNat(v);
}

/* Float */
function floatSum(b) {
    var result = 0;
    for (var i=0; i<b.length; i=i+1) {
        result += b[i];
    }
    return result;
}
function floatArithMean(b) {
    var len = b.length;
    if (len === 0) {
        return 0;
    } else {
        return floatSum(b)/len;
    }
}
function floatMin(b) {
    return Math.min.apply(Math,b);
}
function floatMax(b) {
    return Math.max.apply(Math,b);
}
function natOfFloat(v) {
    return boxNat(Math.trunc(v));
}
